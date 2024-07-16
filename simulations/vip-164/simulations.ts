import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CERTIK_RECEIVER,
  FAIRYPROOF_RECEIVER,
  PECKSHIELD_RECEIVER,
  QUANTSTAMP_RECEIVER,
  USDC,
  USDT,
  vip164,
} from "../../vips/vip-164";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const QUANTSTAMP_VENUS_PRIME_AMOUNT = parseUnits("45000", 18);
const QUANTSTAMP_INCOME_ALLOCATION_AMOUNT = parseUnits("30000", 18);
const FAIRYPROOF_AMOUNT = parseUnits("10000", 18);
const PECKSHIELD_AMOUNT = parseUnits("12000", 18);
const CERTIK_AMOUNT = parseUnits("19000", 18);

forking(31298100, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let prevBalanceQuantStamp: BigNumber;
  let prevBalanceFairyproof: BigNumber;
  let prevBalancePeckShield: BigNumber;
  let prevBalanceCertik: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceQuantStamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevBalanceFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
    prevBalancePeckShield = await usdc.balanceOf(PECKSHIELD_RECEIVER);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
  });

  testVip("VIP-164 Security audits payments", await vip164(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Quantstamp receiver", async () => {
      const currentBalance = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const delta = currentBalance.sub(prevBalanceQuantStamp);
      expect(delta).equals(QUANTSTAMP_INCOME_ALLOCATION_AMOUNT.add(QUANTSTAMP_VENUS_PRIME_AMOUNT));
    });

    it("Should increase balances of Fairyproof receiver", async () => {
      const currentBalance = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const delta = currentBalance.sub(prevBalanceFairyproof);
      expect(delta).equals(FAIRYPROOF_AMOUNT);
    });

    it("Should increase balances of Peckshield receiver", async () => {
      const currentBalance = await usdc.balanceOf(PECKSHIELD_RECEIVER);
      const delta = currentBalance.sub(prevBalancePeckShield);
      expect(delta).equals(PECKSHIELD_AMOUNT);
    });

    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });
  });
});
