import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { CERTIK_RECEIVER, PECKSHIELD_RECEIVER, USDC, USDT, vip180 } from "../../vips/vip-180";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const PECKSHIELD_AMOUNT = parseUnits("7900", 18);
const CERTIK_AMOUNT = parseUnits("19000", 18);

forking(32280000, () => {
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let prevBalancePeckShield: BigNumber;
  let prevBalanceCertik: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalancePeckShield = await usdc.balanceOf(PECKSHIELD_RECEIVER);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
  });

  testVip("VIP-180 Security audits payments", vip180(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
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
  });
});
