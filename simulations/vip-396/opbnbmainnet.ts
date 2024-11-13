import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip396, { OPBNB_IRM, OPBNB_vETH_CORE } from "../../vips/vip-396/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

forking(39230450, async () => {
  let vETHCore: Contract;

  before(async () => {
    vETHCore = await ethers.getContractAt(VTOKEN_ABI, OPBNB_vETH_CORE);
  });

  testForkedNetworkVipCommands("vip396", await vip396());

  describe("Post-VIP behavior", async () => {
    it("check it correctly sets new interest rate model", async () => {
      const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

      const interestRateModel = await vETHCore.interestRateModel();
      expect(interestRateModel).to.equal(OPBNB_IRM);

      checkInterestRate(
        OPBNB_IRM,
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
