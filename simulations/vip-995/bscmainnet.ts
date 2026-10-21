import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip995, {
  CENTRIFUGE_SOURCE_USDC,
  CENTRIFUGE_SOURCE_USDT,
  JAAA_USDC,
  JAAA_USDT,
  JTRSY_USDC,
  JTRSY_USDT,
  KEEPER,
  MIN_PAUSE_GAP,
  NEW_EBRAKE_IMPLEMENTATION,
  PAUSE_DOWN_BPS,
  PAUSE_UP_BPS,
} from "../../vips/vip-995/bscmainnet";
import {
  EBRAKE,
  EBRAKE_OPERATORS,
  HUB_NAV_SENTINEL,
  HUB_SENTINEL_GRANTEES,
  PERMISSIONS,
  VENUS_TEAM_MULTISIG,
} from "../../vips/vip-995/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import HUB_ABI from "./abi/Hub.json";
import SENTINEL_ABI from "./abi/HubNavDeviationSentinel.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";
import YIELD_GROUP_ABI from "./abi/YieldGroupCentrifuge.json";

const { ACCESS_CONTROL_MANAGER, CRITICAL_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK, UNITROLLER } =
  NETWORK_ADDRESSES.bscmainnet;

const BLOCK_NUMBER = 128928685;

const OLD_EBRAKE_IMPLEMENTATION = "0x2D36677EcA318c9536011D53aa752F042dd01DE8";
const HUB_REGISTRY = "0x6D93Fd479f2d37445CFBe132412e316a0364acc2";
const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";

const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const CORE_POOL_ID = 0;
const MINT_ACTION = 0;
const BORROW_ACTION = 2;

// HubNavDeviationSentinel.NavGuardCheckStatus
const OBSERVED_VALUE_ZERO = 3;
const WITHIN_THRESHOLD = 5;
const BREACHED = 6;

// The framework's fallback proposer has an Active proposal at this block, and Governor Bravo allows one per proposer
const PROPOSER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
const SUPPORTERS = [
  "0x34221485302f6F2029660a000908B5FCABB9BC6e",
  "0xc444949e0054a23c44fc45789738bdf64aed2391",
  "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
];

// `status` is what each band reads after the VIP. JAAA under the USDC Hub holds no deposits yet.
const NAV_GUARDS = [
  { yieldGroup: CENTRIFUGE_SOURCE_USDT, resource: JTRSY_USDT, hub: HUB_USDT, status: WITHIN_THRESHOLD },
  { yieldGroup: CENTRIFUGE_SOURCE_USDT, resource: JAAA_USDT, hub: HUB_USDT, status: WITHIN_THRESHOLD },
  { yieldGroup: CENTRIFUGE_SOURCE_USDC, resource: JTRSY_USDC, hub: HUB_USDC, status: WITHIN_THRESHOLD },
  { yieldGroup: CENTRIFUGE_SOURCE_USDC, resource: JAAA_USDC, hub: HUB_USDC, status: OBSERVED_VALUE_ZERO },
];

forking(BLOCK_NUMBER, async () => {
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const sentinel = new Contract(HUB_NAV_SENTINEL, SENTINEL_ABI, ethers.provider);
  const comptroller = new Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const hubs = [HUB_USDT, HUB_USDC, HUB_U].map(hub => new Contract(hub, HUB_ABI, ethers.provider));
  const [usdtHub, usdcHub, uHub] = hubs;
  // Each position's value as its YieldGroup reports it at the fork block. The fork never moves a fund's price.
  const observedAtFork = new Map<string, BigNumber>();

  const ebrakeImplementation = async () =>
    ethers.utils.getAddress(
      ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(EBRAKE, IMPLEMENTATION_SLOT), 12),
    );

  describe("Pre-VIP behavior", () => {
    it("Centrifuge positions report their values", async () => {
      for (const { yieldGroup, resource, status } of NAV_GUARDS) {
        const { observedValue } = await new Contract(yieldGroup, YIELD_GROUP_ABI, ethers.provider).navGuardStatus(
          resource,
        );
        expect(observedValue.isZero(), resource).to.equal(status === OBSERVED_VALUE_ZERO);
        observedAtFork.set(resource, observedValue);
      }
    });

    it("EBrake runs the old implementation", async () => {
      expect(await ebrakeImplementation()).to.equal(OLD_EBRAKE_IMPLEMENTATION);
      expect(await ebrake.IS_ISOLATED_POOL()).to.be.false;
      expect(await ebrake.COMPTROLLER()).to.equal(UNITROLLER);
    });

    it("Guardian cannot pause a Hub through EBrake", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      await expect(ebrake.connect(guardian).pauseHub(HUB_USDT)).to.be.revertedWithoutReason();
      expect(await usdtHub.hubPaused()).to.be.false;
    });

    it("permissions are not granted yet", async () => {
      for (const { contract, signature, account } of PERMISSIONS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.false;
      }
    });

    it("sentinel is initialized and pending Normal Timelock ownership", async () => {
      expect(await sentinel.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await sentinel.EBRAKE()).to.equal(EBRAKE);
      expect(await sentinel.HUB_REGISTRY()).to.equal(HUB_REGISTRY);
      expect(await sentinel.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.trustedKeepers(KEEPER)).to.be.false;
      for (const { yieldGroup, resource } of NAV_GUARDS) {
        const config = await sentinel.navGuardConfigs(yieldGroup, resource);
        expect(config.hub).to.equal(ethers.constants.AddressZero);
        expect(config.enabled).to.be.false;
      }
    });
  });

  testVip("VIP-995 EBrake Liquidity Hub pausing and Hub NAV deviation sentinel", await vip995(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [PERMISSIONS.length]);
      await expectEvents(
        txResponse,
        [SENTINEL_ABI],
        ["OwnershipTransferred", "TrustedKeeperUpdated", "NavGuardConfigUpdated", "NavGuardStatusChanged"],
        [1, 1, NAV_GUARDS.length, NAV_GUARDS.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake is upgraded", async () => {
      expect(await ebrakeImplementation()).to.equal(NEW_EBRAKE_IMPLEMENTATION);
      expect(await ebrake.IS_ISOLATED_POOL()).to.be.false;
      expect(await ebrake.COMPTROLLER()).to.equal(UNITROLLER);
      expect(await ebrake.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await ebrake.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("permissions are granted", async () => {
      for (const { contract, signature, account } of PERMISSIONS) {
        expect(
          await acm.isAllowedToCall(account, signature, { from: contract }),
          `${signature} on ${contract} for ${account}`,
        ).to.be.true;
      }
    });

    it("EBrake's wildcard pauses reach every Hub and YieldGroup", async () => {
      for (const hub of hubs) {
        for (const signature of ["pauseHub()", "pauseYieldGroup(address)"]) {
          expect(await acm.isAllowedToCall(EBRAKE, signature, { from: hub.address }), `${signature} on ${hub.address}`)
            .to.be.true;
        }
        for (const yieldGroup of await hub.registeredYieldGroups()) {
          expect(await acm.isAllowedToCall(EBRAKE, "pauseResource(address)", { from: yieldGroup }), yieldGroup).to.be
            .true;
        }
      }
    });

    it("Normal Timelock owns the sentinel and the keeper is trusted", async () => {
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await sentinel.trustedKeepers(KEEPER)).to.be.true;
    });

    it("Centrifuge positions are configured and armed", async () => {
      for (const { yieldGroup, resource, hub } of NAV_GUARDS) {
        const config = await sentinel.navGuardConfigs(yieldGroup, resource);
        expect(config.hub).to.equal(hub);
        expect(config.pauseUpBps).to.equal(PAUSE_UP_BPS);
        expect(config.pauseDownBps).to.equal(PAUSE_DOWN_BPS);
        expect(config.enabled).to.be.true;
        expect(config.minPauseGap).to.equal(MIN_PAUSE_GAP);
      }
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

    it("keeper cannot pause while positions are within their bands", async () => {
      const keeper = await initMainnetUser(KEEPER, parseEther("1"));
      for (const { yieldGroup, resource, hub, status } of NAV_GUARDS) {
        const check = await sentinel.checkNavGuardDeviation(yieldGroup, resource);
        expect(check.status, resource).to.equal(status);
        expect(check.hub, resource).to.equal(hub);
        expect(check.observedValue, resource).to.equal(observedAtFork.get(resource));
        const handle = sentinel.connect(keeper).handleNavGuardDeviation(yieldGroup, resource);
        if (status === WITHIN_THRESHOLD) {
          await expect(handle)
            .to.be.revertedWithCustomError(sentinel, "DeviationWithinThreshold")
            .withArgs(resource, observedAtFork.get(resource));
        } else {
          await expect(handle).to.be.revertedWithCustomError(sentinel, "NavGuardObservedValueZero").withArgs(resource);
        }
      }
      for (const hub of hubs) {
        expect(await hub.hubPaused(), hub.address).to.be.false;
      }
    });

    it("non-keeper cannot call the sentinel", async () => {
      const [stranger] = await ethers.getSigners();
      await expect(
        sentinel.connect(stranger).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT),
      ).to.be.revertedWithCustomError(sentinel, "UnauthorizedKeeper");
      for (const hub of hubs) {
        expect(await hub.hubPaused(), hub.address).to.be.false;
      }
    });

    it("keeper pauses the USDT Hub on a breach", async () => {
      // The fund's price stays put on the fork while the band's centre drifts up, so a month on JTRSY sits under the
      // centre by more than a 1 bps threshold.
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await sentinel.connect(timelock).setHubNavConfig(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, 1, 1, 1);
      await time.increase(30 * 24 * 60 * 60);

      const keeper = await initMainnetUser(KEEPER, parseEther("1"));
      const tx = await sentinel.connect(keeper).handleNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT);
      // The band as the sentinel measured it in that block
      const atPause = await sentinel.checkNavGuardDeviation(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, {
        blockTag: (await tx.wait()).blockNumber,
      });
      expect(atPause.status).to.equal(BREACHED);
      expect(atPause.observedValue).to.equal(observedAtFork.get(JTRSY_USDT));
      await expect(tx)
        .to.emit(sentinel, "NavGuardDeviationHandled")
        .withArgs(
          HUB_USDT,
          CENTRIFUGE_SOURCE_USDT,
          JTRSY_USDT,
          atPause.observedValue,
          atPause.centre,
          atPause.minAllowedValue,
          atPause.maxAllowedValue,
        );
      await expect(tx).to.emit(ebrake, "HubPaused").withArgs(HUB_NAV_SENTINEL, HUB_USDT);

      expect(await usdtHub.hubPaused()).to.be.true;
      expect(await usdcHub.hubPaused()).to.be.false;
      expect(await uHub.hubPaused()).to.be.false;
    });

    it("Guardian pauses a resource and a YieldGroup through EBrake", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      const centrifugeUsdt = new Contract(CENTRIFUGE_SOURCE_USDT, YIELD_GROUP_ABI, ethers.provider);
      expect((await centrifugeUsdt.resourceConfig(JAAA_USDT)).paused).to.be.false;
      expect((await usdcHub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDC)).paused).to.be.false;

      await expect(ebrake.connect(guardian).pauseHubResource(CENTRIFUGE_SOURCE_USDT, JAAA_USDT))
        .to.emit(ebrake, "HubResourcePaused")
        .withArgs(GUARDIAN, CENTRIFUGE_SOURCE_USDT, JAAA_USDT);
      expect((await centrifugeUsdt.resourceConfig(JAAA_USDT)).paused).to.be.true;
      expect((await centrifugeUsdt.resourceConfig(JTRSY_USDT)).paused).to.be.false;

      await expect(ebrake.connect(guardian).pauseHubYieldGroup(CENTRIFUGE_SOURCE_USDC))
        .to.emit(ebrake, "HubYieldGroupPaused")
        .withArgs(GUARDIAN, HUB_USDC, CENTRIFUGE_SOURCE_USDC);
      expect((await usdcHub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDC)).paused).to.be.true;
      expect((await usdcHub.yieldGroupConfig(CORE_SOURCE_USDC)).paused).to.be.false;

      for (const hub of hubs) {
        expect(await hub.hubPaused(), hub.address).to.be.false;
      }
    });

    it("EBrake operators can pause a Hub, Critical Timelock cannot", async () => {
      for (const account of EBRAKE_OPERATORS) {
        const beforePause = await takeSnapshot();
        const operator = await initMainnetUser(account, parseEther("1"));
        await expect(ebrake.connect(operator).pauseHub(HUB_U)).to.emit(ebrake, "HubPaused").withArgs(account, HUB_U);
        expect(await uHub.hubPaused(), account).to.be.true;
        await beforePause.restore();
      }

      const criticalTimelock = await initMainnetUser(CRITICAL_TIMELOCK, parseEther("1"));
      await expect(ebrake.connect(criticalTimelock).pauseHub(HUB_U))
        .to.be.revertedWithCustomError(ebrake, "Unauthorized")
        .withArgs(CRITICAL_TIMELOCK, EBRAKE, "pauseHub(address)");
      expect(await uHub.hubPaused()).to.be.false;
    });

    it("Hub sentinel grantees can update a band, team multisig cannot", async () => {
      for (const account of HUB_SENTINEL_GRANTEES) {
        const beforeRetune = await takeSnapshot();
        const grantee = await initMainnetUser(account, parseEther("1"));
        await expect(
          sentinel.connect(grantee).setHubNavConfig(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, 500, 900, 1),
        ).to.emit(sentinel, "NavGuardConfigUpdated");
        const config = await sentinel.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT);
        expect([config.pauseUpBps, config.pauseDownBps, config.minPauseGap.toNumber()], account).to.deep.equal([
          500, 900, 1,
        ]);
        await beforeRetune.restore();
      }

      const multisig = await initMainnetUser(VENUS_TEAM_MULTISIG, parseEther("1"));
      await expect(sentinel.connect(multisig).setHubNavConfig(CENTRIFUGE_SOURCE_USDT, JTRSY_USDT, 500, 900, 1))
        .to.be.revertedWithCustomError(sentinel, "Unauthorized")
        .withArgs(VENUS_TEAM_MULTISIG, HUB_NAV_SENTINEL, "setHubNavConfig(address,address,uint16,uint16,uint256)");
    });

    it("EBrake still pauses Core pool markets", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      expect(await comptroller.actionPaused(VUSDT, MINT_ACTION)).to.be.false;
      await expect(ebrake.connect(guardian).pauseSupply(VUSDT))
        .to.emit(ebrake, "ActionPaused")
        .withArgs(GUARDIAN, VUSDT, MINT_ACTION);
      expect(await comptroller.actionPaused(VUSDT, MINT_ACTION)).to.be.true;
      expect(await comptroller.actionPaused(VUSDT, BORROW_ACTION)).to.be.false;
    });

    it("EBrake still decreases a Core market's CF", async () => {
      // vUSDT's Core pool collateral factor and liquidation threshold at the fork block
      const cfAndLt = parseUnits("0.8", 18);
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      const before = await comptroller.poolMarkets(CORE_POOL_ID, VUSDT);
      expect(before.collateralFactorMantissa).to.equal(cfAndLt);
      expect(before.liquidationThresholdMantissa).to.equal(cfAndLt);

      await expect(ebrake.connect(guardian)["decreaseCF(address,uint256)"](VUSDT, 0))
        .to.emit(ebrake, "CollateralFactorDecreased")
        .withArgs(GUARDIAN, VUSDT, CORE_POOL_ID, 0);

      const after = await comptroller.poolMarkets(CORE_POOL_ID, VUSDT);
      expect(after.collateralFactorMantissa).to.equal(0);
      expect(after.liquidationThresholdMantissa).to.equal(cfAndLt);
      const [snapshotCF, snapshotLT] = await ebrake.getMarketCFSnapshot(VUSDT, CORE_POOL_ID);
      expect(snapshotCF).to.equal(cfAndLt);
      expect(snapshotLT).to.equal(cfAndLt);
    });
  });
});
