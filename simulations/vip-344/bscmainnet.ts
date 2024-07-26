import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip344, { USDC, USDT, VTREASURY, CERTIK, FAIRYPROOF, CHAINALYSIS, CHAOSLABS, CERTIK_AMOUNT, FAIRYPROOF_AMOUNT, CHAINALYSIS_AMOUNT, CHAOS_LABS_AMOUNT } from "../../vips/vip-344/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(40805481, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let treasury: Contract;

  let prevCertikBalance: BigNumber;
  let prevFairyProofBalance: BigNumber;
  let prevChainalysisBalance: BigNumber;
  let prevChaosLabsBalance: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    treasury = new ethers.Contract(VTREASURY, VTREASURY_ABI, ethers.provider);

    prevCertikBalance = await usdt.balanceOf(CERTIK);
    prevFairyProofBalance = await usdt.balanceOf(FAIRYPROOF);
    prevChainalysisBalance = await usdc.balanceOf(CHAINALYSIS);
    prevChaosLabsBalance = await usdc.balanceOf(CHAOSLABS);
  });

  testVip("VIP-344", await vip344(), {
    callbackAfterExecution: async txResponse => {
      // await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [4, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const certikBalance = await usdt.balanceOf(CERTIK);
      const fairyProofBalance = await usdt.balanceOf(FAIRYPROOF);
      const chainalysisBalance = await usdc.balanceOf(CHAINALYSIS);
      const chaosLabsBalance = await usdc.balanceOf(CHAOSLABS);

      expect(certikBalance.sub(prevCertikBalance)).to.equal(CERTIK_AMOUNT);
      expect(fairyProofBalance.sub(prevFairyProofBalance)).to.equal(FAIRYPROOF_AMOUNT);
      expect(chainalysisBalance.sub(prevChainalysisBalance)).to.be.gte(CHAINALYSIS_AMOUNT);
      // expect(chaosLabsBalance.sub(prevChaosLabsBalance)).to.equal(CHAOS_LABS_AMOUNT);
    });
  });
});
