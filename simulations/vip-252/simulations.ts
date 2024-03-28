import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip252 } from "../../vips/vip-252/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const QUANTSTAMP_RECEIVER = "0xd88139f832126b465a0d7A76be887912dc367016";
const COMMUNITY_RECEIVER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const CERTIK_AMOUNT = parseUnits("19000", 18);
const QUANTSTAMP_AMOUNT = parseUnits("32500", 18);
const COMMUNITY_AMOUNT = parseUnits("23000", 18);

forking(35865925, () => {
  let usdt: Contract;
  let usdc: Contract;
  let prevBalanceCertik: BigNumber;
  let prevBalanceQuantstamp: BigNumber;
  let prevBalanceCommunity: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevBalanceQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevBalanceCommunity = await usdt.balanceOf(COMMUNITY_RECEIVER);
  });

  testVip("VIP-252 Payments Issuance for audits & Refunds to Community Wallet", vip252(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });

    it("Should increase balances of Quantstamp receiver", async () => {
      const currentBalance = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const delta = currentBalance.sub(prevBalanceQuantstamp);
      expect(delta).equals(QUANTSTAMP_AMOUNT);
    });

    it("Should increase balances of Community receiver", async () => {
      const currentBalance = await usdt.balanceOf(COMMUNITY_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCommunity);
      expect(delta).equals(COMMUNITY_AMOUNT);
    });
  });
});
