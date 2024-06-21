import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { COMMUNITY_WALLET, PECKSHIELD_RECEIVER, USDC, vip173 } from "../../vips/vip-173";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const AMOUNT_TO_REFUND = parseUnits("42000", 18);
const PECKSHIELD_AMOUNT = parseUnits("5000", 18);

forking(31966000, async () => {
  let usdc: Contract;
  let prevBalancePeckShield: BigNumber;
  let prevBalanceCommunityWallet: BigNumber;

  before(async () => {
    usdc = await ethers.getContractAt(IERC20_ABI, USDC);
    prevBalancePeckShield = await usdc.balanceOf(PECKSHIELD_RECEIVER);
    prevBalanceCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-173", await vip173(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async (tx: TransactionResponse) => {
      await expectEvents(tx, [VTREASURY_ABI, IERC20_ABI], ["WithdrawTreasuryBEP20", "Transfer"], [2, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should increase the balance of Peckshield", async () => {
      const currentBalance = await usdc.balanceOf(PECKSHIELD_RECEIVER);
      const delta = currentBalance.sub(prevBalancePeckShield);
      expect(delta).equals(PECKSHIELD_AMOUNT);
    });

    it("should increase the balance of the community wallet", async () => {
      const currentBalance = await usdc.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevBalanceCommunityWallet);
      expect(delta).equals(AMOUNT_TO_REFUND);
    });
  });
});
