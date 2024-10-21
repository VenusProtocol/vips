import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip386, {SEPOLIA_CORE_COMPTROLLER, SEPOLIA_vUSDC, CF, LT} from "../../vips/vip-386/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(6917786, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, SEPOLIA_CORE_COMPTROLLER);
  });

  testForkedNetworkVipCommands("vip386", await vip386());

  describe("Post-VIP behavior", async () => {
    it("check CF and LT", async () => {
      const market = await comptroller.markets(SEPOLIA_vUSDC);
      expect(market.collateralFactorMantissa).to.equal(CF);
      expect(market.liquidationThresholdMantissa).to.equal(LT);
    });
  });
});