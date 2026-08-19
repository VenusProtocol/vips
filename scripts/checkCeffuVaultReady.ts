/**
 * Deploy-first gate for VIP-657 (wire Cash+ and Ceffu FRV vaults into the Liquidity Hub).
 *
 * The Ceffu leg registers an externally-deployed fixed-rate vault at a deterministic CREATE2 address
 * (${CEFFU_VAULT}). All six VIP commands are one atomic transaction and `addResource` reverts with
 * `ResourceNotContract` against a codeless address, so the whole proposal fails closed if the Ceffu
 * vault is not live when it executes. The fork simulation runs at a historical block where the vault
 * does not exist and can only etch a stand-in, so it cannot prove the real vault is ready.
 *
 * This script is that proof. Run it against live bscmainnet immediately BEFORE proposing VIP-657; it
 * exits non-zero unless every precondition below holds:
 *   1. The Ceffu vault holds code and is registered on the InstitutionalVaultController for the Ceffu
 *      institution (proving it is the intended vault, not some other clone at a colliding address).
 *   2. The Ceffu vault's `asset() == USDT`, matching the USDT Hub's FRV source.
 *   3. The already-deployed Cash+ vault still holds code and reports `asset() == U` (sanity check on
 *      the second leg).
 *
 * Run:
 *   npx hardhat run scripts/checkCeffuVaultReady.ts --network bscmainnet
 */
import { ethers } from "hardhat";

import { STACKS } from "../vips/vip-650/addresses/bscmainnet";
import { CASH_PLUS_VAULT, CEFFU_INSTITUTION, CEFFU_VAULT, CONTROLLER } from "../vips/vip-657/bscmainnet";

const CONTROLLER_ABI = [
  "function isRegistered(address) view returns (bool)",
  "function getAggregatedVaultStates() view returns (tuple(address vault, uint8 state, address institutionOperator, uint256 totalRaised, uint256 outstandingDebt, string institutionName)[])",
];
const VAULT_ABI = ["function asset() view returns (address)"];

const getStack = (key: string) => {
  const stack = STACKS.find(s => s.key === key);
  if (!stack) throw new Error(`checkCeffuVaultReady: no ${key} Hub stack in the VIP-650 address book`);
  return stack;
};

const eq = (a: string, b: string) => ethers.utils.getAddress(a) === ethers.utils.getAddress(b);

async function main() {
  const usdt = getStack("USDT").asset;
  const u = getStack("U").asset;

  const controller = new ethers.Contract(CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const failures: string[] = [];

  // --- Ceffu leg: the vault must be deployed, registered for the Ceffu institution, and hold USDT ---
  const ceffuCode = await ethers.provider.getCode(CEFFU_VAULT);
  if (ceffuCode === "0x") {
    failures.push(`Ceffu vault ${CEFFU_VAULT} holds no code — not deployed yet. Do NOT propose VIP-657.`);
  } else {
    const registered = await controller.isRegistered(CEFFU_VAULT);
    if (!registered) failures.push(`Ceffu vault ${CEFFU_VAULT} is not registered on the controller.`);

    const states = await controller.getAggregatedVaultStates();
    const entry = states.find((s: { vault: string }) => eq(s.vault, CEFFU_VAULT));
    if (!entry) {
      failures.push(`Ceffu vault ${CEFFU_VAULT} is not in the controller's vault set.`);
    } else if (!eq(entry.institutionOperator, CEFFU_INSTITUTION)) {
      failures.push(
        `Ceffu vault ${CEFFU_VAULT} belongs to institution ${entry.institutionOperator}, not the ` +
          `expected Ceffu institution ${CEFFU_INSTITUTION}.`,
      );
    }

    const ceffuAsset = await new ethers.Contract(CEFFU_VAULT, VAULT_ABI, ethers.provider).asset();
    if (!eq(ceffuAsset, usdt)) {
      failures.push(`Ceffu vault asset() is ${ceffuAsset}, expected USDT ${usdt}.`);
    }
  }

  // --- Cash+ leg: already deployed; re-confirm it still holds code and reports U ---
  if ((await ethers.provider.getCode(CASH_PLUS_VAULT)) === "0x") {
    failures.push(`Cash+ vault ${CASH_PLUS_VAULT} holds no code.`);
  } else {
    const cashAsset = await new ethers.Contract(CASH_PLUS_VAULT, VAULT_ABI, ethers.provider).asset();
    if (!eq(cashAsset, u)) failures.push(`Cash+ vault asset() is ${cashAsset}, expected U ${u}.`);
  }

  if (failures.length > 0) {
    console.error("VIP-657 deploy-first gate FAILED:");
    for (const f of failures) console.error(`  - ${f}`);
    throw new Error("VIP-657 preconditions not met — do not propose.");
  }

  console.log("VIP-657 deploy-first gate PASSED:");
  console.log(`  - Ceffu vault ${CEFFU_VAULT}: deployed, registered for ${CEFFU_INSTITUTION}, asset == USDT`);
  console.log(`  - Cash+ vault ${CASH_PLUS_VAULT}: deployed, asset == U`);
  console.log("VIP-657 is safe to propose.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
