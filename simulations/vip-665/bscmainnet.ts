import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, {
  ADAPTER_FRV,
  CASH_PLUS_VAULT,
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

const { bscmainnet } = NETWORK_ADDRESSES;
const ACM = bscmainnet.ACCESS_CONTROL_MANAGER;
const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;

// Fork shortly before the proposal is created (current HEAD ~116,788,760). Every fact this sim
// asserts was verified on-chain at that height.
const FORK_BLOCK = 116780000;

// The Operator multisig granted `reallocate` on every Hub by VIP-650/651. Used only to prove the
// registration is live end-to-end (the push into the vault stops failing "not registered").
const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

// U Core source + its vToken resource, the source of the 1-token pull leg in the behavioural proof.
const U_CORE_SOURCE = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const U_VTOKEN = "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E";

// The FRV yield group's outer queue positions must not move: FRV stays out of the deposit queue and
// last in the withdraw queue, exactly as VIP-650/651 left them.
const U_FLUX_SOURCE = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";

const addr = (a: string) => ethers.utils.getAddress(a);
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// A small, cap-safe reallocate push into the CASH+ vault. 1 U sits inside the FRV group's effective
// cap on both sides of the raise (min(5M, 30% / 50% of the U Hub's ~10-token TVL)) and inside the U
// Core source's ~10 tokens, so the pull leg is never the thing that reverts.
const PUSH = parseUnits("1", 18);

// Push 1 U from Core into the FRV group's CASH+ vault. The pull leg funds the Hub; the push leg is
// the assertion target. Returns the raw call promise so each caller can match its own revert.
const reallocatePushIntoVault = (hub: Contract) =>
  hub.reallocate(
    [{ yieldGroup: U_CORE_SOURCE, resource: U_VTOKEN, amount: PUSH }],
    [{ yieldGroup: U_FRV_SOURCE, resource: CASH_PLUS_VAULT, amount: PUSH }],
  );

forking(FORK_BLOCK, async () => {
  const uHub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  const usdtHub = new ethers.Contract(USDT_HUB, HUB_ABI, ethers.provider);
  const uFrv = new ethers.Contract(U_FRV_SOURCE, YIELD_GROUP_FRV_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);

  // Captured pre-VIP so the post-VIP checks can prove the effective FRV cap actually rose.
  let uEffectiveCapBefore: BigNumber;

  describe("Pre-VIP state (bscmainnet)", () => {
    it("the CASH+ vault is unregistered on the U FRV source", async () => {
      expect(await uFrv.resources()).to.deep.equal([]);
      const [registered] = await uFrv.resourceConfig(CASH_PLUS_VAULT);
      expect(registered).to.equal(false);
      expect((await uFrv.innerDepositQueue()).length).to.equal(0);
      expect((await uFrv.innerWithdrawQueue()).length).to.equal(0);
    });

    it("both FRV yield groups are registered, unpaused, at (5,000,000, 30%)", async () => {
      for (const [hub, source] of [
        [uHub, U_FRV_SOURCE],
        [usdtHub, USDT_FRV_SOURCE],
      ] as [Contract, string][]) {
        const cfg = await hub.yieldGroupConfig(source);
        expect(cfg.registered).to.equal(true);
        expect(cfg.paused).to.equal(false);
        expect(cfg.absoluteCap.toString()).to.equal(FRV_ABSOLUTE_CAP);
        expect(cfg.percentageCapBps).to.equal(FRV_PERCENTAGE_CAP_BPS_OLD);
      }
      uEffectiveCapBefore = await uHub.yieldGroupEffectiveCap(U_FRV_SOURCE);
    });

    it("the Normal Timelock already holds every role this VIP calls (no ACM grants needed)", async () => {
      const held: [string, string][] = [
        [U_FRV_SOURCE, "addResource(address,address)"],
        [U_FRV_SOURCE, "setInnerDepositQueue(address[])"],
        [U_FRV_SOURCE, "setInnerWithdrawQueue(address[])"],
        [U_HUB, "raiseYieldGroupCap(address,uint256,uint16)"],
        [USDT_HUB, "raiseYieldGroupCap(address,uint256,uint16)"],
      ];
      for (const [contract, sig] of held) {
        expect(await acm.hasRole(roleId(contract, sig), NORMAL_TIMELOCK)).to.equal(true, `${contract} ${sig}`);
      }
    });

    it("an Operator push into the CASH+ vault reverts ResourceNotRegistered", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(reallocatePushIntoVault(uHub.connect(operator)))
        .to.be.revertedWithCustomError(uFrv, "ResourceNotRegistered")
        .withArgs(addr(CASH_PLUS_VAULT));
    });
  });

  testVip("VIP-665 Wire Cash+ FRV vault into the U Liquidity Hub and raise FRV caps", await vip665(), {
    callbackAfterExecution: async (tx: TransactionResponse) => {
      // One resource registration + its two inner-queue setters on the U FRV source, and one cap
      // raise on each of the two Hubs.
      await expectEvents(
        tx,
        [YIELD_GROUP_FRV_ABI, HUB_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet", "YieldGroupCapRaised"],
        [1, 1, 1, 2],
      );
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

    it("sets the U FRV source's inner deposit and withdraw queues to the CASH+ vault", async () => {
      expect((await uFrv.innerDepositQueue()).map(addr)).to.deep.equal([addr(CASH_PLUS_VAULT)]);
      expect((await uFrv.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(CASH_PLUS_VAULT)]);
    });

    it("raises the FRV percentage cap to 50% on both Hubs, absolute cap unchanged", async () => {
      for (const [hub, source] of [
        [uHub, U_FRV_SOURCE],
        [usdtHub, USDT_FRV_SOURCE],
      ] as [Contract, string][]) {
        const cfg = await hub.yieldGroupConfig(source);
        expect(cfg.registered).to.equal(true);
        expect(cfg.paused).to.equal(false);
        expect(cfg.absoluteCap.toString()).to.equal(FRV_ABSOLUTE_CAP);
        expect(cfg.percentageCapBps).to.equal(FRV_PERCENTAGE_CAP_BPS_NEW);
      }
    });

    it("increases the U FRV group's effective cap and keeps it within the absolute cap", async () => {
      const effAfter = await uHub.yieldGroupEffectiveCap(U_FRV_SOURCE);
      // The percentage dimension binds (Hub TVL << 5M), so the raise 30% -> 50% must lift it.
      expect(effAfter.gt(uEffectiveCapBefore)).to.equal(true, "effective FRV cap did not rise");
      expect(effAfter.lte(BigNumber.from(FRV_ABSOLUTE_CAP))).to.equal(true, "effective cap above absolute cap");
      // 50% of the Hub's live TVL, within adapter rounding dust.
      const half = (await uHub.totalAssets()).mul(FRV_PERCENTAGE_CAP_BPS_NEW).div(10_000);
      expect(effAfter.sub(half).abs().lte(parseUnits("1", 18))).to.equal(true, "effective cap != 50% of TVL");
    });

    it("leaves the FRV group's outer queue positions untouched (out of deposit, last in withdraw)", async () => {
      expect((await uHub.outerDepositQueue()).map(addr)).to.deep.equal([addr(U_CORE_SOURCE), addr(U_FLUX_SOURCE)]);
      const withdrawQueue = (await uHub.outerWithdrawQueue()).map(addr);
      expect(withdrawQueue).to.deep.equal([addr(U_FLUX_SOURCE), addr(U_CORE_SOURCE), addr(U_FRV_SOURCE)]);
    });
  });

  describe("Post-VIP behaviour (bscmainnet)", () => {
    it("an Operator push into the CASH+ vault now clears the registry, failing only on vault capacity", async () => {
      // Registration is live: the push no longer reverts ResourceNotRegistered. The CASH+ vault is
      // still pre-Fundraising (state MarginDeposited), so its maxDeposit is 0 and the push reverts at
      // the vault-capacity gate instead — a different error, which is exactly the registration proof.
      // Once the vault opens for Fundraising, the same call places funds.
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(reallocatePushIntoVault(uHub.connect(operator)))
        .to.be.revertedWithCustomError(uFrv, "ResourceCapacityExceeded")
        .withArgs(PUSH, 0);
    });
  });
});
