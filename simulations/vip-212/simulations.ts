import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip212 } from "../../vips/vip-212";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";

const USDT = "0x55d398326f99059ff775485246999027b3197955";
const CERTIK_RECEIVER = "0x4cf605b238e9c3c72d0faed64d12426e4a54ee12";

const AMOUNT = parseUnits("19000", 18);

forking(33940509, () => {
  let usdt: ethers.Contract;
  let prevBalanceCertik: BigNumber;

  before(async () => {
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);
    prevBalanceCertik = await usdt.balanceOf(CERTIK_RECEIVER);
  });

  testVip("VIP-212 Payments for auditors", vip212(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Certik receiver", async () => {
      const currentBalance = await usdt.balanceOf(CERTIK_RECEIVER);
      const delta = currentBalance.sub(prevBalanceCertik);
      expect(delta).equals(AMOUNT);
    });
  });
});
