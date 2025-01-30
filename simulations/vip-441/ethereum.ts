import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip440, { USDS } from "../../vips/vip-440/bscmainnet";
import vip441, {
  COMPTROLLER,
  CONVERSION_INCENTIVE,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTOKEN_RECEIVER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  sUSDS,
  sUSDS_ERC4626_ORACLE,
  vsUSDS,
} from "../../vips/vip-441/bscmainnet";
import ERC4626_ORACLE_ABI from "./abi/ERC4626Oracle.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const ONE_YEAR = 365 * 24 * 3600;

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

export const newMarkets = {
  vToken: {
    address: vsUSDS,
    name: "Venus sUSDS (Core)",
    symbol: "vsUSDS_Core",
    underlying: {
      address: sUSDS,
      decimals: 18,
      symbol: "sUSDS",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.73", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("30000000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 18),
    vTokenReceiver: VTOKEN_RECEIVER,
  },
  interestRateModel: {
    address: "0x322072b84434609ff64333A125516055B5B4405F",
    base: "0",
    multiplier: "0.15625",
    jump: "2.5",
    kink: "0.8",
  },
};

forking(21735465, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    it("check vtoken", async () => {
      checkVToken(newMarkets.vToken.address, newMarkets.vToken);
    });
  });

  testForkedNetworkVipCommands("USDS markets", await vip440(ONE_YEAR));
  testForkedNetworkVipCommands("sUSDS markets", await vip441());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct sUSDS oracle configuration", async () => {
        const erc4626Oracle = new ethers.Contract(sUSDS_ERC4626_ORACLE, ERC4626_ORACLE_ABI, provider);
        expect(await erc4626Oracle.CORRELATED_TOKEN()).to.equal(sUSDS);
        expect(await erc4626Oracle.UNDERLYING_TOKEN()).to.equal(USDS);
        expect(await erc4626Oracle.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });

      it("has the correct sUSDS price", async () => {
        const price = await oracle.getPrice(sUSDS);
        expect(price).to.be.eq("1032946082184943261");
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add sUSDS market to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(vsUSDS);
      });

      it(`should register sUSDS in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, sUSDS);
        expect(registeredVToken).to.equal(vsUSDS);
      });
    });

    describe("Risk parameters", () => {
      checkRiskParameters(newMarkets.vToken.address, newMarkets.vToken, newMarkets.riskParameters);
    });

    describe("Ownership and initial supply", () => {
      const vTokenContract = new ethers.Contract(newMarkets.vToken.address, VTOKEN_ABI, provider);

      describe(`${newMarkets.vToken.symbol}`, () => {
        it(`should have owner = normal timelock`, async () => {
          expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
        });

        it(`should have initial supply = 10000 ${newMarkets.vToken.symbol}`, async () => {
          expect(await vTokenContract.balanceOf(newMarkets.initialSupply.vTokenReceiver)).to.equal(
            parseUnits("10000", 8),
          );
        });
      });
    });

    describe("Interest rates", () => {
      checkInterestRate(
        newMarkets.interestRateModel.address,
        newMarkets.vToken.symbol,
        newMarkets.interestRateModel,
        BLOCKS_PER_YEAR,
      );
    });

    it("should pause brrowing on sUSDS", async () => {
      expect(await comptroller.actionPaused(newMarkets.vToken.address, 2)).to.equal(true);
    });

    it("Isolated pools generic tests", async () => {
      checkIsolatedPoolsComptrollers();
    });

    describe("Converters", () => {
      const converterBaseAssets = {
        [USDT_PRIME_CONVERTER]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        [USDC_PRIME_CONVERTER]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        [WBTC_PRIME_CONVERTER]: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        [WETH_PRIME_CONVERTER]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        [XVS_VAULT_CONVERTER]: "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A",
      };

      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${sUSDS}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, sUSDS);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
