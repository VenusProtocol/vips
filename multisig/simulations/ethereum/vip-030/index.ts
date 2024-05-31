import { expect } from "chai";
import { Contract } from "ethers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip030, { NEW_IR, VCRVUSD_CORE, VUSDC_CORE, VUSDT_CORE } from "../../../proposals/ethereum/vip-030";
import VTOKEN_IL_ABI from "./abi/VToken.json";

const OLD_IR = "0x508a84311d19fb77E603C1d234d560b2374d0791";

forking(19909700, () => {
  let vusdc: Contract;
  let vusdt: Contract;
  let vcurusdCore: Contract;

  const BLOCKS_PER_YEAR = BigNumber.from("2628000");

  before(async () => {
    vusdc = await ethers.getContractAt(VTOKEN_IL_ABI, VUSDC_CORE);
    vusdt = await ethers.getContractAt(VTOKEN_IL_ABI, VUSDT_CORE);
    vcurusdCore = await ethers.getContractAt(VTOKEN_IL_ABI, VCRVUSD_CORE);
  });

  describe("Pre-Execution state", () => {
    it("Should have old interest rate model", async () => {
      expect(await vusdc.interestRateModel()).equals(OLD_IR);
      expect(await vusdt.interestRateModel()).equals(OLD_IR);
      expect(await vcurusdCore.interestRateModel()).equals(OLD_IR);
    });

    it("should have old parameters", async () => {
      checkInterestRate(
        OLD_IR,
        "vusdc_core",
        { base: "0", multiplier: "0.125", jump: "2.5", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip030());
    });

    it("Should have new interest rate model", async () => {
      expect(await vusdc.interestRateModel()).equals(NEW_IR);
      expect(await vusdt.interestRateModel()).equals(NEW_IR);
      expect(await vcurusdCore.interestRateModel()).equals(NEW_IR);
    });

    it("should have updated parameters", async () => {
      checkInterestRate(
        NEW_IR,
        "vusdc_core",
        { base: "0", multiplier: "0.0875", jump: "2.5", kink: "0.8" },
        BLOCKS_PER_YEAR,
      );
    });
  });
});
