import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip504, {
  COMPTROLLER_CORE,
  USDe,
  USDe_INITIAL_SUPPLY,
  VTOKEN_RECEIVER,
  VUSDe_CORE,
  VsUSDe_CORE,
  sUSDe,
  sUSDe_INITIAL_SUPPLY,
} from "../../vips/vip-504/bscmainnet";
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
const USDe_HOLDER = "0x33AE83071432116AE892693b45466949a38Ac74C";
const sUSDe_HOLDER = "0x15Bb5D31048381c84a157526cEF9513531b8BE1e";

forking(22475162, async () => {
  let comptrollerCore: Contract;
  let USDeHolder: SignerWithAddress;
  let sUSDeHolder: SignerWithAddress;
  let susde: Contract;
  let usde: Contract;

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
    USDeHolder = await initMainnetUser(USDe_HOLDER, parseEther("1"));
    sUSDeHolder = await initMainnetUser(sUSDe_HOLDER, parseEther("1"));

    susde = await ethers.getContractAt(ERC20_ABI, sUSDe);
    usde = await ethers.getContractAt(ERC20_ABI, USDe);

    await susde.connect(sUSDeHolder).transfer(ethereum.VTREASURY, sUSDe_INITIAL_SUPPLY);
    await usde.connect(USDeHolder).transfer(ethereum.VTREASURY, USDe_INITIAL_SUPPLY);
  });

  testForkedNetworkVipCommands("VIP-504 ethereum", await vip504(), {
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
          "TokenConfigAdded",
          "Approval",
          "Transfer",
          "ConversionConfigUpdated",
          "WithdrawTreasuryToken",
          "NewReduceReservesBlockDelta",
          "MarketAdded",
        ],
        [3, 24, 24, 5, 2, 2, 2],
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
        it(`should mint initial supply of ${VsUSDe_CORE} and ${VUSDe_CORE} to ${VTOKEN_RECEIVER}`, async () => {
          const expectedSupply = parseUnits("10000", 8);
          const supplyRemainingsUSDe = expectedSupply.sub(parseUnits("86", 8));
          const supplyRemainingUSDe = expectedSupply.sub(parseUnits("100", 8));

          expect(await vToken1.balanceOf(VTOKEN_RECEIVER)).to.equal(supplyRemainingsUSDe);
          expect(await vToken2.balanceOf(VTOKEN_RECEIVER)).to.equal(supplyRemainingUSDe);
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
      });

      it("Interest rates", async () => {
        checkInterestRate(
          interestRateModelAddress1,
          "VsUSDe",
          {
            base: "0",
            multiplier: "0",
            jump: "0",
            kink: "0",
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
