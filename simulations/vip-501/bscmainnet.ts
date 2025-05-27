import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip501, {
  CERTIK,
  CERTIK_AMOUNT,
  FAIRYPROOF,
  FAIRYPROOF_AMOUNT,
  QUANTSTAMP,
  QUANTSTAMP_AMOUNT,
  USDC,
} from "../../vips/vip-501/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

forking(50391406, async () => {
  let usdc: Contract;

  let prevUSDCBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);

    prevUSDCBalanceOfCertik = await usdc.balanceOf(CERTIK);
    prevUSDCBalanceOfFairyproof = await usdc.balanceOf(FAIRYPROOF);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP);
  });

  testVip("VIP-501", await vip501(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balances", async () => {
      const usdcBalanceOfCertik = await usdc.balanceOf(CERTIK);
      const usdcBalanceOfFairyproof = await usdc.balanceOf(FAIRYPROOF);
      const usdcBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP);

      expect(usdcBalanceOfCertik.sub(prevUSDCBalanceOfCertik)).to.equal(CERTIK_AMOUNT);
      expect(usdcBalanceOfFairyproof.sub(prevUSDCBalanceOfFairyproof)).to.equal(FAIRYPROOF_AMOUNT);
      expect(usdcBalanceOfQuantstamp.sub(prevUSDCBalanceOfQuantstamp)).to.equal(QUANTSTAMP_AMOUNT);
    });
  });
});
