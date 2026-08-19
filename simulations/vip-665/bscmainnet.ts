import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { OPERATOR, STACKS } from "../../vips/vip-650/addresses/bscmainnet";
import vip665, {
  ADAPTER_FRV,
  CASH_PLUS_VAULT,
  CEFFU_INSTITUTION,
  CEFFU_VAULT,
  CONTROLLER,
  FRV_ABSOLUTE_CAP,
  FRV_PERCENTAGE_CAP_BPS_NEW,
  FRV_PERCENTAGE_CAP_BPS_OLD,
  USDT_FRV_SOURCE,
  USDT_HUB,
  U_FRV_SOURCE,
  U_HUB,
} from "../../vips/vip-665/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import YIELD_GROUP_FRV_ABI from "./abi/YieldGroupFRV.json";

// Minimal read-only ABI for the InstitutionalVaultController's deterministic-address predictor and
// its per-institution vault nonce (used to document why the prediction is a build-time check only).
const CONTROLLER_ABI = [
  "function predictVaultAddress(address institution) view returns (address)",
  "function institutionNonce(address institution) view returns (uint256)",
];

// Deployed (runtime) bytecode of a minimal stand-in for the not-yet-deployed Ceffu FRV vault, etched
// at CEFFU_VAULT so the Hub-side wiring can be simulated (the real vault ships from the fixed-rate-
// vaults workstream). It implements only the surface the Hub / AdapterFRV touch: asset() == BSC USDT
// (so addResource's asset-match check passes), balanceOf() == 0 (so AdapterFRV values the FRV source's
// position at 0 and totalAssets() reads succeed), maxDeposit()/maxWithdraw() == 0 (pre-Fundraising),
// and a no-op updateVaultState(). Source (solc 0.8.26, optimizer 200 runs):
//   contract MockFRVVault {
//     function asset() external pure returns (address) { return 0x55d3...7955; } // BSC USDT
//     function balanceOf(address) external pure returns (uint256) { return 0; }
//     function maxDeposit(address) external pure returns (uint256) { return 0; }
//     function maxWithdraw(address) external pure returns (uint256) { return 0; }
//     function updateVaultState() external {}
//   }
const MOCK_FRV_VAULT_BYTECODE =
  "0x6080604052348015600e575f80fd5b5060043610604e575f3560e01c806338d52e0f146052578063402d267d14607957806370a08231146079578063746b70f5146096578063ce96cb77146079575b5f80fd5b6040517355d398326f99059ff775485246999027b319795581526020015b60405180910390f35b608960843660046098565b505f90565b6040519081526020016070565b005b5f6020828403121560a7575f80fd5b81356001600160a01b038116811460bc575f80fd5b939250505056fea264697066735822122086ead7350122d5f6033cd25f6c84f3d37889c634b13c796bde6ab767b9c75b1a64736f6c634300081a0033";

const { bscmainnet } = NETWORK_ADDRESSES;
const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;

// On-chain facts were re-verified at HEAD (~116,788,760). The sim forks a little earlier so the block
// is warm across reruns; every asserted fact is stable across that small gap.
const FORK_BLOCK = 116780000;

// Core source + its vToken resource, Flux source per Hub, reused from VIP-650's address book instead
// of being re-literalled here. Each Core leg funds the 1-token behavioural push on its Hub.
const uStack = STACKS.find(s => s.key === "U");
if (!uStack) throw new Error("VIP-665 sim: no U Hub stack in the VIP-650 address book");
const U_CORE_SOURCE = uStack.core;
const U_VTOKEN = uStack.vToken;
const U_FLUX_SOURCE = uStack.flux;

const usdtStack = STACKS.find(s => s.key === "USDT");
if (!usdtStack) throw new Error("VIP-665 sim: no USDT Hub stack in the VIP-650 address book");
const USDT_CORE_SOURCE = usdtStack.core;
const USDT_VTOKEN = usdtStack.vToken;

const addr = (a: string) => ethers.utils.getAddress(a);
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// A small, cap-safe reallocate push into an FRV vault. 1 asset unit (all three Hub assets are 18-dec)
// sits inside the FRV group's effective cap on both sides of the raise and inside the Core source's
// liquidity, so the pull leg is never the thing that reverts.
const PUSH = parseUnits("1", 18);

// Push 1 asset unit from Core into the FRV group's vault. The pull leg funds the Hub; the push leg is
// the assertion target. Returns the raw call promise so each caller can match its own revert.
const reallocatePushIntoVault = (hub: Contract, coreSource: string, vToken: string, frvSource: string, vault: string) =>
  hub.reallocate(
    [{ yieldGroup: coreSource, resource: vToken, amount: PUSH }],
    [{ yieldGroup: frvSource, resource: vault, amount: PUSH }],
  );

forking(FORK_BLOCK, async () => {
  const uHub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  const usdtHub = new ethers.Contract(USDT_HUB, HUB_ABI, ethers.provider);
  const uFrv = new ethers.Contract(U_FRV_SOURCE, YIELD_GROUP_FRV_ABI, ethers.provider);
  const usdtFrv = new ethers.Contract(USDT_FRV_SOURCE, YIELD_GROUP_FRV_ABI, ethers.provider);
  const controller = new ethers.Contract(CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);

  // Both Hubs paired with their FRV source, iterated by the cap assertions on either side of the VIP.
  const frvGroups: [Contract, string][] = [
    [uHub, U_FRV_SOURCE],
    [usdtHub, USDT_FRV_SOURCE],
  ];

  // Assert both FRV yield groups are registered, unpaused, at the launch absolute cap and the given
  // percentage cap. Called with the OLD bps pre-VIP and the NEW bps post-VIP.
  const expectFrvCaps = async (percentageCapBps: number) => {
    for (const [hub, source] of frvGroups) {
      const cfg = await hub.yieldGroupConfig(source);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap.toString()).to.equal(FRV_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(percentageCapBps);
    }
  };

  // Captured pre-VIP so the post-VIP checks can prove the effective FRV cap actually rose.
  let uEffectiveCapBefore: BigNumber;

  describe("Pre-VIP state (bscmainnet)", () => {
    it("the CASH+ vault is unregistered on the U FRV source, inner queues empty", async () => {
      expect(await uFrv.resources()).to.deep.equal([]);
      const [registered] = await uFrv.resourceConfig(CASH_PLUS_VAULT);
      expect(registered).to.equal(false);
      expect((await uFrv.innerDepositQueue()).length).to.equal(0);
      expect((await uFrv.innerWithdrawQueue()).length).to.equal(0);
    });

    it("the Ceffu vault is unregistered on the USDT FRV source, inner queues empty", async () => {
      expect(await usdtFrv.resources()).to.deep.equal([]);
      const [registered] = await usdtFrv.resourceConfig(CEFFU_VAULT);
      expect(registered).to.equal(false);
      expect((await usdtFrv.innerDepositQueue()).length).to.equal(0);
      expect((await usdtFrv.innerWithdrawQueue()).length).to.equal(0);
    });

    it("[build-time check] CEFFU_VAULT is the controller's nonce-0 CREATE2 clone for the Ceffu institution", async () => {
      // This confirms the hard-coded CEFFU_VAULT literal is exactly the address the controller derives
      // for the Ceffu institution at its CURRENT (zero) nonce — a preimage sanity check that catches a
      // typo'd address, nothing more. It is NOT a check a voter can reproduce once this VIP ships:
      // createVault increments institutionNonce, so after the Ceffu vault is deployed
      // predictVaultAddress(CEFFU_INSTITUTION) returns the institution's NEXT clone, not CEFFU_VAULT.
      // (Verified on bscmainnet: the two institutions that have already deployed both sit at nonce 1 and
      // predict a different, codeless address than their live vault.) Post-deployment address/config
      // correctness is enforced off-fork by the deploy-first gate (scripts/checkCeffuVaultReady.ts), not
      // by this assertion.
      expect((await controller.institutionNonce(CEFFU_INSTITUTION)).toNumber()).to.equal(0);
      expect(addr(await controller.predictVaultAddress(CEFFU_INSTITUTION))).to.equal(addr(CEFFU_VAULT));
    });

    it("[Test-Only] etches a minimal FRV-vault stand-in at the predicted Ceffu address", async () => {
      // The Ceffu vault does not exist at ANY historical block (the fixed-rate-vaults workstream ships
      // it later), so this fork sim cannot exercise the real contract — it etches a minimal stand-in at
      // the deterministic address purely to drive the Hub-side code paths (addResource's asset-match,
      // the inner withdraw-queue setter, the cap raise, and the reallocate registry gate). asset() must
      // return USDT for addResource's asset-match check to pass. The REAL vault's code, asset and
      // lifecycle state are therefore NOT verified here; that is enforced off-fork, at proposal time, by
      // scripts/checkCeffuVaultReady.ts. FOLLOW-UP: once the Ceffu vault is deployed, bump FORK_BLOCK
      // past its deployment and drop this etch so the sim asserts the live vault directly.
      expect(await ethers.provider.getCode(CEFFU_VAULT)).to.equal("0x");
      await ethers.provider.send("hardhat_setCode", [addr(CEFFU_VAULT), MOCK_FRV_VAULT_BYTECODE]);
      const stub = new ethers.Contract(CEFFU_VAULT, ["function asset() view returns (address)"], ethers.provider);
      expect(addr(await stub.asset())).to.equal(addr(usdtStack.asset));
    });

    it("both FRV yield groups are registered, unpaused, at (5,000,000, 30%)", async () => {
      await expectFrvCaps(FRV_PERCENTAGE_CAP_BPS_OLD);
      uEffectiveCapBefore = await uHub.yieldGroupEffectiveCap(U_FRV_SOURCE);
    });

    it("the Normal Timelock already holds every role this VIP calls (no ACM grants needed)", async () => {
      const held: [string, string][] = [
        [U_FRV_SOURCE, "addResource(address,address)"],
        [USDT_FRV_SOURCE, "addResource(address,address)"],
        [U_HUB, "raiseYieldGroupCap(address,uint256,uint16)"],
        [USDT_HUB, "raiseYieldGroupCap(address,uint256,uint16)"],
      ];
      for (const [contract, sig] of held) {
        expect(await acm.hasRole(roleId(contract, sig), NORMAL_TIMELOCK)).to.equal(true, `${contract} ${sig}`);
      }
    });

    it("an Operator push into the CASH+ vault reverts ResourceNotRegistered", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(
        reallocatePushIntoVault(uHub.connect(operator), U_CORE_SOURCE, U_VTOKEN, U_FRV_SOURCE, CASH_PLUS_VAULT),
      )
        .to.be.revertedWithCustomError(uFrv, "ResourceNotRegistered")
        .withArgs(addr(CASH_PLUS_VAULT));
    });

    it("an Operator push into the Ceffu vault reverts ResourceNotRegistered", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(
        reallocatePushIntoVault(usdtHub.connect(operator), USDT_CORE_SOURCE, USDT_VTOKEN, USDT_FRV_SOURCE, CEFFU_VAULT),
      )
        .to.be.revertedWithCustomError(usdtFrv, "ResourceNotRegistered")
        .withArgs(addr(CEFFU_VAULT));
    });
  });

  testVip("VIP-665 Wire Cash+ and Ceffu FRV vaults into the Liquidity Hub and raise FRV caps", await vip665(), {
    callbackAfterExecution: async (tx: TransactionResponse) => {
      // One resource registration on each FRV source (U/CASH+ and USDT/Ceffu), and one cap raise on
      // each of the two Hubs. Inner deposit and withdraw queues are left empty on both legs (manual).
      await expectEvents(tx, [YIELD_GROUP_FRV_ABI, HUB_ABI], ["ResourceAdded", "YieldGroupCapRaised"], [2, 2]);
    },
  });

  describe("Post-VIP state (bscmainnet)", () => {
    it("registers the CASH+ vault on the U FRV source behind AdapterFRV", async () => {
      expect((await uFrv.resources()).map(addr)).to.deep.equal([addr(CASH_PLUS_VAULT)]);
      const [registered, paused, boundAdapter] = await uFrv.resourceConfig(CASH_PLUS_VAULT);
      expect(registered).to.equal(true);
      expect(paused).to.equal(false);
      expect(addr(boundAdapter)).to.equal(addr(ADAPTER_FRV));
    });

    it("leaves the U FRV source's inner deposit and withdraw queues empty", async () => {
      expect((await uFrv.innerDepositQueue()).length).to.equal(0);
      expect((await uFrv.innerWithdrawQueue()).length).to.equal(0);
    });

    it("registers the Ceffu vault on the USDT FRV source behind AdapterFRV", async () => {
      expect((await usdtFrv.resources()).map(addr)).to.deep.equal([addr(CEFFU_VAULT)]);
      const [registered, paused, boundAdapter] = await usdtFrv.resourceConfig(CEFFU_VAULT);
      expect(registered).to.equal(true);
      expect(paused).to.equal(false);
      expect(addr(boundAdapter)).to.equal(addr(ADAPTER_FRV));
    });

    it("leaves the USDT FRV source's inner deposit and withdraw queues empty", async () => {
      expect((await usdtFrv.innerDepositQueue()).length).to.equal(0);
      expect((await usdtFrv.innerWithdrawQueue()).length).to.equal(0);
    });

    it("raises the FRV percentage cap to 50% on both Hubs, absolute cap unchanged", async () => {
      await expectFrvCaps(FRV_PERCENTAGE_CAP_BPS_NEW);
    });

    it("increases the U FRV group's effective cap and keeps it within the absolute cap", async () => {
      const effAfter = await uHub.yieldGroupEffectiveCap(U_FRV_SOURCE);
      // The percentage dimension binds (Hub TVL << 5M), so the raise 30% -> 50% must lift it.
      expect(effAfter.gt(uEffectiveCapBefore)).to.equal(true, "effective FRV cap did not rise");
      expect(effAfter.lte(BigNumber.from(FRV_ABSOLUTE_CAP))).to.equal(true, "effective cap above absolute cap");
      // Effective cap is exactly 50% of live TVL: `_effectiveCap` computes `totalAssets * bps / 10_000`
      // with the same integer division as `half`, read at the same block with no intervening txs.
      const half = (await uHub.totalAssets()).mul(FRV_PERCENTAGE_CAP_BPS_NEW).div(10_000);
      expect(effAfter.eq(half)).to.equal(true, "effective cap != 50% of TVL");
    });

    it("leaves the FRV group's outer queue positions untouched (out of deposit, last in withdraw)", async () => {
      // Outer queues must not move: FRV stays OUT of the deposit queue and LAST in the withdraw queue,
      // exactly as VIP-650/651 left them.
      expect((await uHub.outerDepositQueue()).map(addr)).to.deep.equal([addr(U_CORE_SOURCE), addr(U_FLUX_SOURCE)]);
      const withdrawQueue = (await uHub.outerWithdrawQueue()).map(addr);
      expect(withdrawQueue).to.deep.equal([addr(U_FLUX_SOURCE), addr(U_CORE_SOURCE), addr(U_FRV_SOURCE)]);
    });
  });

  describe("Post-VIP behaviour (bscmainnet)", () => {
    // Registration is live for both vaults: the push no longer reverts ResourceNotRegistered. Each
    // vault is pre-Fundraising (maxDeposit == 0 — CASH+ is in state MarginDeposited on-chain, the
    // Ceffu stand-in returns 0), so the push reverts at the vault-capacity gate instead — a different
    // error, which is exactly the registration proof. A full fund-movement round trip is out of scope
    // here: opening a vault into Fundraising is an institution/controller action, not Hub governance,
    // and the vaults live in the separate fixed-rate-vaults workstream. Once open, the same call funds.
    it("an Operator push into the CASH+ vault now clears the registry, failing only on vault capacity", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(
        reallocatePushIntoVault(uHub.connect(operator), U_CORE_SOURCE, U_VTOKEN, U_FRV_SOURCE, CASH_PLUS_VAULT),
      )
        .to.be.revertedWithCustomError(uFrv, "ResourceCapacityExceeded")
        .withArgs(PUSH, 0);
    });

    it("an Operator push into the Ceffu vault now clears the registry, failing only on vault capacity", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(
        reallocatePushIntoVault(usdtHub.connect(operator), USDT_CORE_SOURCE, USDT_VTOKEN, USDT_FRV_SOURCE, CEFFU_VAULT),
      )
        .to.be.revertedWithCustomError(usdtFrv, "ResourceCapacityExceeded")
        .withArgs(PUSH, 0);
    });
  });
});
