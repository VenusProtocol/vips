import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip259 } from "../../vips/vip-259/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const PESSIMISTIC_AMOUNT = parseUnits("5000", 18);
const FAIRYPROOF_AMOUNT = parseUnits("15000", 18);
const COMMUNITY_WALLET_USDT_AMOUNT = parseUnits("2895", 18);
const COMMUNITY_WALLET_ETH_AMOUNT = parseUnits("2.4083847", 18);
const COMMUNITY_WALLET_BNB_AMOUNT = parseUnits("3", 18);
const PESSIMISTIC_RECEIVER = "0x1B3bCe9Bd90cF6598bCc0321cC10b48bfD6Cf12f";
const FAIRYPROOF_RECEIVER = "0x060a08fff78aedba4eef712533a324272bf68119";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

forking(36192027, async () => {
  let usdt: Contract;
  let eth: Contract;
  let prevBalancePessimistic: BigNumber;
  let prevBalanceFairyproof: BigNumber;
  let prevUSDTBalanceCommunityWallet: BigNumber;
  let prevETHBalanceCommunityWallet: BigNumber;
  let prevBNBBalanceCommunityWallet: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    eth = new ethers.Contract(ETH, IERC20_ABI, ethers.provider);
    prevBalancePessimistic = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
    prevBalanceFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
    prevUSDTBalanceCommunityWallet = await usdt.balanceOf(COMMUNITY_WALLET);
    prevETHBalanceCommunityWallet = await eth.balanceOf(COMMUNITY_WALLET);
    prevBNBBalanceCommunityWallet = await ethers.provider.getBalance(COMMUNITY_WALLET);
    console.log({ prevBNBBalanceCommunityWallet });
  });

  testVip("VIP-259 Payments Issuance for audits", await vip259(), {
    supporter: "0x55a9f5374af30e3045fb491f1da3c2e8a74d168d",
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20", "WithdrawTreasuryBNB"], [4, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Pessimistic receiver", async () => {
      const currentBalance = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
      const delta = currentBalance.sub(prevBalancePessimistic);
      expect(delta).equals(PESSIMISTIC_AMOUNT);
    });

    it("Should increase balances of Fairyproof receiver", async () => {
      const currentBalance = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const delta = currentBalance.sub(prevBalanceFairyproof);
      expect(delta).equals(FAIRYPROOF_AMOUNT);
    });

    it("Should increase USDT balances of Community wallet receiver", async () => {
      const currentBalance = await usdt.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevUSDTBalanceCommunityWallet);
      expect(delta).equals(COMMUNITY_WALLET_USDT_AMOUNT);
    });

    it("Should increase ETH balances of Community wallet receiver", async () => {
      const currentBalance = await eth.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevETHBalanceCommunityWallet);
      expect(delta).equals(COMMUNITY_WALLET_ETH_AMOUNT);
    });

    it("Should increase BNB balances of Community wallet receiver", async () => {
      const currentBalance = await ethers.provider.getBalance(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevBNBBalanceCommunityWallet);
      expect(delta).equals(COMMUNITY_WALLET_BNB_AMOUNT);
    });
  });
});
