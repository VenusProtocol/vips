import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip304, { COMMUNITY_WALLET, TOKEN_REDEEMER, VUSDC } from "../../vips/vip-304/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

forking(38770760, () => {
  let usdc: Contract;
  let vusdc: Contract;
  let prevBalanceCommunityWallet: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vusdc = new ethers.Contract(VUSDC, ERC20_ABI, ethers.provider);
    prevBalanceCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-304 Transfer bootstrap liquidity needed for Arbitrum one to the Community wallet", vip304(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase USDC balance of the community wallet", async () => {
      const currUSDcBal = await usdc.balanceOf(COMMUNITY_WALLET);
      const delta = currUSDcBal.sub(prevBalanceCommunityWallet);
      expect(delta).to.be.closeTo(parseUnits("25000", 18), parseUnits("10", 18));
    });

    it("leaves no USDC in the redeemer helper contract", async () => {
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });

    it("leaves no vUSDC in the redeemer helper contract", async () => {
      expect(await vusdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });
});
