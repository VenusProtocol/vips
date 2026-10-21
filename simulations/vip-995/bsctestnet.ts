import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip995, {
  ACCESS_CONTROL_MANAGER,
  CENTRIFUGE_SOURCE_USDT,
  CENTRIFUGE_VAULT_USDT,
  EBRAKE,
  GUARDIAN,
  HUB_NAV_SENTINEL,
  HUB_REGISTRY,
  HUB_USDT,
  MIN_PAUSE_GAP,
  NEW_HUB_NAV_SENTINEL_IMPLEMENTATION,
  OLD_HUB_NAV_SENTINEL_IMPLEMENTATION,
  PAUSE_DOWN_BPS,
  PAUSE_UP_BPS,
} from "../../vips/vip-995/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import HUB_ABI from "./abi/Hub.json";
import SENTINEL_ABI from "./abi/HubNavDeviationSentinel.json";
import PRE_AUDIT_SENTINEL_ABI from "./abi/HubNavDeviationSentinelPreAudit.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";
import YIELD_GROUP_ABI from "./abi/YieldGroupCentrifuge.json";

const { CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, NORMAL_TIMELOCK, UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

const BLOCK_NUMBER = 138047700;

const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
const NEW_SENTINEL_SETTER = "setHubNavConfig(address,address,uint16,uint16,uint256)";
const EBRAKE_HUB_ACTIONS = ["pauseHub(address)", "pauseHubYieldGroup(address)", "pauseHubResource(address,address)"];

const REVOKES = [NORMAL_TIMELOCK, GUARDIAN].flatMap(account => [
  { contract: HUB_NAV_SENTINEL, signature: "setHubNavConfig(address,address,uint16,uint16)", account },
  { contract: HUB_NAV_SENTINEL, signature: "setMinHubNavGapBps(uint16)", account },
]);
const GRANTS = [
  ...[NORMAL_TIMELOCK, GUARDIAN].map(account => ({
    contract: HUB_NAV_SENTINEL,
    signature: NEW_SENTINEL_SETTER,
    account,
  })),
  ...[GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK].flatMap(account =>
    EBRAKE_HUB_ACTIONS.map(signature => ({ contract: EBRAKE, signature, account })),
  ),
];
const WITHIN_THRESHOLD = 5;

const BREACHED = 6;

forking(BLOCK_NUMBER, async () => {
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const sentinel = new Contract(HUB_NAV_SENTINEL, SENTINEL_ABI, ethers.provider);
  const oldSentinel = new Contract(HUB_NAV_SENTINEL, PRE_AUDIT_SENTINEL_ABI, ethers.provider);
  const hub = new Contract(HUB_USDT, HUB_ABI, ethers.provider);
  const centrifugeSource = new Contract(CENTRIFUGE_SOURCE_USDT, YIELD_GROUP_ABI, ethers.provider);
  // The mock vault's value as its YieldGroup reports it at the fork block. The fork never moves it.
  let observedAtFork: BigNumber;

  const implementation = async () =>
    ethers.utils.getAddress(
      ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(HUB_NAV_SENTINEL, IMPLEMENTATION_SLOT), 12),
    );

  describe("Pre-VIP behavior", () => {
    it("the mock vault reads outside its NavGuard band", async () => {
      const status = await centrifugeSource.navGuardStatus(CENTRIFUGE_VAULT_USDT);
      expect(status.isClamped).to.be.true;
      observedAtFork = status.observedValue;
    });

    it("the sentinel proxy runs the pre-audit implementation, with its 1 bps Hub NAV gate", async () => {
      expect(await implementation()).to.equal(OLD_HUB_NAV_SENTINEL_IMPLEMENTATION);
      expect(await oldSentinel.minHubNavGapBps()).to.equal(1);
    });

    it("the audited implementation is deployed against EBrake and the Hub registry, with initializers disabled", async () => {
      const audited = new Contract(NEW_HUB_NAV_SENTINEL_IMPLEMENTATION, SENTINEL_ABI, ethers.provider);
      expect(await audited.EBRAKE()).to.equal(EBRAKE);
      expect(await audited.HUB_REGISTRY()).to.equal(HUB_REGISTRY);
      // Initializable._initialized, set to type(uint8).max by _disableInitializers()
      expect(await ethers.provider.getStorageAt(NEW_HUB_NAV_SENTINEL_IMPLEMENTATION, 0)).to.equal(
        ethers.utils.hexZeroPad("0xff", 32),
      );
    });

    it("every permission the VIP revokes is held", async () => {
      for (const { contract, signature, account } of REVOKES) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.true;
      }
    });

    it("no permission the VIP grants is held yet", async () => {
      for (const { contract, signature, account } of GRANTS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.false;
      }
    });

    it("EBrake already runs the Hub-pausing build, with IS_REMOTE_CHAIN false and its Hub-side rights", async () => {
      expect(await ebrake.IS_REMOTE_CHAIN()).to.be.false;
      expect(await ebrake.COMPTROLLER()).to.equal(UNITROLLER);
      expect(await acm.isAllowedToCall(EBRAKE, "pauseHub()", { from: HUB_USDT })).to.be.true;
      expect(await acm.isAllowedToCall(EBRAKE, "pauseYieldGroup(address)", { from: HUB_USDT })).to.be.true;
      expect(await acm.isAllowedToCall(EBRAKE, "pauseResource(address)", { from: CENTRIFUGE_SOURCE_USDT })).to.be.true;
    });

    it("the Centrifuge vault is armed with 10% bands and the Hub is live", async () => {
      const [configHub, pauseUpBps, pauseDownBps, enabled] = await oldSentinel.navGuardConfigs(
        CENTRIFUGE_SOURCE_USDT,
        CENTRIFUGE_VAULT_USDT,
      );
      expect([configHub, pauseUpBps, pauseDownBps, enabled]).to.deep.equal([
        HUB_USDT,
        PAUSE_UP_BPS,
        PAUSE_DOWN_BPS,
        true,
      ]);
      expect(await hub.hubPaused()).to.be.false;
    });
  });

  testVip("VIP-995 HubNavDeviationSentinel audit fixes and EBrake Hub pause permissions", await vip995(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [GRANTS.length, REVOKES.length]);
      await expectEvents(txResponse, [SENTINEL_ABI], ["NavGuardConfigUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("the sentinel proxy runs the audited implementation, without the Hub NAV gate", async () => {
      expect(await implementation()).to.equal(NEW_HUB_NAV_SENTINEL_IMPLEMENTATION);
      expect(await sentinel.EBRAKE()).to.equal(EBRAKE);
      expect(await sentinel.HUB_REGISTRY()).to.equal(HUB_REGISTRY);
      await expect(oldSentinel.minHubNavGapBps()).to.be.revertedWithoutReason();
    });

    it("the upgrade keeps the sentinel's ACM, owner and keeper", async () => {
      expect(await sentinel.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.trustedKeepers(GUARDIAN)).to.be.true;
    });

    it("every revoked permission is gone", async () => {
      for (const { contract, signature, account } of REVOKES) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.false;
      }
    });

    it("every granted permission is held", async () => {
      for (const { contract, signature, account } of GRANTS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.true;
      }
    });

    it("the Centrifuge vault keeps its bands, gains the minimum pause gap and stays armed", async () => {
      const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      expect(config.hub).to.equal(HUB_USDT);
      expect(config.pauseUpBps).to.equal(PAUSE_UP_BPS);
      expect(config.pauseDownBps).to.equal(PAUSE_DOWN_BPS);
      expect(config.enabled).to.be.true;
      expect(config.minPauseGap).to.equal(MIN_PAUSE_GAP);
    });

    it("the 4-argument setHubNavConfig no longer exists", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      await expect(
        oldSentinel
          .connect(guardian)
          .setHubNavConfig(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, PAUSE_UP_BPS, PAUSE_DOWN_BPS),
      ).to.be.revertedWithoutReason();
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    beforeEach(async () => {
      snapshot = await takeSnapshot();
    });
    afterEach(async () => {
      await snapshot.restore();
    });

    it("the vault sits past its band by less than the minimum gap, so the keeper's call reverts", async () => {
      const check = await sentinel.checkNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      expect(check.status).to.equal(WITHIN_THRESHOLD);
      expect(check.observedValue).to.equal(observedAtFork);

      const keeper = await initMainnetUser(GUARDIAN, parseEther("1"));
      await expect(sentinel.connect(keeper).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT))
        .to.be.revertedWithCustomError(sentinel, "DeviationWithinThreshold")
        .withArgs(CENTRIFUGE_VAULT_USDT, observedAtFork);
      expect(await hub.hubPaused()).to.be.false;
    });

    it("an untrusted caller cannot drive the sentinel", async () => {
      const [stranger] = await ethers.getSigners();
      await expect(
        sentinel.connect(stranger).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT),
      ).to.be.revertedWithCustomError(sentinel, "UnauthorizedKeeper");
      expect(await hub.hubPaused()).to.be.false;
    });

    it("with a 1 USDT minimum gap the keeper pauses the Hub through EBrake", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      await expect(
        sentinel
          .connect(guardian)
          .setHubNavConfig(
            CENTRIFUGE_SOURCE_USDT,
            CENTRIFUGE_VAULT_USDT,
            PAUSE_UP_BPS,
            PAUSE_DOWN_BPS,
            parseUnits("1", 6),
          ),
      ).to.emit(sentinel, "NavGuardConfigUpdated");

      const tx = await sentinel
        .connect(guardian)
        .handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      // The band as the sentinel measured it in that block
      const atPause = await sentinel.checkNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, {
        blockTag: (await tx.wait()).blockNumber,
      });
      expect(atPause.status).to.equal(BREACHED);
      expect(atPause.observedValue).to.equal(observedAtFork);
      await expect(tx)
        .to.emit(sentinel, "NavGuardDeviationHandled")
        .withArgs(
          HUB_USDT,
          CENTRIFUGE_SOURCE_USDT,
          CENTRIFUGE_VAULT_USDT,
          atPause.observedValue,
          atPause.centre,
          atPause.minAllowedValue,
          atPause.maxAllowedValue,
        );
      await expect(tx).to.emit(ebrake, "HubPaused").withArgs(HUB_NAV_SENTINEL, HUB_USDT);
      expect(await hub.hubPaused()).to.be.true;
    });

    it("the Guardian pauses one resource and one YieldGroup through EBrake, and nothing else", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      expect((await centrifugeSource.resourceConfig(CENTRIFUGE_VAULT_USDT)).paused).to.be.false;
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).paused).to.be.false;

      await expect(ebrake.connect(guardian).pauseHubResource(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT))
        .to.emit(ebrake, "HubResourcePaused")
        .withArgs(GUARDIAN, CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      expect((await centrifugeSource.resourceConfig(CENTRIFUGE_VAULT_USDT)).paused).to.be.true;

      await expect(ebrake.connect(guardian).pauseHubYieldGroup(CENTRIFUGE_SOURCE_USDT))
        .to.emit(ebrake, "HubYieldGroupPaused")
        .withArgs(GUARDIAN, HUB_USDT, CENTRIFUGE_SOURCE_USDT);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).paused).to.be.true;

      expect((await hub.yieldGroupConfig(FRV_SOURCE_USDT)).paused).to.be.false;
      expect(await hub.hubPaused()).to.be.false;
    });

    it("the Guardian and every Timelock can pause the Hub through EBrake, and a stranger cannot", async () => {
      for (const account of [GUARDIAN, NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        const beforePause = await takeSnapshot();
        const operator = await initMainnetUser(account, parseEther("1"));
        await expect(ebrake.connect(operator).pauseHub(HUB_USDT))
          .to.emit(ebrake, "HubPaused")
          .withArgs(account, HUB_USDT);
        expect(await hub.hubPaused(), account).to.be.true;
        await beforePause.restore();
      }

      const [stranger] = await ethers.getSigners();
      await expect(ebrake.connect(stranger).pauseHub(HUB_USDT))
        .to.be.revertedWithCustomError(ebrake, "Unauthorized")
        .withArgs(stranger.address, EBRAKE, "pauseHub(address)");
      expect(await hub.hubPaused()).to.be.false;
    });

    it("the Normal Timelock and the Guardian can retune the band, and the Fast-track Timelock cannot", async () => {
      for (const account of [NORMAL_TIMELOCK, GUARDIAN]) {
        const beforeRetune = await takeSnapshot();
        const admin = await initMainnetUser(account, parseEther("1"));
        await expect(
          sentinel.connect(admin).setHubNavConfig(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, 500, 900, 1),
        ).to.emit(sentinel, "NavGuardConfigUpdated");
        const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
        expect([config.pauseUpBps, config.pauseDownBps, config.minPauseGap.toNumber()], account).to.deep.equal([
          500, 900, 1,
        ]);
        await beforeRetune.restore();
      }

      const fastTrack = await initMainnetUser(FAST_TRACK_TIMELOCK, parseEther("1"));
      await expect(
        sentinel.connect(fastTrack).setHubNavConfig(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT, 500, 900, 1),
      )
        .to.be.revertedWithCustomError(sentinel, "Unauthorized")
        .withArgs(FAST_TRACK_TIMELOCK, HUB_NAV_SENTINEL, NEW_SENTINEL_SETTER);
    });
  });
});
