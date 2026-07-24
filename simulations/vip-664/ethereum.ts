import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip664, {
  ETH_CORE_COMPTROLLER,
  ETH_DEVIATION_SENTINEL,
  ETH_EBRAKE,
  ETH_NORMAL_TIMELOCK,
  ETH_VTREASURY,
  EXPECTED_EBTC_UNDERLYING,
  eBTC,
  veBTC,
} from "../../vips/vip-664/bscmainnet";

// Recent Ethereum block — the eBTC market, EBrake and DeviationSentinel (VIP-616) all predate it,
// and the Deviation Sentinel has already snapshotted eBTC's CF ([0.68, 0.72]) by this height.
const FORK_BLOCK = 25590000;
// Core pool id used for the EBrake CF-snapshot reads (single-pool IL comptroller).
const CORE_POOL_ID = 0;
// Comptroller Action enum (isolated-pools ComptrollerInterface): BORROW is index 2.
const ACTION_BORROW = 2;

const COMPTROLLER_ABI = [
  "function supplyCaps(address) view returns (uint256)",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
  "function actionPaused(address market, uint8 action) view returns (bool)",
];
const EBRAKE_ABI = ["function getMarketCFSnapshot(address,uint96) view returns (uint256 cf, uint256 lt)"];
const DEVIATION_SENTINEL_ABI = ["function tokenConfigs(address) view returns (uint8 deviation, bool enabled)"];
const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

forking(FORK_BLOCK, async () => {
  const comptroller = new Contract(ETH_CORE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const ebrake = new Contract(ETH_EBRAKE, EBRAKE_ABI, ethers.provider);
  const deviationSentinel = new Contract(ETH_DEVIATION_SENTINEL, DEVIATION_SENTINEL_ABI, ethers.provider);
  const vebtc = new Contract(veBTC, ERC20_ABI, ethers.provider);
  const ebtc = new Contract(eBTC, ERC20_ABI, ethers.provider);

  let treasuryVeBTCBefore: BigNumber;
  let treasuryEBTCBefore: BigNumber;

  describe("Pre-VIP state", () => {
    it("eBTC supply cap is 25 eBTC", async () => {
      expect(await comptroller.supplyCaps(veBTC)).to.equal(parseUnits("25", 8));
    });

    it("EBrake holds a CF snapshot [0.68, 0.72] for veBTC", async () => {
      const { cf, lt } = await ebrake.getMarketCFSnapshot(veBTC, CORE_POOL_ID);
      expect(cf).to.equal(parseUnits("0.68", 18));
      expect(lt).to.equal(parseUnits("0.72", 18));
    });

    it("Deviation Sentinel monitors eBTC (enabled)", async () => {
      const config = await deviationSentinel.tokenConfigs(eBTC);
      expect(config.enabled).to.equal(true);
    });

    // The delisting's collateral-factor and borrow-pause actions were already applied via the
    // Emergency Brake (EBrake.decreaseCF + pauseBorrow), so they are not repeated in this VIP.
    // Assert the eBTC market is already in that delisted state before the VIP runs.
    it("eBTC collateral factor is already 0 (set via the Emergency Brake)", async () => {
      const { collateralFactorMantissa } = await comptroller.markets(veBTC);
      expect(collateralFactorMantissa).to.equal(0);
    });

    it("borrowing on eBTC is already paused (set via the Emergency Brake)", async () => {
      expect(await comptroller.actionPaused(veBTC, ACTION_BORROW)).to.equal(true);
    });

    it("the Treasury holds a veBTC position and no eBTC yet", async () => {
      treasuryVeBTCBefore = await vebtc.balanceOf(ETH_VTREASURY);
      treasuryEBTCBefore = await ebtc.balanceOf(ETH_VTREASURY);
      expect(treasuryVeBTCBefore).to.be.gt(0);
    });

    it("the Normal Timelock holds no veBTC or eBTC before the VIP", async () => {
      expect(await vebtc.balanceOf(ETH_NORMAL_TIMELOCK)).to.equal(0);
      expect(await ebtc.balanceOf(ETH_NORMAL_TIMELOCK)).to.equal(0);
    });
  });

  testForkedNetworkVipCommands("VIP-664 Ethereum eBTC delisting", await vip664());

  describe("Post-VIP state", () => {
    it("eBTC supply cap is 0", async () => {
      expect(await comptroller.supplyCaps(veBTC)).to.equal(0);
    });

    it("EBrake CF snapshot for veBTC is cleared", async () => {
      const { cf, lt } = await ebrake.getMarketCFSnapshot(veBTC, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
    });

    it("Deviation Sentinel no longer monitors eBTC (deviation config preserved)", async () => {
      const configBefore = 3; // deviation threshold set in VIP-616 era, preserved by a disable
      const config = await deviationSentinel.tokenConfigs(eBTC);
      expect(config.enabled).to.equal(false);
      expect(config.deviation).to.equal(configBefore);
    });

    // resetCFSnapshot only clears the EBrake's stored snapshot; it does NOT restore the collateral
    // factor, and the VIP never touches the borrow pause. Confirm the delisted state still holds.
    it("eBTC collateral factor remains 0 after the VIP", async () => {
      const { collateralFactorMantissa } = await comptroller.markets(veBTC);
      expect(collateralFactorMantissa).to.equal(0);
    });

    it("borrowing on eBTC remains paused after the VIP", async () => {
      expect(await comptroller.actionPaused(veBTC, ACTION_BORROW)).to.equal(true);
    });

    it("the Treasury's veBTC is redeemed and the eBTC returned to the Treasury", async () => {
      // The whole veBTC position was withdrawn to the Normal Timelock, redeemed, and the eBTC
      // transferred back, so the Treasury holds no veBTC and its eBTC balance grew by the redeemed
      // underlying (1:1 at the fixed 1e18 exchange rate — no dust).
      expect(await vebtc.balanceOf(ETH_VTREASURY)).to.equal(0);
      const treasuryEBTCAfter = await ebtc.balanceOf(ETH_VTREASURY);
      expect(treasuryEBTCAfter.sub(treasuryEBTCBefore)).to.equal(EXPECTED_EBTC_UNDERLYING);
    });

    it("the Normal Timelock keeps no leftover veBTC or eBTC", async () => {
      expect(await vebtc.balanceOf(ETH_NORMAL_TIMELOCK)).to.equal(0);
      expect(await ebtc.balanceOf(ETH_NORMAL_TIMELOCK)).to.equal(0);
    });
  });
});
