import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664Mainnet, {
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
} from "../../vips/vip-664/bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_OPERATOR,
} from "../../vips/vip-664/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import VAULT_ABI from "./abi/CentrifugeAsyncVault.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifugeLatest.json";

const BLOCK_NUMBER = 121990800;

const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const FUNDS = [
  { name: "JTRSY", vault: JTRSY_VAULT, share: JTRSY_SHARE, poolId: JTRSY_POOL_ID, scId: JTRSY_SHARE_CLASS_ID },
  { name: "JAAA", vault: JAAA_VAULT, share: JAAA_SHARE, poolId: JAAA_POOL_ID, scId: JAAA_SHARE_CLASS_ID },
];

// The three groups already on Hub_USDT, and the queues as they stand.
const EXISTING_GROUPS = [CORE_SOURCE_USDT, FLUX_SOURCE_USDT, FRV_SOURCE_USDT];

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

  testVip("VIP-668 [BNB Chain] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup", await vip664Mainnet(), {
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

    it("onboarding moves no capital", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await hub.totalAssets()).to.equal(hubTotalBefore);
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
});
