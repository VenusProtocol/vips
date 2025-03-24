import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip448, { COMPTROLLER_CORE, market, token } from "../../vips/vip-448/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
const XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";
const converterBaseAssets = {
  [USDT_PRIME_CONVERTER]: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT USDTTokenConverter BaseAsset
  [USDC_PRIME_CONVERTER]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC USDCTokenConverter BaseAsset
  [WBTC_PRIME_CONVERTER]: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC WBTCTokenConverter BaseAsset
  [WETH_PRIME_CONVERTER]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH WETHTokenConverter BaseAsset
  [XVS_VAULT_CONVERTER]: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A", // XVS XVSTokenConverter BaseAsset
};
const CONVERSION_INCENTIVE = parseUnits("3", 14);

const BLOCKS_PER_YEAR = BigNumber.from("2628000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

forking(21801393, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  const vTokenContract = new ethers.Contract(market.vToken.address, VTOKEN_ABI, provider);

  describe("vTokens deployment", () => {
    before(async () => {
      const weth = new ethers.Contract(WETH, ERC20_ABI, provider);
      await setMaxStalePeriod(oracle, weth);
    });

    it(`should deploy market`, async () => {
      await checkVToken(market.vToken.address, market.vToken);
    });

    it(`has the correct ${token.symbol} price`, async () => {
      const price = await oracle.getPrice(token.address);
      expect(price).to.be.eq(parseUnits("2672.239223726228558785", 18));
    });
  });

  testForkedNetworkVipCommands("vip448", await vip448(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["MarketSupported"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it(`has the correct ${token.symbol} price`, async () => {
        const price = await oracle.getPrice(token.address);
        expect(price).to.be.eq(parseUnits("2672.239223726228558785", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add ${market.vToken.symbol} to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(market.vToken.address);
      });

      it(`should register ${market.vToken.symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(
          COMPTROLLER_CORE,
          market.vToken.underlying.address,
        );
        expect(registeredVToken).to.equal(market.vToken.address);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);

      it("should pause borrowing on wsuperOETHb", async () => {
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

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        const asset = market.vToken.underlying.address;
        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, asset);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
