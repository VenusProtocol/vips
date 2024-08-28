import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip055, { RATE_MODELS, VCRVUSD_CORE, VDAI_CORE, VTUSD_CORE } from "../../../proposals/ethereum/vip-055";
import VTOKEN_IL_ABI from "./abi/VTokenIL.json";

const ETH_BLOCKS_PER_YEAR = BigNumber.from(2_628_000);

forking(20575000, async () => {
  const provider = ethers.provider;

  const vDAICore = new ethers.Contract(VDAI_CORE, VTOKEN_IL_ABI, provider);
  const vcrvUSDCore = new ethers.Contract(VCRVUSD_CORE, VTOKEN_IL_ABI, provider);
  const vTUSDCore = new ethers.Contract(VTUSD_CORE, VTOKEN_IL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vDAICore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps_alternative,
      );
      expect(await vcrvUSDCore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
      );
      expect(await vTUSDCore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps,
      );
    });

    describe("old interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps_alternative,
        "vDAI (Core pool)",
        {
          base: "0",
          multiplier: "0.15",
          jump: "2.5",
          kink: "0.8",
        },
        ETH_BLOCKS_PER_YEAR,
      );

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
        "vcrvUSD (Core pool)",
        {
          base: "0",
          multiplier: "0.0875",
          jump: "2.5",
          kink: "0.8",
        },
        ETH_BLOCKS_PER_YEAR,
      );

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps,
        "vTUSD (Core pool)",
        {
          base: "0",
          multiplier: "0.15",
          jump: "2.5",
          kink: "0.8",
        },
        ETH_BLOCKS_PER_YEAR,
      );
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip055());
    });

    it("has the new interest rate model addresses", async () => {
      for (const vToken of [vDAICore, vTUSDCore]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
        );
      }
      expect(await vcrvUSDCore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps,
      );
    });

    describe("new interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope875bps_jump25000bps_kink8000bps,
        "vDAI, vTUSD (Core pool)",
        {
          base: "0",
          multiplier: "0.0875",
          jump: "2.5",
          kink: "0.8",
        },
        ETH_BLOCKS_PER_YEAR,
      );

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1500bps_jump25000bps_kink8000bps,
        "vcrvUSD (Core pool)",
        {
          base: "0",
          multiplier: "0.15",
          jump: "2.5",
          kink: "0.8",
        },
        ETH_BLOCKS_PER_YEAR,
      );
    });
  });
});
