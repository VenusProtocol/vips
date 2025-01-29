import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { vip071 } from "../../multisig/proposals/sepolia/vip-071/index";
import vip440, {
  COMPTROLLER,
  CONVERSION_INCENTIVE,
  USDC_PRIME_CONVERTER,
  USDS,
  USDT_PRIME_CONVERTER,
  WBTC_PRIME_CONVERTER,
  WETH_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
  sUSDS,
  sUSDS_ERC4626_ORACLE,
  vUSDS,
  vsUSDS,
} from "../../vips/vip-440/bsctestnet";
import ERC4626_ORACLE_ABI from "./abi/ERC4626Oracle.json";
import POOL_REGISTRY_ABI from "./abi/PoolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("2628000");

const { POOL_REGISTRY, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY } = NETWORK_ADDRESSES["sepolia"];

export const newMarkets = {
  vUSDS: {
    vToken: {
      address: vUSDS,
      name: "Venus USDS (Core)",
      symbol: "vUSDS_Core",
      underlying: {
        address: USDS,
        decimals: 18,
        symbol: "USDS",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER,
    },
    riskParameters: {
      collateralFactor: parseUnits("0.73", 18),
      liquidationThreshold: parseUnits("0.75", 18),
      supplyCap: parseUnits("65000000", 18),
      borrowCap: parseUnits("7680000", 18),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("0.05", 18),
    },
    initialSupply: {
      amount: parseUnits("10000", 18),
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0xBd20E6922A5b1e20B5e611700f1Cab7c177C35De",
      base: "0",
      multiplier: "0.15625",
      jump: "2.5",
      kink: "0.8",
    },
  },
  vsUSDS: {
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
      vTokenReceiver: VTREASURY,
    },
    interestRateModel: {
      address: "0xBd20E6922A5b1e20B5e611700f1Cab7c177C35De",
      base: "0",
      multiplier: "0.15625",
      jump: "2.5",
      kink: "0.8",
    },
  },
};

forking(7582260, async () => {
  const provider = ethers.provider;
  const oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const poolRegistry = new ethers.Contract(POOL_REGISTRY, POOL_REGISTRY_ABI, provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("vTokens deployment", () => {
    before(async () => {
      await pretendExecutingVip(await vip071());
    });
    for (const market of Object.values(newMarkets)) {
      checkVToken(market.vToken.address, market.vToken);
    }
  });

  testForkedNetworkVipCommands("USDS & sUSDS markets", await vip440());

  describe("Post-VIP state", () => {
    describe("Oracle configuration", async () => {
      it("has the correct USDS price", async () => {
        const price = await oracle.getPrice(USDS);
        expect(price).to.be.eq(parseUnits("1.1", 18));
      });

      it("has the correct sUSDS oracle configuration", async () => {
        const erc4626Oracle = new ethers.Contract(sUSDS_ERC4626_ORACLE, ERC4626_ORACLE_ABI, provider);
        expect(await erc4626Oracle.CORRELATED_TOKEN()).to.equal(sUSDS);
        expect(await erc4626Oracle.UNDERLYING_TOKEN()).to.equal(USDS);
        expect(await erc4626Oracle.RESILIENT_ORACLE()).to.equal(RESILIENT_ORACLE);
      });

      it("has the correct wUSDM price", async () => {
        const price = await oracle.getPrice(sUSDS);
        expect(price).to.be.eq(parseUnits("1.1", 18));
      });
    });

    describe("PoolRegistry state", () => {
      it(`should add USDS market to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(vUSDS);
      });
      it(`should add sUSDS market to the Comptroller`, async () => {
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.contain(vsUSDS);
      });

      it(`should register USDS in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, USDS);
        expect(registeredVToken).to.equal(vUSDS);
      });

      it(`should register sUSDS in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(COMPTROLLER, sUSDS);
        expect(registeredVToken).to.equal(vsUSDS);
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

          it(`should have initial supply = 10000 ${vTokenSpec.symbol}`, async () => {
            expect(await vTokenContract.balanceOf(initialSupply.vTokenReceiver)).to.equal(parseUnits("10000", 8));
          });
        });
      }
    });

    describe("Interest rates", () => {
      for (const { vToken, interestRateModel } of Object.values(newMarkets)) {
        checkInterestRate(interestRateModel.address, vToken.symbol, interestRateModel, BLOCKS_PER_YEAR);
      }
    });

    it("should pause brrowing on sUSDS", async () => {
      expect(await comptroller.actionPaused(newMarkets["vsUSDS"].vToken.address, 2)).to.equal(true);
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

      const assets = [USDS, sUSDS];

      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        for (const asset of assets) {
          it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
            const result = await converterContract.conversionConfigurations(baseAsset, asset);
            expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
          });
        }
      }
    });
  });
});
