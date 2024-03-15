import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip243 } from "../../vips/vip-243";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const CHAOS_LABS_RECEIVER = "0xfb1912af5b9d3fb678f801bf764e98f1c217ef35";
const CERTIK_AMOUNT = parseUnits("19000", 18);
const CHAOS_LABS_AMOUNT = parseUnits("130000", 18);

forking(35259895, () => {
  let usdt: ethers.Contract;
  let prevBalanceCertik: BigNumber;
  let prevBalanceChaosLabs: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevBalanceChaosLabs = await usdt.balanceOf(CHAOS_LABS_RECEIVER);
  });

  testVip("VIP-243 Payments for auditors", vip243(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });

    it("Should increase balances of Chaos Labs receiver", async () => {
      const currentBalance = await usdt.balanceOf(CHAOS_LABS_RECEIVER);
      const delta = currentBalance.sub(prevBalanceChaosLabs);
      expect(delta).equals(CHAOS_LABS_AMOUNT);
    });
  });
});
