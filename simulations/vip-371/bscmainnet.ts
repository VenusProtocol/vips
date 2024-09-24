import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip371, { COMMUNITY_WALLET, TOKEN_REDEEMER, TREASURY, VUSDC, VUSDC_AMOUNT } from "../../vips/vip-371/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

forking(42532215, async () => {
  let usdc: Contract;
  let vusdc: Contract;
  let prevBalanceCommunityWallet: BigNumber;
  let prevTreasuryBalance: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(VUSDC, ERC20_ABI, ethers.provider);
    prevBalanceCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);
    prevTreasuryBalance = await vusdc.balanceOf(TREASURY);
  });

  testVip("VIP-371 Transfer bootstrap liquidity needed for Optimism to the Community wallet", await vip371(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should decrease vtreasury balance by the amount used to transfer vtoken corresponding to 25000 usdc", async () => {
      expect(await vusdc.balanceOf(TREASURY)).to.closeTo(prevTreasuryBalance.sub(VUSDC_AMOUNT), parseUnits("500", 8));
    });

    it("Should increase USDC balance of the community wallet", async () => {
      const currUSDcBal = await usdc.balanceOf(COMMUNITY_WALLET);
      const delta = currUSDcBal.sub(prevBalanceCommunityWallet);
      expect(delta).to.be.equal(parseUnits("25000", 18));
    });

    it("Leaves no USDC in the redeemer helper contract", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("Leaves no vUSDC in the redeemer helper contract", async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
