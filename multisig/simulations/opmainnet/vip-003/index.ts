import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumberish, Signer } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip003, {
  COMPTROLLER_CORE,
  OP,
  USDC,
  USDT,
  VOP_CORE,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  WBTC,
  WETH,
} from "../../../proposals/opmainnet/vip-003";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TOKEN_ABI from "./abi/token.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { opmainnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = opmainnet.RESILIENT_ORACLE;
const GUARDIAN = opmainnet.GUARDIAN;
const POOL_REGISTRY = opmainnet.POOL_REGISTRY;
const PSR = "0x735ed037cB0dAcf90B133370C33C08764f88140a";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

type VTokenSymbol = "vWBTC_Core" | "vWETH_Core" | "vUSDT_Core" | "vOP_Core" | "vUSDC_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: VWBTC_CORE,
  vWETH_Core: VWETH_CORE,
  vUSDT_Core: VUSDT_CORE,
  vOP_Core: VOP_CORE,
  vUSDC_Core: VUSDC_CORE,
};

const tokens = {
  WBTC: WBTC,
  WETH: WETH,
  USDT: USDT,
  OP: OP,
  USDC: USDC,
};

interface VTokenState {
  name: string;
  symbol: string;
  decimals: number;
  underlying: string;
  exchangeRate: BigNumberish;
  comptroller: string;
}

interface AssetConfig {
  name: string;
  address: string;
  price: string;
  feed: string;
  oracle: string;
}

const assetConfigs: { [key: string]: AssetConfig } = {
  USDCe: {
    name: "USDCe",
    address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    price: "0",
    feed: "0x0000000000000000000000000000000000000000",
    oracle: "chainlink",
  },
  USDC: {
    name: "USDC",
    address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
    price: "999931010000000000000000000000",
    feed: "0x16a9FA2FDa030272Ce99B29CF780dFA30361E0f3",
    oracle: "chainlink",
  },
};

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
  vOP_Core: {
    name: "Venus OP (Core)",
    symbol: "vOP_Core",
    decimals: 8,
    underlying: tokens.OP,
    exchangeRate: parseUnits("1", 28),
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
};

interface RiskParameters {
  borrowCap: BigNumber;
  supplyCap: BigNumber;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  reserveFactor: BigNumber;
  protocolSeizeShare: BigNumber;
  initialSupply: string;
  vTokenReceiver: string;
}

interface VTOKEN {
  address: string;
  name: string;
  symbol: string;
  underlying: {
    address: string;
    decimals: number;
    symbol: string;
  };
  decimals: number;
  exchangeRate: BigNumber;
  comptroller: string;
}

const newMarkets: { [key in VTokenSymbol]: { vToken: VTOKEN; riskParameters: RiskParameters } } = {
  vWBTC_Core: {
    vToken: {
      address: VWBTC_CORE,
      name: "Venus WBTC (Core)",
      symbol: "vWBTC_Core",
      underlying: {
        address: WBTC,
        decimals: 8,
        symbol: "WBTC",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 18),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      borrowCap: parseUnits("50", 8),
      supplyCap: parseUnits("100", 8),
      collateralFactor: parseUnits("0.68", 18),
      liquidationThreshold: parseUnits("0.73", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("5", 16),
      initialSupply: "0.07575825",
      vTokenReceiver: opmainnet.VTREASURY,
    },
  },
  vWETH_Core: {
    vToken: {
      address: VWETH_CORE,
      name: "Venus WETH (Core)",
      symbol: "vWETH_Core",
      underlying: {
        address: WETH,
        decimals: 18,
        symbol: "WETH",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      borrowCap: parseUnits("2700", 18),
      supplyCap: parseUnits("3000", 18),
      collateralFactor: parseUnits("0.75", 18),
      liquidationThreshold: parseUnits("0.8", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("5", 16),
      initialSupply: "1.86273828",
      vTokenReceiver: opmainnet.VTREASURY,
    },
  },
  vUSDT_Core: {
    vToken: {
      address: VUSDT_CORE,
      name: "Venus USDT (Core)",
      symbol: "vUSDT_Core",
      underlying: {
        address: USDT,
        decimals: 6,
        symbol: "USDT",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 16),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      borrowCap: parseUnits("3600000", 6),
      supplyCap: parseUnits("4000000", 6),
      collateralFactor: parseUnits("0.75", 18),
      liquidationThreshold: parseUnits("0.78", 18),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("5", 16),
      initialSupply: "4998.60272500",
      vTokenReceiver: opmainnet.VTREASURY,
    },
  },
  vOP_Core: {
    vToken: {
      address: VOP_CORE,
      name: "Venus OP (Core)",
      symbol: "vOP_Core",
      underlying: {
        address: OP,
        decimals: 18,
        symbol: "OP",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      borrowCap: parseUnits("1500000", 18),
      supplyCap: parseUnits("3000000", 18),
      collateralFactor: parseUnits("0.58", 18),
      liquidationThreshold: parseUnits("0.63", 18),
      reserveFactor: parseUnits("0.2", 18),
      protocolSeizeShare: parseUnits("5", 16),
      initialSupply: "2641.14405837",
      vTokenReceiver: opmainnet.VTREASURY,
    },
  },
  vUSDC_Core: {
    vToken: {
      address: VUSDC_CORE,
      name: "Venus USDC (Core)",
      symbol: "vUSDC_Core",
      underlying: {
        address: USDC,
        decimals: 6,
        symbol: "USDC",
      },
      decimals: 8,
      exchangeRate: parseUnits("1", 16),
      comptroller: COMPTROLLER_CORE,
    },
    riskParameters: {
      borrowCap: parseUnits("9000000", 6),
      supplyCap: parseUnits("10000000", 6),
      collateralFactor: parseUnits("0.75", 18),
      liquidationThreshold: parseUnits("0.78", 18),
      reserveFactor: parseUnits("0.1", 18),
      protocolSeizeShare: parseUnits("5", 16),
      initialSupply: "5000",
      vTokenReceiver: opmainnet.VTREASURY,
    },
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
    vTokens: ["vWBTC_Core", "vOP_Core"],
    kink: "0.45",
    base: "0",
    multiplier: "0.15",
    jump: "2.5",
  },
  {
    vTokens: ["vWETH_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.035",
    jump: "2.5",
  },
  {
    vTokens: ["vUSDT_Core", "vUSDC_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.06875",
    jump: "2.5",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vWBTC_Core: "",
  vWETH_Core: "",
  vUSDT_Core: "",
  vOP_Core: "",
  vUSDC_Core: "",
};

forking(126173640, async () => {
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
      await pretendExecutingVip(await vip003());

      for (const model of interestRateModels) {
        for (const symbol of model.vTokens) {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          interestRateModelAddresses[symbol] = await vToken.interestRateModel();
        }
      }
    });

    describe("Oracle vaule for USDC", () => {
      it("validate asset prices", async () => {
        const provider = ethers.provider;
        const resilientOracle = new ethers.Contract(opmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

        let assetConfig = assetConfigs.USDCe;
        await expect(resilientOracle.getPrice(assetConfig.address)).to.be.revertedWith(
          "invalid resilient oracle price",
        );

        assetConfig = assetConfigs.USDC;
        const price = await resilientOracle.getPrice(assetConfig.address);
        expect(price).to.be.equal(assetConfig.price);
      });
    });

    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 1 pool(Core Pool)", async () => {
        expect(registeredPools).to.have.lengthOf(1);
      });

      it("should register Core pool in PoolRegistry", async () => {
        const pool = registeredPools[0];
        expect(pool.name).to.equal("Core");
        expect(pool.creator).to.equal(GUARDIAN);
        expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.length(5);
        expect(poolVTokens).to.include(vTokens.vWBTC_Core);
        expect(poolVTokens).to.include(vTokens.vWETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vUSDC_Core);
        expect(poolVTokens).to.include(vTokens.vOP_Core);
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
      for (const [symbol, params] of Object.entries(newMarkets) as [
        VTokenSymbol,
        { vToken: VTOKEN; riskParameters: RiskParameters },
      ][]) {
        const { riskParameters } = params;
        it(`should mint initial supply of ${symbol} to ${riskParameters.vTokenReceiver}`, async () => {
          // Since we're distributing 1:1, decimals should be accounted for in the exchange rate
          const expectedSupply = parseUnits(riskParameters.initialSupply, 8);
          const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
          expect(await vToken.balanceOf(riskParameters.vTokenReceiver)).to.equal(expectedSupply);
        });
      }
    });

    describe("Risk parameters", () => {
      for (const market of Object.values(newMarkets) as { vToken: VTOKEN; riskParameters: RiskParameters }[]) {
        checkRiskParameters(market.vToken.address, market.vToken, market.riskParameters);
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
      before(async () => {
        const USDC_ACCOUNT = "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9";

        await impersonateAccount(USDC_ACCOUNT);
        await setBalance(USDC_ACCOUNT, ethers.utils.parseEther("1"));

        const signer: Signer = await ethers.getSigner(USDC_ACCOUNT);
        const mockUSDCToken = await ethers.getContractAt(TOKEN_ABI, USDC, signer);
        await mockUSDCToken.connect(signer).transfer(opmainnet.VTREASURY, parseUnits("1", 6));
      });

      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
