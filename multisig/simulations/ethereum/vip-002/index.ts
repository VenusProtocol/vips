import { expect } from "chai";
import { BigNumberish } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip002 from "../../../proposals/ethereum/vip-002";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const ETHEREUM_MULTISIG = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";
const CRV_VTOKEN_RECEIVER = "0x7a16fF8270133F063aAb6C9977183D9e72835428";

const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

const BLOCKS_PER_YEAR = BigNumber.from("2628000"); // assuming a block is mined every 12 seconds

const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const COMPTROLLER_STABLECOINS = "0x18eF8D2bee415b731C25662568dc1035001cEB2c";
const COMPTROLLER_CURVE = "0xD298182D3ACb43e98e32757FF09C91F203e9E67E";
const MOCK_WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b";
const MOCK_USDC = "0x772d68929655ce7234C8C94256526ddA66Ef641E";
const MOCK_USDT = "0x8d412FD0bc5d826615065B931171Eed10F5AF266";
const MOCK_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
const VCRV_CORE = "0x121E3be152F283319310D807ed847E8b98319C1e";
const VCRVUSD_CORE = "0xA09cFAd2e138fe6d8FF62df803892cbCb79ED082";
const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const VCRVUSD_STABLECOINS = "0x9C5e7a3B4db931F07A6534f9e44100DDDc78c408";
const VUSDC_STABLECOINS = "0xD5f83FCbb4a62779D0B37b9E603CD19Ad84884F0";
const VUSDT_STABLECOINS = "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4";
const VCRV_CURVE = "0x9Db62c5BBc6fb79416545FcCBDB2204099217b78";
const VCRVUSD_CURVE = "0xc7be132027e191636172798B933202E0f9CAD548";
const MOCK_CRV = "0x2c78EF7eab67A6e0C9cAa6f2821929351bdDF3d3";
const MOCK_crvUSD = "0x36421d873abCa3E2bE6BB3c819C0CF26374F63b6";

type VTokenSymbol =
  | "vWBTC_Core"
  | "vWETH_Core"
  | "vUSDT_Core"
  | "vUSDC_Core"
  | "vcrvUSD_Core"
  | "vcrvUSD_Curve"
  | "vCRV_Core"
  | "vUSDC_Stablecoins"
  | "vUSDT_Stablecoins"
  | "vcrvUSD_Stablecoins"
  | "vCRV_Curve";

const vTokens: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: VWBTC_CORE,
  vWETH_Core: VWETH_CORE,
  vUSDT_Core: VUSDT_CORE,
  vUSDC_Core: VUSDC_CORE,
  vcrvUSD_Core: VCRVUSD_CORE,
  vCRV_Core: VCRV_CORE,
  vUSDC_Stablecoins: VUSDC_STABLECOINS,
  vUSDT_Stablecoins: VUSDT_STABLECOINS,
  vcrvUSD_Stablecoins: VCRVUSD_STABLECOINS,
  vcrvUSD_Curve: VCRVUSD_CURVE,
  vCRV_Curve: VCRV_CURVE,
};

const tokens = {
  WBTC: MOCK_WBTC,
  WETH: MOCK_WETH,
  USDT: MOCK_USDT,
  USDC: MOCK_USDC,
  CRV: MOCK_CRV,
  crvUSD: MOCK_crvUSD,
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
  vCRV_Core: {
    name: "Venus CRV (Core)",
    symbol: "vCRV_Core",
    decimals: 8,
    underlying: tokens.CRV,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },

  // Stablecoins Pool
  vUSDT_Stablecoins: {
    name: "Venus USDT (Stablecoins)",
    symbol: "vUSDT_Stablecoins",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_STABLECOINS,
  },
  vUSDC_Stablecoins: {
    name: "Venus USDC (Stablecoins)",
    symbol: "vUSDC_Stablecoins",
    decimals: 8,
    underlying: tokens.USDC,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_STABLECOINS,
  },
  vcrvUSD_Stablecoins: {
    name: "Venus crvUSD (Stablecoins)",
    symbol: "vcrvUSD_Stablecoins",
    decimals: 8,
    underlying: tokens.crvUSD,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_STABLECOINS,
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

const riskParameters = {
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

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: "",
  vWETH_Core: "",
  vUSDT_Core: "",
  vUSDC_Core: "",
  vcrvUSD_Core: "",
  vcrvUSD_Curve: "",
  vCRV_Core: "",
  vUSDC_Stablecoins: "",
  vUSDT_Stablecoins: "",
  vcrvUSD_Stablecoins: "",
  vCRV_Curve: "",
};

forking(19033343, async () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
  });

  describe("Contracts setup", async () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      await checkVToken(address, vTokenState[symbol]);
    }
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip002());
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
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
      });

      it("should register Stablecoins pool in PoolRegistry", async () => {
        const pool = registeredPools[1];
        expect(pool.name).to.equal("Stablecoins");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_STABLECOINS);
      });

      it("should register Curve pool in PoolRegistry", async () => {
        const pool = registeredPools[1];
        expect(pool.name).to.equal("Curve");
        expect(pool.creator).to.equal(GUARDIAN);
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

      it("should register Stablecoins pool vTokens in Stablecoins pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_STABLECOINS);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(3);
        expect(poolVTokens).to.include(vTokens.vUSDC_Stablecoins);
        expect(poolVTokens).to.include(vTokens.vUSDT_Stablecoins);
        expect(poolVTokens).to.include(vTokens.vcrvUSD_Stablecoins);
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
      const checkComptroller = (comptrollerAddress: string, comptrollerName: string) => {
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

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = ETHEREUM_MULTISIG", async () => {
            expect(await comptroller.owner()).to.equal(ETHEREUM_MULTISIG);
          });
        });
      };

      checkComptroller(COMPTROLLER_CORE, "Core");
      checkComptroller(COMPTROLLER_STABLECOINS, "Stablecoins");
      checkComptroller(COMPTROLLER_CURVE, "Curve");
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

    describe("generic tests", async () => {
      checkIsolatedPoolsComptrollers();
    });
  });
});
