import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { USDFMarketSpec, asBNBMarketSpec, vip514 } from "../../vips/vip-514/bsctestnet";
import ASBNB_ABI from "./abi/asBNB.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCKTOKEN_ABI from "./abi/mockToken.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RATE_MODEL = "0xE0d3774406296322f42CBf25e96e8388cDAf0A66";
const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

forking(54514316, async () => {
  let comptroller: Contract;
  let asBNB: Contract;
  let vasBNB: Contract;
  let usdf: Contract;
  let vUSDF: Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(asBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    asBNB = new ethers.Contract(asBNBMarketSpec.vToken.underlying.address, ASBNB_ABI, provider);
    vasBNB = new ethers.Contract(asBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);
    usdf = new ethers.Contract(USDFMarketSpec.vToken.underlying.address, MOCKTOKEN_ABI, provider);
    vUSDF = new ethers.Contract(USDFMarketSpec.vToken.address, VTOKEN_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check asBNB market not listed", async () => {
      const market = await comptroller.markets(asBNBMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check asBNB market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(
        asBNBMarketSpec.vToken.underlying.address,
        Actions.ENTER_MARKET,
      );
      expect(borrowPaused).to.equal(false);
    });

    it("check USDF market not listed", async () => {
      const market = await comptroller.markets(USDFMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check USDF market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(
        USDFMarketSpec.vToken.underlying.address,
        Actions.ENTER_MARKET,
      );
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip(
    "VIP-514",
    await vip514({
      maxStalePeriod: 365 * 24 * 60 * 60, // 1 year in seconds
    }),
    {
      callbackAfterExecution: async txResponse => {
        const numberOfNewMarkets = 2;

        await expectEvents(
          txResponse,
          [COMPTROLLER_ABI, VTOKEN_ABI],
          ["MarketListed", "NewSupplyCap", "NewCollateralFactor", "NewReserveFactor", "NewProtocolShareReserve"],
          [
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
          ],
        );
      },
    },
  );

  describe("Post-VIP behavior", async () => {
    checkInterestRate(RATE_MODEL, "asBNB", {
      base: asBNBMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: asBNBMarketSpec.interestRateModel.multiplierPerYear,
      jump: asBNBMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: asBNBMarketSpec.interestRateModel.kink,
    });

    checkInterestRate(RATE_MODEL, "vUSDF", {
      base: USDFMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: USDFMarketSpec.interestRateModel.multiplierPerYear,
      jump: USDFMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: USDFMarketSpec.interestRateModel.kink,
    });

    checkVToken(asBNBMarketSpec.vToken.address, {
      name: "Venus asBNB",
      symbol: "vasBNB",
      decimals: 8,
      underlying: asBNBMarketSpec.vToken.underlying.address,
      exchangeRate: asBNBMarketSpec.vToken.exchangeRate,
      comptroller: asBNBMarketSpec.vToken.comptroller,
    });

    checkVToken(USDFMarketSpec.vToken.address, {
      name: "Venus USDF",
      symbol: "vUSDF",
      decimals: 8,
      underlying: USDFMarketSpec.vToken.underlying.address,
      exchangeRate: USDFMarketSpec.vToken.exchangeRate,
      comptroller: USDFMarketSpec.vToken.comptroller,
    });
  });
});
