import { expect } from "chai";
import { BigNumberish } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "../../../../src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import vip002 from "../../../proposals/opbnbmainnet/vip-002";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";
const COMPTROLLER_CORE = "0xD6e3E2A1d8d95caE355D15b3b9f8E5c2511874dd";
const TREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
const BTCB = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2";
const ETH = "0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea";
const USDT = "0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3";
const WBNB = "0x4200000000000000000000000000000000000006";
const FDUSD = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
const VBTCB_CORE = "0xED827b80Bd838192EA95002C01B5c6dA8354219a";
const VETH_CORE = "0x509e81eF638D489936FA85BC58F52Df01190d26C";
const VUSDT_CORE = "0xb7a01Ba126830692238521a1aA7E7A7509410b8e";
const VWBNB_CORE = "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672";
const VFDUSD_CORE = "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917";
const COMPTROLLER_BEACON = "0x11C3e19236ce17729FC66b74B537de00C54d44e7";
const COMPTROLLER_IMPL = "0x557C69aDf4bB12305F00F62f1Ab71CAe9BFa3D46";
const VTOKEN_BEACON = "0xfeD1d3a13597c5aBc893Af41ED5cb17e64c847c7";
const VTOKEN_IMPL = "0x227c4D4176604908755be2B513A2b7bcA6f54a1F";
const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
const BLOCKS_PER_YEAR = 31_536_000; // assuming a block is mined every 1 seconds

const CORE_POOL_SUPPLIER = "0xa7e84de1f48743143223ba17153ea88732490cd2";

type VTokenSymbol = "vBTCB_Core" | "vETH_Core" | "vUSDT_Core" | "vWBNB_Core" | "vFDUSD_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  vBTCB_Core: VBTCB_CORE,
  vETH_Core: VETH_CORE,
  vUSDT_Core: VUSDT_CORE,
  vWBNB_Core: VWBNB_CORE,
  vFDUSD_Core: VFDUSD_CORE,
};

const tokens = {
  BTCB: BTCB,
  ETH: ETH,
  USDT: USDT,
  WBNB: WBNB,
  FDUSD: FDUSD,
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
  vBTCB_Core: {
    name: "Venus BTCB (Core)",
    symbol: "vBTCB_Core",
    decimals: 8,
    underlying: tokens.BTCB,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  vETH_Core: {
    name: "Venus ETH (Core)",
    symbol: "vETH_Core",
    decimals: 8,
    underlying: tokens.ETH,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  vUSDT_Core: {
    name: "Venus USDT (Core)",
    symbol: "vUSDT_Core",
    decimals: 8,
    underlying: tokens.USDT,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  vWBNB_Core: {
    name: "Venus WBNB (Core)",
    symbol: "vWBNB_Core",
    decimals: 8,
    underlying: tokens.WBNB,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  vFDUSD_Core: {
    name: "Venus FDUSD (Core)",
    symbol: "vFDUSD_Core",
    decimals: 8,
    underlying: tokens.FDUSD,
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
  vBTCB_Core: {
    borrowCap: "0.55",
    supplyCap: "1",
    collateralFactor: "0.7",
    liquidationThreshold: "0.75",
    reserveFactor: "0.2",
    initialSupply: "0.03553143",
    vTokenReceiver: TREASURY,
  },
  vETH_Core: {
    borrowCap: "16",
    supplyCap: "25",
    collateralFactor: "0.7",
    liquidationThreshold: "0.75",
    reserveFactor: "0.2",
    initialSupply: "0.61097887",
    vTokenReceiver: TREASURY,
  },
  vUSDT_Core: {
    borrowCap: "130000",
    supplyCap: "150000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.77",
    reserveFactor: "0.1",
    initialSupply: "1800.00000001",
    vTokenReceiver: TREASURY,
  },
  vWBNB_Core: {
    borrowCap: "75",
    supplyCap: "100",
    collateralFactor: "0.6",
    liquidationThreshold: "0.65",
    reserveFactor: "0.25",
    initialSupply: "4.88149960",
    vTokenReceiver: TREASURY,
  },
  vFDUSD_Core: {
    borrowCap: "130000",
    supplyCap: "150000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.77",
    reserveFactor: "0.1",
    initialSupply: "1800.00000001",
    vTokenReceiver: TREASURY,
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
    vTokens: ["vBTCB_Core"],
    kink: "0.45",
    base: "0",
    multiplier: "0.09",
    jump: "3",
  },
  {
    vTokens: ["vETH_Core"],
    kink: "0.45",
    base: "0",
    multiplier: "0.09",
    jump: "3",
  },
  {
    vTokens: ["vUSDT_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.075",
    jump: "2.5",
  },
  {
    vTokens: ["vWBNB_Core"],
    kink: "0.6",
    base: "0",
    multiplier: "0.15",
    jump: "300",
  },
  {
    vTokens: ["vFDUSD_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.075",
    jump: "2.5",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {};

forking(16775600, () => {
  let poolRegistry: Contract;
  let fdusd: Contract;
  let oldCommunityWalletBalance: BigNumber;

  before(async () => {
    poolRegistry = await ethers.getContractAt(POOL_REGISTRY_ABI, POOL_REGISTRY);
    fdusd = await ethers.getContractAt(ERC20_ABI, FDUSD);
    oldCommunityWalletBalance = await fdusd.balanceOf(COMMUNITY_WALLET);
  });

  describe("Contracts setup", async () => {
    for (const [symbol, address] of Object.entries(vTokens) as [VTokenSymbol, string][]) {
      await checkVToken(address, vTokenState[symbol]);
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

    describe("Community Wallet", () => {
      it(`should have received 7,200 FDUSD`, async () => {
        const FDUSD_EXPECTED_TRANSFER_AMOUNT: BigNumber = parseUnits("7200", 18);
        const currentCommunityWalletBalance: BigNumber = await fdusd.balanceOf(COMMUNITY_WALLET);
        expect(currentCommunityWalletBalance.sub(oldCommunityWalletBalance)).equals(FDUSD_EXPECTED_TRANSFER_AMOUNT);
      });
    });

    describe("Implementation check", () => {
      let comptrollerBeacon: Contract;
      let vtokenBeacon: Contract;

      before(async () => {
        comptrollerBeacon = await ethers.getContractAt(BEACON_ABI, COMPTROLLER_BEACON);
        vtokenBeacon = await ethers.getContractAt(BEACON_ABI, VTOKEN_BEACON);
      });

      it("should have correct comptroller implementation", async () => {
        const impl = await comptrollerBeacon.implementation();
        expect(impl).equals(COMPTROLLER_IMPL);
      });

      it("should have correct vtoken implementation", async () => {
        const impl = await vtokenBeacon.implementation();
        expect(impl).equals(VTOKEN_IMPL);
      });
    });

    describe("PoolRegistry state", () => {
      let registeredPools: { name: string; creator: string; comptroller: string }[];

      before(async () => {
        console.log(`PoolRegistry: ${poolRegistry.address}`);
        registeredPools = await poolRegistry.getAllPools();
      });

      it("should have 1 pools", async () => {
        expect(registeredPools).to.have.lengthOf(1);
      });

      it("should register Core pool in PoolRegistry", async () => {
        const pool = registeredPools[0];
        expect(pool.name).to.equal("Core");
        expect(pool.creator).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(5);
        expect(poolVTokens).to.include(vTokens.vBTCB_Core);
        expect(poolVTokens).to.include(vTokens.vETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vWBNB_Core);
        expect(poolVTokens).to.include(vTokens.vFDUSD_Core);
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
        it(`should transfer ownership of ${symbol} to opbnbmainnet.NORMAL_TIMELOCK`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
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

          it("should have owner = opbnbmainnet.NORMAL_TIMELOCK", async () => {
            expect(await comptroller.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
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
      checkIsolatedPoolsComptrollers({ [COMPTROLLER_CORE]: CORE_POOL_SUPPLIER });
    });
  });
});
