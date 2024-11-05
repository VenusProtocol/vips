import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { IRM, vETH_CORE, vip024 } from "../../../proposals/opbnbmainnet/vip-024";
import VTOKEN_ABI from "./abi/vToken.json";

forking(39057882, async () => {
  let vETHCore: Contract;

  before(async () => {
    vETHCore = await ethers.getContractAt(VTOKEN_ABI, vETH_CORE);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip024());
    });

    it("check it correctly sets new interest rate model", async () => {
      const BLOCKS_PER_YEAR = BigNumber.from("31536000");

      const interestRateModel = await vETHCore.interestRateModel();
      expect(interestRateModel).to.equal(IRM);

      checkInterestRate(
        IRM,
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
