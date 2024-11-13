import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip392, { ARBITRUM_IRM, ARBITRUM_vETH_CORE, ARBITRUM_vETH_LST } from "../../vips/vip-392/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

forking(273956364, async () => {
  let vETHCore: Contract;
  let vETHLST: Contract;

  before(async () => {
    vETHCore = await ethers.getContractAt(VTOKEN_ABI, ARBITRUM_vETH_CORE);
    vETHLST = await ethers.getContractAt(VTOKEN_ABI, ARBITRUM_vETH_LST);
  });

  testForkedNetworkVipCommands("vip392", await vip392());

  describe("Post-VIP behavior", async () => {
    it("check it correctly sets new interest rate model", async () => {
      const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

      let interestRateModel = await vETHCore.interestRateModel();
      expect(interestRateModel).to.equal(ARBITRUM_IRM);
      interestRateModel = await vETHLST.interestRateModel();
      expect(interestRateModel).to.equal(ARBITRUM_IRM);

      checkInterestRate(
        ARBITRUM_IRM,
        "vETH",
        {
          base: "0",
          multiplier: "0.03",
          jump: "4.5",
          kink: "0.9",
        },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
