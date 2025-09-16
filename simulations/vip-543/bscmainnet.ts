import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  NATIVE_TOKEN_GATEWAY_VWBNB_CORE,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  WBNBMarketSpec,
  convertAmountToVTokens,
  vip543,
} from "../../vips/vip-543/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import NATIVE_TOKEN_GATEWAY_ABI from "./abi/NativeTokenGateway.json";
import COMPTROLLER_ABI from "./abi/OldComptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import WBNB_ABI from "./abi/WBNB.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_WBNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

forking(60902107, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let wbnb: Contract;
  let vWBNB: Contract;
  let nativeTokenGateway: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(WBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    wbnb = new ethers.Contract(WBNBMarketSpec.vToken.underlying.address, WBNB_ABI, provider);
    vWBNB = new ethers.Contract(WBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    nativeTokenGateway = new ethers.Contract(NATIVE_TOKEN_GATEWAY_VWBNB_CORE, NATIVE_TOKEN_GATEWAY_ABI, provider);

    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      WBNBMarketSpec.vToken.underlying.address,
      CHAINLINK_WBNB_FEED,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");
  });

  describe("Pre-VIP behavior", async () => {
    it("check WBNB market not listed", async () => {
      const market = await comptroller.markets(WBNBMarketSpec.vToken.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-543", await vip543(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "WithdrawTreasuryBEP20",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has expected prices", async () => {
      const redStoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
      const chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
      const binanceOracle = new ethers.Contract(bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_ABI, ethers.provider);
      expect(await chainlinkOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.equal(
        parseUnits("906.61834154", 18),
      );
      expect(await binanceOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.equal(
        parseUnits("906.49926626", 18),
      );
      await expect(redStoneOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.be.reverted; // built-in staleness checks
      expect(await resilientOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.equal(
        parseUnits("906.49926626", 18),
      );
    });

    it("check new IRM", async () => {
      expect(await vWBNB.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkTwoKinksInterestRate(RATE_MODEL, "vWBNB", {
      base: WBNBMarketSpec.interestRateModel.baseRatePerYear,
      base2: WBNBMarketSpec.interestRateModel.baseRatePerYear2,
      multiplier: WBNBMarketSpec.interestRateModel.multiplierPerYear,
      jump: WBNBMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink1: WBNBMarketSpec.interestRateModel.kink,
      kink2: WBNBMarketSpec.interestRateModel.kink2,
      multiplier2: WBNBMarketSpec.interestRateModel.multiplierPerYear2,
    });

    checkVToken(WBNBMarketSpec.vToken.address, {
      name: "Venus WBNB",
      symbol: "vWBNB",
      decimals: 8,
      underlying: WBNBMarketSpec.vToken.underlying.address,
      exchangeRate: WBNBMarketSpec.vToken.exchangeRate,
      comptroller: WBNBMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(WBNBMarketSpec.vToken.address, WBNBMarketSpec.vToken, WBNBMarketSpec.riskParameters);

    it("check price WBNB", async () => {
      const expectedPrice = parseUnits("906.49926626", 18);
      expect(await resilientOracle.getPrice(WBNBMarketSpec.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(WBNBMarketSpec.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vWBNB.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vWBNB.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vWBNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vWBNBSupply = await vWBNB.totalSupply();

      expect(vWBNBSupply).to.equal(
        convertAmountToVTokens(WBNBMarketSpec.initialSupply.amount, WBNBMarketSpec.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const wbnbBalance = await wbnb.balanceOf(vWBNB.address);

      expect(wbnbBalance).to.equal(WBNBMarketSpec.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vWBNBBalanceBurned = await vWBNB.balanceOf(ethers.constants.AddressZero);

      expect(vWBNBBalanceBurned).to.equal(WBNBMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const vWBNBReceiverBalance = await vWBNB.balanceOf(WBNBMarketSpec.initialSupply.vTokenReceiver);

      expect(vWBNBReceiverBalance).to.equal(
        convertAmountToVTokens(WBNBMarketSpec.initialSupply.amount, WBNBMarketSpec.vToken.exchangeRate).sub(
          WBNBMarketSpec.initialSupply.vTokensToBurn,
        ),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vWBNBTimelockBalance = await vWBNB.balanceOf(bscmainnet.NORMAL_TIMELOCK);

      expect(vWBNBTimelockBalance).to.equal(0);
    });

    it("should transfer the ownership of the NativeTokenGateway", async () => {
      expect(await nativeTokenGateway.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });
});
