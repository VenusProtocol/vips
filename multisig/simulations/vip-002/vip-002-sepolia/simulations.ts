import { expect } from "chai";
import { BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_CONFIG } from "../../../../src/networkConfig";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip002 } from "../../../proposals/vip-002/vip-002-sepolia";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RATE_MODEL_ABI from "./abi/rateModel.json";
import VTOKEN_ABI from "./abi/vToken.json";

const RESILIENT_ORACLE = sepoliaContracts.RESILIENT_ORACLE;
const GUARDIAN = sepoliaContracts.GUARDIAN;
const POOL_REGISTRY = sepoliaContracts.POOL_REGISTRY;

type VTokenSymbol = "vWBTC_Core" | "vWETH_Core" | "vUSDT_Core" | "vUSDC_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: sepoliaContracts.VWBTC,
  vWETH_Core: sepoliaContracts.VWETH,
  vUSDT_Core: sepoliaContracts.VUSDT,
  vUSDC_Core: sepoliaContracts.VUSDC,
};

const tokens = {
  WBTC: sepoliaContracts.MOCK_WBTC,
  WETH: sepoliaContracts.MOCK_WETH,
  USDT: sepoliaContracts.MOCK_USDT,
  USDC: sepoliaContracts.MOCK_USDC,
};

interface VTokenState {
  name: string;
  symbol: string;
  decimals: BigNumberish;
  underlying: string;
  exchangeRate: BigNumberish;
  comptroller: string;
}

const vTokenState: { [key in VTokenSymbol]: VTokenState } = {
  // DeFi pool
  vWBTC_Core: {
    name: "Venus WBTC (Core)",
    symbol: "vWBTC_Core",
    decimals: 8,
    underlying: tokens.WBTC,
    exchangeRate: parseUnits("1", 18),
    comptroller: sepoliaContracts.COMPTROLLER,
  },
  vWETH_Core: {
    name: "Venus WETH (Core)",
    symbol: "vWETH_Core",
    decimals: 8,
    underlying: tokens.WETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: sepoliaContracts.COMPTROLLER,
  },
  vUSDT_Core: {
    name: "Venus USDT (Core)",
    symbol: "vUSDT_Core",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 16),
    comptroller: sepoliaContracts.COMPTROLLER,
  },
  vUSDC_Core: {
    name: "Venus USDC (Core)",
    symbol: "vUSDC_Core",
    decimals: 8,
    underlying: tokens.USDC,
    exchangeRate: parseUnits("1", 16),
    comptroller: sepoliaContracts.COMPTROLLER,
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
  // DeFi
  vWBTC_Core: {
    borrowCap: "50",
    supplyCap: "100",
    collateralFactor: "0.8",
    liquidationThreshold: "0.85",
    reserveFactor: "0.2",
    initialSupply: "1",
    vTokenReceiver: sepoliaContracts.VTREASURY,
  },
  vWETH_Core: {
    borrowCap: "500",
    supplyCap: "1000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.85",
    reserveFactor: "0.2",
    initialSupply: "10",
    vTokenReceiver: sepoliaContracts.VTREASURY,
  },
  vUSDT_Core: {
    borrowCap: "500000",
    supplyCap: "1000000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.85",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: sepoliaContracts.VTREASURY,
  },
  vUSDC_Core: {
    borrowCap: "500000",
    supplyCap: "1000000",
    collateralFactor: "0.825",
    liquidationThreshold: "0.85",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: sepoliaContracts.VTREASURY,
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
    vTokens: ["vWBTC_Core", "vWETH_Core"],
    kink: "0.75",
    base: "0",
    multiplier: "0.09",
    jump: "2",
  },
  {
    vTokens: ["vUSDT_Core", "vUSDC_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.05",
    jump: "2.5",
  },
];

forking(4333890, () => {
  let poolRegistry: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
  });

  describe("Contracts setup", () => {
    const checkVToken = (
      vTokenAddress: string,
      { name, symbol, decimals, underlying, exchangeRate, comptroller }: VTokenState,
    ) => {
      describe(symbol, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
        });

        it(`should have name = "${name}"`, async () => {
          expect(await vToken.name()).to.equal(name);
        });

        it(`should have symbol = "${symbol}"`, async () => {
          expect(await vToken.symbol()).to.equal(symbol);
        });

        it(`should have ${decimals.toString()} decimals`, async () => {
          expect(await vToken.decimals()).to.equal(decimals);
        });

        it(`should have underlying = "${underlying}"`, async () => {
          expect(await vToken.underlying()).to.equal(underlying);
        });

        it(`should have initial exchange rate of ${exchangeRate.toString()}`, async () => {
          expect(await vToken.exchangeRateStored()).to.equal(exchangeRate);
        });

        it("should have the correct Comptroller", async () => {
          expect(await vToken.comptroller()).to.equal(comptroller);
        });
      });
    };

    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      checkVToken(address, vTokenState[symbol]);
    }
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip002());
    });
    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 1 pools", async () => {
        expect(registeredPools).to.have.lengthOf(1);
      });

      it("should register Core pool in PoolRegistry", async () => {
        const pool = registeredPools[0];
        expect(pool.name).to.equal("Core");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(sepoliaContracts.COMPTROLLER);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, sepoliaContracts.COMPTROLLER);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(4);
        expect(poolVTokens).to.include(vTokens.vWBTC_Core);
        expect(poolVTokens).to.include(vTokens.vWETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vUSDC_Core);
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

    describe("Pool configuration", () => {
      describe("Core Comptroller", () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, sepoliaContracts.COMPTROLLER);
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
    });
  });

  describe("Interest rate models", () => {
    const checkInterestRate = (
      vTokenAddress: string,
      symbol: string,
      {
        base,
        multiplier,
        jump,
        kink,
      }: {
        base: string;
        multiplier: string;
        jump: string;
        kink: string;
      },
    ) => {
      describe(`${symbol} interest rate model`, () => {
        const BLOCKS_PER_YEAR = 2_252_571;
        let rateModel: Contract;

        before(async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokenAddress);
          rateModel = await ethers.getContractAt(RATE_MODEL_ABI, await vToken.interestRateModel());
        });

        it(`should have base = ${base}`, async () => {
          const basePerBlock = parseUnits(base, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.baseRatePerBlock()).to.equal(basePerBlock);
        });

        it(`should have jump = ${jump}`, async () => {
          const jumpPerBlock = parseUnits(jump, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.jumpMultiplierPerBlock()).to.equal(jumpPerBlock);
        });

        it(`should have multiplier = ${multiplier}`, async () => {
          const multiplierPerBlock = parseUnits(multiplier, 18).div(BLOCKS_PER_YEAR);
          expect(await rateModel.multiplierPerBlock()).to.equal(multiplierPerBlock);
        });

        it(`should have kink = ${kink}`, async () => {
          expect(await rateModel.kink()).to.equal(parseUnits(kink, 18));
        });
      });
    };

    describe("Interest rate models", () => {
      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          checkInterestRate(vTokens[symbol], symbol, {
            base: model.base,
            multiplier: model.multiplier,
            jump: model.jump,
            kink: model.kink,
          });
        }
      }
    });
  });
});
