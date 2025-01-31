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
  COMPTROLLER,
  CONVERSION_INCENTIVE,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  vBAL,
} from "../../vips/vip-440/bsctestnet";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("2628000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY } = NETWORK_ADDRESSES["sepolia"];

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
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0x9Fafd82fE0623B286FEbe02c82C9428AD6b0e420",
      base: "0",
      multiplier: "0.09",
      jump: "3",
      kink: "0.45",
    },
  },
};

forking(7608756, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    for (const market of Object.values(newMarkets)) {
      checkVToken(market.vToken.address, market.vToken);
    }
  });

  testForkedNetworkVipCommands("BAL market in Core pool", await vip440());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct BAL price", async () => {
        const price = await oracle.getPrice(BAL);
        expect(price).to.be.eq(parseUnits("2.5", 18));
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
        [USDT_PRIME_CONVERTER]: "0x8d412FD0bc5d826615065B931171Eed10F5AF266",
        [USDC_PRIME_CONVERTER]: "0x772d68929655ce7234C8C94256526ddA66Ef641E",
        [WBTC_PRIME_CONVERTER]: "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b",
        [WETH_PRIME_CONVERTER]: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        [XVS_VAULT_CONVERTER]: "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E",
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
