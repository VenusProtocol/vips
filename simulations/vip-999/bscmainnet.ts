import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  ACM,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_ABSOLUTE_CAP,
  CENTRIFUGE_CRITICAL_GUARDIAN,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_KEEPER,
  CENTRIFUGE_PERCENTAGE_CAP_BPS,
  CENTRIFUGE_SPOKE,
  CENTRIFUGE_VAULTS,
  CENTRIFUGE_YIELD_GROUP,
  CRITICAL_GUARDIAN,
  JAAA_POOL_ID,
  JAAA_SHARE_CLASS_ID,
  JAAA_VAULT,
  JTRSY_POOL_ID,
  JTRSY_SHARE_CLASS_ID,
  JTRSY_VAULT,
  NORMAL_TIMELOCK,
  OPERATOR,
  OUTER_DEPOSIT_QUEUE_UNCHANGED,
  OUTER_WITHDRAW_QUEUE,
  PRICE_GUARD_MAX_AGE,
  USDT,
  USDT_CORE_YIELD_GROUP,
  USDT_FLUX_YIELD_GROUP,
  USDT_FRV_YIELD_GROUP,
  USDT_HUB,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import CENTRIFUGE_ABI from "./abi/YieldGroupCentrifuge.json";

// DRAFT: CENTRIFUGE_YIELD_GROUP and ADAPTER_CENTRIFUGE are placeholders, so this simulation fails
// until they are swapped for the real deployment. Every other address is live and asserted for real.
const FORK_BLOCK = 117218000;

const SPOKE_ABI = [
  "function markersPricePoolPerShare(uint64,bytes16) view returns (uint64 computedAt,uint64 maxAge,uint64 validUntil)",
];
const VAULT_ABI = [
  "function asset() view returns (address)",
  "function poolId() view returns (uint64)",
  "function scId() view returns (bytes16)",
];

const addr = (a: string) => ethers.utils.getAddress(a);
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

forking(FORK_BLOCK, async () => {
  const hub = new ethers.Contract(USDT_HUB, HUB_ABI, ethers.provider);
  const group = new ethers.Contract(CENTRIFUGE_YIELD_GROUP, CENTRIFUGE_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
  const spoke = new ethers.Contract(CENTRIFUGE_SPOKE, SPOKE_ABI, ethers.provider);

  let totalAssetsBefore: BigNumber;

  describe("Pre-VIP state", () => {
    it("both Centrifuge vaults are live, USDT-denominated, and match their declared ids", async () => {
      for (const [vault, poolId, scId] of [
        [JTRSY_VAULT, JTRSY_POOL_ID, JTRSY_SHARE_CLASS_ID],
        [JAAA_VAULT, JAAA_POOL_ID, JAAA_SHARE_CLASS_ID],
      ]) {
        const v = new ethers.Contract(vault, VAULT_ABI, ethers.provider);
        expect(addr(await v.asset())).to.equal(addr(USDT), vault);
        expect((await v.poolId()).toString()).to.equal(poolId, vault);
        expect(await v.scId()).to.equal(scId, vault);
      }
    });

    it("both share classes have a published NAV inside the configured staleness window", async () => {
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      for (const [poolId, scId] of [
        [JTRSY_POOL_ID, JTRSY_SHARE_CLASS_ID],
        [JAAA_POOL_ID, JAAA_SHARE_CLASS_ID],
      ]) {
        const { computedAt } = await spoke.markersPricePoolPerShare(poolId, scId);
        expect(computedAt.gt(0)).to.equal(true, `${poolId} never published`);
        expect(now - computedAt.toNumber()).to.be.lessThan(PRICE_GUARD_MAX_AGE, `${poolId} already stale`);
      }
    });

    it("the Centrifuge group is bound to the USDT Hub and unregistered on it", async () => {
      expect(addr(await group.hub())).to.equal(addr(USDT_HUB));
      expect(addr(await group.asset())).to.equal(addr(USDT));
      expect((await hub.yieldGroupConfig(CENTRIFUGE_YIELD_GROUP)).registered).to.equal(false);
      expect((await hub.registeredYieldGroups()).map(addr)).to.deep.equal([
        addr(USDT_CORE_YIELD_GROUP),
        addr(USDT_FLUX_YIELD_GROUP),
        addr(USDT_FRV_YIELD_GROUP),
      ]);
    });

    it("no vault is registered on the group and nobody holds a role on it", async () => {
      expect(await group.resources()).to.deep.equal([]);
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        for (const account of [NORMAL_TIMELOCK, CRITICAL_GUARDIAN, OPERATOR]) {
          expect(await acm.hasRole(roleId(CENTRIFUGE_YIELD_GROUP, sig), account)).to.equal(false, `${account} ${sig}`);
        }
      }
    });

    it("the Hub's outer queues are the launch queues", async () => {
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(OUTER_DEPOSIT_QUEUE_UNCHANGED.map(addr));
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([
        addr(USDT_FLUX_YIELD_GROUP),
        addr(USDT_CORE_YIELD_GROUP),
        addr(USDT_FRV_YIELD_GROUP),
      ]);
      totalAssetsBefore = await hub.totalAssets();
    });
  });

  testVip("VIP-999 Onboard the Centrifuge yield group into the USDT Liquidity Hub", await vip999(), {
    callbackAfterExecution: async (tx: TransactionResponse) => {
      await expectEvents(
        tx,
        [ACM_ABI, CENTRIFUGE_ABI, HUB_ABI],
        [
          "RoleGranted",
          "ResourceAdded",
          "InnerDepositQueueSet",
          "PriceGuardSet",
          "YieldGroupAdded",
          "OuterWithdrawQueueSet",
        ],
        [CENTRIFUGE_GOVERNANCE.length + CENTRIFUGE_CRITICAL_GUARDIAN.length + CENTRIFUGE_KEEPER.length, 2, 1, 2, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("grants the Normal Timelock the full governance set", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleId(CENTRIFUGE_YIELD_GROUP, sig), NORMAL_TIMELOCK)).to.equal(true, sig);
      }
    });

    it("grants the Critical Guardian and the keeper only their subsets", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleId(CENTRIFUGE_YIELD_GROUP, sig), CRITICAL_GUARDIAN)).to.equal(
          CENTRIFUGE_CRITICAL_GUARDIAN.includes(sig),
          `guardian ${sig}`,
        );
        expect(await acm.hasRole(roleId(CENTRIFUGE_YIELD_GROUP, sig), OPERATOR)).to.equal(
          CENTRIFUGE_KEEPER.includes(sig),
          `keeper ${sig}`,
        );
      }
    });

    it("registers both vaults, sets the inner deposit queue, and leaves the inner withdraw queue unset", async () => {
      expect((await group.resources()).map(addr)).to.deep.equal(CENTRIFUGE_VAULTS.map(addr));
      for (const vault of CENTRIFUGE_VAULTS) {
        const [registered, paused, adapter] = await group.resourceConfig(vault);
        expect(registered).to.equal(true, vault);
        expect(paused).to.equal(false, vault);
        expect(addr(adapter)).to.equal(addr(ADAPTER_CENTRIFUGE), vault);
      }
      expect((await group.innerDepositQueue()).map(addr)).to.deep.equal(CENTRIFUGE_VAULTS.map(addr));
      expect(await group.innerWithdrawQueue()).to.deep.equal([]);
    });

    it("arms a price guard per vault against the live Spoke", async () => {
      for (const [vault, poolId, scId] of [
        [JTRSY_VAULT, JTRSY_POOL_ID, JTRSY_SHARE_CLASS_ID],
        [JAAA_VAULT, JAAA_POOL_ID, JAAA_SHARE_CLASS_ID],
      ]) {
        const guard = await group.priceGuard(vault);
        expect(guard.enabled).to.equal(true, vault);
        expect(addr(guard.spoke)).to.equal(addr(CENTRIFUGE_SPOKE), vault);
        expect(guard.poolId.toString()).to.equal(poolId, vault);
        expect(guard.scId).to.equal(scId, vault);
        expect(guard.maxAge).to.equal(PRICE_GUARD_MAX_AGE, vault);
      }
    });

    it("registers the group on the Hub at the configured caps", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_YIELD_GROUP);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap.toString()).to.equal(CENTRIFUGE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(CENTRIFUGE_PERCENTAGE_CAP_BPS);
    });

    it("appends Centrifuge to the outer withdraw queue and leaves the deposit queue untouched", async () => {
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(OUTER_WITHDRAW_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(OUTER_DEPOSIT_QUEUE_UNCHANGED.map(addr));
    });

    it("keeps totalAssets readable — the armed price guards do not fire", async () => {
      const after = await hub.totalAssets();
      expect(after.gt(0)).to.equal(true);
      expect(after.sub(totalAssetsBefore).abs().lt(totalAssetsBefore.div(1000))).to.equal(true, "TVL moved >0.1%");
    });
  });

  describe("Post-VIP behaviour", () => {
    it("the keeper can claim on both vaults and nothing else", async () => {
      const keeper = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      for (const vault of CENTRIFUGE_VAULTS) {
        for (const fn of ["claimDeposit", "claimRedeem", "claimCancelDeposit", "claimCancelRedeem"] as const) {
          await expect(group.connect(keeper)[fn](vault)).to.not.be.reverted;
        }
      }
      await expect(group.connect(keeper).unpauseResource(JTRSY_VAULT)).to.be.revertedWithCustomError(
        group,
        "Unauthorized",
      );
    });

    it("the Critical Guardian can pause a vault but cannot unpause it", async () => {
      const guardian = await initMainnetUser(CRITICAL_GUARDIAN, ethers.utils.parseEther("1"));
      await expect(group.connect(guardian).pauseResource(JAAA_VAULT)).to.emit(group, "ResourcePauseToggled");
      await expect(group.connect(guardian).unpauseResource(JAAA_VAULT)).to.be.revertedWithCustomError(
        group,
        "Unauthorized",
      );
    });

    it("the group reports zero withdrawable, so the Hub's withdraw cascade skips it", async () => {
      // Empty inner withdraw queue => maxWithdraw() is idle balance only, which is zero here.
      expect((await group.maxWithdraw()).toString()).to.equal("0");
    });

    it("a random account holds nothing on the group", async () => {
      const [random] = await ethers.getSigners();
      await expect(group.connect(random).claimDeposit(JTRSY_VAULT)).to.be.revertedWithCustomError(
        group,
        "Unauthorized",
      );
    });
  });
});
