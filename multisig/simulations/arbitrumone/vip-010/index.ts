import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip010, { RATE_MODELS, VUSDC_CORE, VUSDT_CORE } from "../../../proposals/arbitrumone/vip-010";
import VTOKEN_IL_ABI from "./abi/VTokenIL.json";

const ARB_BLOCKS_PER_YEAR = BigNumber.from(31_536_000);

forking(245111060, async () => {
  const provider = ethers.provider;

  const vUSDCCore = new ethers.Contract(VUSDC_CORE, VTOKEN_IL_ABI, provider);
  const vUSDTCore = new ethers.Contract(VUSDT_CORE, VTOKEN_IL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      for (const vToken of [vUSDCCore, vUSDTCore]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
        );
      }
    });

    describe("old interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
        "vUSDT, vUSDC (Core pool)",
        {
          base: "0",
          multiplier: "0.0875",
          jump: "2.5",
          kink: "0.8",
        },
        ARB_BLOCKS_PER_YEAR,
      );
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it("has the new interest rate model addresses", async () => {
      for (const vToken of [vUSDCCore, vUSDTCore]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModelV2_base0bps_slope800bps_jump25000bps_kink8000bps,
        );
      }
    });

    describe("new interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope800bps_jump25000bps_kink8000bps,
        "vUSDT, vUSDC (Core pool)",
        {
          base: "0",
          multiplier: "0.08",
          jump: "2.5",
          kink: "0.8",
        },
        ARB_BLOCKS_PER_YEAR,
      );
    });
  });
});
