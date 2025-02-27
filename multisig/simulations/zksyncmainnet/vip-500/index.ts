import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip500, { COMPTROLLER, vWUSDM, LIQUIDATION_THRESHOLD } from "../../../proposals/zksyncmainnet/vip-500";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(56689395, async () => {
  describe("Post-Execution state", () => {
    let comptroller: Contract;

    before(async () => {
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
      await pretendExecutingVip(await vip500());
    });

    it("check pause", async () => {
      expect(await comptroller.actionPaused(vWUSDM, 0)).to.be.true;
      expect(await comptroller.actionPaused(vWUSDM, 2)).to.be.true;
      expect(await comptroller.actionPaused(vWUSDM, 7)).to.be.true;
    });

    it("check CF and LT", async () => {
      const { collateralFactorMantissa, liquidationThresholdMantissa } = await comptroller.markets(vWUSDM);
      expect(collateralFactorMantissa).to.be.equal(0);
      expect(liquidationThresholdMantissa).to.be.equal(LIQUIDATION_THRESHOLD)
    });
  });
});
