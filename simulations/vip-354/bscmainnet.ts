import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip354, {
  RATE_MODELS,
  VDAI_CORE,
  VFDUSD_CORE,
  VUSDC_CORE,
  VUSDT_CORE,
  VUSDT_DEFI,
  VUSDT_GAMEFI,
  VUSDT_STABLECOINS,
} from "../../vips/vip-354/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";
import VTOKEN_IL_ABI from "./abi/VTokenIL.json";

forking(41557364, async () => {
  const provider = ethers.provider;

  const vUSDTCore = new ethers.Contract(VUSDT_CORE, VTOKEN_CORE_POOL_ABI, provider);
  const vUSDCCore = new ethers.Contract(VUSDC_CORE, VTOKEN_CORE_POOL_ABI, provider);
  const vDAICore = new ethers.Contract(VDAI_CORE, VTOKEN_CORE_POOL_ABI, provider);
  const vFDUSDCore = new ethers.Contract(VFDUSD_CORE, VTOKEN_CORE_POOL_ABI, provider);

  const vUSDTStablecoins = new ethers.Contract(VUSDT_STABLECOINS, VTOKEN_IL_ABI, provider);
  const vUSDTGameFi = new ethers.Contract(VUSDT_GAMEFI, VTOKEN_IL_ABI, provider);
  const vUSDTDeFi = new ethers.Contract(VUSDT_DEFI, VTOKEN_IL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      for (const vToken of [vUSDTCore, vUSDCCore, vDAICore]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModel_base0bps_slope875bps_jump25000bps_kink8000bps,
        );
      }
      expect(await vFDUSDCore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModel_base0bps_slope875bps_jump50000bps_kink8000bps,
      );
      expect(await vUSDTStablecoins.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1000bps_jump25000bps_kink8000bps,
      );
      for (const vToken of [vUSDTGameFi, vUSDTDeFi]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModelV2_base200bps_slope1500bps_jump25000bps_kink8000bps,
        );
      }
    });

    describe("old interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModel_base0bps_slope875bps_jump25000bps_kink8000bps,
        "vUSDT, vUSDC, vDAI (Core pool)",
        {
          base: "0",
          multiplier: "0.0875",
          jump: "2.5",
          kink: "0.8",
        },
      );

      checkInterestRate(RATE_MODELS.JumpRateModel_base0bps_slope875bps_jump50000bps_kink8000bps, "vFDUSD (Core pool)", {
        base: "0",
        multiplier: "0.0875",
        jump: "5",
        kink: "0.8",
      });

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope1000bps_jump25000bps_kink8000bps,
        "vUSDT (Stablecoins pool)",
        {
          base: "0",
          multiplier: "0.1",
          jump: "2.5",
          kink: "0.8",
        },
      );

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base200bps_slope1500bps_jump25000bps_kink8000bps,
        "vUSDT (GameFi, DeFi pools)",
        {
          base: "0.02",
          multiplier: "0.15",
          jump: "2.5",
          kink: "0.8",
        },
      );
    });
  });

  testVip("VIP-354", await vip354(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [4]);
      await expectEvents(txResponse, [VTOKEN_IL_ABI], ["NewMarketInterestRateModel"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      for (const vToken of [vUSDTCore, vUSDCCore, vDAICore]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModel_base0bps_slope1000bps_jump25000bps_kink8000bps,
        );
      }
      expect(await vFDUSDCore.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModel_base0bps_slope750bps_jump50000bps_kink8000bps,
      );
      expect(await vUSDTStablecoins.interestRateModel()).to.equal(
        RATE_MODELS.JumpRateModelV2_base0bps_slope375bps_jump25000bps_kink8000bps,
      );
      for (const vToken of [vUSDTGameFi, vUSDTDeFi]) {
        expect(await vToken.interestRateModel()).to.equal(
          RATE_MODELS.JumpRateModelV2_base200bps_slope1350bps_jump25000bps_kink8000bps,
        );
      }
    });

    describe("new interest rate model parameters", async () => {
      checkInterestRate(
        RATE_MODELS.JumpRateModel_base0bps_slope1000bps_jump25000bps_kink8000bps,
        "vUSDT, vUSDC, vDAI (Core pool)",
        {
          base: "0",
          multiplier: "0.1",
          jump: "2.5",
          kink: "0.8",
        },
      );

      checkInterestRate(RATE_MODELS.JumpRateModel_base0bps_slope750bps_jump50000bps_kink8000bps, "vFDUSD (Core pool)", {
        base: "0",
        multiplier: "0.075",
        jump: "5",
        kink: "0.8",
      });

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base0bps_slope375bps_jump25000bps_kink8000bps,
        "vUSDT (Stablecoins pool)",
        {
          base: "0",
          multiplier: "0.0375",
          jump: "2.5",
          kink: "0.8",
        },
      );

      checkInterestRate(
        RATE_MODELS.JumpRateModelV2_base200bps_slope1350bps_jump25000bps_kink8000bps,
        "vUSDT (GameFi, DeFi pools)",
        {
          base: "0.02",
          multiplier: "0.135",
          jump: "2.5",
          kink: "0.8",
        },
      );
    });
  });
});
