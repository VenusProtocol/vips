import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import {
  ABSOLUTE_CAP_UNBOUNDED,
  ACM,
  ADAPTER_CORE_V1,
  ADAPTER_FLUX,
  ADAPTER_FRV,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  FRV_VAULT_USDT,
  FUSDT_FLUX,
  HUB_REGISTRY,
  HUB_USDT,
  NORMAL_TIMELOCK,
  PERCENTAGE_CAP_DISABLED,
  USDT,
  VUSDT_CORE,
} from "../../vips/vip-680/addresses/bsctestnet";
import vip680 from "../../vips/vip-680/bsctestnet";
import vip680Wiring from "../../vips/vip-680/bsctestnet-wiring";
import HUB_ABI from "./abi/Hub.json";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// bsctestnet block after the Liquidity Hub (USDT) redeployment and the FRV vault creation.
const BLOCK_NUMBER = 119474506;

const addr = (a: string) => ethers.utils.getAddress(a);

const OUTER_QUEUE = [FRV_SOURCE_USDT, FLUX_SOURCE_USDT, CORE_SOURCE_USDT];

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let registry: Contract;
  let core: Contract;
  let frv: Contract;
  let flux: Contract;

  before(async () => {
    // This wiring proposal needs the roles + ownership from the main VIP-680 proposal. Replay it as the
    // Normal Timelock so the fixture snapshot reflects the on-chain state after it executes.
    await pretendExecutingVip(await vip680(), NORMAL_TIMELOCK);

    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
    core = await ethers.getContractAt(YIELD_GROUP_ABI, CORE_SOURCE_USDT);
    frv = await ethers.getContractAt(YIELD_GROUP_ABI, FRV_SOURCE_USDT);
    flux = await ethers.getContractAt(YIELD_GROUP_ABI, FLUX_SOURCE_USDT);
  });

  describe("Pre-wiring state (after main VIP-680)", () => {
    it("Normal Timelock owns the Hub and registry (main VIP-680 accepted ownership)", async () => {
      expect(await hub.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await registry.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Hub unregistered, no yield groups, sources empty", async () => {
      expect(await registry.isHub(HUB_USDT)).to.equal(false);
      expect(await registry.getHubs()).to.deep.equal([]);
      expect(await hub.registeredYieldGroups()).to.deep.equal([]);
      for (const src of [core, frv, flux]) {
        expect(await src.resources()).to.deep.equal([]);
      }
    });

    it("Hub advertises zero deposit capacity (no routes wired)", async () => {
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.equal(0);
    });
  });

  testVip("VIP-680 [BNB Testnet] Liquidity Hub (USDT) wiring", await vip680Wiring(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [HUB_REGISTRY_ABI], ["HubAdded"], [1]);
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterDepositQueueSet", "OuterWithdrawQueueSet"],
        [3, 1, 1],
      );
      await expectEvents(
        txResponse,
        [YIELD_GROUP_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [3, 3, 3],
      );

      // README invariant: HubAdded lands at a lower log index than every YieldGroupAdded, so indexers
      // seed each Hub's yield-group set correctly.
      const receipt = await txResponse.wait();
      const topicHubAdded = new ethers.utils.Interface(HUB_REGISTRY_ABI).getEventTopic("HubAdded");
      const topicYieldGroupAdded = new ethers.utils.Interface(HUB_ABI).getEventTopic("YieldGroupAdded");
      const hubAddedIdx = receipt.logs.filter(l => l.topics[0] === topicHubAdded).map(l => l.logIndex);
      const yieldGroupAddedIdx = receipt.logs.filter(l => l.topics[0] === topicYieldGroupAdded).map(l => l.logIndex);
      expect(hubAddedIdx.length).to.equal(1);
      expect(yieldGroupAddedIdx.length).to.equal(3);
      expect(hubAddedIdx[0]).to.be.lessThan(Math.min(...yieldGroupAddedIdx));
    },
  });

  describe("Post-wiring state", () => {
    it("Hub is registered in the HubRegistry", async () => {
      expect(await registry.isHub(HUB_USDT)).to.equal(true);
      expect((await registry.getHubsCount()).toNumber()).to.equal(1);
      expect(addr(await registry.hubForAsset(USDT))).to.equal(addr(HUB_USDT));
    });

    it("three yield groups registered on the Hub, all uncapped", async () => {
      expect((await hub.registeredYieldGroups()).map(addr)).to.have.members(
        [CORE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT].map(addr),
      );
      for (const src of [CORE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT]) {
        const cfg = await hub.yieldGroupConfig(src);
        expect(cfg.registered).to.equal(true);
        expect(cfg.paused).to.equal(false);
        expect(cfg.absoluteCap.toString()).to.equal(ABSOLUTE_CAP_UNBOUNDED);
        expect(cfg.percentageCapBps).to.equal(PERCENTAGE_CAP_DISABLED);
      }
    });

    it("Hub outer queues route [FRV, Flux, Core] for deposits and withdrawals", async () => {
      const want = OUTER_QUEUE.map(addr);
      expect((await hub.outerDepositQueue()).map(addr)).to.deep.equal(want);
      expect((await hub.outerWithdrawQueue()).map(addr)).to.deep.equal(want);
    });

    it("each source holds its resource behind the right adapter, with matching inner queues", async () => {
      const cases: [Contract, string, string][] = [
        [core, VUSDT_CORE, ADAPTER_CORE_V1],
        [frv, FRV_VAULT_USDT, ADAPTER_FRV],
        [flux, FUSDT_FLUX, ADAPTER_FLUX],
      ];
      for (const [src, resource, adapter] of cases) {
        expect((await src.resources()).map(addr)).to.deep.equal([addr(resource)]);
        const [registered, paused, boundAdapter] = await src.resourceConfig(resource);
        expect(registered).to.equal(true);
        expect(paused).to.equal(false);
        expect(addr(boundAdapter)).to.equal(addr(adapter));
        expect((await src.innerDepositQueue()).map(addr)).to.deep.equal([addr(resource)]);
        expect((await src.innerWithdrawQueue()).map(addr)).to.deep.equal([addr(resource)]);
      }
    });

    it("accessControlManager is the canonical ACM on all five contracts", async () => {
      for (const c of [hub, registry, core, frv, flux]) {
        expect(addr(await c.accessControlManager())).to.equal(addr(ACM));
      }
    });

    it("Hub now advertises deposit capacity through the wired route", async () => {
      // maxDeposit walks the whole live route: Hub outer queue -> source inner queue -> adapter.maxDeposit.
      expect(await hub.maxDeposit(NORMAL_TIMELOCK)).to.be.gt(0);
    });
  });
});
