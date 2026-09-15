import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999Mainnet, {
  ACM,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_ABSOLUTE_CAP,
  CENTRIFUGE_BASE_MANAGER,
  CENTRIFUGE_BEACON,
  CENTRIFUGE_PERCENTAGE_CAP_BPS,
  CENTRIFUGE_RESOURCES,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  JAAA_POOL_ID,
  JAAA_SHARE,
  JAAA_SHARE_CLASS_ID,
  JAAA_VAULT,
  JTRSY_POOL_ID,
  JTRSY_SHARE,
  JTRSY_SHARE_CLASS_ID,
  JTRSY_VAULT,
  KEEPER,
  NORMAL_TIMELOCK,
  OPERATOR,
  OUTER_WITHDRAW_QUEUE,
  USDT,
  YIELD_GROUP_CENTRIFUGE_IMPL,
} from "../../vips/vip-999/bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
} from "../../vips/vip-999/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import MANAGER_ABI from "./abi/CentrifugeAsyncRequestManager.json";
import VAULT_ABI from "./abi/CentrifugeAsyncVault.json";
import HOOK_ABI from "./abi/CentrifugeFullRestrictions.json";
import SHARE_ABI from "./abi/CentrifugeShare.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifugeLatest.json";

const BLOCK_NUMBER = 122007400;

const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const FUNDS = [
  { name: "JTRSY", vault: JTRSY_VAULT, share: JTRSY_SHARE, poolId: JTRSY_POOL_ID, scId: JTRSY_SHARE_CLASS_ID },
  { name: "JAAA", vault: JAAA_VAULT, share: JAAA_SHARE, poolId: JAAA_POOL_ID, scId: JAAA_SHARE_CLASS_ID },
];

// The three groups already on Hub_USDT, and the queues as they stand.
const EXISTING_GROUPS = [CORE_SOURCE_USDT, FLUX_SOURCE_USDT, FRV_SOURCE_USDT];

// Centrifuge's Spoke, a ward of both share-class hooks and so the account that onboards a holder.
const CENTRIFUGE_SPOKE = "0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB";
// The vToken behind the Core group, the leg a reallocation pulls from.
const CORE_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// 100,000 USDT: comfortably inside the group cap, which the percentage dimension binds at ~850,000.
const TRANCHE = ethers.utils.parseUnits("100000", 18);
const NEVER_EXPIRES = "18446744073709551615"; // type(uint64).max

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let beacon: Contract;
  let source: Contract;
  let adapter: Contract;
  let acm: Contract;
  let usdt: Contract;

  let outerQueuesBefore: string[][];
  let hubTotalBefore: BigNumber;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    beacon = await ethers.getContractAt(BEACON_ABI, CENTRIFUGE_BEACON);
    source = await ethers.getContractAt(SOURCE_ABI, CENTRIFUGE_SOURCE_USDT);
    adapter = await ethers.getContractAt(ADAPTER_ABI, ADAPTER_CENTRIFUGE);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);

    outerQueuesBefore = [await hub.outerDepositQueue(), await hub.outerWithdrawQueue()];
    hubTotalBefore = await hub.totalAssets();
  });

  describe("Pre-VIP state", () => {
    it("USDT is 18-decimal and both share tokens are 6-decimal", async () => {
      expect(await usdt.decimals()).to.equal(18);
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(ERC20_ABI, fund.share);
        expect(await share.decimals(), fund.name).to.equal(6);
        expect(await share.symbol(), fund.name).to.equal(fund.name);
      }
    });

    it("both Centrifuge funds are live, denominated in USDT, and share one request manager", async () => {
      for (const fund of FUNDS) {
        const vault = await ethers.getContractAt(VAULT_ABI, fund.vault);
        expect(await vault.asset(), fund.name).to.equal(USDT);
        expect(await vault.share(), fund.name).to.equal(fund.share);
        expect(await vault.baseManager(), fund.name).to.equal(CENTRIFUGE_BASE_MANAGER);
        expect((await vault.poolId()).toString(), fund.name).to.equal(fund.poolId);
        expect(await vault.scId(), fund.name).to.equal(fund.scId);
        expect(await vault.pricePerShare(), fund.name).to.be.gt(0);
      }
    });

    it("Centrifuge has not onboarded the source to either share class yet", async () => {
      // Both share classes run a `FullRestrictions` hook, which only lets a member hold the share.
      // The source is on neither memberlist, so the first reallocation into a fund
      // cannot settle until Centrifuge adds it. That is an operational prerequisite this proposal
      // cannot satisfy — it grants roles and registers funds; it does not make Venus a member.
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDT);
        expect(isMember, fund.name).to.equal(false);
        // The Spoke is the ward that can change that.
        expect(await hook.wards(CENTRIFUGE_SPOKE), fund.name).to.equal(1);
      }
    });

    it("the Hub is live, bound to USDT and the ACM, and carries the three existing groups", async () => {
      expect(await hub.asset()).to.equal(USDT);
      expect(await hub.accessControlManager()).to.equal(ACM);
      expect(await hub.hubPaused()).to.equal(false);
      expect(await hub.registeredYieldGroups()).to.deep.equal(EXISTING_GROUPS);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).registered).to.equal(false);
    });

    it("the Centrifuge source is deployed and bound to this Hub, with no resources yet", async () => {
      expect(await ethers.provider.getCode(CENTRIFUGE_SOURCE_USDT)).to.not.equal("0x");
      expect(await source.hub()).to.equal(HUB_USDT);
      expect(await source.asset()).to.equal(USDT);
      expect(await source.accessControlManager()).to.equal(ACM);
      expect(await source.resources()).to.deep.equal([]);
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([]);
      expect(await source.totalAssets()).to.equal(0);
    });

    it("the beacon serves the recorded implementation and is owned by the normal timelock", async () => {
      expect(await beacon.implementation()).to.equal(YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the adapter accepts both funds and reads them as USDT", async () => {
      expect(await ethers.provider.getCode(ADAPTER_CENTRIFUGE)).to.not.equal("0x");
      for (const fund of FUNDS) {
        await adapter.validateRegistration(fund.vault);
        expect(await adapter.asset(fund.vault), fund.name).to.equal(USDT);
        expect(await adapter.pricePerShare(fund.vault), fund.name).to.be.gt(0);
        expect(await adapter.receiptBalance(fund.vault, CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
      }
    });

    it("nobody holds any role on the source, and nobody holds a wildcard either", async () => {
      for (const holder of [NORMAL_TIMELOCK, OPERATOR, KEEPER, GUARDIAN, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
          expect(
            await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), holder),
            `wildcard ${holder} ${sig}`,
          ).to.equal(false);
        }
      }
    });
  });

  testVip("VIP-999 [BNB Chain] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup", await vip999Mainnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted"],
        [
          CENTRIFUGE_GOVERNANCE.length +
            CENTRIFUGE_OPERATOR.length +
            CENTRIFUGE_CLAIMS.length +
            CENTRIFUGE_GUARDIAN.length,
        ],
      );
      await expectEvents(
        txResponse,
        [SOURCE_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [FUNDS.length, 1, 1],
      );
      await expectEvents(txResponse, [HUB_ABI], ["YieldGroupAdded", "OuterWithdrawQueueSet"], [1, 1]);
      await expectEvents(txResponse, [HUB_ABI], ["OuterDepositQueueSet"], [0]);
    },
  });

  describe("Post-VIP state", () => {
    it("both funds are registered behind the adapter and unpaused", async () => {
      expect(await source.resources()).to.deep.equal(CENTRIFUGE_RESOURCES);
      for (const fund of FUNDS) {
        const cfg = await source.resourceConfig(fund.vault);
        expect(cfg.registered, fund.name).to.equal(true);
        expect(cfg.paused, fund.name).to.equal(false);
        expect(cfg.adapter, fund.name).to.equal(ADAPTER_CENTRIFUGE);
      }
    });

    it("both inner queues list both funds in order", async () => {
      expect(await source.innerDepositQueue()).to.deep.equal(CENTRIFUGE_RESOURCES);
      expect(await source.innerWithdrawQueue()).to.deep.equal(CENTRIFUGE_RESOURCES);
    });

    it("the group is registered on the Hub at the intended caps", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap).to.equal(CENTRIFUGE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(CENTRIFUGE_PERCENTAGE_CAP_BPS);
      expect(await hub.registeredYieldGroups()).to.deep.equal([...EXISTING_GROUPS, CENTRIFUGE_SOURCE_USDT]);
    });

    it("Centrifuge is appended last to the withdraw cascade, ahead of nothing", async () => {
      const withdrawQueue: string[] = await hub.outerWithdrawQueue();
      expect(withdrawQueue).to.deep.equal(OUTER_WITHDRAW_QUEUE);
      expect(withdrawQueue[withdrawQueue.length - 1]).to.equal(CENTRIFUGE_SOURCE_USDT);
      // The pre-existing order is preserved ahead of it, not reshuffled.
      expect(withdrawQueue.slice(0, -1)).to.deep.equal(outerQueuesBefore[1]);
    });

    it("the deposit queue is untouched, so no user deposit routes into Centrifuge", async () => {
      expect(await hub.outerDepositQueue()).to.deep.equal(outerQueuesBefore[0]);
      expect(await hub.outerDepositQueue()).to.not.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("onboarding moves no capital into the new group", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      for (const fund of FUNDS) {
        expect(await adapter.receiptBalance(fund.vault, CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
        const share = await ethers.getContractAt(ERC20_ABI, fund.share);
        expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
      }
    });

    it("the Hub's total is unchanged but for what Core, Flux and FRV accrued meanwhile", async () => {
      let sum = BigNumber.from(0);
      for (const group of await hub.registeredYieldGroups()) {
        sum = sum.add(await (await ethers.getContractAt(SOURCE_ABI, group)).totalAssets());
      }
      expect(await hub.totalAssets()).to.equal(sum.add(await usdt.balanceOf(HUB_USDT)));
      expect(await source.totalAssets()).to.equal(0);
      expect(await hub.totalAssets()).to.be.gte(hubTotalBefore);
    });

    it("no NAV guard is armed and no APY is published, for either fund", async () => {
      for (const fund of FUNDS) {
        const band = await source.navGuard(fund.vault);
        expect(band.anchor, fund.name).to.equal(0);
        expect(band.interval, fund.name).to.equal(0);
        expect(band.capEnabled, fund.name).to.equal(false);
        expect(band.floorEnabled, fund.name).to.equal(false);
        expect((await source.navGuardStatus(fund.vault)).isClamped, fund.name).to.equal(false);
        expect(await source.resourceSpotAPYBps(fund.vault), fund.name).to.equal(0);
      }
      expect(await source.spotAPYBps()).to.equal(0);
    });

    it("the timelock holds the whole surface", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("the operator holds its keeper surface and nothing beyond it", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), OPERATOR), sig).to.equal(
          CENTRIFUGE_OPERATOR.includes(sig),
        );
      }
    });

    it("the keeper holds the four claim functions and nothing else", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER), sig).to.equal(
          CENTRIFUGE_CLAIMS.includes(sig),
        );
      }
      // Sweeping claims must not imply moving value out of the group.
      for (const sig of ["sweep(address,address)", "removeResource(address)", "requestRedeem(address,uint256)"]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER), sig).to.equal(false);
      }
    });

    it("the guardian holds containment only, and cannot unpause", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN), sig).to.equal(
          CENTRIFUGE_GUARDIAN.includes(sig),
        );
      }
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, "unpauseResource(address)"), GUARDIAN)).to.equal(false);
    });

    it("the operator can arm a band but cannot snapshot or toggle one", async () => {
      const armable = "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)";
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, armable), OPERATOR)).to.equal(true);
      for (const sig of ["setNavGuardSnapshot(address,uint128,uint64)", "setNavGuardEnabled(address,bool,bool)"]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), OPERATOR), sig).to.equal(false);
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("the fast-track and critical timelocks are granted nothing", async () => {
      for (const holder of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
        }
      }
    });

    it("the source was never granted the right to pause the Hub", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(false);
    });
  });
  describe("Post-VIP end-to-end: the Operator routes capital into Centrifuge", () => {
    let operator: SignerWithAddress;
    let manager: Contract;

    const leg = (yieldGroup: string, resource: string, amount: BigNumber) => ({ yieldGroup, resource, amount });

    before(async () => {
      operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      manager = await ethers.getContractAt(MANAGER_ABI, CENTRIFUGE_BASE_MANAGER);

      // Centrifuge onboards the Venus source to both share classes. Modelled by impersonating the
      // Spoke, the ward of both hooks, because it is Centrifuge's action and not the proposal's.
      const spoke = await initMainnetUser(CENTRIFUGE_SPOKE, ethers.utils.parseEther("1"));
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        await hook.connect(spoke).updateMember(fund.share, CENTRIFUGE_SOURCE_USDT, NEVER_EXPIRES);
      }
    });

    it("the source is a member of both share classes once Centrifuge adds it", async () => {
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDT);
        expect(isMember, fund.name).to.equal(true);
      }
    });

    it("an operator reallocation moves capital out of Core and into JTRSY", async () => {
      const hubTotalBeforeMove = await hub.totalAssets();
      const coreBefore = await (await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDT)).totalAssets();

      await hub
        .connect(operator)
        .reallocate([leg(CORE_SOURCE_USDT, CORE_VUSDT, TRANCHE)], [leg(CENTRIFUGE_SOURCE_USDT, JTRSY_VAULT, TRANCHE)]);

      // The request is pending, so the position is valued at cost and none of it is liquid.
      expect(await source.totalAssets()).to.equal(TRANCHE);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);

      // Capital moved rather than appeared. Core is down by the tranche less the interest it books
      // in the same transaction — the reallocation accrues it, catching up every block skipped over
      // the timelock delay — so the net drop is slightly under the tranche and never over it.
      const coreAfter = await (await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDT)).totalAssets();
      const coreDrop = coreBefore.sub(coreAfter);
      expect(coreDrop).to.be.lte(TRANCHE);
      expect(coreDrop).to.be.gte(TRANCHE.mul(99).div(100));
      expect(await hub.totalAssets()).to.be.gte(hubTotalBeforeMove);
    });

    it("Centrifuge records it as a pending deposit request, with nothing issued", async () => {
      const state = await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT);
      expect(state.pendingDepositRequest).to.equal(TRANCHE);
      expect(state.maxMint).to.equal(0);
      expect(state.maxWithdraw).to.equal(0);
      expect(state.pendingCancelDepositRequest).to.equal(false);

      // No shares yet, but the position is not empty: `receiptBalance` counts the pending request,
      // which is exactly what stops `removeResource` from dropping a fund with capital in flight.
      const share = await ethers.getContractAt(SHARE_ABI, JTRSY_SHARE);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await adapter.receiptBalance(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT)).to.equal(TRANCHE);
      await expect(source.connect(operator).removeResource(JTRSY_VAULT)).to.be.reverted;
    });

    it("claiming before Centrifuge settles is a no-op rather than a revert", async () => {
      await source.connect(operator).claimDeposit(JTRSY_VAULT);
      const share = await ethers.getContractAt(SHARE_ABI, JTRSY_SHARE);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.totalAssets()).to.equal(TRANCHE);
    });

    it("the keeper can claim, holding nothing beyond the four claim functions", async () => {
      const keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      await source.connect(keeper).claimDeposit(JTRSY_VAULT);
      await source.connect(keeper).claimRedeem(JTRSY_VAULT);
      // ...but it cannot open or cancel a request.
      await expect(source.connect(keeper).requestRedeem(JTRSY_VAULT, 1)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
      await expect(source.connect(keeper).cancelDepositRequest(JTRSY_VAULT)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
    });

    it("the operator can cancel a request Centrifuge has not filled", async () => {
      await source.connect(operator).cancelDepositRequest(JTRSY_VAULT);
      const state = await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT);
      expect(state.pendingCancelDepositRequest).to.equal(true);
    });

    it("the guardian can pause a fund, and a paused fund takes no more capital", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await source.connect(guardian).pauseResource(JAAA_VAULT);
      expect((await source.resourceConfig(JAAA_VAULT)).paused).to.equal(true);

      await expect(
        hub
          .connect(operator)
          .reallocate([leg(CORE_SOURCE_USDT, CORE_VUSDT, TRANCHE)], [leg(CENTRIFUGE_SOURCE_USDT, JAAA_VAULT, TRANCHE)]),
      ).to.be.reverted;

      // And the guardian cannot undo its own pause: only governance can.
      await expect(source.connect(guardian).unpauseResource(JAAA_VAULT)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
    });
  });
});
