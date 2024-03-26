import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip278 from "../../vips/vip-262/bscmainnet";
import {
  CERTIK_RECEIVER,
  CERTIK_USDT_AMOUNT,
  QUANTSTAMP_RECEIVER,
  QUANTSTAMP_USDC_AMOUNT,
  FAIRYPROOF_RECEIVER,
  FAIRYPROOF_USDT_AMOUNT,
  CANTINA_RECEIVER,
  CANTINA_USDC_AMOUNT,
  USDC,
  USDT,
} from "../../vips/vip-278/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(37307972, () => {
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;
  let prevUSDTBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfCantina: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
    prevUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);

    await pretendExecutingVip(vip278());
  });

  testVip("VIP-278", vip278(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [4]);
    }
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of wallets", async () => {
      const newUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
      const newUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const newUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const newUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);

      expect(newUSDTBalanceOfCertik).to.be.eq(prevUSDTBalanceOfCertik.add(CERTIK_USDT_AMOUNT));
      expect(newUSDCBalanceOfQuantstamp).to.be.eq(prevUSDCBalanceOfQuantstamp.add(QUANTSTAMP_USDC_AMOUNT));
      expect(newUSDTBalanceOfFairyproof).to.be.eq(prevUSDTBalanceOfFairyproof.add(FAIRYPROOF_USDT_AMOUNT));
      expect(newUSDCBalanceOfCantina).to.be.eq(prevUSDCBalanceOfCantina.add(CANTINA_USDC_AMOUNT));
    });
  });
});
