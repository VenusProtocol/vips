import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  CONVERSION_INCENTIVE,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  REDUCE_RESERVES_BLOCK_DELTA,
  convertAmountToVTokens,
  converterBaseAssets,
  marketSpecs,
  vTokensRemaining,
  vip615,
} from "../../vips/vip-615/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(83432607, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let XAUM: Contract;
  let vXAUM: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    XAUM = new ethers.Contract(marketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vXAUM = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check XAUM market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-615", await vip615(true), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "ActionPausedMarket",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new IRM", async () => {
      expect(await vXAUM.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vXAUM", {
      base: marketSpecs.interestRateModel.baseRatePerYear,
      multiplier: marketSpecs.interestRateModel.multiplierPerYear,
      jump: marketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: marketSpecs.interestRateModel.kink,
    });

    checkVToken(marketSpecs.vToken.address, {
      name: "Venus Matrixdock Gold",
      symbol: "vXAUM",
      decimals: 8,
      underlying: marketSpecs.vToken.underlying.address,
      exchangeRate: marketSpecs.vToken.exchangeRate,
      comptroller: marketSpecs.vToken.comptroller,
    });

    checkRiskParameters(marketSpecs.vToken.address, marketSpecs.vToken, marketSpecs.riskParameters);

    it("get correct price from oracle ", async () => {
      const price = await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address);
      expect(price).to.equal(parseUnits("5240.367", 18));
    });

    it("market have correct owner", async () => {
      expect(await vXAUM.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vXAUM.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vXAUM.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vXAUMSupply = await vXAUM.totalSupply();
      expect(vXAUMSupply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("market should have correct reduce reserves block delta", async () => {
      const blockDelta = await vXAUM.reduceReservesBlockDelta();
      expect(blockDelta).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("market should have balance of underlying", async () => {
      const XAUMBalance = await XAUM.balanceOf(vXAUM.address);
      expect(XAUMBalance).to.equal(marketSpecs.initialSupply.amount);
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vXAUMTimelockBalance = await vXAUM.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vXAUMTimelockBalance).to.equal(0);
    });

    it("should burn vTokens", async () => {
      const vXAUMBalanceBurned = await vXAUM.balanceOf(ethers.constants.AddressZero);
      expect(vXAUMBalanceBurned).to.equal(marketSpecs.initialSupply.vTokensToBurn);
    });

    it("should send remaining vTokens to vTokenReceiver", async () => {
      const vXAUMReceiverBalance = await vXAUM.balanceOf(marketSpecs.initialSupply.vTokenReceiver);
      expect(vXAUMReceiverBalance).to.equal(vTokensRemaining);
    });

    it("should pause Borrow on vXAUM market", async () => {
      expect(await comptroller.actionPaused(marketSpecs.vToken.address, 2)).to.equal(true);
    });

    // Verify isBorrowAllowed flag is set to false in market configuration
    it("should have borrowAllowed to False for vXAUM market", async () => {
      const vXAUMMarket = await comptroller.markets(marketSpecs.vToken.address);
      expect(vXAUMMarket.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        // Verify each converter has the correct incentive configured for XAUM token conversions
        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset XAUM`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            marketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
