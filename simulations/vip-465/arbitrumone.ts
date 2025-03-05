import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip465, {
  ARBITRUM_CORE_COMPTROLLER,
  ARBITRUM_vgmBTC_CF,
  ARBITRUM_vgmBTC_CORE,
  ARBITRUM_vgmBTC_LT,
  ARBITRUM_vgmWETH_CF,
  ARBITRUM_vgmWETH_CORE,
  ARBITRUM_vgmWETH_LT,
} from "../../vips/vip-465/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(312485973, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(ARBITRUM_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("correct CF, LT for gmBTC and gmWETH market", async () => {
      const prevCF = parseUnits("0.55", 18);
      const prevLT = parseUnits("0.6", 18);

      const vgmbtcParam = await comptroller.markets(ARBITRUM_vgmBTC_CORE);
      const vgmethParam = await comptroller.markets(ARBITRUM_vgmWETH_CORE);

      expect(vgmbtcParam.collateralFactorMantissa).to.equal(prevCF);
      expect(vgmbtcParam.liquidationThresholdMantissa).to.equal(prevLT);
      expect(vgmethParam.collateralFactorMantissa).to.equal(prevCF);
      expect(vgmethParam.liquidationThresholdMantissa).to.equal(prevLT);
    });
  });

  testForkedNetworkVipCommands("vip465", await vip465());

  describe("Post-VIP behaviour", async () => {
    it("correct CF, LT for gmBTC and gmWETH market", async () => {
      const vgmbtcParam = await comptroller.markets(ARBITRUM_vgmBTC_CORE);
      const vgmethParam = await comptroller.markets(ARBITRUM_vgmWETH_CORE);

      expect(vgmbtcParam.collateralFactorMantissa).to.equal(ARBITRUM_vgmBTC_CF);
      expect(vgmbtcParam.liquidationThresholdMantissa).to.equal(ARBITRUM_vgmBTC_LT);
      expect(vgmethParam.collateralFactorMantissa).to.equal(ARBITRUM_vgmWETH_CF);
      expect(vgmethParam.liquidationThresholdMantissa).to.equal(ARBITRUM_vgmWETH_LT);
    });
  });
});
