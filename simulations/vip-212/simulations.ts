import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip212 } from "../../vips/vip-212";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const BEP20_RECEIVER = "0x9c492e6c087b50f9191e671b6781be81579942ab";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

const CERTIK_AMOUNT = parseUnits("19000", 18);
const BINANCE_AMOUNT = parseUnits("36000", 18);
const COMMUNITY_AMOUNT = parseUnits("15000", 18);

forking(33968239, () => {
  let usdt: ethers.Contract;
  let prevBalanceCertik: BigNumber;
  let prevBalancecommunity: any;
  let prevBalanceBinance: any;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevBalancecommunity = await usdt.balanceOf(COMMUNITY_WALLET);
    prevBalanceBinance = await usdt.balanceOf(BEP20_RECEIVER);
  });

  testVip("VIP-212 Payments for auditors", vip212(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20", "Failure"], [3, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });
    it("Should increase balances of Community wallet", async () => {
      const currentBalance = await usdt.balanceOf(COMMUNITY_WALLET);
      const delta = currentBalance.sub(prevBalancecommunity);
      expect(delta).equals(COMMUNITY_AMOUNT);
    });
    it("Should increase balances of Binance receiver", async () => {
      const currentBalance = await usdt.balanceOf(BEP20_RECEIVER);
      const delta = currentBalance.sub(prevBalanceBinance);
      expect(delta).equals(BINANCE_AMOUNT);
    });
  });
});
