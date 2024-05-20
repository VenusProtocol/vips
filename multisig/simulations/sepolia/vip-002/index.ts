import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import vip002, {
  COMPTROLLER_CORE,
  COMPTROLLER_CURVE,
  COMPTROLLER_STABLECOINS,
  MOCK_CRV,
  MOCK_USDC,
  MOCK_USDT,
  MOCK_WBTC,
  MOCK_WETH,
  MOCK_crvUSD,
  POOL_REGISTRY,
  RESILIENT_ORACLE,
  VCRVUSD_CORE,
  VCRVUSD_CURVE,
  VCRVUSD_STABLECOINS,
  VCRV_CORE,
  VCRV_CURVE,
  VTREASURY,
  VUSDC_CORE,
  VUSDC_STABLECOINS,
  VUSDT_CORE,
  VUSDT_STABLECOINS,
  VWBTC_CORE,
  VWETH_CORE,
} from "../../../proposals/sepolia/vip-002";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const BLOCKS_PER_YEAR = BigNumber.from("2252571"); // assuming a block is mined every 14 seconds
const GUARDIAN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

type VTokenSymbol =
  | "vWBTC_Core"
  | "vWETH_Core"
  | "vUSDT_Core"
  | "vUSDC_Core"
  | "vcrvUSD_Core"
  | "vCRV_Core"
  | "vUSDC_Stablecoins"
  | "vUSDT_Stablecoins"
  | "vcrvUSD_Stablecoins"
  | "vcrvUSD_Curve"
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

const riskParameters: { [key in VTokenSymbol]: RiskParameters } = {
  // Core Pool
  vWBTC_Core: {
    borrowCap: "250",
    supplyCap: "300",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "0.3",
    vTokenReceiver: VTREASURY,
  },
  vWETH_Core: {
    borrowCap: "4600",
    supplyCap: "5500",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "5",
    vTokenReceiver: VTREASURY,
  },
  vUSDC_Core: {
    borrowCap: "9000000",
    supplyCap: "10000000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vUSDT_Core: {
    borrowCap: "9000000",
    supplyCap: "10000000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vcrvUSD_Core: {
    borrowCap: "9000000",
    supplyCap: "10000000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vCRV_Core: {
    borrowCap: "2500000",
    supplyCap: "5000000",
    collateralFactor: "0.35",
    liquidationThreshold: "0.4",
    reserveFactor: "0.25",
    initialSupply: "20000",
    vTokenReceiver: VTREASURY,
  },

  // Stablecoins Pool
  vUSDC_Stablecoins: {
    borrowCap: "4500000",
    supplyCap: "5000000",
    collateralFactor: "0.85",
    liquidationThreshold: "0.9",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vUSDT_Stablecoins: {
    borrowCap: "4500000",
    supplyCap: "5000000",
    collateralFactor: "0.85",
    liquidationThreshold: "0.9",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vcrvUSD_Stablecoins: {
    borrowCap: "4500000",
    supplyCap: "5000000",
    collateralFactor: "0.85",
    liquidationThreshold: "0.9",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },

  // Curve Pool
  vcrvUSD_Curve: {
    borrowCap: "2000000",
    supplyCap: "2500000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: VTREASURY,
  },
  vCRV_Curve: {
    borrowCap: "2500000",
    supplyCap: "5000000",
    collateralFactor: "0.6",
    liquidationThreshold: "0.65",
    reserveFactor: "0.25",
    initialSupply: "20000",
    vTokenReceiver: VTREASURY,
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
    multiplier: "0.05",
    jump: "0.8",
  },
  {
    vTokens: ["vWETH_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.045",
    jump: "0.8",
  },
  {
    vTokens: ["vUSDC_Core", "vUSDT_Core", "vcrvUSD_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.07",
    jump: "0.8",
  },
  {
    vTokens: ["vCRV_Core"],
    kink: "0.45",
    base: "0.02",
    multiplier: "0.15",
    jump: "3",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: "",
  vWETH_Core: "",
  vUSDT_Core: "",
  vUSDC_Core: "",
  vcrvUSD_Core: "",
  vCRV_Core: "",
  vUSDC_Stablecoins: "",
  vUSDT_Stablecoins: "",
  vcrvUSD_Stablecoins: "",
  vcrvUSD_Curve: "",
  vCRV_Curve: "",
};

forking(4783370, async () => {
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

      it("should have 3 pools", async () => {
        expect(registeredPools).to.have.lengthOf(3);
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
        const pool = registeredPools[2];
        expect(pool.name).to.equal("Curve");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_CURVE);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(6);
        expect(poolVTokens).to.include(vTokens.vWBTC_Core);
        expect(poolVTokens).to.include(vTokens.vWETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vUSDC_Core);
        expect(poolVTokens).to.include(vTokens.vCRV_Core);
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
        it(`should transfer ownership of ${symbol} to GUARDIAN`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.owner()).to.equal(GUARDIAN);
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

          it(`should set ${symbol} protocol seize share to 0.05`, async () => {
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

          it("should have liquidation incentive = 1.1", async () => {
            expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.1", 18));
          });

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = GUARDIAN", async () => {
            expect(await comptroller.owner()).to.equal(GUARDIAN);
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
  });
});
