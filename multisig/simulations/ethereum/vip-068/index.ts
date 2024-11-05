import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip068, IRM, vETH_CORE, vETH_LST } from "../../../proposals/ethereum/vip-068";
import VTOKEN_ABI from "./abi/vToken.json";

forking(21121545, async () => {
  let vETHCore: Contract;
  let vETHLST: Contract;

  before(async () => {
    vETHCore = await ethers.getContractAt(VTOKEN_ABI, vETH_CORE);
    vETHLST = await ethers.getContractAt(VTOKEN_ABI, vETH_LST);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip068());
    });

    it("check it correctly sets new interest rate model", async () => {
      const BLOCKS_PER_YEAR = BigNumber.from(2628000);
      
      let interestRateModel = await vETHCore.interestRateModel();
      expect(interestRateModel).to.equal(IRM);
      interestRateModel = await vETHLST.interestRateModel();
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
