import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  Actions,
  PROTOCOL_SHARE_RESERVE,
  asBNBMarketSpec,
  convertAmountToVTokens,
  vip518,
} from "../../vips/vip-518/bscmainnet";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import ASBNB_ABI from "./abi/asBNB.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const RATE_MODEL = "0x52F63686D09d92c367c90BCDBF79A562f81bd6BF";

const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const CHAINLINK_BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(51771903, async () => {
  let comptroller: Contract;
  let asBNB: Contract;
  let vasBNB: Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(asBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    asBNB = new ethers.Contract(asBNBMarketSpec.vToken.underlying.address, ASBNB_ABI, provider);
    vasBNB = new ethers.Contract(asBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);

    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      NATIVE_TOKEN_ADDR,
      CHAINLINK_BNB_FEED,
      bscmainnet.NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");
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

  testVip("VIP-518", await vip518(), {
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

    it("market have correct owner", async () => {
      expect(await vasBNB.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vasBNB.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
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

    it("should burn vTokens", async () => {
      const vasBNBBalanceBurned = await vasBNB.balanceOf(ethers.constants.AddressZero);

      expect(vasBNBBalanceBurned).to.equal(asBNBMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vasBNBTimelockBalance = await vasBNB.balanceOf(bscmainnet.NORMAL_TIMELOCK);

      expect(vasBNBTimelockBalance).to.equal(0);
    });
  });

  describe("Paused markets", () => {
    it("should pause asBNB market", async () => {
      expect(await comptroller.actionPaused(asBNBMarketSpec.vToken.address, Actions.BORROW)).to.equal(true);
    });
  });
});
