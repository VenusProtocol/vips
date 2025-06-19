import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  Actions,
  PROTOCOL_SHARE_RESERVE,
  asBNBMarketSpec,
  convertAmountToVTokens,
  vip520,
} from "../../vips/vip-520/bsctestnet";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import MOCKTOKEN_ABI from "./abi/MockToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import ASBNB_ABI from "./abi/asBNB.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const RATE_MODEL = "0xE0d3774406296322f42CBf25e96e8388cDAf0A66";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(54514316, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let asBNB: Contract;
  let vasBNB: Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(asBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    asBNB = new ethers.Contract(asBNBMarketSpec.vToken.underlying.address, ASBNB_ABI, provider);
    vasBNB = new ethers.Contract(asBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
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
  });

  testVip("vip-520", await vip520(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        ["MarketListed", "NewSupplyCap", "NewCollateralFactor", "NewReserveFactor", "NewProtocolShareReserve"],
        [1, 1, 1, 1, 1, 1],
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

    checkVToken(asBNBMarketSpec.vToken.address, {
      name: "Venus asBNB",
      symbol: "vasBNB",
      decimals: 8,
      underlying: asBNBMarketSpec.vToken.underlying.address,
      exchangeRate: asBNBMarketSpec.vToken.exchangeRate,
      comptroller: asBNBMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(asBNBMarketSpec.vToken.address, asBNBMarketSpec.vToken, asBNBMarketSpec.riskParameters);

    it("markets have correct owner", async () => {
      expect(await vasBNB.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vasBNB.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vasBNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vasBNBSupply = await vasBNB.totalSupply();

      expect(vasBNBSupply).to.equal(
        convertAmountToVTokens(asBNBMarketSpec.initialSupply.amount, asBNBMarketSpec.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const asBNBBalance = await asBNB.balanceOf(vasBNB.address);

      expect(asBNBBalance).to.equal(asBNBMarketSpec.initialSupply.amount);
    });

    it("should burn vTokens (on testnet transfer to VTreasury)", async () => {
      const vasBNBBalance = await vasBNB.balanceOf(bsctestnet.VTREASURY);

      expect(vasBNBBalance).to.equal(asBNBMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vasBNBTimelockBalance = await vasBNB.balanceOf(bsctestnet.NORMAL_TIMELOCK);

      expect(vasBNBTimelockBalance).to.equal(0);
    });
  });

  describe("Paused markets", () => {
    it("should pause asBNB market", async () => {
      expect(await comptroller.actionPaused(asBNBMarketSpec.vToken.address, Actions.BORROW)).to.equal(true);
    });
  });
});
