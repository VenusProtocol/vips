import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip002, {allVTokens, Action} from "../../../proposals/bscmainnet/vip-002";
import COMPTROLLER_ABI from "./abi/comptroller.json"
import { NETWORK_ADDRESSES } from "src/networkAddresses";


forking(59788053, async () => {
    const provider = ethers.provider;
    let comptroller: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      comptroller = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    });

    it("Actions Paused: Redeem, Seize, Transfer, Exit Market, Liquidate, Borrow, Enter Market", async () => {
      for (const [vTokenSymbol, vTokenAddress] of Object.entries(allVTokens)) {
        const vTokenRedeemPaused = await comptroller.actionPaused(vTokenAddress, Action.REDEEM);
        const vTokenSeizePaused = await comptroller.actionPaused(vTokenAddress, Action.SEIZE);
        const vTokenTransferPaused = await comptroller.actionPaused(vTokenAddress, Action.TRANSFER);
        const vTokenExitMarketPaused = await comptroller.actionPaused(vTokenAddress, Action.EXIT_MARKET);
        const vTokenLiquidationPaused = await comptroller.actionPaused(vTokenAddress, Action.LIQUIDATE);
        const vTokenBorrowPaused = await comptroller.actionPaused(vTokenAddress, Action.BORROW);
        const vTokenEnterMarketPaused = await comptroller.actionPaused(vTokenAddress, Action.ENTER_MARKET);

        expect(vTokenRedeemPaused).to.equal(true);
        expect(vTokenSeizePaused).to.equal(true);
        expect(vTokenTransferPaused).to.equal(true);
        expect(vTokenExitMarketPaused).to.equal(true);
        expect(vTokenLiquidationPaused).to.equal(true);
        expect(vTokenBorrowPaused).to.equal(true);
        expect(vTokenEnterMarketPaused).to.equal(true);
      }
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip002());
    });

    it("Actions Unpaused: Redeem, Seize, Transfer, Exit Market", async () => {
      for (const [vTokenSymbol, vTokenAddress] of Object.entries(allVTokens)) {
        const vTokenRedeemPaused = await comptroller.actionPaused(vTokenAddress, Action.REDEEM);
        const vTokenSeizePaused = await comptroller.actionPaused(vTokenAddress, Action.SEIZE);
        const vTokenTransferPaused = await comptroller.actionPaused(vTokenAddress, Action.TRANSFER);
        const vTokenExitMarketPaused = await comptroller.actionPaused(vTokenAddress, Action.EXIT_MARKET);

        expect(vTokenRedeemPaused).to.equal(false);
        expect(vTokenSeizePaused).to.equal(false);
        expect(vTokenTransferPaused).to.equal(false);
        expect(vTokenExitMarketPaused).to.equal(false);
      }
    });

    it("Actions Unpaused: Liquidate", async () => {
      for (const [vTokenSymbol, vTokenAddress] of Object.entries(allVTokens)) {
        const vTokenLiquidationPaused = await comptroller.actionPaused(vTokenAddress, Action.LIQUIDATE);
        if (vTokenAddress === allVTokens.vBUSD) {
          expect(vTokenLiquidationPaused).to.equal(true);
          continue;
        }
        expect(vTokenLiquidationPaused).to.equal(false);
      }
    });

    it("Actions Unpaused: Borrow", async () => {
      for (const [vTokenSymbol, vTokenAddress] of Object.entries(allVTokens)) {
        const vTokenBorrowPaused = await comptroller.actionPaused(vTokenAddress, Action.BORROW);
        if (vTokenAddress === allVTokens.vBUSD ||
            vTokenAddress === allVTokens.vSXP ||
            vTokenAddress === allVTokens.vXVS ||
            vTokenAddress === allVTokens.vBETH ||
            vTokenAddress === allVTokens.vTUSDOLD ||
            vTokenAddress === allVTokens.vTRXOLD ||
            vTokenAddress === allVTokens["vPT-sUSDE-26JUN2025"] ||
            vTokenAddress === allVTokens.vsUSDe ||
            vTokenAddress === allVTokens.vxSolvBTC ||
            vTokenAddress === allVTokens.vasBNB) {
          expect(vTokenBorrowPaused).to.equal(true);
          continue;
        }
        expect(vTokenBorrowPaused).to.equal(false);
      }
    });

    it("Actions Unpaused: Enter Market", async () => {
      for (const [vTokenSymbol, vTokenAddress] of Object.entries(allVTokens)) {
        const vTokenEnterMarketPaused = await comptroller.actionPaused(vTokenAddress, Action.ENTER_MARKET);
        if (vTokenAddress === allVTokens.vBUSD ||
            vTokenAddress === allVTokens.vSXP ||
            vTokenAddress === allVTokens.vTUSDOLD ||
            vTokenAddress === allVTokens.vTRXOLD ||
            vTokenAddress === allVTokens["vPT-sUSDE-26JUN2025"]) {
          expect(vTokenEnterMarketPaused).to.equal(true);
          continue;
        }
        expect(vTokenEnterMarketPaused).to.equal(false);
      }
    });
  });
});
