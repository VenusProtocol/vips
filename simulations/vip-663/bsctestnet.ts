import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip663, { CURRENT_LT, NEW_CF, vBNB } from "../../vips/vip-663/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 100039209;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP state", () => {
    it("vBNB CF should be 0.80", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(ethers.utils.parseUnits("0.8", 18));
    });

    it("vBNB LT should be 0.80", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.liquidationThresholdMantissa).to.equal(ethers.utils.parseUnits("0.8", 18));
    });
  });

  testVip("VIP-663 [BNB Chain Testnet] Set vBNB Collateral Factor to 0", await vip663());

  describe("Post-VIP state", () => {
    it("vBNB CF should be 0", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.collateralFactorMantissa).to.equal(NEW_CF);
    });

    it("vBNB LT should remain 0.80", async () => {
      const market = await comptroller.markets(vBNB);
      expect(market.liquidationThresholdMantissa).to.equal(CURRENT_LT);
    });
  });
});
