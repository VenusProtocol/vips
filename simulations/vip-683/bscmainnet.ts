import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip683, { EBRAKE, NEW_EBRAKE_IMPLEMENTATION, RESET_GRANTEES } from "../../vips/vip-683/bscmainnet";
import { RESET_POOL_CF_SNAPSHOT } from "../../vips/vip-683/config";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";

const {
  ACCESS_CONTROL_MANAGER,
  BINANCE_ORACLE,
  CHAINLINK_ORACLE,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  NORMAL_TIMELOCK,
  REDSTONE_ORACLE,
  UNITROLLER,
} = NETWORK_ADDRESSES.bscmainnet;

const BLOCK_NUMBER = 133377700;

// EIP-1967 implementation slot
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
// The implementation VIP-680 installed
const OLD_EBRAKE_IMPLEMENTATION = "0x918794Bb15BAc47C8Bbba553e7EE8BB1bD4A0959";

// vUSDT is listed in the Core pool and in E-Mode pool 4 with the same CF and LT at the fork block
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const CORE_POOL_ID = 0;
const EMODE_POOL_ID = 4;
const CF = parseUnits("0.8", 18);
const LT = parseUnits("0.8", 18);
const LOWER_CF = parseUnits("0.7", 18);

const implementationOf = async (proxy: string) =>
  ethers.utils.getAddress("0x" + (await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT)).slice(26));

forking(BLOCK_NUMBER, async () => {
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const comptroller = new Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("EBrake runs the VIP-680 implementation", async () => {
      expect(await implementationOf(EBRAKE)).to.equal(OLD_EBRAKE_IMPLEMENTATION);
    });

    it("nobody holds the per-pool reset permission", async () => {
      for (const account of [...RESET_GRANTEES, CRITICAL_TIMELOCK]) {
        expect(await acm.isAllowedToCall(account, RESET_POOL_CF_SNAPSHOT, { from: EBRAKE }), account).to.be.false;
      }
    });

    it("the grantees hold the market-wide reset permission", async () => {
      for (const account of RESET_GRANTEES) {
        expect(await acm.isAllowedToCall(account, "resetCFSnapshot(address)", { from: EBRAKE }), account).to.be.true;
      }
    });
  });

  testVip("VIP-683 EBrake per-pool CF snapshot reset", await vip683(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [RESET_GRANTEES.length]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("EBrake runs the new implementation", async () => {
      expect(await implementationOf(EBRAKE)).to.equal(NEW_EBRAKE_IMPLEMENTATION);
    });

    it("EBrake keeps its comptroller, ACM and owner", async () => {
      expect(await ebrake.COMPTROLLER()).to.equal(UNITROLLER);
      expect(await ebrake.IS_REMOTE_CHAIN()).to.be.false;
      expect(await ebrake.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await ebrake.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the grantees hold the per-pool reset permission and the Critical Timelock does not", async () => {
      for (const account of RESET_GRANTEES) {
        expect(await acm.isAllowedToCall(account, RESET_POOL_CF_SNAPSHOT, { from: EBRAKE }), account).to.be.true;
      }
      expect(await acm.isAllowedToCall(CRITICAL_TIMELOCK, RESET_POOL_CF_SNAPSHOT, { from: EBRAKE })).to.be.false;
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    let guardian: Contract;

    before(async () => {
      guardian = ebrake.connect(await initMainnetUser(GUARDIAN, parseEther("1")));

      // The governance delay leaves the fork's USDT feeds stale, and setCollateralFactor needs a valid price
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      const setDirectPrice = ["function setDirectPrice(address asset, uint256 price)"];
      await new Contract(CHAINLINK_ORACLE, setDirectPrice, timelock).setDirectPrice(USDT, parseEther("1"));
      await new Contract(REDSTONE_ORACLE, setDirectPrice, timelock).setDirectPrice(USDT, parseEther("1"));
      await new Contract(
        BINANCE_ORACLE,
        ["function setMaxStalePeriod(string symbol, uint256 maxStalePeriod)"],
        timelock,
      ).setMaxStalePeriod("USDT", 365 * 24 * 3600);
    });

    beforeEach(async () => {
      snapshot = await takeSnapshot();
      // Tighten vUSDT in both pools so EBrake snapshots each of them
      for (const poolId of [CORE_POOL_ID, EMODE_POOL_ID]) {
        const market = await comptroller.poolMarkets(poolId, vUSDT);
        expect(market.collateralFactorMantissa).to.equal(CF);
        expect(market.liquidationThresholdMantissa).to.equal(LT);
        await guardian["decreaseCF(address,uint96,uint256)"](vUSDT, poolId, LOWER_CF);
        expect(await ebrake.getMarketCFSnapshot(vUSDT, poolId)).to.deep.equal([CF, LT]);
      }
    });

    afterEach(async () => {
      await snapshot.restore();
    });

    it("Guardian clears the Core pool snapshot and keeps the E-Mode pool snapshot", async () => {
      await expect(guardian["resetCFSnapshot(address,uint96)"](vUSDT, CORE_POOL_ID))
        .to.emit(ebrake, "PoolCFSnapshotReset")
        .withArgs(vUSDT, CORE_POOL_ID);

      expect(await ebrake.getMarketCFSnapshot(vUSDT, CORE_POOL_ID)).to.deep.equal([0, 0]);
      expect(await ebrake.getMarketCFSnapshot(vUSDT, EMODE_POOL_ID)).to.deep.equal([CF, LT]);
    });

    it("Normal Timelock clears the E-Mode pool snapshot and keeps the Core pool snapshot", async () => {
      const timelock = ebrake.connect(await initMainnetUser(NORMAL_TIMELOCK, parseEther("1")));
      await expect(timelock["resetCFSnapshot(address,uint96)"](vUSDT, EMODE_POOL_ID))
        .to.emit(ebrake, "PoolCFSnapshotReset")
        .withArgs(vUSDT, EMODE_POOL_ID);

      expect(await ebrake.getMarketCFSnapshot(vUSDT, CORE_POOL_ID)).to.deep.equal([CF, LT]);
      expect(await ebrake.getMarketCFSnapshot(vUSDT, EMODE_POOL_ID)).to.deep.equal([0, 0]);
    });

    it("the market-wide reset still clears every pool", async () => {
      await expect(guardian["resetCFSnapshot(address)"](vUSDT)).to.emit(ebrake, "CFSnapshotReset").withArgs(vUSDT);

      expect(await ebrake.getMarketCFSnapshot(vUSDT, CORE_POOL_ID)).to.deep.equal([0, 0]);
      expect(await ebrake.getMarketCFSnapshot(vUSDT, EMODE_POOL_ID)).to.deep.equal([0, 0]);
    });

    it("an account without the permission cannot clear a pool snapshot", async () => {
      const critical = ebrake.connect(await initMainnetUser(CRITICAL_TIMELOCK, parseEther("1")));
      await expect(critical["resetCFSnapshot(address,uint96)"](vUSDT, CORE_POOL_ID)).to.be.revertedWithCustomError(
        ebrake,
        "Unauthorized",
      );
    });
  });
});
