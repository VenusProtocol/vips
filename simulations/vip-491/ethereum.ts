import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import bscmainnetVip491, {
  Actions,
  Comptroller_Ethena,
  Comptroller_LiquidStakedETH,
  PT_weETH_26DEC2024_LiquidStakedETH,
  Pendle_Router,
  Timelock_Ethereum,
  VToken_vPT_USDe_27MAR2025_Ethena,
  VToken_vPT_sUSDE_27MAR2025_Ethena,
  VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
  VToken_vUSDC_Ethena,
  VToken_vsUSDe_Ethena,
  VTreasury_Ethereum,
  weETH_Address,
  weETH_expected,
} from "../../vips/vip-491/bscmainnet";
import bscmainnet2Vip491, {
  COMPTROLLER_CORE,
  USDe,
  USDe_INITIAL_SUPPLY,
  VUSDe_CORE,
  VsUSDe_CORE,
  sUSDe,
  sUSDe_INITIAL_SUPPLY,
} from "../../vips/vip-491/bscmainnet-2";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vtoken.json";

const provider = ethers.provider;
const { ethereum } = NETWORK_ADDRESSES;
const PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
const BLOCKS_PER_YEAR = BigNumber.from("2628000");
const USDe_HOLDER = "0x33AE83071432116AE892693b45466949a38Ac74C";
const sUSDe_HOLDER = "0x15Bb5D31048381c84a157526cEF9513531b8BE1e";

forking(22475162, async () => {
  let comptrollerEthena: Contract;
  let comptrollerLSETH: Contract;
  let comptrollerCore: Contract;
  let vPtTokenWeETH: Contract;
  let ptTokenWeETH: Contract;
  let weETH: Contract;
  let weEthBefore: BigNumber;
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
    comptrollerEthena = new ethers.Contract(Comptroller_Ethena, COMPTROLLER_ABI, provider);
    comptrollerLSETH = new ethers.Contract(Comptroller_LiquidStakedETH, COMPTROLLER_ABI, provider);
    vPtTokenWeETH = new ethers.Contract(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, VTOKEN_ABI, provider);
    ptTokenWeETH = new ethers.Contract(PT_weETH_26DEC2024_LiquidStakedETH, ERC20_ABI, provider);

    weETH = new ethers.Contract(weETH_Address, ERC20_ABI, provider);
    weEthBefore = await weETH.balanceOf(VTreasury_Ethereum);

    USDeHolder = await initMainnetUser(USDe_HOLDER, parseEther("1"));
    sUSDeHolder = await initMainnetUser(sUSDe_HOLDER, parseEther("1"));

    susde = await ethers.getContractAt(ERC20_ABI, sUSDe);
    usde = await ethers.getContractAt(ERC20_ABI, USDe);

    await susde.connect(sUSDeHolder).transfer(ethereum.VTREASURY, sUSDe_INITIAL_SUPPLY);
    await usde.connect(USDeHolder).transfer(ethereum.VTREASURY, USDe_INITIAL_SUPPLY);
  });

  describe("Pre-VIP behavior", async () => {
    describe("Ethena Markets", () => {
      it("Check PT_USDe market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_USDe_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check PT_USDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check PT_USDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check PT_sUSDE market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_sUSDE_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check PT_sUSDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check PT_sUSDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check sUSDE market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vsUSDe_Ethena);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check sUSDE market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check sUSDE enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check USDC market CF is not zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vUSDC_Ethena);
        expect(market.collateralFactorMantissa).equal(0);
      });

      it("Check USDC market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check USDC enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.false;
      });
    });

    describe("Liquid Staked ETH Market", () => {
      it("Check weETH market CF is not zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check weth market mint is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, Actions.MINT);
        expect(isPaused).to.be.false;
      });

      it("Check weth enter market action is not paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(
          VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.false;
      });

      it("Check PT token approval is zero", async () => {
        const allowance = await ptTokenWeETH.allowance(Timelock_Ethereum, Pendle_Router);
        expect(allowance).to.equal(0);
      });

      it("Check treasury vToken balance", async () => {
        const balance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(balance).to.be.gt(0);
      });
    });
  });

  testForkedNetworkVipCommands("VIP-491 part 1", await bscmainnetVip491());
  testForkedNetworkVipCommands("VIP-491 part 2", await bscmainnet2Vip491());

  describe("Post-VIP behavior", async () => {
    describe("Ethena Markets", () => {
      it("Check PT_USDe market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_USDe_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check PT_USDe market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check PT_USDe enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_USDe_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check PT_sUSDE market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vPT_sUSDE_27MAR2025_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check PT_sUSDE market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check PT_sUSDE enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vPT_sUSDE_27MAR2025_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check sUSDE market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vsUSDe_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check sUSDE market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check sUSDE enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vsUSDe_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check USDC market CF is zero", async () => {
        const market = await comptrollerEthena.markets(VToken_vUSDC_Ethena);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check USDC market mint is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check USDC enter market action is paused", async () => {
        const isPaused = await comptrollerEthena.actionPaused(VToken_vUSDC_Ethena, Actions.ENTER_MARKET); // Enter market action
        expect(isPaused).to.be.true;
      });
    });

    describe("Liquid Staked ETH Market", () => {
      it("Check weETH market CF is zero", async () => {
        const market = await comptrollerLSETH.markets(VToken_vPT_weETH_26DEC2024_LiquidStakedETH);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check weETH market mint is paused", async () => {
        const isPaused = await comptrollerLSETH.actionPaused(VToken_vPT_weETH_26DEC2024_LiquidStakedETH, Actions.MINT);
        expect(isPaused).to.be.true;
      });

      it("Check weETH enter market action is paused", async () => {
        const isPaused = await comptrollerLSETH.actionPaused(
          VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.true;
      });

      it("Check treasury holds no vPT tokens after redemption", async () => {
        const vptBalance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(vptBalance).to.equal(0);
      });

      it("Verify Pendle redemption occurred", async () => {
        const treasuryBalance = await ptTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(treasuryBalance).to.equal(0);
      });

      it("Check Normal Timelock holds no vPT tokens after redemption", async () => {
        const vptBalance = await vPtTokenWeETH.balanceOf(Timelock_Ethereum);
        expect(vptBalance).to.equal(0);
      });

      it("Check Normal Timelock holds no PT tokens after redemption", async () => {
        const treasuryBalance = await ptTokenWeETH.balanceOf(Timelock_Ethereum);
        expect(treasuryBalance).to.equal(0);
      });

      it("Verify treasury received weEth after Pendle redemption", async () => {
        const weEthAfter = await weETH.balanceOf(VTreasury_Ethereum);
        expect(weEthAfter.sub(weEthBefore)).to.equal(weETH_expected);
      });
    });

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
        it(`should mint initial supply of ${VsUSDe_CORE} and ${VUSDe_CORE} to ${ethereum.VTREASURY}`, async () => {
          const expectedSupply = parseUnits("10000", 8);

          expect(await vToken1.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
          expect(await vToken2.balanceOf(ethereum.VTREASURY)).to.equal(expectedSupply);
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
