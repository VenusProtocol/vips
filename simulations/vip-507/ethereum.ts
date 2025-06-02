import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip507, {
  COMPTROLLER_CORE,
  USDe,
  VSUSDE_EXPECTED,
  VUSDE_EXPECTED,
  VUSDe_CORE,
  VsUSDe_CORE,
  VsUSDe_IR_MODEL,
  sUSDe,
} from "../../vips/vip-507/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkoracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import POOL_REGISTRY_ABI from "./abi/poolregistry.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientoracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/singletokenconverter.json";
import VTOKEN_ABI from "./abi/vtoken.json";
import VTREASURY_ABI from "./abi/vtreasury.json";

const { ethereum } = NETWORK_ADDRESSES;
const PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const CHAINLINK_USDe_FEED = "0xa569d910839Ae8865Da8F8e70FfFb0cBA869F961";

forking(22609010, async () => {
  let comptrollerCore: Contract;

  describe("Contracts setup", () => {
    checkVToken(VsUSDe_CORE, {
      name: "Venus sUSDe (Core)",
      symbol: "vsUSDe_Core",
      decimals: 8,
      underlying: sUSDe,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER_CORE,
    });

    checkVToken(VUSDe_CORE, {
      name: "Venus USDe (Core)",
      symbol: "vUSDe_Core",
      decimals: 8,
      underlying: USDe,
      exchangeRate: parseUnits("1", 28),
      comptroller: COMPTROLLER_CORE,
    });
  });

  before(async () => {
    await setMaxStalePeriodInChainlinkOracle(
      ethereum.CHAINLINK_ORACLE,
      USDe,
      CHAINLINK_USDe_FEED,
      ethereum.NORMAL_TIMELOCK,
    );
  });

  testForkedNetworkVipCommands("VIP-507 ethereum", await vip507(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [
          ERC20_ABI,
          VTOKEN_ABI,
          SINGLE_TOKEN_CONVERTER_ABI,
          VTREASURY_ABI,
          POOL_REGISTRY_ABI,
          RESILIENT_ORACLE_ABI,
          CHAINLINK_ORACLE_ABI,
        ],
        [
          "Approval",
          "Transfer",
          "ConversionConfigUpdated",
          "WithdrawTreasuryToken",
          "NewReduceReservesBlockDelta",
          "MarketAdded",
        ],
        [24, 20, 5, 2, 2, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("New markets sUSDe and USDe", () => {
      let interestRateModelAddress1: string;
      let interestRateModelAddress2: string;

      let vToken1: Contract;
      let vToken2: Contract;

      before(async () => {
        vToken1 = await ethers.getContractAt(VTOKEN_ABI, VsUSDe_CORE);
        vToken2 = await ethers.getContractAt(VTOKEN_ABI, VUSDe_CORE);

        interestRateModelAddress1 = await vToken1.interestRateModel();
        interestRateModelAddress2 = await vToken2.interestRateModel();
      });

      describe("PoolRegistry state", () => {
        it("should register sUSDe and USDe vToken in Core pool Comptroller", async () => {
          comptrollerCore = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
          const poolVTokens = await comptrollerCore.getAllMarkets();
          expect(poolVTokens).to.include(VsUSDe_CORE);
          expect(poolVTokens).to.include(VUSDe_CORE);
        });
      });

      describe("Ownership", () => {
        it(`should transfer ownership of ${VsUSDe_CORE} and ${VUSDe_CORE} to NORMAL_TIMELOCK`, async () => {
          expect(await vToken1.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
          expect(await vToken2.owner()).to.equal(ethereum.NORMAL_TIMELOCK);
        });
      });

      describe("ProtocolShareReserve", () => {
        it(`should set PSR for ${VsUSDe_CORE} and ${VUSDe_CORE}`, async () => {
          expect(await vToken1.protocolShareReserve()).to.equal(PSR);
          expect(await vToken2.protocolShareReserve()).to.equal(PSR);
        });
      });

      describe("Initial supply", () => {
        it("normal timelock should not hold any vToken", async () => {
          const vToken1Balance = await vToken1.balanceOf(ethereum.NORMAL_TIMELOCK);
          const vToken2Balance = await vToken2.balanceOf(ethereum.NORMAL_TIMELOCK);

          expect(vToken1Balance).to.equal(0);
          expect(vToken2Balance).to.equal(0);
        });

        it("total supply of vTokens", async () => {
          const vToken1Supply = await vToken1.totalSupply();
          const vToken2Supply = await vToken2.totalSupply();

          expect(vToken1Supply).to.equal(VSUSDE_EXPECTED);
          expect(vToken2Supply).to.equal(VUSDE_EXPECTED);
        });

        it("zero address should hold total supply", async () => {
          const vToken1Balance = await vToken1.balanceOf(ethers.constants.AddressZero);
          const vToken2Balance = await vToken2.balanceOf(ethers.constants.AddressZero);
          const vToken1Supply = await vToken1.totalSupply();
          const vToken2Supply = await vToken2.totalSupply();

          expect(vToken1Supply).to.equal(vToken1Balance);
          expect(vToken2Supply).to.equal(vToken2Balance);
        });
      });

      describe("Interest rate model", () => {
        it("should set interest rate model for sUSDe", async () => {
          expect(await vToken1.interestRateModel()).to.equals(VsUSDe_IR_MODEL);
        });
      });

      describe(`risk parameters`, () => {
        let comptroller: Contract;

        before(async () => {
          comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
        });

        it(`should set correct reserve factor`, async () => {
          expect(await vToken1.reserveFactorMantissa()).to.equal(parseUnits("0", 18));
          expect(await vToken2.reserveFactorMantissa()).to.equal(parseUnits("0.1", 18));
        });

        it(`should set correct collateral factor`, async () => {
          const market1 = await comptroller.markets(VsUSDe_CORE);
          const market2 = await comptroller.markets(VUSDe_CORE);

          expect(market1.collateralFactorMantissa).to.equal(parseUnits("0.72", 18));
          expect(market2.collateralFactorMantissa).to.equal(parseUnits("0.72", 18));
        });

        it(`should set correct liquidation threshold`, async () => {
          const market1 = await comptroller.markets(VsUSDe_CORE);
          const market2 = await comptroller.markets(VUSDe_CORE);

          expect(market1.liquidationThresholdMantissa).to.equal(parseUnits("0.75", 18));
          expect(market2.liquidationThresholdMantissa).to.equal(parseUnits("0.75", 18));
        });

        it(`should set correct protocol seize share`, async () => {
          expect(await vToken1.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
          expect(await vToken2.protocolSeizeShareMantissa()).to.equal(parseUnits("0.05", 18));
        });

        it(`should set correct supply cap`, async () => {
          expect(await comptroller.supplyCaps(VsUSDe_CORE)).to.equal(parseUnits("20000000", 18));
          expect(await comptroller.supplyCaps(VUSDe_CORE)).to.equal(parseUnits("30000000", 18));
        });

        it(`should set correct borrow cap`, async () => {
          expect(await comptroller.borrowCaps(VsUSDe_CORE)).to.equal(0);
          expect(await comptroller.borrowCaps(VUSDe_CORE)).to.equal(parseUnits("25000000", 18));
        });

        it("should pause borrow action for sUSDe market", async () => {
          expect(await comptroller.actionPaused(VsUSDe_CORE, 2)).to.equal(true);
        });
      });

      it("Interest rates", async () => {
        checkInterestRate(
          interestRateModelAddress1,
          "VsUSDe",
          {
            base: "0",
            multiplier: "0.08",
            jump: "0.8",
            kink: "0.8",
          },
          BLOCKS_PER_YEAR,
        );
        checkInterestRate(
          interestRateModelAddress2,
          "VUSDe",
          {
            base: "0",
            multiplier: "0.1",
            jump: "2.5",
            kink: "0.8",
          },
          BLOCKS_PER_YEAR,
        );
      });

      it("check isolated pools", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
