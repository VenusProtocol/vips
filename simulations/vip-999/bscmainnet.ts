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
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GROUP,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_KEEPER,
  CENTRIFUGE_PERCENTAGE_CAP_BPS,
  GUARDIAN,
  JTRSY_VAULT,
  KEEPER,
  NORMAL_TIMELOCK,
  OUTER_DEPOSIT_QUEUE_UNCHANGED,
  OUTER_WITHDRAW_QUEUE,
  PRICE_GUARD_MAX_AGE,
  USDC,
  USDC_CORE_GROUP,
  USDC_FLUX_GROUP,
  USDC_FRV_GROUP,
  USDC_HUB,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import CENTRIFUGE_ABI from "./abi/YieldGroupCentrifuge.json";

// DRAFT: the Centrifuge contracts are not deployed, so every CENTRIFUGE_* / JTRSY_* / KEEPER address
// in the VIP is a dummy and this simulation is EXPECTED TO FAIL until they are swapped in. The
// structure is final — only the fork block and the address book should need touching.
const FORK_BLOCK = 116780000;

const addr = (a: string) => ethers.utils.getAddress(a);
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

forking(FORK_BLOCK, async () => {
  const hub = new ethers.Contract(USDC_HUB, HUB_ABI, ethers.provider);
  const group = new ethers.Contract(CENTRIFUGE_GROUP, CENTRIFUGE_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);

  let totalAssetsBefore: BigNumber;

  describe("Pre-VIP state", () => {
    it("the Centrifuge group is deployed and bound to the USDC Hub", async () => {
      expect(addr(await group.hub())).to.equal(addr(USDC_HUB));
      expect(addr(await group.asset())).to.equal(addr(USDC));
    });

    it("the Centrifuge group is not registered on the Hub", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_GROUP);
      expect(cfg.registered).to.equal(false);
      expect((await hub.registeredYieldGroups()).map(addr)).to.deep.equal([
        addr(USDC_CORE_GROUP),
        addr(USDC_FLUX_GROUP),
        addr(USDC_FRV_GROUP),
      ]);
    });

    it("the JTRSY vault is unregistered and the inner queues are empty", async () => {
      expect(await group.resources()).to.deep.equal([]);
      const [registered] = await group.resourceConfig(JTRSY_VAULT);
      expect(registered).to.equal(false);
      expect((await group.innerDepositQueue()).length).to.equal(0);
      expect((await group.innerWithdrawQueue()).length).to.equal(0);
    });

    it("nobody holds any role on the Centrifuge group yet", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        for (const account of [NORMAL_TIMELOCK, GUARDIAN, KEEPER]) {
          expect(await acm.hasRole(roleId(CENTRIFUGE_GROUP, sig), account)).to.equal(false, `${account} ${sig}`);
        }
      }
    });

    it("the Hub's outer queues are the launch queues", async () => {
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal([addr(USDC_CORE_GROUP), addr(USDC_FLUX_GROUP)]);
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal([
        addr(USDC_FLUX_GROUP),
        addr(USDC_CORE_GROUP),
        addr(USDC_FRV_GROUP),
      ]);
      totalAssetsBefore = await hub.totalAssets();
    });
  });

  testVip("VIP-999 Onboard the Centrifuge yield group into the USDC Liquidity Hub", await vip999(), {
    callbackAfterExecution: async (tx: TransactionResponse) => {
      await expectEvents(
        tx,
        [ACM_ABI, CENTRIFUGE_ABI, HUB_ABI],
        [
          "RoleGranted",
          "ResourceAdded",
          "InnerDepositQueueSet",
          "InnerWithdrawQueueSet",
          "PriceGuardSet",
          "YieldGroupAdded",
          "OuterWithdrawQueueSet",
        ],
        [CENTRIFUGE_GOVERNANCE.length + CENTRIFUGE_GUARDIAN.length + CENTRIFUGE_KEEPER.length, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("grants the Normal Timelock the full governance set", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleId(CENTRIFUGE_GROUP, sig), NORMAL_TIMELOCK)).to.equal(true, sig);
      }
    });

    it("grants the Guardian only the containment subset", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        const expected = CENTRIFUGE_GUARDIAN.includes(sig);
        expect(await acm.hasRole(roleId(CENTRIFUGE_GROUP, sig), GUARDIAN)).to.equal(expected, sig);
      }
    });

    it("grants the keeper only the four claim functions", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        const expected = CENTRIFUGE_KEEPER.includes(sig);
        expect(await acm.hasRole(roleId(CENTRIFUGE_GROUP, sig), KEEPER)).to.equal(expected, sig);
      }
    });

    it("registers the JTRSY vault behind AdapterCentrifuge", async () => {
      expect((await group.resources()).map(addr)).to.deep.equal([addr(JTRSY_VAULT)]);
      const [registered, paused, adapter] = await group.resourceConfig(JTRSY_VAULT);
      expect(registered).to.equal(true);
      expect(paused).to.equal(false);
      expect(addr(adapter)).to.equal(addr(ADAPTER_CENTRIFUGE));
    });

    it("sets both inner queues to the JTRSY vault", async () => {
      expect((await group.innerDepositQueue()).map(addr)).to.deep.equal([addr(JTRSY_VAULT)]);
      expect((await group.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(JTRSY_VAULT)]);
    });

    it("arms the price guard with the configured window", async () => {
      const guard = await group.priceGuard(JTRSY_VAULT);
      expect(guard.enabled).to.equal(true);
      expect(guard.maxAge).to.equal(PRICE_GUARD_MAX_AGE);
    });

    it("registers the Centrifuge group on the Hub at the configured caps", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_GROUP);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap.toString()).to.equal(CENTRIFUGE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(CENTRIFUGE_PERCENTAGE_CAP_BPS);
    });

    it("appends Centrifuge to the outer withdraw queue and leaves the deposit queue untouched", async () => {
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(OUTER_WITHDRAW_QUEUE.map(addr));
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(OUTER_DEPOSIT_QUEUE_UNCHANGED.map(addr));
    });

    it("keeps totalAssets readable (a firing price guard would halt every Hub op)", async () => {
      // Not asserted equal to the pre-VIP value: the governance flow advances many blocks, so Core
      // and Flux accrue and fees are taken. The point is that the read still succeeds, and that the
      // newly added group contributes nothing yet (no deposit has been routed into it).
      const after = await hub.totalAssets();
      expect(after.gt(0)).to.equal(true);
      expect(after.sub(totalAssetsBefore).abs().lt(totalAssetsBefore.div(1000))).to.equal(true, "TVL moved >0.1%");
    });
  });

  describe("Post-VIP behaviour", () => {
    it("the keeper can call every claim function and nothing else", async () => {
      const keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      // Claims are idempotent no-ops at zero claimable, so passing the ACM gate is the assertion.
      for (const fn of ["claimDeposit", "claimRedeem", "claimCancelDeposit", "claimCancelRedeem"] as const) {
        await expect(group.connect(keeper)[fn](JTRSY_VAULT)).to.not.be.reverted;
      }
      await expect(group.connect(keeper).unpauseResource(JTRSY_VAULT)).to.be.revertedWithCustomError(
        group,
        "Unauthorized",
      );
    });

    it("the Guardian can pause the resource but cannot unpause it", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await expect(group.connect(guardian).pauseResource(JTRSY_VAULT)).to.emit(group, "ResourcePauseToggled");
      await expect(group.connect(guardian).unpauseResource(JTRSY_VAULT)).to.be.revertedWithCustomError(
        group,
        "Unauthorized",
      );
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
