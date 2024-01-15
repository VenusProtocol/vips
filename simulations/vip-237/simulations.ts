import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip237 } from "../../vips/vip-237";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";
const CERTIK_AMOUNT = parseUnits("19000", 18);

forking(35259895, () => {
  let usdt: ethers.Contract;
  let prevBalanceCertik: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
  });

  testVip("VIP-237 Payments for auditors", vip237(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(CERTIK_AMOUNT);
    });
  });
});
