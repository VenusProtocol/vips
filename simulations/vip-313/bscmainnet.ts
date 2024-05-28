import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip313, { GITCOIN_WALLET, TOKEN_REDEEMER, TREASURY, VUSDC, VUSDC_AMOUNT } from "../../vips/vip-313/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

forking(39090224, () => {
  let usdc: Contract;
  let vusdc: Contract;
  let prevBalanceGitcoinWallet: BigNumber;
  let prevTreasuryBalance: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(VUSDC, ERC20_ABI, ethers.provider);
    prevBalanceGitcoinWallet = await usdc.balanceOf(GITCOIN_WALLET);
    prevTreasuryBalance = await vusdc.balanceOf(TREASURY);
  });

  testVip("VIP-313 VIP to transfer funds to the Gitcoin wallet, for the grants", vip313(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should decrease vtreasury balance by the amount used to transfer vtoken corresponding to 150000 usdc", async () => {
      expect(await vusdc.balanceOf(TREASURY)).to.closeTo(prevTreasuryBalance.sub(VUSDC_AMOUNT), parseUnits("6000", 8)); // around 150 USDC
    });

    it("Should increase USDC balance of the gitcoin wallet", async () => {
      const currUSDcBal = await usdc.balanceOf(GITCOIN_WALLET);
      const delta = currUSDcBal.sub(prevBalanceGitcoinWallet);
      expect(delta).to.be.equal(parseUnits("150000", 18));
    });

    it("Leaves no USDC in the redeemer helper contract", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Leaves no vUSDC in the redeemer helper contract", async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
