import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import bsctestnetVip491, {
  Actions,
  Comptroller_Ethena,
  Comptroller_LiquidStakedETH,
  VToken_vPT_USDe_27MAR2025_Ethena,
  VToken_vPT_sUSDE_27MAR2025_Ethena,
  VToken_vPT_weETH_26DEC2024_LiquidStakedETH,
  VToken_vUSDC_Ethena,
  VToken_vsUSDe_Ethena,
  VTreasury_Ethereum,
} from "../../vips/vip-491/bsctestnet";

import bsctestnet2Vip491, {
  COMPTROLLER_CORE,
  USDe,
  VUSDe_CORE,
  VsUSDe_CORE,
  sUSDe,
} from "../../vips/vip-491/bsctestnet-2";

import COMPTROLLER_ABI from "./abi/comptroller.json";
import VTOKEN_ABI from "./abi/vtoken.json";

const provider = ethers.provider;
const { sepolia } = NETWORK_ADDRESSES;
const PSR = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
const BLOCKS_PER_YEAR = BigNumber.from("2628000");

forking(8318124, async () => {
  let comptrollerEthena: Contract;
  let comptrollerLSETH: Contract;
  let comptrollerCore: Contract;
  let vPtTokenWeETH: Contract;

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

      it("Check treasury vToken balance", async () => {
        const balance = await vPtTokenWeETH.balanceOf(VTreasury_Ethereum);
        expect(balance).to.be.gt(0);
      });
    });
  });

  testForkedNetworkVipCommands("add sUSDe and USDe market", await bsctestnetVip491());
  testForkedNetworkVipCommands("add sUSDe and USDe market", await bsctestnet2Vip491());

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
          expect(await vToken1.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
          expect(await vToken2.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
        });
      });

      describe("ProtocolShareReserve", () => {
        it(`should set PSR for ${VsUSDe_CORE} and ${VUSDe_CORE}`, async () => {
          expect(await vToken1.protocolShareReserve()).to.equal(PSR);
          expect(await vToken2.protocolShareReserve()).to.equal(PSR);
        });
      });

      describe("Initial supply", () => {
        it(`should have initial supply in ${sepolia.VTREASURY}`, async () => {
          const expectedSupply = parseUnits("10000", 8);
          const supplyRemaining = expectedSupply.sub(parseUnits("100", 8));

          expect(await vToken1.balanceOf(sepolia.VTREASURY)).to.equal(supplyRemaining);
          expect(await vToken2.balanceOf(sepolia.VTREASURY)).to.equal(supplyRemaining);
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
