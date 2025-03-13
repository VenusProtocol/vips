import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip465, {
  COMPTROLLER_LIQUID_STAKED_BNB_POOL,
  market,
  token,
  vBNBx_LiquidStakedBNB,
  vWBNB_LiquidStakedBNB,
  vankrBNB_LiquidStakedBNB,
  vslisBNB_LiquidStakedBNB,
  vstkBNB_LiquidStakedBNB,
} from "../../vips/vip-465/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["bsctestnet"];
const BLOCKS_PER_YEAR = BigNumber.from("10512000");

forking(49051765, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_LIQUID_STAKED_BNB_POOL, COMPTROLLER_ABI, provider);
  const vTokenContract = new ethers.Contract(market.vToken.address, VTOKEN_ABI, provider);

  describe("vTokens deployment", () => {
    it(`should deploy market`, async () => {
      await checkVToken(market.vToken.address, market.vToken);
    });
  });

  testVip("vip465", await vip465());

  describe("Post-VIP behavior", () => {
    describe("Oracle configuration", async () => {
      it(`has the correct ${token.symbol} price`, async () => {
        const price = await oracle.getPrice(token.address);
        expect(price).to.be.eq(parseUnits("2315.504013308118083583", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${market.vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(market.vToken.address);
      });

      it(`should register ${market.vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(
          COMPTROLLER_LIQUID_STAKED_BNB_POOL,
          market.vToken.underlying.address,
        );
        expect(registeredVToken).to.equal(market.vToken.address);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);

      it("should pause borrowing", async () => {
        expect(await comptroller.actionPaused(market.vToken.address, 2)).to.equal(true);
      });

      it(`should have a protocol seize share ${market.riskParameters.protocolSeizeShare}`, async () => {
        expect(await vTokenContract.protocolSeizeShareMantissa()).to.equal(market.riskParameters.protocolSeizeShare);
      });
    });

    describe("Ownership and initial supply", () => {
      const { vToken: vTokenSpec, initialSupply } = market;
      const underlyingSymbol = token.symbol;

      describe(`${vTokenSpec.symbol}`, () => {
        it(`should have owner = normal timelock`, async () => {
          expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
        });

        // Initial exchange rate should account for decimal transformations such that
        // the string representation is the same (i.e. 1 vToken == 1 underlying)
        const multiplier = 10 ** (vTokenSpec.underlying.decimals - vTokenSpec.decimals);
        const vTokenSupply = initialSupply.amount.div(multiplier);
        const underlyingSupplyString = formatUnits(initialSupply.amount, vTokenSpec.underlying.decimals);
        const vTokenSupplyString = formatUnits(vTokenSupply, vTokenSpec.decimals);

        it(`should have initial supply = ${vTokenSupplyString} ${vTokenSpec.symbol}`, async () => {
          expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(vTokenSupply);
        });

        it(`should have balance of underlying = ${underlyingSupplyString} ${underlyingSymbol}`, async () => {
          const underlying = new ethers.Contract(vTokenSpec.underlying.address, ERC20_ABI, provider);
          expect(await underlying.balanceOf(vTokenSpec.address)).to.equal(initialSupply.amount);
        });
      });
    });

    describe("Interest rates", () => {
      checkInterestRate(
        market.interestRateModel.address,
        market.vToken.symbol,
        market.interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    checkIsolatedPoolsComptrollers();

    it("check liquidation incentive", async () => {
      const liquidationIncentiveMantissa = await comptroller.liquidationIncentiveMantissa();
      expect(liquidationIncentiveMantissa).to.equal(parseUnits("1.025", 18));
    });

    it("check protocol seize share incentive", async () => {
      let vtoken = new ethers.Contract(vankrBNB_LiquidStakedBNB, VTOKEN_ABI, provider);
      let protocolSeizeShare = await vtoken.protocolSeizeShareMantissa();
      expect(protocolSeizeShare).to.equal(parseUnits("0.0125", 18));

      vtoken = new ethers.Contract(vBNBx_LiquidStakedBNB, VTOKEN_ABI, provider);
      protocolSeizeShare = await vtoken.protocolSeizeShareMantissa();
      expect(protocolSeizeShare).to.equal(parseUnits("0.0125", 18));

      vtoken = new ethers.Contract(vWBNB_LiquidStakedBNB, VTOKEN_ABI, provider);
      protocolSeizeShare = await vtoken.protocolSeizeShareMantissa();
      expect(protocolSeizeShare).to.equal(parseUnits("0.0125", 18));

      vtoken = new ethers.Contract(vstkBNB_LiquidStakedBNB, VTOKEN_ABI, provider);
      protocolSeizeShare = await vtoken.protocolSeizeShareMantissa();
      expect(protocolSeizeShare).to.equal(parseUnits("0.0125", 18));

      vtoken = new ethers.Contract(vslisBNB_LiquidStakedBNB, VTOKEN_ABI, provider);
      protocolSeizeShare = await vtoken.protocolSeizeShareMantissa();
      expect(protocolSeizeShare).to.equal(parseUnits("0.0125", 18));
    });
  });
});
