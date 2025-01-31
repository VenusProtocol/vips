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

import vip440, {
  BAL,
  CONVERSION_INCENTIVE,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  VTOKEN_RECEIVER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  vBAL,
} from "../../vips/vip-440/bscmainnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const ONE_YEAR = 360 * 24 * 60 * 60;

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["ethereum"];

export const newMarkets = {
  vBAL: {
    vToken: {
      address: vBAL,
      name: "Venus BAL (Core)",
      symbol: "vBAL_Core",
      underlying: {
        address: BAL,
        decimals: 18,
        symbol: "BAL",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.57", 18),
      liquidationThreshold: parseUnits("0.59", 18),
      supplyCap: parseUnits("1500000", 18),
      borrowCap: parseUnits("700000", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("4000", 18),
      vTokenReceiver: VTOKEN_RECEIVER,
    },
    interestRateModel: {
      address: "0x17F987e09896F19584799e3FFD10679b9C7C35f0",
      base: "0",
      multiplier: "0.09",
      jump: "3",
      kink: "0.45",
    },
  },
};

forking(21743953, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    for (const market of Object.values(newMarkets)) {
      checkVToken(market.vToken.address, market.vToken);
    }
  });

  testForkedNetworkVipCommands("BAL market in Core pool", await vip440(ONE_YEAR));

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct BAL price", async () => {
        const price = await oracle.getPrice(BAL);
        expect(price).to.be.eq("2473118440000000000");
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add BAL market to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(vBAL);
      });

      it(`should register BAL in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, BAL);
        expect(registeredVToken).to.equal(vBAL);
      });
    });

    describe("Risk parameters", () => {
      for (const market of Object.values(newMarkets)) {
        checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
      }
    });

    describe("Ownership and initial supply", () => {
      for (const { vToken: vTokenSpec, initialSupply } of Object.values(newMarkets)) {
        const vTokenContract = new ethers.Contract(vTokenSpec.address, VTOKEN_ABI, provider);

        describe(`${vTokenSpec.symbol}`, () => {
          it(`should have owner = normal timelock`, async () => {
            expect(await vTokenContract.owner()).to.equal(NORMAL_TIMELOCK);
          });

          it(`should have initial supply = 4000 ${vTokenSpec.symbol}`, async () => {
            expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(parseUnits("4000", 8));
          });
        });
      }
    });

    describe("Interest rates", () => {
      for (const { vToken, interestRateModel } of Object.values(newMarkets)) {
        checkInterestRate(interestRateModel.address, vToken.symbol, interestRateModel, BLOCKS_PER_YEAR);
      }
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

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${BAL}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, BAL);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });
  });
});
