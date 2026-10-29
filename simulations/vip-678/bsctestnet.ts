import { FakeContract, smock } from "@defi-wonderland/smock";
import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip678, { BSTOCK_PAUSE_SENTINEL, EBRAKE } from "../../vips/vip-678/bsctestnet";
import SENTINEL_ABI from "./abi/BStockPauseSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import PROXY_ABI from "./abi/OptimizedTransparentUpgradeableProxy.json";
import SPOKE_COMPTROLLER_ABI from "./abi/SpokeComptroller.json";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

const BLOCK_NUMBER = 139577200;

// NVDAB market on the Hub Spoke pool. Its mock token has no PauseManager, so the sim fakes it as a bStock.
const vNVDAB_SPOKE = "0x41A860F11Ddb71ed7d3063aE43dF0e9741B4eed3";
const NVDAB_SPOKE = "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56";
const HUB_SPOKE_COMPTROLLER = "0x11960c84d6c4F2a978a12372721C3A6A88C78f4c";

// EBrake reports a Spoke market under pool id 0
const SPOKE_POOL_ID = 0;
// vNVDAB's collateral factor and liquidation threshold at the fork block
const CF = parseUnits("0.5", 18);
const LT = parseUnits("0.6", 18);

forking(BLOCK_NUMBER, async () => {
  const sentinel = new Contract(BSTOCK_PAUSE_SENTINEL, SENTINEL_ABI, ethers.provider);
  const ebrake = new Contract(EBRAKE, EBRAKE_ABI, ethers.provider);
  const spokeComptroller = new Contract(HUB_SPOKE_COMPTROLLER, SPOKE_COMPTROLLER_ABI, ethers.provider);
  let pauseManager: FakeContract;
  let compliance: FakeContract;

  // An unpaused bStock whose compliance module rejects the market's vToken
  before(async () => {
    pauseManager = await smock.fake(["function isTokenPaused(address token) view returns (bool)"]);
    compliance = await smock.fake(["function checkIsCompliant(address token, address account) view"]);
    const token = await smock.fake(
      ["function pauseManager() view returns (address)", "function compliance() view returns (address)"],
      { address: NVDAB_SPOKE },
    );
    pauseManager.isTokenPaused.returns(false);
    compliance.checkIsCompliant.whenCalledWith(NVDAB_SPOKE, vNVDAB_SPOKE).reverts();
    token.pauseManager.returns(pauseManager.address);
    token.compliance.returns(compliance.address);

    const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
    await sentinel.connect(guardian).setMarketMonitored(vNVDAB_SPOKE, true);
  });

  describe("Pre-VIP behavior", () => {
    it("sentinel does not treat a compliance block as a pause", async () => {
      const check = await sentinel.checkBStockPause(vNVDAB_SPOKE);
      expect(check.isPaused).to.be.false;
      expect(check.underlying).to.equal(NVDAB_SPOKE);
      expect(check.pauseManager).to.equal(pauseManager.address);
    });
  });

  testVip("VIP-678 BStockPauseSentinel compliance-block check", await vip678(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("sentinel keeps its owner, ACM and EBrake", async () => {
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await sentinel.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await sentinel.EBRAKE()).to.equal(EBRAKE);
    });

    it("sentinel treats a compliance block on the market as a pause", async () => {
      const check = await sentinel.checkBStockPause(vNVDAB_SPOKE);
      expect(check.isPaused).to.be.true;
      expect(check.underlying).to.equal(NVDAB_SPOKE);
      expect(check.pauseManager).to.equal(pauseManager.address);
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

    it("keeper zeroes the blocked Spoke market's CF, keeping LT", async () => {
      const before = await spokeComptroller.markets(vNVDAB_SPOKE);
      expect(before.collateralFactorMantissa).to.equal(CF);
      expect(before.liquidationThresholdMantissa).to.equal(LT);

      const keeper = await initMainnetUser(GUARDIAN, parseEther("1"));
      await sentinel.connect(keeper).setTrustedKeeper(GUARDIAN, true);
      await expect(sentinel.connect(keeper).handleBStockPause(vNVDAB_SPOKE))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(vNVDAB_SPOKE, NVDAB_SPOKE, pauseManager.address)
        .and.to.emit(ebrake, "CollateralFactorDecreased")
        .withArgs(BSTOCK_PAUSE_SENTINEL, vNVDAB_SPOKE, SPOKE_POOL_ID, 0);

      const after = await spokeComptroller.markets(vNVDAB_SPOKE);
      expect(after.collateralFactorMantissa).to.equal(0);
      expect(after.liquidationThresholdMantissa).to.equal(LT);
      const [snapshotCF, snapshotLT] = await ebrake.getMarketCFSnapshot(vNVDAB_SPOKE, SPOKE_POOL_ID);
      expect(snapshotCF).to.equal(CF);
      expect(snapshotLT).to.equal(LT);
    });

    it("sentinel does not treat the market as paused once the compliance module accepts it", async () => {
      compliance.checkIsCompliant.reset();
      expect((await sentinel.checkBStockPause(vNVDAB_SPOKE)).isPaused).to.be.false;
    });
  });
});
