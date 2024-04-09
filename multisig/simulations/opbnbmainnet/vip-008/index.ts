import { expect } from "chai";
import { Contract } from "ethers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip008 from "../../../proposals/opbnbmainnet/vip-008";
import VTOKEN_IL_ABI from "./abi/VtokenIL.json";

const vFDUSD_CORE = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
const vUSDT_CORE = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";

const NEW_IR = "0xaf6862b20280818FA24fA6D17097517608Fe65d4";
const OLD_IR = "0x2Af5a31ee1DaeF1122E6cC1750977952c6f09935";
forking(20848424, () => {
  let vfdusd: Contract;
  let vusdt: Contract;
  const BLOCKS_PER_YEAR = BigNumber.from("31536000");

  before(async () => {
    vfdusd = await ethers.getContractAt(VTOKEN_IL_ABI, vFDUSD_CORE);
    vusdt = await ethers.getContractAt(VTOKEN_IL_ABI, vUSDT_CORE);
  });
  describe("Pre-Execution state", () => {
    it("Should have old interest rate model", async () => {
      expect(await vfdusd.interestRateModel()).equals(OLD_IR);
      expect(await vusdt.interestRateModel()).equals(OLD_IR);
    });
    it("should have old parameters", async () => {
      checkInterestRate(
        OLD_IR,
        "FDUSD_Core",
        { base: "0", multiplier: "0.075", jump: "2.5", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });
  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip008());
    });
    it("Should have new interest rate model", async () => {
      expect(await vfdusd.interestRateModel()).equals(NEW_IR);
      expect(await vusdt.interestRateModel()).equals(NEW_IR);
    });
    it("should have updated parameters", async () => {
      checkInterestRate(
        NEW_IR,
        "FDUSD_Core",
        { base: "0", multiplier: "0.1", jump: "2.5", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
