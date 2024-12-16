import { expect } from "chai";
import { BigNumber, BigNumberish } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  COMPTROLLER_ETHENA,
  MockPT_USDe_27MAR2025,
  MockPT_sUSDE_27MAR2025,
  MockUSDC,
  MocksUSDe,
  VPT_USDe_27MAR2025_ETHENA,
  VPT_sUSDE_27MAR2025_ETHENA,
  VUSDC_Ethena,
  VsUSDe_Ethena,
  vip407,
} from "../../vips/vip-407/bsctestnet";
import { CONVERSION_INCENTIVE, converterBaseAssets, underlyingAddress, vip408 } from "../../vips/vip-408/bsctestnet";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { sepolia } = NETWORK_ADDRESSES;

const BLOCKS_PER_YEAR = BigNumber.from("2252571"); // assuming a block is mined every 14 seconds
const GUARDIAN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

type VTokenSymbol = "vPT-USDe-27MAR2025_Ethena" | "vPT-sUSDE-27MAR2025_Ethena" | "vsUSDe_Ethena" | "vUSDC_Ethena";

const vTokens: { [key in VTokenSymbol]: string } = {
  "vPT-USDe-27MAR2025_Ethena": VPT_USDe_27MAR2025_ETHENA,
  "vPT-sUSDE-27MAR2025_Ethena": VPT_sUSDE_27MAR2025_ETHENA,
  vsUSDe_Ethena: VsUSDe_Ethena,
  vUSDC_Ethena: VUSDC_Ethena,
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
  "vPT-USDe-27MAR2025_Ethena": {
    name: "Venus PT-USDe-27MAR2025(Ethena)",
    symbol: "vPT-USDe-27MAR2025_Ethena",
    decimals: 8,
    underlying: MockPT_USDe_27MAR2025,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_ETHENA,
  },
  "vPT-sUSDE-27MAR2025_Ethena": {
    name: "Venus PT-sUSDE-27MAR2025 (Ethena)",
    symbol: "vPT-sUSDE-27MAR2025_Ethena",
    decimals: 8,
    underlying: MockPT_sUSDE_27MAR2025,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_ETHENA,
  },
  vsUSDe_Ethena: {
    name: "Venus sUSDe (Ethena)",
    symbol: "vsUSDe_Ethena",
    decimals: 8,
    underlying: MocksUSDe,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_ETHENA,
  },
  vUSDC_Ethena: {
    name: "Venus USDC (Ethena)",
    symbol: "vUSDC_Ethena",
    decimals: 8,
    underlying: MockUSDC,
    exchangeRate: parseUnits("1", 16),
    comptroller: COMPTROLLER_ETHENA,
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
  protocolSeizeShareMantissa: string;
  price: BigNumber;
}

const riskParameters: { [key in VTokenSymbol]: RiskParameters } = {
  "vPT-USDe-27MAR2025_Ethena": {
    borrowCap: "0",
    supplyCap: "850000",
    collateralFactor: "0.86",
    liquidationThreshold: "0.88",
    reserveFactor: "0",
    initialSupply: "10619",
    vTokenReceiver: sepolia.VTREASURY,
    protocolSeizeShareMantissa: "0.004",
    price: parseUnits("1", 18),
  },
  "vPT-sUSDE-27MAR2025_Ethena": {
    borrowCap: "0",
    supplyCap: "12000000",
    collateralFactor: "0.85",
    liquidationThreshold: "0.87",
    reserveFactor: "0",
    initialSupply: "10653",
    vTokenReceiver: sepolia.VTREASURY,
    protocolSeizeShareMantissa: "0.004",
    price: parseUnits("1", 18),
  },
  vsUSDe_Ethena: {
    borrowCap: "0",
    supplyCap: "50000000",
    collateralFactor: "0.9",
    liquidationThreshold: "0.92",
    reserveFactor: "0",
    initialSupply: "10000",
    vTokenReceiver: sepolia.VTREASURY,
    protocolSeizeShareMantissa: "0.0010",
    price: parseUnits("1", 18),
  },
  vUSDC_Ethena: {
    borrowCap: "46000000",
    supplyCap: "50000000",
    collateralFactor: "0",
    liquidationThreshold: "0",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: sepolia.VTREASURY,
    protocolSeizeShareMantissa: "0.0020",
    price: parseUnits("1", 18),
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
    vTokens: ["vPT-USDe-27MAR2025_Ethena", "vPT-sUSDE-27MAR2025_Ethena", "vsUSDe_Ethena"],
    kink: "0.8",
    base: "0",
    multiplier: "0.07",
    jump: "0.8",
  },
  {
    vTokens: ["vUSDC_Ethena"],
    kink: "0.92",
    base: "0",
    multiplier: "0.16304",
    jump: "2.5",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  "vPT-USDe-27MAR2025_Ethena": "",
  "vPT-sUSDE-27MAR2025_Ethena": "",
  vsUSDe_Ethena: "",
  vUSDC_Ethena: "",
};

forking(7291756, async () => {
  let poolRegistry: Contract;
  let noOfPools: BigNumber;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, sepolia.POOL_REGISTRY);
  });

  describe("Contracts setup", async () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      checkVToken(address, vTokenState[symbol]);
    }
  });

  testForkedNetworkVipCommands("Ethena pool", await vip407());
  testForkedNetworkVipCommands("Ethena pool", await vip408());

  describe("Post-Execution state", () => {
    before(async () => {
      noOfPools = await poolRegistry.getAllPools();

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

      it("should have 4 pools", async () => {
        expect(registeredPools).to.have.lengthOf(noOfPools.add(1));
      });

      it("should register Ethena pool in PoolRegistry", async () => {
        const pool = registeredPools[4];
        expect(pool.name).to.equal("Ethena");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_ETHENA);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_ETHENA);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(4);
        expect(poolVTokens).to.include(vTokens["vPT-USDe-27MAR2025_Ethena"]);
        expect(poolVTokens).to.include(vTokens["vPT-sUSDE-27MAR2025_Ethena"]);
        expect(poolVTokens).to.include(vTokens.vUSDC_Ethena);
        expect(poolVTokens).to.include(vTokens.vsUSDe_Ethena);
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
          //  Since we're distributing 1:1, decimals should be accounted for in the exchange rate
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

          it(`should set ${symbol} protocol seize share ${params.protocolSeizeShareMantissa}`, async () => {
            expect(await vToken.protocolSeizeShareMantissa()).to.equal(
              parseUnits(params.protocolSeizeShareMantissa, 18),
            );
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
            expect(await comptroller.oracle()).to.equal(sepolia.RESILIENT_ORACLE);
          });

          it("should have close factor = 0.5", async () => {
            expect(await comptroller.closeFactorMantissa()).to.equal(parseUnits("0.5", 18));
          });

          it("should have liquidation incentive = 1.04", async () => {
            expect(await comptroller.liquidationIncentiveMantissa()).to.equal(parseUnits("1.04", 18));
          });

          it("should have minLiquidatableCollateral = $100", async () => {
            expect(await comptroller.minLiquidatableCollateral()).to.equal(parseUnits("100", 18));
          });

          it("should have owner = GUARDIAN", async () => {
            expect(await comptroller.owner()).to.equal(GUARDIAN);
          });
        });
      };

      checkComptroller(COMPTROLLER_ETHENA, "Ethena");
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
    it("Check Price", async () => {
      const resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

      for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
        expect(await resilientOracle.getPrice(vTokenState[symbol].underlying)).to.be.closeTo(
          params.price,
          parseUnits("1", 18),
        );
        expect(await resilientOracle.getUnderlyingPrice(vTokens[symbol])).to.be.closeTo(
          params.price,
          parseUnits("1", 18),
        );
      }
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        for (const asset of underlyingAddress) {
          it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${asset}`, async () => {
            const result = await converterContract.conversionConfigurations(baseAsset, asset);
            expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
          });
        }
      }
    });
  });
});
