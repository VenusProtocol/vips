import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  Actions,
  BNB_COMPTROLLERS,
  BNB_VTOKENS,
  COMPTROLLER_LiquidStakedBNB,
  VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
  vip510,
} from "../../vips/vip-510/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(50560525, async () => {
  let comptroller_liquid_staked_bnb: Contract;
  let comptroller_btc: Contract;
  let comptroller_liquid_staked_eth: Contract;
  let comptroller_meme: Contract;
  let comptroller_stablecoin: Contract;
  let comptroller_tron: Contract;
  let comptroller_defi: Contract;
  let comptroller_gamefi: Contract;

  before(async () => {
    comptroller_liquid_staked_bnb = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_LiquidStakedBNB);
    comptroller_btc = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.BTC);
    comptroller_liquid_staked_eth = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.LiquidStakedETH);
    comptroller_meme = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.Meme);
    comptroller_stablecoin = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.Stablecoins);
    comptroller_tron = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.Tron);
    comptroller_defi = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.DeFi);
    comptroller_gamefi = await ethers.getContractAt(COMPTROLLER_ABI, BNB_COMPTROLLERS.GameFi);
  });

  describe("Pre-VIP behavior", async () => {
    describe("COMPTROLLER_LIQUID_STAKED_BNB", async () => {
      it("Check market CF is not zero", async () => {
        const market = await comptroller_liquid_staked_bnb.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
        expect(market.collateralFactorMantissa).not.equal(0);
      });

      it("Check market LI is not zero", async () => {
        const market = await comptroller_liquid_staked_bnb.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
        expect(market.liquidationIncentiveMantissa).not.equal(0);
      });

      it("Check mint action is not paused", async () => {
        const isPaused = await comptroller_liquid_staked_bnb.actionPaused(
          VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
          Actions.MINT,
        ); // Mint action
        expect(isPaused).to.be.false;
      });

      it("Check enter market action is not paused", async () => {
        const isPaused = await comptroller_liquid_staked_bnb.actionPaused(
          VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.false;
      });
    });

    describe("COMPTROLLER_BTC", async () => {
      it("unpaused actions for VToken_vPT_BTC", async () => {
        // BORROW already paused
        let paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC, Actions.BORROW);
        expect(paused).to.be.true;

        // MINT already paused
        paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC, Actions.MINT);
        expect(paused).to.be.true;

        // ENTER_MARKET already paused
        paused = await comptroller_btc.actionPaused(
          BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("unpaused actions for VToken_vBTCB_BTC", async () => {
        let paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_LIQUID_STAKED_ETH", async () => {
      it("unpaused actions for VToken_vETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vweETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vwstETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.false;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_MEME", async () => {
      it("unpaused actions for VToken_vBabyDoge_Meme", async () => {
        let paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vUSDT_Meme", async () => {
        let paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_STABLECOIN", async () => {
      it("unpaused actions for VToken_vEURA_Stablecoins", async () => {
        // MINT already paused
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        // BORROW already paused
        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vEURA_Stablecoins, Actions.MINT);
        expect(paused).to.be.true;

        // ENTER_MARKET already paused
        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("unpaused actions for VToken_vUSDD_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vUSDT_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vlisUSD_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_TRON", async () => {
      it("unpaused actions for VToken_vTRX_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vBTT_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vWIN_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vUSDD_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vUSDT_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_DEFI", async () => {
      it("unpaused actions for VToken_vUSDD_DeFi", async () => {
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });

      it("unpaused actions for VToken_vALPACA_DeFi", async () => {
        // Borrow already paused
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.BORROW);
        expect(paused).to.be.true;

        // Mint not paused
        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.MINT);
        expect(paused).to.be.false;

        // Enter market al
        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("unpaused actions for VToken_vankrBNB_DeFi", async () => {
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });

    describe("COMPTROLLER_GAME_FI", async () => {
      it("unpaused actions for VToken_vUSDD_GameFi", async () => {
        let paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.BORROW);
        expect(paused).to.be.false;

        paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.MINT);
        expect(paused).to.be.false;

        paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.ENTER_MARKET);
        expect(paused).to.be.false;
      });
    });
  });

  testVip("VIP-510", await vip510(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["ActionPausedMarket", "NewCollateralFactor", "NewLiquidationThreshold"],
        [62, 18, 0],
      );
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("COMPTROLLER_LIQUID_STAKED_BNB", async () => {
      it("Market CF should be zero", async () => {
        const market = await comptroller_liquid_staked_bnb.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
        expect(market.collateralFactorMantissa).to.equal(0);
      });

      it("Check market LI remains uneffected", async () => {
        const market = await comptroller_liquid_staked_bnb.markets(VToken_vPT_clisBNB_APR25_LiquidStakedBNB);
        expect(market.liquidationIncentiveMantissa).not.equal(0);
      });

      it("Mint action should be paused", async () => {
        const isPaused = await comptroller_liquid_staked_bnb.actionPaused(
          VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
          Actions.MINT,
        );
        expect(isPaused).to.be.true;
      });

      it("Enter market action should be paused", async () => {
        const isPaused = await comptroller_liquid_staked_bnb.actionPaused(
          VToken_vPT_clisBNB_APR25_LiquidStakedBNB,
          Actions.ENTER_MARKET,
        ); // Enter market action
        expect(isPaused).to.be.true;
      });
    });

    describe("COMPTROLLER_BTC", async () => {
      it("paused actions for VToken_vPT_BTC", async () => {
        let paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_btc.actionPaused(
          BNB_VTOKENS.BTC.vPT_SolvBTC_BBN_27MAR2025_BTC,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vBTCB_BTC", async () => {
        let paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_btc.actionPaused(BNB_VTOKENS.BTC.vBTCB_BTC, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.BTC)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_btc.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_LIQUID_STAKED_ETH", async () => {
      it("paused actions for VToken_vETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vweETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vweETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vwstETH_LiquidStakedETH", async () => {
        let paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.MINT,
        );
        expect(paused).to.be.true;

        paused = await comptroller_liquid_staked_eth.actionPaused(
          BNB_VTOKENS.LiquidStakedETH.vwstETH_LiquidStakedETH,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.LiquidStakedETH)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_liquid_staked_eth.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_MEME", async () => {
      it("paused actions for VToken_vBabyDoge_Meme", async () => {
        let paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vBabyDoge_Meme, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vUSDT_Meme", async () => {
        let paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_meme.actionPaused(BNB_VTOKENS.Meme.vUSDT_Meme, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.Meme)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_meme.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_STABLECOIN", async () => {
      it("paused actions for VToken_vEURA_Stablecoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vEURA_Stablecoins, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vEURA_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vUSDD_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDD_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vUSDT_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vUSDT_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vlisUSD_StableCoins", async () => {
        let paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins,
          Actions.BORROW,
        );
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_stablecoin.actionPaused(
          BNB_VTOKENS.Stablecoins.vlisUSD_Stablecoins,
          Actions.ENTER_MARKET,
        );
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.Stablecoins)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_stablecoin.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_TRON", async () => {
      it("paused actions for VToken_vTRX_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vTRX_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vBTT_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vBTT_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vWIN_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vWIN_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vUSDD_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDD_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vUSDT_Tron", async () => {
        let paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_tron.actionPaused(BNB_VTOKENS.Tron.vUSDT_Tron, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.Tron)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_tron.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_DEFI", async () => {
      it("paused actions for VToken_vUSDD_DeFi", async () => {
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vUSDD_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vALPACA_DeFi", async () => {
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vALPACA_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it("paused actions for VToken_vankrBNB_DeFi", async () => {
        let paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_defi.actionPaused(BNB_VTOKENS.DeFi.vankrBNB_DeFi, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      for (const [name, address] of Object.entries(BNB_VTOKENS.DeFi)) {
        it(`should set ${name} collateral factor to 0`, async () => {
          const market = await comptroller_defi.markets(address);
          expect(market.collateralFactorMantissa).to.equal(0);
        });
      }
    });

    describe("COMPTROLLER_GAME_FI", async () => {
      it("paused actions for VToken_vUSDD_GameFi", async () => {
        let paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.BORROW);
        expect(paused).to.be.true;

        paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.MINT);
        expect(paused).to.be.true;

        paused = await comptroller_gamefi.actionPaused(BNB_VTOKENS.GameFi.vUSDD_GameFi, Actions.ENTER_MARKET);
        expect(paused).to.be.true;
      });

      it(`should set vsfrxETH_LiquidStakedETH collateral factor to 0`, async () => {
        const market = await comptroller_gamefi.markets(BNB_VTOKENS.GameFi.vUSDD_GameFi);
        expect(market.collateralFactorMantissa).to.equal(0);
      });
    });
  });
});
