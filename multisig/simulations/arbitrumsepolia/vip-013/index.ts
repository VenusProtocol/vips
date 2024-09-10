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

import vip013, {
  COMPTROLLER_LIQUID_STAKED_ETH,
  Mock_weETH,
  Mock_wstETH,
  PSR,
  VWETH,
  VweETH,
  VwstETH,
  WETH,
} from "../../../proposals/arbitrumsepolia/vip-013";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumsepolia.RESILIENT_ORACLE;
const GUARDIAN = arbitrumsepolia.GUARDIAN;
const POOL_REGISTRY = arbitrumsepolia.POOL_REGISTRY;
const COMPTROLLER_BEACON = "0x12Dcb8D9F1eE7Ad7410F5B36B07bcC7891ab4cEf";
const OLD_COMPTROLLER_IMPLEMENTATION = "0x77AF9c816b0Ef51A64CF8731f77eDf65872b0973";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x6b9C91d7310BC19A9ce8a0AD7F926A72cEeb3b1D";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

type VTokenSymbol = "vwstETH_Liquid_staked_ETH" | "vweETH_Liquid_staked_ETH" | "vWETH_Liquid_staked_ETH";

const vTokens: { [key in VTokenSymbol]: string } = {
  vwstETH_Liquid_staked_ETH: VwstETH,
  vweETH_Liquid_staked_ETH: VweETH,
  vWETH_Liquid_staked_ETH: VWETH,
};

const tokens = {
  wstETH: Mock_wstETH,
  weETH: Mock_weETH,
  WETH: WETH,
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
  vwstETH_Liquid_staked_ETH: {
    name: "Venus wstETH (Liquid Staked ETH)",
    symbol: "vwstETH_LiquidStakedETH",
    decimals: 8,
    underlying: tokens.wstETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_ETH,
  },
  vweETH_Liquid_staked_ETH: {
    name: "Venus weETH (Liquid Staked ETH)",
    symbol: "vweETH_LiquidStakedETH",
    decimals: 8,
    underlying: tokens.weETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_ETH,
  },
  vWETH_Liquid_staked_ETH: {
    name: "Venus WETH (Liquid Staked ETH)",
    symbol: "vWETH_LiquidStakedETH",
    decimals: 8,
    underlying: tokens.WETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_ETH,
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
  // Liquid Staked ETH Pool
  vwstETH_Liquid_staked_ETH: {
    borrowCap: "800",
    supplyCap: "8000",
    collateralFactor: "0.93",
    liquidationThreshold: "0.95",
    reserveFactor: "0.25",
    initialSupply: "2",
    vTokenReceiver: arbitrumsepolia.VTREASURY,
  },
  vweETH_Liquid_staked_ETH: {
    borrowCap: "2300",
    supplyCap: "4600",
    collateralFactor: "0.93",
    liquidationThreshold: "0.95",
    reserveFactor: "0.25",
    initialSupply: "2",
    vTokenReceiver: arbitrumsepolia.VTREASURY,
  },
  vWETH_Liquid_staked_ETH: {
    borrowCap: "12500",
    supplyCap: "14000",
    collateralFactor: "0.77",
    liquidationThreshold: "0.80",
    reserveFactor: "0.2",
    initialSupply: "2",
    vTokenReceiver: arbitrumsepolia.VTREASURY,
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
    vTokens: ["vwstETH_Liquid_staked_ETH", "vweETH_Liquid_staked_ETH"],
    kink: "0.45",
    base: "0",
    multiplier: "0.09",
    jump: "3",
  },
  {
    vTokens: ["vWETH_Liquid_staked_ETH"],
    kink: "0.8",
    base: "0",
    multiplier: "0.035",
    jump: "0.8",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vwstETH_Liquid_staked_ETH: "",
  vweETH_Liquid_staked_ETH: "",
  vWETH_Liquid_staked_ETH: "",
};

forking(73250686, async () => {
  let poolRegistry: Contract;
  let comptrollerBeacon: Contract;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    comptrollerBeacon = await ethers.getContractAt(BEACON_ABI, COMPTROLLER_BEACON);
  });

  describe("Contracts setup", () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      checkVToken(address, vTokenState[symbol]);
    }

    it("comptroller should have old implementation", async () => {
      expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
        OLD_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
      );
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip013());

      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          interestRateModelAddresses[symbol] = await vToken.interestRateModel();
        }
      }
    });

    describe("Update comptroller beacon implementation", () => {
      it("comptroller should have new implementation", async () => {
        expect((await comptrollerBeacon.implementation()).toLowerCase()).to.equal(
          NEW_COMPTROLLER_IMPLEMENTATION.toLowerCase(),
        );
      });
    });

    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 2 pools(Core and Liquid staked ETH)", async () => {
        expect(registeredPools).to.have.lengthOf(2);
      });

      it("should register Liquid staked ETH pool in PoolRegistry", async () => {
        const pool = registeredPools[1];
        expect(pool.name).to.equal("Liquid Staked ETH");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_LIQUID_STAKED_ETH);
      });

      it("should register vTokens in Liquid staked ETH pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_LIQUID_STAKED_ETH);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(3);
        expect(poolVTokens).to.include(vTokens.vwstETH_Liquid_staked_ETH);
        expect(poolVTokens).to.include(vTokens.vweETH_Liquid_staked_ETH);
        expect(poolVTokens).to.include(vTokens.vWETH_Liquid_staked_ETH);
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

    describe("ProtocolShareReserve", () => {
      for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
        it(`should set PSR for ${symbol}`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.protocolShareReserve()).to.equal(PSR);
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

      checkComptroller(COMPTROLLER_LIQUID_STAKED_ETH, "Liquid Staked ETH");
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
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
