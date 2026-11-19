import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip683, { EBRAKE, NEW_EBRAKE_IMPLEMENTATION, RESET_GRANTEES } from "../../vips/vip-683/bsctestnet";
import { RESET_POOL_CF_SNAPSHOT } from "../../vips/vip-683/config";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

const BLOCK_NUMBER = 142517800;

// The testnet EBrake is owned by its deployer
const DEPLOYER = "0x33C6476F88eeA28D7E7900F759B4597704Ef95B7";

// EIP-1967 implementation slot
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
// The implementation EBrake runs at the fork block
const OLD_EBRAKE_IMPLEMENTATION = "0xAC54A4D148690b7FDA22B1D29c4439aCBF668fb2";

// vUSDT is listed in the Core pool and in E-Mode pool 1 at the fork block
const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const CORE_POOL_ID = 0;
const EMODE_POOL_ID = 1;
const LOWER_CF = parseUnits("0.5", 18);

const implementationOf = async (proxy: string) =>
  ethers.utils.getAddress("0x" + (await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT)).slice(26));

forking(BLOCK_NUMBER, async () => {
  const acm = new Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const comptroller = new Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("EBrake runs the implementation from the fork block", async () => {
      expect(await implementationOf(EBRAKE)).to.equal(OLD_EBRAKE_IMPLEMENTATION);
    });

    it("nobody holds the per-pool reset permission", async () => {
      for (const account of RESET_GRANTEES) {
        expect(await acm.isAllowedToCall(account, RESET_POOL_CF_SNAPSHOT, { from: EBRAKE }), account).to.be.false;
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
      expect(await ebrake.owner()).to.equal(DEPLOYER);
    });

    it("the grantees hold the per-pool reset permission", async () => {
      for (const account of RESET_GRANTEES) {
        expect(await acm.isAllowedToCall(account, RESET_POOL_CF_SNAPSHOT, { from: EBRAKE }), account).to.be.true;
      }
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    let guardian: Contract;
    const snapshots: Record<number, [unknown, unknown]> = {};

    before(async () => {
      guardian = ebrake.connect(await initMainnetUser(GUARDIAN, parseEther("1")));
    });

    beforeEach(async () => {
      snapshot = await takeSnapshot();
      // Earlier testnet runs left vUSDT snapshots behind, and decreaseCF keeps an existing snapshot
      await guardian["resetCFSnapshot(address)"](vUSDT);
      // Tighten vUSDT in both pools so EBrake snapshots each of them
      for (const poolId of [CORE_POOL_ID, EMODE_POOL_ID]) {
        const market = await comptroller.poolMarkets(poolId, vUSDT);
        expect(market.collateralFactorMantissa).to.be.gt(LOWER_CF);
        snapshots[poolId] = [market.collateralFactorMantissa, market.liquidationThresholdMantissa];
        await guardian["decreaseCF(address,uint96,uint256)"](vUSDT, poolId, LOWER_CF);
        expect(await ebrake.getMarketCFSnapshot(vUSDT, poolId)).to.deep.equal(snapshots[poolId]);
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
      expect(await ebrake.getMarketCFSnapshot(vUSDT, EMODE_POOL_ID)).to.deep.equal(snapshots[EMODE_POOL_ID]);
    });

    it("the market-wide reset still clears every pool", async () => {
      await expect(guardian["resetCFSnapshot(address)"](vUSDT)).to.emit(ebrake, "CFSnapshotReset").withArgs(vUSDT);

      expect(await ebrake.getMarketCFSnapshot(vUSDT, CORE_POOL_ID)).to.deep.equal([0, 0]);
      expect(await ebrake.getMarketCFSnapshot(vUSDT, EMODE_POOL_ID)).to.deep.equal([0, 0]);
    });
  });
});
