import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import { vip002 } from "../../../proposals/vip-002/vip-002-ethereum";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";
const CRV_VTOKEN_RECEIVER = "0x7a16fF8270133F063aAb6C9977183D9e72835428";

// Comptrollers
const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
const COMPTROLLER_CURVE = "0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796";

const BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds

type VTokenSymbol =
  | "vWBTC_Core"
  | "vWETH_Core"
  | "vUSDT_Core"
  | "vUSDC_Core"
  | "vcrvUSD_Core"
  | "vcrvUSD_Curve"
  | "vCRV_Curve";

const vTokens: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
  vWETH_Core: "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
  vUSDT_Core: "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
  vUSDC_Core: "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
  vcrvUSD_Core: "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
  vcrvUSD_Curve: "0x2d499800239C4CD3012473Cb1EAE33562F0A6933",
  vCRV_Curve: "0x30aD10Bd5Be62CAb37863C2BfcC6E8fb4fD85BDa",
};

const tokens = {
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
  crvUSD: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
};

interface VTokenState {
  name: string;
  symbol: string;
  decimals: number;
  underlying: string;
  exchangeRate: BigNumberish;
  comptroller: string;
}

const vTokenState: { [key in VTokenSymbol]: VTokenState } = {
  // Core Pool
  vWBTC_Core: {
    name: "Venus WBTC (Core)",
    symbol: "vWBTC_Core",
    decimals: 8,
    underlying: tokens.WBTC,
    exchangeRate: parseUnits("1", 18),
    comptroller: COMPTROLLER_CORE,
  },
  vWETH_Core: {
    name: "Venus WETH (Core)",
    symbol: "vWETH_Core",
    decimals: 8,
    underlying: tokens.WETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  vUSDT_Core: {
    name: "Venus USDT (Core)",
    symbol: "vUSDT_Core",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_CORE,
  },
  vUSDC_Core: {
    name: "Venus USDC (Core)",
    symbol: "vUSDC_Core",
    decimals: 8,
    underlying: tokens.USDC,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_CORE,
  },
  vcrvUSD_Core: {
    name: "Venus crvUSD (Core)",
    symbol: "vcrvUSD_Core",
    decimals: 8,
    underlying: tokens.crvUSD,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  // Curve Pool
  vcrvUSD_Curve: {
    name: "Venus crvUSD (Curve)",
    symbol: "vcrvUSD_Curve",
    decimals: 8,
    underlying: tokens.crvUSD,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CURVE,
  },
  vCRV_Curve: {
    name: "Venus CRV (Curve)",
    symbol: "vCRV_Curve",
    decimals: 8,
    underlying: tokens.CRV,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CURVE,
  },
};

interface RiskParameters {
  borrowCap: string;
  supplyCap: string;
  collateralFactor: string;
  liquidationThreshold: string;
  reserveFactor: string;
  initialSupply: string;
  vTokenReceiver: string;
}

const riskParameters: { [key in VTokenSymbol]: RiskParameters } = {
  // Core Pool
  vWBTC_Core: {
    borrowCap: "850",
    supplyCap: "1000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "0.29818818",
    vTokenReceiver: TREASURY,
  },
  vWETH_Core: {
    borrowCap: "18000",
    supplyCap: "20000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "5",
    vTokenReceiver: TREASURY,
  },
  vUSDC_Core: {
    borrowCap: "45000000",
    supplyCap: "50000000",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vUSDT_Core: {
    borrowCap: "45000000",
    supplyCap: "50000000",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vcrvUSD_Core: {
    borrowCap: "45000000",
    supplyCap: "50000000",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: CRV_VTOKEN_RECEIVER,
  },
  // Curve Pool
  vcrvUSD_Curve: {
    borrowCap: "2000000",
    supplyCap: "2500000",
    collateralFactor: "0.45",
    liquidationThreshold: "0.5",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: CRV_VTOKEN_RECEIVER,
  },
  vCRV_Curve: {
    borrowCap: "3000000",
    supplyCap: "6000000",
    collateralFactor: "0.45",
    liquidationThreshold: "0.5",
    reserveFactor: "0.25",
    initialSupply: "40000",
    vTokenReceiver: CRV_VTOKEN_RECEIVER,
  },
};

interface InterestRateModelSpec {
  vTokens: VTokenSymbol[];
  kink: string;
  base: string;
  multiplier: string;
  jump: string;
}

const interestRateModels: InterestRateModelSpec[] = [
  {
    vTokens: ["vWBTC_Core"],
    kink: "0.75",
    base: "0",
    multiplier: "0.09",
    jump: "0.75",
  },
  {
    vTokens: ["vWETH_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.09",
    jump: "0.75",
  },
  {
    vTokens: ["vUSDC_Core", "vUSDT_Core", "vcrvUSD_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.075",
    jump: "0.8",
  },
  {
    vTokens: ["vcrvUSD_Curve"],
    kink: "0.8",
    base: "0",
    multiplier: "0.075",
    jump: "0.8",
  },
  {
    vTokens: ["vCRV_Curve"],
    kink: "0.5",
    base: "0.02",
    multiplier: "0.2",
    jump: "3",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {};

forking(19033343, () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
  });

  describe("Contracts setup", () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      checkVToken(address, vTokenState[symbol]);
    }
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip002());
      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          interestRateModelAddresses[symbol] = await vToken.interestRateModel();
        }
      }
    });
    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        console.log(`PoolRegistry: ${poolRegistry.address}`);
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 2 pools", async () => {
        expect(registeredPools).to.have.lengthOf(2);
      });

      it("should register Core pool in PoolRegistry", async () => {
        const pool = registeredPools[0];
        expect(pool.name).to.equal("Core");
        expect(pool.creator).to.equal(ETHEREUM_MULTISIG);
        expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
      });

      it("should register Curve pool in PoolRegistry", async () => {
        const pool = registeredPools[1];
        expect(pool.name).to.equal("Curve");
        expect(pool.creator).to.equal(ETHEREUM_MULTISIG);
        expect(pool.comptroller).to.equal(COMPTROLLER_CURVE);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(5);
        expect(poolVTokens).to.include(vTokens.vWBTC_Core);
        expect(poolVTokens).to.include(vTokens.vWETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vUSDC_Core);
        expect(poolVTokens).to.include(vTokens.vcrvUSD_Core);
      });

      it("should register Curve pool vTokens in Curve pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CURVE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(2);
        expect(poolVTokens).to.include(vTokens.vCRV_Curve);
        expect(poolVTokens).to.include(vTokens.vcrvUSD_Curve);
      });

      for (const [symbol, { underlying }] of Object.entries(vTokenState) as [VTokenSymbol, VTokenState][]) {
        it(`should register ${symbol} in PoolRegistry`, async () => {
          const registeredVToken = await poolRegistry.getVTokenForAsset(vTokenState[symbol].comptroller, underlying);
          expect(registeredVToken).to.equal(vTokens[symbol]);
        });
      }
    });

    describe("Ownership", () => {
      for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
        it(`should transfer ownership of ${symbol} to ETHEREUM_MULTISIG`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.owner()).to.equal(ETHEREUM_MULTISIG);
        });
      }
    });

    describe("Initial supply", () => {
      for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
        it(`should mint initial supply of ${symbol} to ${params.vTokenReceiver}`, async () => {
          // Since we're distributing 1:1, decimals should be accounted for in the exchange rate
          const expectedSupply = parseUnits(params.initialSupply, 8);
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          expect(await vToken.balanceOf(params.vTokenReceiver)).to.equal(expectedSupply);
        });
      }
    });

    describe("Risk parameters", () => {
      for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
        describe(`${symbol} risk parameters`, () => {
          let vToken: Contract;
          let comptroller: Contract;
          let underlyingDecimals: number;

          before(async () => {
            vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
            comptroller = await ethers.getContractAt(COMPTROLLER_ABI, vTokenState[symbol].comptroller);
            const underlyingAddress = vTokenState[symbol].underlying;
            const underlying = await ethers.getContractAt(ERC20_ABI, underlyingAddress);
            underlyingDecimals = await underlying.decimals();
          });

          it(`should set ${symbol} reserve factor to ${params.reserveFactor}`, async () => {
            expect(await vToken.reserveFactorMantissa()).to.equal(parseUnits(params.reserveFactor, 18));
          });

          it(`should set ${symbol} collateral factor to ${params.collateralFactor}`, async () => {
            const market = await comptroller.markets(vTokens[symbol]);
            expect(market.collateralFactorMantissa).to.equal(parseUnits(params.collateralFactor, 18));
          });

          it(`should set ${symbol} liquidation threshold to ${params.liquidationThreshold}`, async () => {
            const market = await comptroller.markets(vTokens[symbol]);
            expect(market.liquidationThresholdMantissa).to.equal(parseUnits(params.liquidationThreshold, 18));
          });

          it(`should ${symbol} have correct protocol seize share equal to 0.05`, async () => {
            expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
          });

          it(`should set ${symbol} supply cap to ${params.supplyCap}`, async () => {
            expect(await comptroller.supplyCaps(vTokens[symbol])).to.equal(
              parseUnits(params.supplyCap, underlyingDecimals),
            );
          });

          it(`should set ${symbol} borrow cap to ${params.borrowCap}`, async () => {
            expect(await comptroller.borrowCaps(vTokens[symbol])).to.equal(
              parseUnits(params.borrowCap, underlyingDecimals),
            );
          });
        });
      }
    });

    describe("Pools configuration", () => {
      const checkComptroller = (
        comptrollerAddress: string,
        comptrollerName: string,
        liquidationIncentive: BigNumber,
      ) => {
        describe(`${comptrollerName} Comptroller`, () => {
          let comptroller: Contract;

          before(async () => {
            comptroller = await ethers.getContractAt(COMPTROLLER_ABI, comptrollerAddress);
          });

          it("should use the correct comptroller address", async () => {
            expect(comptroller.address).to.equal(comptrollerAddress);
          });

          it("should have the correct price oracle", async () => {
            expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
          });

          it("should have close factor = 0.5", async () => {
            expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
          });

          it("should have correct liquidation incentive ", async () => {
            expect(await comptroller.liquidationIncentiveMantissa()).to.equal(liquidationIncentive);
          });

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = ETHEREUM_MULTISIG", async () => {
            expect(await comptroller.owner()).to.equal(ETHEREUM_MULTISIG);
          });
        });
      };

      checkComptroller(COMPTROLLER_CORE, "Core", parseUnits("1.1", 18));
      checkComptroller(COMPTROLLER_CURVE, "Curve", parseUnits("1.1", 18));
    });

    it("Interest rates", async () => {
      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          checkInterestRate(
            interestRateModelAddresses[symbol],
            symbol,
            {
              base: model.base,
              multiplier: model.multiplier,
              jump: model.jump,
              kink: model.kink,
            },
            BLOCKS_PER_YEAR,
          );
        }
      }
    });

    describe.only("generic tests", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
