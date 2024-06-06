import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  CERTIK_RECEIVER,
  CHAOSLABS_RECEIVER,
  OZ_RECEIVER,
  PECKSHIELD_RECEIVER,
  QUANTSTAMP_RECEIVER,
  STEAKHOUSE_RECEIVER,
  USDC,
  USDT,
  VAI,
  vip184,
} from "../../vips/vip-184";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const PECKSHIELD_AMOUNT = parseUnits("31000", 18); // 24,000 + 7,000 = 31,000
const CERTIK_AMOUNT = parseUnits("19000", 18);
const QUANTSTAMP_AMOUNT = parseUnits("25000", 18);
const OZ_AMOUNT = parseUnits("277200", 18);
const CHAOSLABS_AMOUNT = parseUnits("200000", 18);
const STEAKHOUSE_AMOUNT = parseUnits("50000", 18);

forking(32516199, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let vai: Contract;

  let prevBalancePeckShield: BigNumber;
  let prevBalanceCertik: BigNumber;
  let prevBalanceQuantStamp: BigNumber;
  let prevBalanceOz: BigNumber;
  let prevBalanceChaosLabs: BigNumber;
  let prevBalanceSteakHouse: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    vai = new ethers.Contract(VAI, IERC20_ABI, ethers.provider);

    prevBalancePeckShield = await usdc.balanceOf(PECKSHIELD_RECEIVER);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevBalanceQuantStamp = await usdt.balanceOf(QUANTSTAMP_RECEIVER);
    prevBalanceOz = await usdc.balanceOf(OZ_RECEIVER);
    prevBalanceChaosLabs = await usdt.balanceOf(CHAOSLABS_RECEIVER);
    prevBalanceSteakHouse = await vai.balanceOf(STEAKHOUSE_RECEIVER);
  });

  testVip("VIP-184 Security audits payments", await vip184(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [7]);
    },
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

    it("Should increase balances of Quantstamp receiver", async () => {
      const currentBalance = await usdt.balanceOf(QUANTSTAMP_RECEIVER);
      const delta = currentBalance.sub(prevBalanceQuantStamp);
      expect(delta).equals(QUANTSTAMP_AMOUNT);
    });

    it("Should increase balances of OZ receiver", async () => {
      const currentBalance = await usdc.balanceOf(OZ_RECEIVER);
      const delta = currentBalance.sub(prevBalanceOz);
      expect(delta).equals(OZ_AMOUNT);
    });

    it("Should increase balances of Chaos Labs receiver", async () => {
      const currentBalance = await usdt.balanceOf(CHAOSLABS_RECEIVER);
      const delta = currentBalance.sub(prevBalanceChaosLabs);
      expect(delta).equals(CHAOSLABS_AMOUNT);
    });

    it("Should increase balances of Steakhouse receiver", async () => {
      const currentBalance = await vai.balanceOf(STEAKHOUSE_RECEIVER);
      const delta = currentBalance.sub(prevBalanceSteakHouse);
      expect(delta).equals(STEAKHOUSE_AMOUNT);
    });
  });
});
