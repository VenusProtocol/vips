import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, BigNumberish, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip452 from "../../vips/vip-452/bsctestnet";
import vip453 from "../../vips/vip-453/bsctestnet";
import vip454, {
  ACM,
  COMPTROLLER_CORE,
  MOCK_USDCe,
  PSR,
  VUSDCe,
  VWBERA,
  VWETH,
  WBERA,
  WETH,
} from "../../vips/vip-454/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager_ABI.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { berachainbartio } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = berachainbartio.RESILIENT_ORACLE;
const POOL_REGISTRY = berachainbartio.POOL_REGISTRY;

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

type VTokenSymbol = "vUSDCe_Core" | "vWETH_Core" | "vWBERA_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  vUSDCe_Core: VUSDCe,
  vWETH_Core: VWETH,
  vWBERA_Core: VWBERA,
};

const tokens = {
  USDCe: MOCK_USDCe,
  WETH: WETH,
  WBERA: WBERA,
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
  vUSDCe_Core: {
    name: "Venus USDC.e (Core)",
    symbol: "vUSDC.e_Core",
    decimals: 8,
    underlying: tokens.USDCe,
    exchangeRate: parseUnits("1", 16),
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
  vWBERA_Core: {
    name: "Venus WBERA (Core)",
    symbol: "vWBERA_Core",
    decimals: 8,
    underlying: tokens.WBERA,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
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
  vUSDCe_Core: {
    borrowCap: "18000000",
    supplyCap: "20000000",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "5000",
    vTokenReceiver: berachainbartio.VTREASURY,
  },
  vWETH_Core: {
    borrowCap: "350",
    supplyCap: "700",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "2",
    vTokenReceiver: berachainbartio.VTREASURY,
  },
  vWBERA_Core: {
    borrowCap: "3500000",
    supplyCap: "4000000",
    collateralFactor: "0.78",
    liquidationThreshold: "0.8",
    reserveFactor: "0.1",
    initialSupply: "0.05",
    vTokenReceiver: berachainbartio.VTREASURY,
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
    vTokens: ["vUSDCe_Core", "vWETH_Core", "vWBERA_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.0875",
    jump: "2.5",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vUSDCe_Core: "",
  vWETH_Core: "",
  vWBERA_Core: "",
};

forking(10914719, async () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;
  let poolRegistry: Contract;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PSR);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);

    psrSigner = await initMainnetUser(PSR, ethers.utils.parseEther("1"));

    for (const model of interestRateModels) {
      for (const symbol of model.vTokens) {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
        interestRateModelAddresses[symbol] = await vToken.interestRateModel();
      }
    }
  });

  describe("Contracts setup", () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      checkVToken(address, vTokenState[symbol]);
    }
  });

  testForkedNetworkVipCommands("vip452 configures bridge", await vip452());
  testForkedNetworkVipCommands("vip453 configures bridge", await vip453());
  testForkedNetworkVipCommands("vip454 configures bridge", await vip454());

  describe("Post-VIP behaviour", async () => {
    let registeredPools: { name: string; creator: string; comptroller: string }[];

    before(async () => {
      registeredPools = await poolRegistry.getAllPools();
    });

    it("PSR owner should be NT", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(berachainbartio.NORMAL_TIMELOCK);
    });

    it("PSR should have correct ACM reference", async () => {
      const acm = await protocolShareReserve.accessControlManager();
      expect(acm).equals(ACM);
    });

    it("PSR should have correct PoolRegistry reference", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(berachainbartio.POOL_REGISTRY);
    });

    it("Verify Multisig permissions for PSR", async () => {
      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(berachainbartio.GUARDIAN, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(berachainbartio.GUARDIAN, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });

    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(berachainbartio.VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(berachainbartio.VTREASURY, 1)).to.equal(10000);
    });

    it("should have 1 pool(Core Pool)", async () => {
      expect(registeredPools).to.have.lengthOf(1);
    });

    it("should register Core pool in PoolRegistry", async () => {
      const pool = registeredPools[0];
      expect(pool.name).to.equal("Core");
      expect(pool.creator).to.equal(berachainbartio.NORMAL_TIMELOCK);
      expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
    });

    it("should register Core pool vTokens in Core pool Comptroller", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      const poolVTokens = await comptroller.getAllMarkets();
      expect(poolVTokens).to.have.lengthOf(3);
      expect(poolVTokens).to.include(vTokens.vUSDCe_Core);
      expect(poolVTokens).to.include(vTokens.vWETH_Core);
      expect(poolVTokens).to.include(vTokens.vWBERA_Core);
    });

    for (const [symbol, { underlying }] of Object.entries(vTokenState) as [VTokenSymbol, VTokenState][]) {
      it(`should register ${symbol} in PoolRegistry`, async () => {
        const registeredVToken = await poolRegistry.getVTokenForAsset(vTokenState[symbol].comptroller, underlying);
        expect(registeredVToken).to.equal(vTokens[symbol]);
      });
    }

    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      it(`should transfer ownership of ${symbol} to GUARDIAN`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
        expect(await vToken.owner()).to.equal(berachainbartio.NORMAL_TIMELOCK);
      });
    }

    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      it(`should set PSR for ${symbol}`, async () => {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
        expect(await vToken.protocolShareReserve()).to.equal(PSR);
      });
    }

    for (const [symbol, params] of Object.entries(riskParameters) as [VTokenSymbol, RiskParameters][]) {
      it(`should mint initial supply of ${symbol} to ${params.vTokenReceiver}`, async () => {
        // Since we're distributing 1:1, decimals should be accounted for in the exchange rate
        const expectedSupply = parseUnits(params.initialSupply, 8);
        const vToken = await ethers.getContractAt(VTOKEN_ABI, vTokens[symbol]);
        expect(await vToken.balanceOf(params.vTokenReceiver)).to.equal(expectedSupply);
      });
    }

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
            expect(await comptroller.owner()).to.equal(berachainbartio.NORMAL_TIMELOCK);
          });
        });
      };

      checkComptroller(COMPTROLLER_CORE, "Core");
    });

    it.only("Interest rates", async () => {
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
