import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip279 from "../../vips/vip-279/bscmainnet";
import {
  CANTINA_RECEIVER,
  CANTINA_USDC_AMOUNT,
  CERTIK_RECEIVER,
  CERTIK_USDT_AMOUNT,
  FAIRYPROOF_RECEIVER,
  FAIRYPROOF_USDT_AMOUNT,
  NODEREAL_RECEIVER,
  NODEREAL_USDT_AMOUNT,
  QUANTSTAMP_RECEIVER,
  QUANTSTAMP_USDC_AMOUNT,
  USDC,
  USDT,
} from "../../vips/vip-279/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(37477733, () => {
  let usdc: ethers.Contract;
  let usdt: ethers.Contract;
  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;
  let prevUSDTBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfCantina: BigNumber;
  let prevUSDTBalanceOfNodereal: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, IERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
    prevUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);
    prevUSDTBalanceOfNodereal = await usdt.balanceOf(NODEREAL_RECEIVER);
  });

  testVip("VIP-279", vip279(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [5]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of wallets", async () => {
      const newUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
      const newUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const newUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const newUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);
      const newUSDTBalanceOfNodereal = await usdt.balanceOf(NODEREAL_RECEIVER);

      expect(newUSDTBalanceOfCertik).to.be.eq(prevUSDTBalanceOfCertik.add(CERTIK_USDT_AMOUNT));
      expect(newUSDCBalanceOfQuantstamp).to.be.eq(prevUSDCBalanceOfQuantstamp.add(QUANTSTAMP_USDC_AMOUNT));
      expect(newUSDTBalanceOfFairyproof).to.be.eq(prevUSDTBalanceOfFairyproof.add(FAIRYPROOF_USDT_AMOUNT));
      expect(newUSDCBalanceOfCantina).to.be.eq(prevUSDCBalanceOfCantina.add(CANTINA_USDC_AMOUNT));
      expect(newUSDTBalanceOfNodereal).to.be.eq(prevUSDTBalanceOfNodereal.add(NODEREAL_USDT_AMOUNT));
    });
  });
});
