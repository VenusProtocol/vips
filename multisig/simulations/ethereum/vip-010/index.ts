import { expect } from "chai";
import { BigNumberish } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip010 from "../../../proposals/ethereum/vip-010";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";
import WSTETH_ORACLE_ABI from "./abi/wstETHOracle.json";

const { ethereum } = NETWORK_ADDRESSES;

const GUARDIAN = ethereum.GUARDIAN;
const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
const LIQUID_STAKED_COMPTROLLER = "0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3";
const VWSTETH = "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB";
const VWETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const POOL_REGISTRY = "0x61CAff113CCaf05FFc6540302c37adcf077C5179";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";
const WSTETH_NONEQUIVALENCE_ORACLE = "0xd082B50b3EeB012605598bB45Fc2Be853b9AFEEf";

const WSTETH_HOLDER = "0x5fEC2f34D80ED82370F733043B6A536d7e9D7f8d";

type VTokenSymbol = "vwstETH_LiquidStakedETH" | "vWETH_LiquidStakedETH";

const vTokens: { [key in VTokenSymbol]: string } = {
  vwstETH_LiquidStakedETH: VWSTETH,
  vWETH_LiquidStakedETH: VWETH,
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
  // Liquid Staked ETH Pool
  vwstETH_LiquidStakedETH: {
    name: "Venus wstETH (Liquid Staked ETH)",
    symbol: "vwstETH_LiquidStakedETH",
    decimals: 8,
    underlying: WSTETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: LIQUID_STAKED_COMPTROLLER,
  },
  vWETH_LiquidStakedETH: {
    name: "Venus WETH (Liquid Staked ETH)",
    symbol: "vWETH_LiquidStakedETH",
    decimals: 8,
    underlying: WETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: LIQUID_STAKED_COMPTROLLER,
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
  vwstETH_LiquidStakedETH: {
    borrowCap: "2000",
    supplyCap: "20000",
    collateralFactor: "0.9",
    liquidationThreshold: "0.93",
    reserveFactor: "0.2",
    initialSupply: "4.33315750",
    vTokenReceiver: ethereum.VTREASURY,
  },
  vWETH_LiquidStakedETH: {
    borrowCap: "18000",
    supplyCap: "20000",
    collateralFactor: "0.9",
    liquidationThreshold: "0.93",
    reserveFactor: "0.15",
    initialSupply: "5",
    vTokenReceiver: ethereum.VTREASURY,
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
    vTokens: ["vwstETH_LiquidStakedETH"],
    kink: "0.45",
    base: "0",
    multiplier: "0.09",
    jump: "0.75",
  },
  {
    vTokens: ["vWETH_LiquidStakedETH"],
    kink: "0.8",
    base: "0",
    multiplier: "0.035",
    jump: "0.8",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vwstETH_LiquidStakedETH: "",
  vWETH_LiquidStakedETH: "",
};

forking(19276500, async () => {
  let poolRegistry: Contract;
  let wstETHNonEquivalentOracle: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    wstETHNonEquivalentOracle = await ethers.getContractAt(WSTETH_ORACLE_ABI, WSTETH_NONEQUIVALENCE_ORACLE);
  });

  describe("Contracts setup", async () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      await checkVToken(address, vTokenState[symbol]);
    }
  });

  describe("Secondary wstETH oracle", () => {
    it("should revert for uncofigured stETH price", async () => {
      await expect(wstETHNonEquivalentOracle.getPrice(WSTETH)).to.be.revertedWith("invalid resilient oracle price");
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip010());

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

      it("should register Liquid Staked ETH pool in PoolRegistry", async () => {
        const pool = registeredPools[2];
        expect(pool.name).to.equal("Liquid Staked ETH");
        expect(pool.comptroller).to.equal(LIQUID_STAKED_COMPTROLLER);
      });

      it("should register Liquid Staked ETH pool vTokens in Liquid Staked ETH pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_COMPTROLLER);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(2);
        expect(poolVTokens).to.include(vTokens.vwstETH_LiquidStakedETH);
        expect(poolVTokens).to.include(vTokens.vWETH_LiquidStakedETH);
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

          it(`should set ${symbol} protocol seize share to 0.01`, async () => {
            expect(await vToken.protocolSeizeShareMantissa()).to.equal(parseUnits("0.01", 18));
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

          it("should have liquidation incentive = 1.02", async () => {
            expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.02", 18));
          });

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = GUARDIAN", async () => {
            expect(await comptroller.owner()).to.equal(GUARDIAN);
          });
        });
      };
      checkComptroller(LIQUID_STAKED_COMPTROLLER, "Liquid Staked ETH");
    });

    describe("Secondary wstETH oracle", () => {
      it("should not revert", async () => {
        await expect(wstETHNonEquivalentOracle.getPrice(WSTETH)).not.to.be.revertedWith(
          "invalid resilient oracle price",
        );
      });
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

  describe("generic tests", async () => {
    checkIsolatedPoolsComptrollers({
      [LIQUID_STAKED_COMPTROLLER]: WSTETH_HOLDER,
    });
  });
});
