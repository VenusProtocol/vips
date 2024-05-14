import { expect } from "chai";
import { BigNumberish } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkVToken } from "../../../../src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "../../../../src/vip-framework/checks/interestRateModel";
import vip002 from "../../../proposals/opbnbtestnet/vip-002";
import BEACON_ABI from "./abi/beacon.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const POOL_REGISTRY = "0x560eA4e1cC42591E9f5F5D83Ad2fd65F30128951";
const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
const TREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";
const RESILIENT_ORACLE = "0xEF4e53a9A4565ef243A2f0ee9a7fc2410E1aA623";
const MOCK_BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const MOCK_ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const MOCK_USDT = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";
const MOCK_WBNB = "0xF9ce72611a1BE9797FdD2c995dB6fB61FD20E4eB";
const VBTCB_CORE = "0x86F82bca79774fc04859966917D2291A68b870A9";
const VETH_CORE = "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480";
const VUSDT_CORE = "0xe3923805f6E117E51f5387421240a86EF1570abC";
const VWBNB_CORE = "0xD36a31AcD3d901AeD998da6E24e848798378474e";
const COMPTROLLER_NEW_IMPL = "0xA693FbB4C5F479142e4Fb253B06FC113E5EB1536";
const VTOKEN_NEW_IMPL = "0xd1fC255c701a42b8eDe64eE92049444FF23626A0";
const COMPTROLLER_BEACON = "0x2020BDa1F931E07B14C9d346E2f6D5943b4cd56D";
const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // assuming a block is mined every 1 seconds

type VTokenSymbol = "vBTCB_Core" | "vETH_Core" | "vUSDT_Core" | "vWBNB_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  vBTCB_Core: VBTCB_CORE,
  vETH_Core: VETH_CORE,
  vUSDT_Core: VUSDT_CORE,
  vWBNB_Core: VWBNB_CORE,
};

const tokens = {
  BTCB: MOCK_BTCB,
  ETH: MOCK_ETH,
  USDT: MOCK_USDT,
  WBNB: MOCK_WBNB,
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
    borrowCap: "250",
    supplyCap: "300",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "0.3",
    vTokenReceiver: TREASURY,
  },
  vETH_Core: {
    borrowCap: "4600",
    supplyCap: "5500",
    collateralFactor: "0.75",
    liquidationThreshold: "0.8",
    reserveFactor: "0.2",
    initialSupply: "5",
    vTokenReceiver: TREASURY,
  },
  vUSDT_Core: {
    borrowCap: "9000000",
    supplyCap: "10000000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.82",
    reserveFactor: "0.1",
    initialSupply: "10000",
    vTokenReceiver: TREASURY,
  },
  vWBNB_Core: {
    borrowCap: "56000",
    supplyCap: "80000",
    collateralFactor: "0.45",
    liquidationThreshold: "0.5",
    reserveFactor: "0.25",
    initialSupply: "45",
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
    kink: "0.75",
    base: "0",
    multiplier: "0.05",
    jump: "0.8",
  },
  {
    vTokens: ["vETH_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.045",
    jump: "0.8",
  },
  {
    vTokens: ["vUSDT_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.07",
    jump: "0.8",
  },
  {
    vTokens: ["vWBNB_Core"],
    kink: "0.5",
    base: "0.02",
    multiplier: "0.2",
    jump: "3",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  vBTCB_Core: "",
  vETH_Core: "",
  vUSDT_Core: "",
  vWBNB_Core: "",
};

forking(16885889, () => {
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
    describe("Implementation check", () => {
      let comptrollerBeacon: Contract;
      let vtokenBeacon: Contract;

      before(async () => {
        comptrollerBeacon = await ethers.getContractAt(BEACON_ABI, COMPTROLLER_BEACON);
        vtokenBeacon = await ethers.getContractAt(BEACON_ABI, VTOKEN_BEACON);
      });

      it("should have correct comptroller implementation", async () => {
        const impl = await comptrollerBeacon.implementation();
        expect(impl).equals(COMPTROLLER_NEW_IMPL);
      });

      it("should have correct vtoken implementation", async () => {
        const impl = await vtokenBeacon.implementation();
        expect(impl).equals(VTOKEN_NEW_IMPL);
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
        expect(pool.creator).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
        expect(pool.comptroller).to.equal(COMPTROLLER_CORE);
      });

      it("should register Core pool vTokens in Core pool Comptroller", async () => {
        const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        const poolVTokens = await comptroller.getAllMarkets();
        expect(poolVTokens).to.have.lengthOf(4);
        expect(poolVTokens).to.include(vTokens.vBTCB_Core);
        expect(poolVTokens).to.include(vTokens.vETH_Core);
        expect(poolVTokens).to.include(vTokens.vUSDT_Core);
        expect(poolVTokens).to.include(vTokens.vWBNB_Core);
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
        it(`should transfer ownership of ${symbol} to opbnbtestnet.NORMAL_TIMELOCK`, async () => {
          const vToken = await ethers.getContractAt(VTOKEN_ABI, address);
          expect(await vToken.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
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

          it("should have owner = opbnbtestnet.NORMAL_TIMELOCK", async () => {
            expect(await comptroller.owner()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
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
  });
});
