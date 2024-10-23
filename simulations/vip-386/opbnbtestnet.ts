import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip386, { CF, LT, OPBNBTESTNET_CORE_COMPTROLLER, OPBNBTESTNET_vUSDT } from "../../vips/vip-386/bsctestnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(42835470, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, OPBNBTESTNET_CORE_COMPTROLLER);
  });

  testForkedNetworkVipCommands("vip386", await vip386());

  describe("Post-VIP behavior", async () => {
    it("check CF and LT", async () => {
      const market = await comptroller.markets(OPBNBTESTNET_vUSDT);
      expect(market.collateralFactorMantissa).to.equal(CF);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });
  });
});
