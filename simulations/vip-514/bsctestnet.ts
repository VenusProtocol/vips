import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  asBNB as ASBNB_BSC,
  MockedUSDF,
  PROTOCOL_SHARE_RESERVE_BSC,
  REDUCE_RESERVES_BLOCK_DELTA_BSC,
  USDFMarketSpec,
  asBNBMarketSpec,
  vip514,
} from "../../vips/vip-514/bsctestnet";
import ASBNB_ABI from "./abi/asBNB.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCKTOKEN_ABI from "./abi/mockToken.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RATE_MODEL = "0xE0d3774406296322f42CBf25e96e8388cDAf0A66"; // TODO: Ask about this

const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

forking(54414271, async () => {
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
    usdf = new ethers.Contract(MockedUSDF, MOCKTOKEN_ABI, provider);
    vUSDF = new ethers.Contract(USDFMarketSpec.vToken.address, VTOKEN_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check asBNB market not listed", async () => {
      const market = await comptroller.markets(asBNB);
      expect(market.isListed).to.equal(false);
    });

    it("check asBNB market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(asBNB, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });

    it("check USDF market not listed", async () => {
      const market = await comptroller.markets(MockedUSDF);
      expect(market.isListed).to.equal(false);
    });

    it("check USDF market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(MockedUSDF, Actions.ENTER_MARKET);
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip("VIP-514", await vip514(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewCollateralFactor",
          "NewReserveFactor",
          "ReduceReserves",
          "NewProtocolShareReserve",
        ],
        [2, 2, 2, 2, 2, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    checkInterestRate(RATE_MODEL, "asBNB", {
      base: asBNBMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: asBNBMarketSpec.interestRateModel.multiplierPerYear,
      jump: asBNBMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: asBNBMarketSpec.interestRateModel.kink,
    });

    checkInterestRate(RATE_MODEL, "vUSDF", {
      base: USDFMarketSpec.vToken.interestRateModel.baseRatePerYear,
      multiplier: USDFMarketSpec.vToken.interestRateModel.multiplierPerYear,
      jump: USDFMarketSpec.vToken.interestRateModel.jumpMultiplierPerYear,
      kink: USDFMarketSpec.vToken.interestRateModel.kink,
    });

    checkVToken(asBNBMarketSpec.vToken.address, {
      name: "Venus asBNB",
      symbol: "vasBNB",
      decimals: 18,
      underlying: ASBNB_BSC,
      exchangeRate: asBNBMarketSpec.vToken.exchangeRate,
      comptroller: asBNBMarketSpec.vToken.comptroller,
    });

    checkVToken(USDFMarketSpec.vToken.address, {
      name: "Venus USDF",
      symbol: "vUSDF",
      decimals: 18,
      underlying: MockedUSDF,
      exchangeRate: USDFMarketSpec.vToken.exchangeRate,
      comptroller: USDFMarketSpec.vToken.comptroller,
    });
  });
});
