import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000, { COMPTROLLER, VBTC, VUSDC, VUSDT, VWBETH, VFDUSD, Actions } from "../../../proposals/bscmainnet/vip-000";
import COMPTROLLER_ABI from "./abi/comptroller.json"

forking(59782673, async () => {
    const provider = ethers.provider;
    let comptroller: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    });

    it("Actions Paused", async () => {
      const vbtcLiquidationPaused = await comptroller.actionPaused(VBTC, Actions.LIQUIDATE);
      const vusdcSeizePaused = await comptroller.actionPaused(VUSDC, Actions.SEIZE);
      const vusdtSeizePaused = await comptroller.actionPaused(VUSDT, Actions.SEIZE);
      const vwbethSeizePaused = await comptroller.actionPaused(VWBETH, Actions.SEIZE);
      const vfdusdSeizePaused = await comptroller.actionPaused(VFDUSD, Actions.SEIZE);
      const vusdcTransferPaused = await comptroller.actionPaused(VUSDC, Actions.TRANSFER);
      const vusdtTransferPaused = await comptroller.actionPaused(VUSDT, Actions.TRANSFER);
      const vwbethTransferPaused = await comptroller.actionPaused(VWBETH, Actions.TRANSFER);
      const vfdusdTransferPaused = await comptroller.actionPaused(VFDUSD, Actions.TRANSFER);      
      
      expect(vbtcLiquidationPaused).to.equal(true);
      expect(vusdcSeizePaused).to.equal(true);
      expect(vusdtSeizePaused).to.equal(true);
      expect(vwbethSeizePaused).to.equal(true);
      expect(vfdusdSeizePaused).to.equal(true);
      expect(vusdcTransferPaused).to.equal(true);
      expect(vusdtTransferPaused).to.equal(true);
      expect(vwbethTransferPaused).to.equal(true);
      expect(vfdusdTransferPaused).to.equal(true);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip000());
    });

    // TODO: Add VIP-001 checks here also

    it("Actions Paused", async () => {
      const vbtcLiquidationPaused = await comptroller.actionPaused(VBTC, Actions.LIQUIDATE);
      const vusdcSeizePaused = await comptroller.actionPaused(VUSDC, Actions.SEIZE);
      const vusdtSeizePaused = await comptroller.actionPaused(VUSDT, Actions.SEIZE);
      const vwbethSeizePaused = await comptroller.actionPaused(VWBETH, Actions.SEIZE);
      const vfdusdSeizePaused = await comptroller.actionPaused(VFDUSD, Actions.SEIZE);
      const vusdcTransferPaused = await comptroller.actionPaused(VUSDC, Actions.TRANSFER);
      const vusdtTransferPaused = await comptroller.actionPaused(VUSDT, Actions.TRANSFER);
      const vwbethTransferPaused = await comptroller.actionPaused(VWBETH, Actions.TRANSFER);
      const vfdusdTransferPaused = await comptroller.actionPaused(VFDUSD, Actions.TRANSFER);      
      
      expect(vbtcLiquidationPaused).to.equal(true);
      expect(vusdcSeizePaused).to.equal(true);
      expect(vusdtSeizePaused).to.equal(true);
      expect(vwbethSeizePaused).to.equal(true);
      expect(vfdusdSeizePaused).to.equal(true);
      expect(vusdcTransferPaused).to.equal(true);
      expect(vusdtTransferPaused).to.equal(true);
      expect(vwbethTransferPaused).to.equal(true);
      expect(vfdusdTransferPaused).to.equal(true);
    });
  });
});
