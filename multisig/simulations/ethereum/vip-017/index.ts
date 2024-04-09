import { expect } from "chai";
import { Contract } from "ethers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip017 from "../../../proposals/ethereum/vip-017";
import VTOKEN_IL_ABI from "./abi/VtokenIL.json";

const vUSDC_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
const vUSDT_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
const vCURUSD_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
const vCURUSD_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";

const NEW_IR = "0xd7fbFD2A36b8b388E6d04C7a05956Df91862E146";
const OLD_IR = "0x1C243a1aCe202424fa79F71de36225DF93B9e5C5";
forking(19612715, () => {
  let vusdc: Contract;
  let vusdt: Contract;
  let vcurusdCore: Contract;
  let vcurvusdCurve: Contract;

  const BLOCKS_PER_YEAR = BigNumber.from("2628000");

  before(async () => {
    vusdc = await ethers.getContractAt(VTOKEN_IL_ABI, vUSDC_CORE);
    vusdt = await ethers.getContractAt(VTOKEN_IL_ABI, vUSDT_CORE);
    vcurusdCore = await ethers.getContractAt(VTOKEN_IL_ABI, vCURUSD_CORE);
    vcurvusdCurve = await ethers.getContractAt(VTOKEN_IL_ABI, vCURUSD_CURVE);
  });
  describe("Pre-Execution state", () => {
    it("Should have old interest rate model", async () => {
      expect(await vusdc.interestRateModel()).equals(OLD_IR);
      expect(await vusdt.interestRateModel()).equals(OLD_IR);
      expect(await vcurusdCore.interestRateModel()).equals(OLD_IR);
      expect(await vcurvusdCurve.interestRateModel()).equals(OLD_IR);
    });
    it("should have old parameters", async () => {
      checkInterestRate(
        OLD_IR,
        "vusdc_core",
        { base: "0", multiplier: "0.075", jump: "0.8", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });
  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip017());
    });
    it("Should have new interest rate model", async () => {
      expect(await vusdc.interestRateModel()).equals(NEW_IR);
      expect(await vusdt.interestRateModel()).equals(NEW_IR);
      expect(await vcurusdCore.interestRateModel()).equals(NEW_IR);
      expect(await vcurvusdCurve.interestRateModel()).equals(NEW_IR);
    });
    it("should have updated parameters", async () => {
      checkInterestRate(
        NEW_IR,
        "vusdc_core",
        { base: "0", multiplier: "0.1", jump: "2.5", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
