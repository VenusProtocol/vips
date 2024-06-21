import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip138 } from "../../vips/vip-138";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";

const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT = "0x55d398326f99059ff775485246999027b3197955";
const PECKSHIELD_RECEIVER = "0x24ee02a67c64f66ca5bcf9352f6701b46dcedff1";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const FAIRYPROOF_RECEIVER = "0x083a394785f20b244e0697c08f0e01874fde801f";
const OZ_RECEIVER = "0x5e101FCa7a2BAB7877972bc85A1a07A2606A31B9";

const PECKSHIELD_AMOUNT = parseUnits("18000", 18).add(parseUnits("6000", 18));
const CERTIK_AMOUNT = parseUnits("19000", 18);
const FAIRYPROOF_AMOUNT = parseUnits("20000", 18);
const OZ_AMOUNT = parseUnits("277200", 18);

forking(29726604, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let prevBalancePeckShield: BigNumber;
  let prevBalanceCertik: BigNumber;
  let prevBalanceFairyproof: BigNumber;
  let prevBalanceOZ: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalancePeckShield = await usdc.balanceOf(PECKSHIELD_RECEIVER);
    prevBalanceCertik = await usdc.balanceOf(CERTIK_RECEIVER);
    prevBalanceFairyproof = await usdc.balanceOf(FAIRYPROOF_RECEIVER);
    prevBalanceOZ = await usdc.balanceOf(OZ_RECEIVER);
  });

  testVip("VIP-138 Payments for auditors", await vip138(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });

  describe("Post-VIP behavior", async () => {
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

    it("Should increase balances of Fairyproof receiver", async () => {
      const currentBalance = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const delta = currentBalance.sub(prevBalanceFairyproof);
      expect(delta).equals(FAIRYPROOF_AMOUNT);
    });

    it("Should increase balances of OZ receiver", async () => {
      const currentBalance = await usdc.balanceOf(OZ_RECEIVER);
      const delta = currentBalance.sub(prevBalanceOZ);
      expect(delta).equals(OZ_AMOUNT);
    });
  });
});
