import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  CERTIK_RECEIVER,
  MESSARI_RECEIVER,
  UQUID_RECEIVER,
  USDC,
  USDT,
  VAI,
  VRTUHub_RECEIVER,
  vip196,
} from "../../vips/vip-196";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const CERTIK_AMOUNT = parseUnits("19000", 18);
const UQUID_AMOUNT = parseUnits("10000", 18);
const VRTUHub_AMOUNT = parseUnits("15000", 18);
const MESSARI_AMOUNT = parseUnits("95000", 18);
const GALXE_CAMPAIGN_AMOUNT = parseUnits("25000", 18);

forking(33135500, () => {
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let vai: ethers.Contract;

  let prevBalanceCertik: BigNumber;
  let prevBalanceUquid: BigNumber;
  let prevBalanceVrtHub: BigNumber;
  let prevBalanceMessari: BigNumber;
  let prevBalanceGalxeCampaign: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    vai = new ethers.Contract(VAI, IERC20_ABI, ethers.provider);

    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevBalanceUquid = await vai.balanceOf(UQUID_RECEIVER);
    prevBalanceVrtHub = await vai.balanceOf(VRTUHub_RECEIVER);
    prevBalanceMessari = await usdc.balanceOf(MESSARI_RECEIVER);
    prevBalanceGalxeCampaign = await usdt.balanceOf(MESSARI_RECEIVER);
  });

  testVip("VIP-196 Payments", vip196(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });

    it("Should increase balances of UQUID receiver", async () => {
      const currentBalance = await vai.balanceOf(UQUID_RECEIVER);
      const delta = currentBalance.sub(prevBalanceUquid);
      expect(delta).equals(UQUID_AMOUNT);
    });

    it("Should increase balances of VRTHub receiver", async () => {
      const currentBalance = await vai.balanceOf(VRTUHub_RECEIVER);
      const delta = currentBalance.sub(prevBalanceVrtHub);
      expect(delta).equals(VRTUHub_AMOUNT);
    });

    it("Should increase balances of Messari receiver", async () => {
      const currentBalance = await usdc.balanceOf(MESSARI_RECEIVER);
      const delta = currentBalance.sub(prevBalanceMessari);
      expect(delta).equals(MESSARI_AMOUNT);
    });

    it("Should increase balances of Messari (GALXE Campaign) receiver", async () => {
      const currentBalance = await usdt.balanceOf(MESSARI_RECEIVER);
      const delta = currentBalance.sub(prevBalanceGalxeCampaign);
      expect(delta).equals(GALXE_CAMPAIGN_AMOUNT);
    });
  });
});
