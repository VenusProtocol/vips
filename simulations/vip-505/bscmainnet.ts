import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { VUSD1, vip505 } from "../../vips/vip-505/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";

forking(50329732, async () => {
  const comptroller = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  await setMaxStalePeriodInChainlinkOracle(
    NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
    USD1,
    ethers.constants.AddressZero,
    NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
  );

  describe("Pre-VIP behavior", async () => {
    it("collateral factor should be 0", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.collateralFactorMantissa).to.equal(0);
    });
  });

  testVip("VIP-505 Increase CF in USD1", await vip505(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should set collateral factor to 50%", async () => {
      const market = await comptroller.markets(VUSD1);
      expect(market.collateralFactorMantissa).to.equal(parseUnits("0.50", 18));
    });
  });
});
