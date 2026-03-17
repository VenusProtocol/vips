import { expect } from "chai";
import * as fs from "fs";
import { ethers } from "hardhat";
import * as path from "path";
import { initMainnetUser } from "src/utils";
import { forking } from "src/vip-framework";

/**
 * Fork test that reads safePauseTxBuilder.json, executes each transaction
 * by impersonating the Guardian (Safe) address, then verifies the
 * intended state changes using safePauseTxMetadata.json.
 *
 * Usage:
 *   npx hardhat test scripts/simulateSafePauseTx.ts --fork <networkName>
 */

const jsonPath = path.resolve(__dirname, "data", "safePauseTxBuilder.json");
if (!fs.existsSync(jsonPath)) {
  throw new Error(`${jsonPath} not found. Run generateSafePauseJson.ts first.`);
}
const batchFile = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const transactions: { to: string; data: string; value: string }[] = batchFile.transactions;
const safeAddress = batchFile.meta.createdFromSafeAddress;

const metadataPath = path.resolve(__dirname, "data", "safePauseTxMetadata.json");
const hasMetadata = fs.existsSync(metadataPath);
const metadata = hasMetadata ? JSON.parse(fs.readFileSync(metadataPath, "utf-8")) : null;

const symbolOf = (vToken: string): string => metadata?.symbols?.[vToken] || vToken.slice(0, 10);

// ─── ABI-decode helpers for TX labels ─────────────────────────────────────

const CF_IFACE = new ethers.utils.Interface([
  "function setCollateralFactor(address,uint256,uint256)",
]);
const EMODE_CF_IFACE = new ethers.utils.Interface([
  "function setCollateralFactor(uint96,address,uint256,uint256)",
]);
const PAUSE_IFACE = new ethers.utils.Interface([
  "function setActionsPaused(address[],uint8[],bool)",
]);

const ActionNames: Record<number, string> = {
  0: "MINT",
  1: "REDEEM",
  2: "BORROW",
  3: "REPAY",
  4: "SEIZE",
  5: "LIQUIDATE",
  6: "TRANSFER",
  7: "ENTER_MARKET",
  8: "EXIT_MARKET",
};

const decodeTxLabel = (i: number, tx: { to: string; data: string }): string => {
  const prefix = `Tx ${i + 1}/${transactions.length}`;
  const selector = tx.data.slice(0, 10);

  try {
    // setCollateralFactor(address,uint256,uint256) — selector 0xe4028eee
    if (selector === CF_IFACE.getSighash("setCollateralFactor(address,uint256,uint256)")) {
      const decoded = CF_IFACE.decodeFunctionData("setCollateralFactor(address,uint256,uint256)", tx.data);
      const market = decoded[0];
      return `${prefix}: setCollateralFactor → CF=0 for ${symbolOf(market)} (${market})`;
    }

    // setCollateralFactor(uint96,address,uint256,uint256) — e-mode selector
    if (selector === EMODE_CF_IFACE.getSighash("setCollateralFactor(uint96,address,uint256,uint256)")) {
      const decoded = EMODE_CF_IFACE.decodeFunctionData("setCollateralFactor(uint96,address,uint256,uint256)", tx.data);
      const poolId = decoded[0];
      const market = decoded[1];
      return `${prefix}: setCollateralFactor → e-mode pool ${poolId} CF=0 for ${symbolOf(market)} (${market})`;
    }

    // setActionsPaused(address[],uint8[],bool)
    if (selector === PAUSE_IFACE.getSighash("setActionsPaused")) {
      const decoded = PAUSE_IFACE.decodeFunctionData("setActionsPaused", tx.data);
      const markets: string[] = decoded[0];
      const actions: number[] = decoded[1];
      const actionLabels = actions.map(a => ActionNames[a] || String(a)).join(", ");
      return `${prefix}: setActionsPaused → pause [${actionLabels}] for ${markets.length} market(s)`;
    }
  } catch (e) {
    console.log(`  Warning: failed to decode tx ${i + 1} data: ${e}`);
  }

  return `${prefix}: call to ${tx.to}`;
};

// ─── ABI fragments for verification ────────────────────────────────────────

const BSC_COMPTROLLER_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
  "function poolMarkets(uint96,address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus, uint256 liquidationThresholdMantissa, uint256 liquidationIncentiveMantissa, uint96 marketPoolId, bool isBorrowAllowed)",
  "function actionPaused(address,uint8) view returns (bool)",
];

const REMOTE_COMPTROLLER_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
  "function actionPaused(address,uint8) view returns (bool)",
];

// ─── Verification helpers ──────────────────────────────────────────────────

const verifyCfZero = (comptroller: string, markets: string[], isBsc: boolean) => {
  const abi = isBsc ? BSC_COMPTROLLER_ABI : REMOTE_COMPTROLLER_ABI;

  for (const vToken of markets) {
    it(`${symbolOf(vToken)} (${vToken}) should have CF = 0`, async () => {
      const contract = new ethers.Contract(comptroller, abi, ethers.provider);
      const data = await contract.markets(vToken);
      const cf = data.collateralFactorMantissa.toString();
      const lt = data.liquidationThresholdMantissa.toString();
      console.log(`        CF: ${cf}, LT: ${lt}`);
      expect(data.collateralFactorMantissa).to.equal(0);
    });
  }
};

const verifyEmodeCfZero = (comptroller: string, entries: { vToken: string; poolId: number }[]) => {
  for (const { vToken, poolId } of entries) {
    it(`${symbolOf(vToken)} (${vToken}) e-mode pool ${poolId} should have CF = 0`, async () => {
      const contract = new ethers.Contract(comptroller, BSC_COMPTROLLER_ABI, ethers.provider);
      const data = await contract.poolMarkets(poolId, vToken);
      const cf = data.collateralFactorMantissa.toString();
      const lt = data.liquidationThresholdMantissa.toString();
      console.log(`        CF: ${cf}, LT: ${lt}`);
      expect(data.collateralFactorMantissa).to.equal(0);
    });
  }
};

const verifyActionsPaused = (comptroller: string, markets: string[], actions: number[], isBsc: boolean) => {
  const abi = isBsc ? BSC_COMPTROLLER_ABI : REMOTE_COMPTROLLER_ABI;

  for (const vToken of markets) {
    for (const action of actions) {
      const actionName = ActionNames[action] || String(action);

      it(`${symbolOf(vToken)} (${vToken}) action ${actionName} should be paused`, async () => {
        const contract = new ethers.Contract(comptroller, abi, ethers.provider);
        const paused = await contract.actionPaused(vToken, action);
        expect(paused).to.equal(true);
      });
    }
  }
};

// ─── Test suite ────────────────────────────────────────────────────────────

(async () => {
  console.log("Fetching latest block number...");
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log(`Latest block: ${blockNumber}`);

  forking(blockNumber, async () => {
    describe(`Simulate safePauseTxBuilder.json (${transactions.length} txs)`, () => {
      for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];

        it(decodeTxLabel(i, tx), async () => {
          const signer = await initMainnetUser(safeAddress, ethers.utils.parseEther("10"));
          const txResponse = await signer.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value || "0",
          });
          const receipt = await txResponse.wait();
          expect(receipt.status).to.equal(1);
        });
      }
    });

    // Derive verification data from transactions
    const comptroller = metadata?.comptroller || transactions[0]?.to;
    const isBsc = metadata?.network === "bscmainnet";
    const cfSighash = CF_IFACE.getSighash("setCollateralFactor(address,uint256,uint256)");
    const emodeCfSighash = EMODE_CF_IFACE.getSighash("setCollateralFactor(uint96,address,uint256,uint256)");
    const pauseSighash = PAUSE_IFACE.getSighash("setActionsPaused");

    const cfZeroMarkets: string[] = [];
    const emodeCfZero: { vToken: string; poolId: number }[] = [];
    const pauseMarketsSet = new Set<string>();
    const pauseActionsSet = new Set<number>();

    for (const tx of transactions) {
      const selector = tx.data.slice(0, 10);
      try {
        if (selector === cfSighash) {
          const decoded = CF_IFACE.decodeFunctionData("setCollateralFactor(address,uint256,uint256)", tx.data);
          cfZeroMarkets.push(decoded[0]);
        } else if (selector === emodeCfSighash) {
          const decoded = EMODE_CF_IFACE.decodeFunctionData("setCollateralFactor(uint96,address,uint256,uint256)", tx.data);
          emodeCfZero.push({ vToken: decoded[1], poolId: decoded[0].toNumber() });
        } else if (selector === pauseSighash) {
          const decoded = PAUSE_IFACE.decodeFunctionData("setActionsPaused", tx.data);
          (decoded[0] as string[]).forEach((m: string) => pauseMarketsSet.add(m));
          (decoded[1] as number[]).forEach((a: number) => pauseActionsSet.add(a));
        }
      } catch {
        // skip unrecognized transactions
      }
    }

    const pauseMarkets = Array.from(pauseMarketsSet);
    const pauseActions = Array.from(pauseActionsSet);

    if (comptroller) {
      describe("Verify post-execution state", () => {
        if (cfZeroMarkets.length > 0) {
          describe("Collateral factor = 0", () => {
            verifyCfZero(comptroller, cfZeroMarkets, isBsc);
          });
        }

        if (emodeCfZero.length > 0) {
          describe("E-mode collateral factor = 0", () => {
            verifyEmodeCfZero(comptroller, emodeCfZero);
          });
        }

        if (pauseMarkets.length > 0 && pauseActions.length > 0) {
          describe("Actions paused", () => {
            verifyActionsPaused(comptroller, pauseMarkets, pauseActions, isBsc);
          });
        }
      });
    }
  });
})();
