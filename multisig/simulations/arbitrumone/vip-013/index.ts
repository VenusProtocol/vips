import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumberish, Signer } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";

import {vip012} from "../../../proposals/arbitrumone/vip-012"
import vip013, {
  COMPTROLLER_LIQUID_STAKED_ETH,
  PSR,
  REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH,
  VWETH,
  VweETH,
  VwstETH,
  WETH,
  vTokenReceiver,
  weETH,
  wstETH,
} from "../../../proposals/arbitrumone/vip-013";
import TOKEN_ABI from "./abi/WETH.json";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";
import XVS_ABI from "./abi/xvs.json";

const { arbitrumone } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = arbitrumone.RESILIENT_ORACLE;
const GUARDIAN = arbitrumone.GUARDIAN;
const POOL_REGISTRY = arbitrumone.POOL_REGISTRY;
const OLD_COMPTROLLER_IMPLEMENTATION = "0x5d91d7b73284f62f67db484e2a7678da85354159";

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

type VTokenSymbol = "vwstETH_Liquid_staked_ETH" | "vweETH_Liquid_staked_ETH" | "vWETH_Liquid_staked_ETH";

const vTokens: { [key in VTokenSymbol]: string } = {
  vwstETH_Liquid_staked_ETH: VwstETH,
  vweETH_Liquid_staked_ETH: VweETH,
  vWETH_Liquid_staked_ETH: VWETH,
};

const tokens = {
  wstETH: wstETH,
  weETH: weETH,
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
    initialSupply: "3.55",
    vTokenReceiver: vTokenReceiver,
  },
  vweETH_Liquid_staked_ETH: {
    borrowCap: "2300",
    supplyCap: "4600",
    collateralFactor: "0.93",
    liquidationThreshold: "0.95",
    reserveFactor: "0.25",
    initialSupply: "4",
    vTokenReceiver: vTokenReceiver,
  },
  vWETH_Liquid_staked_ETH: {
    borrowCap: "12500",
    supplyCap: "14000",
    collateralFactor: "0",
    liquidationThreshold: "0",
    reserveFactor: "0.2",
    initialSupply: "1.9678",
    vTokenReceiver: vTokenReceiver,
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

forking(250401898, async () => {
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
      // executing the vip012 to upgrade the beacon comptroller implementation
      await pretendExecutingVip(await vip012());

      const WSTETH_ACCOUNT = "0x513c7E3a9c69cA3e22550eF58AC1C0088e918FFf";
      const WEETH_ACCOUNT = "0x8437d7C167dFB82ED4Cb79CD44B7a32A1dd95c77";

      await impersonateAccount(WSTETH_ACCOUNT);
      await impersonateAccount(WEETH_ACCOUNT);
      await setBalance(WSTETH_ACCOUNT, ethers.utils.parseEther("1"));
      await setBalance(WEETH_ACCOUNT, ethers.utils.parseEther("1"));

      const wstETHSigner: Signer = await ethers.getSigner(WSTETH_ACCOUNT);
      const weETHSigner: Signer = await ethers.getSigner(WEETH_ACCOUNT);
      const mockWSTToken = await ethers.getContractAt(TOKEN_ABI, wstETH, wstETHSigner);
      const mockWeETHToken = await ethers.getContractAt(TOKEN_ABI, weETH, weETHSigner);

      await mockWSTToken.connect(wstETHSigner).transfer(arbitrumone.VTREASURY, ethers.utils.parseEther("3"));

      await mockWeETHToken.connect(weETHSigner).transfer(arbitrumone.VTREASURY, ethers.utils.parseEther("3"));

      await pretendExecutingVip(await vip013());

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
      before(async () => {
        const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";
        const ARB_ACCOUNT = "0xF3FC178157fb3c87548bAA86F9d24BA38E649B58";

        await impersonateAccount(ARB_ACCOUNT);
        await setBalance(ARB_ACCOUNT, ethers.utils.parseEther("1"));

        const signer: Signer = await ethers.getSigner(ARB_ACCOUNT);
        const mockARBToken = await ethers.getContractAt(TOKEN_ABI, ARB, signer);

        await mockARBToken.connect(signer).transfer(arbitrumone.VTREASURY, ethers.utils.parseEther("1"));
      });

      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });

    describe("Rewards Distributor tests", async () => {
      let xvs: Contract;
      before(async () => {
        xvs = await ethers.getContractAt(XVS_ABI, arbitrumone.XVS);
      });

      it("rewards distributor should have expected number of xvs tokens", async () => {
        expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH)).to.be.equal(parseUnits("15300", 18));
      });

      const rewardBasicConfig = {
        pool: COMPTROLLER_LIQUID_STAKED_ETH,
        address: REWARD_DISTRIBUTOR_LIQUID_STAKED_ETH,
        token: arbitrumone.XVS,
      };

      describe("Generic checks for rewards", async () => {
        checkRewardsDistributorPool(COMPTROLLER_LIQUID_STAKED_ETH, 1);

        const tokensRewardConfig: RewardsDistributorConfig[] = [
          {
            ...rewardBasicConfig,
            vToken: VwstETH,
            borrowSpeed: "0",
            supplySpeed: "327932098765432",
            totalRewardsToDistribute: parseUnits("2550", 18),
          },
          {
            ...rewardBasicConfig,
            vToken: VweETH,
            borrowSpeed: "0",
            supplySpeed: "327932098765432",
            totalRewardsToDistribute: parseUnits("2550", 18),
          },
          {
            ...rewardBasicConfig,
            vToken: VWETH,
            borrowSpeed: "918209876543209",
            supplySpeed: "393518518518518",
            totalRewardsToDistribute: parseUnits("10200", 18),
          },
        ];

        for (const config of tokensRewardConfig) {
          checkRewardsDistributor("RewardsDistributor_LiquidStakedETH_XVS", config);
        }
      });
    });
  });
});
