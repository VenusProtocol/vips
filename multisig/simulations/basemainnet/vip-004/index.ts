import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumberish, Signer } from "ethers";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip000 from "../../../proposals/basemainnet/vip-000";
import vip001 from "../../../proposals/basemainnet/vip-001";
import vip002 from "../../../proposals/basemainnet/vip-002";
import vip003 from "../../../proposals/basemainnet/vip-003";
import vip004, {
  COMPTROLLER_CORE,
  USDC,
  VCBBTC_CORE,
  VUSDC_CORE,
  VWETH_CORE,
  WETH,
  cbBTC,
} from "../../../proposals/basemainnet/vip-004";
import TOKEN_ABI from "./abi/WETH.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolRegistry.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { basemainnet } = NETWORK_ADDRESSES;

const PSR = "0x3565001d57c91062367C3792B74458e3c6eD910a";

const RESILIENT_ORACLE = basemainnet.RESILIENT_ORACLE;
const GUARDIAN = basemainnet.GUARDIAN;
const POOL_REGISTRY = basemainnet.POOL_REGISTRY;

const BLOCKS_PER_YEAR = BigNumber.from("31536000"); // equal to seconds in a year as it is timebased deployment

type VTokenSymbol = "VCBBTC_CORE" | "vWETH_Core" | "vUSDC_Core";

const vTokens: { [key in VTokenSymbol]: string } = {
  VCBBTC_CORE: VCBBTC_CORE,
  vWETH_Core: VWETH_CORE,
  vUSDC_Core: VUSDC_CORE,
};

const tokens = {
  cbBTC: cbBTC,
  WETH: WETH,
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

const vTokenState: { [key in VTokenSymbol]: VTokenState } = {
  // Core Pool
  VCBBTC_CORE: {
    name: "Venus cbBTC (Core)",
    symbol: "vcbBTC_Core",
    decimals: 8,
    underlying: tokens.cbBTC,
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
  VCBBTC_CORE: {
    borrowCap: "200",
    supplyCap: "400",
    collateralFactor: "0.73",
    liquidationThreshold: "0.78",
    reserveFactor: "0.2",
    initialSupply: "0.05",
    vTokenReceiver: basemainnet.VTREASURY,
  },
  vWETH_Core: {
    borrowCap: "9000",
    supplyCap: "10000",
    collateralFactor: "0.8",
    liquidationThreshold: "0.83",
    reserveFactor: "0.15",
    initialSupply: "2",
    vTokenReceiver: basemainnet.VTREASURY,
  },
  vUSDC_Core: {
    borrowCap: "27000000",
    supplyCap: "30000000",
    collateralFactor: "0.75",
    liquidationThreshold: "0.78",
    reserveFactor: "0.1",
    initialSupply: "5000",
    vTokenReceiver: basemainnet.VTREASURY,
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
    vTokens: ["VCBBTC_CORE"],
    kink: "0.45",
    base: "0",
    multiplier: "0.15",
    jump: "2.5",
  },
  {
    vTokens: ["vUSDC_Core"],
    kink: "0.8",
    base: "0",
    multiplier: "0.08",
    jump: "2.5",
  },
  {
    vTokens: ["vWETH_Core"],
    kink: "0.9",
    base: "0",
    multiplier: "0.03",
    jump: "4.5",
  },
];

const interestRateModelAddresses: { [key in VTokenSymbol]: string } = {
  VCBBTC_CORE: "",
  vWETH_Core: "",
  vUSDC_Core: "",
};

forking(23347683, async () => {
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
      const WETH_ACCOUNT = "0x6446021F4E396dA3df4235C62537431372195D38";
      const USDC_ACCOUNT = "0x0B0A5886664376F59C351ba3f598C8A8B4D0A6f3";
      const cbBTC_ACCOUNT = "0xF877ACaFA28c19b96727966690b2f44d35aD5976";

      await impersonateAccount(WETH_ACCOUNT);
      await impersonateAccount(USDC_ACCOUNT);
      await impersonateAccount(cbBTC_ACCOUNT);
      await setBalance(WETH_ACCOUNT, ethers.utils.parseEther("1"));
      await setBalance(USDC_ACCOUNT, ethers.utils.parseEther("1"));
      await setBalance(cbBTC_ACCOUNT, ethers.utils.parseEther("1"));

      const WETHSigner: Signer = await ethers.getSigner(WETH_ACCOUNT);
      const USDCSigner: Signer = await ethers.getSigner(USDC_ACCOUNT);
      const cbBTCSigner: Signer = await ethers.getSigner(cbBTC_ACCOUNT);
      const wethToken = await ethers.getContractAt(TOKEN_ABI, WETH, WETHSigner);
      const usdcToken = await ethers.getContractAt(TOKEN_ABI, USDC, USDCSigner);
      const cbBTCToken = await ethers.getContractAt(TOKEN_ABI, cbBTC, cbBTCSigner);

      await wethToken.connect(WETHSigner).transfer(basemainnet.VTREASURY, parseUnits("2", 18));
      await usdcToken.connect(USDCSigner).transfer(basemainnet.VTREASURY, parseUnits("5000", 6));
      await cbBTCToken.connect(cbBTCSigner).transfer(basemainnet.VTREASURY, parseUnits("0.05", 8));

      await pretendExecutingVip(await vip000());
      await pretendExecutingVip(await vip001());
      await pretendExecutingVip(await vip002());
      await pretendExecutingVip(await vip003());
      await pretendExecutingVip(await vip004());

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
        expect(poolVTokens).to.have.lengthOf(3);
        expect(poolVTokens).to.include(vTokens.VCBBTC_CORE);
        expect(poolVTokens).to.include(vTokens.vWETH_Core);
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
