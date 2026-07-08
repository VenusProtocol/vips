import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, { CURRENT_LT, vETH, vETH_NEW_CF, vUSDT, vUSDT_NEW_CF } from "../../vips/vip-664/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 117950000;
const vUSDT_CURRENT_CF = parseUnits("0.75", 18);

// Underlyings of the two markets whose CF is being raised. setCollateralFactor
// requires a live price when CF > 0, and testVip advances block.timestamp past
// the governance delays, so these feeds must be kept fresh for execution.
const ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const ERC20_ABI = ["function symbol() view returns (string)"];

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);

  before(async () => {
    const resilientOracle = new ethers.Contract(await comptroller.oracle(), RESILIENT_ORACLE_ABI, provider);
    const eth = new ethers.Contract(ETH, ERC20_ABI, provider);
    const usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    await setMaxStalePeriodForAllAssets(resilientOracle, [eth, usdt]);
  });

  describe("Pre-VIP state", () => {
    it("vETH CF should be 0", async () => {
      const market = await comptroller.markets(vETH);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("vETH LT should be 0.80", async () => {
      const market = await comptroller.markets(vETH);
      expect(market.liquidationThresholdMantissa).to.equal(CURRENT_LT);
    });

    it("vUSDT CF should be 0.75", async () => {
      const market = await comptroller.markets(vUSDT);
      expect(market.collateralFactorMantissa).to.equal(vUSDT_CURRENT_CF);
    });

    it("vUSDT LT should be 0.80", async () => {
      const market = await comptroller.markets(vUSDT);
      expect(market.liquidationThresholdMantissa).to.equal(CURRENT_LT);
    });
  });

  testVip("VIP-664 [BNB Chain Testnet] Update Core Pool Collateral Factors (vETH, vUSDT)", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor"], [2]);
    },
  });

  describe("Post-VIP state", () => {
    it("vETH CF should be 0.79", async () => {
      const market = await comptroller.markets(vETH);
      expect(market.collateralFactorMantissa).to.equal(vETH_NEW_CF);
    });

    it("vETH LT should remain 0.80", async () => {
      const market = await comptroller.markets(vETH);
      expect(market.liquidationThresholdMantissa).to.equal(CURRENT_LT);
    });

    it("vUSDT CF should be 0.80", async () => {
      const market = await comptroller.markets(vUSDT);
      expect(market.collateralFactorMantissa).to.equal(vUSDT_NEW_CF);
    });

    it("vUSDT LT should remain 0.80", async () => {
      const market = await comptroller.markets(vUSDT);
      expect(market.liquidationThresholdMantissa).to.equal(CURRENT_LT);
    });

    it("collateral factor never exceeds liquidation threshold", async () => {
      const eth = await comptroller.markets(vETH);
      const usdt = await comptroller.markets(vUSDT);
      expect(eth.collateralFactorMantissa).to.be.lte(eth.liquidationThresholdMantissa);
      expect(usdt.collateralFactorMantissa).to.be.lte(usdt.liquidationThresholdMantissa);
    });
  });
});
