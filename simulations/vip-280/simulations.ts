import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip280 from "../../vips/vip-280/bscmainnet";
import {
  CANTINA_RECEIVER,
  CANTINA_USDC_AMOUNT,
  CERTIK_RECEIVER,
  CERTIK_USDT_AMOUNT,
  CHAINALYSIS_USDC_AMOUNT,
  COMMUNITY_WALLET,
  FAIRYPROOF_RECEIVER,
  FAIRYPROOF_USDT_AMOUNT,
  NODEREAL_RECEIVER,
  NODEREAL_USDT_AMOUNT,
  QUANTSTAMP_RECEIVER,
  QUANTSTAMP_USDC_AMOUNT,
  USDC,
  USDT,
} from "../../vips/vip-280/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(37477733, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let prevUSDTBalanceOfCertik: BigNumber;
  let prevUSDCBalanceOfQuantstamp: BigNumber;
  let prevUSDTBalanceOfFairyproof: BigNumber;
  let prevUSDCBalanceOfCantina: BigNumber;
  let prevUSDTBalanceOfNodereal: BigNumber;
  let prevUSDCBalanceOfCommunityWallet: BigNumber;

  before(async () => {
    usdc = new Contract(USDC, IERC20_ABI, ethers.provider);
    usdt = new Contract(USDT, IERC20_ABI, ethers.provider);

    prevUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
    prevUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
    prevUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
    prevUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);
    prevUSDTBalanceOfNodereal = await usdt.balanceOf(NODEREAL_RECEIVER);
    prevUSDCBalanceOfCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);
  });

  testVip("VIP-280", await vip280(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [6]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of wallets", async () => {
      const newUSDTBalanceOfCertik = await usdt.balanceOf(CERTIK_RECEIVER);
      const newUSDCBalanceOfQuantstamp = await usdc.balanceOf(QUANTSTAMP_RECEIVER);
      const newUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
      const newUSDCBalanceOfCantina = await usdc.balanceOf(CANTINA_RECEIVER);
      const newUSDTBalanceOfNodereal = await usdt.balanceOf(NODEREAL_RECEIVER);
      const newUSDCBalanceOfCommunityWallet = await usdc.balanceOf(COMMUNITY_WALLET);

      expect(newUSDTBalanceOfCertik).to.be.eq(prevUSDTBalanceOfCertik.add(CERTIK_USDT_AMOUNT));
      expect(newUSDCBalanceOfQuantstamp).to.be.eq(prevUSDCBalanceOfQuantstamp.add(QUANTSTAMP_USDC_AMOUNT));
      expect(newUSDTBalanceOfFairyproof).to.be.eq(prevUSDTBalanceOfFairyproof.add(FAIRYPROOF_USDT_AMOUNT));
      expect(newUSDCBalanceOfCantina).to.be.eq(prevUSDCBalanceOfCantina.add(CANTINA_USDC_AMOUNT));
      expect(newUSDTBalanceOfNodereal).to.be.eq(prevUSDTBalanceOfNodereal.add(NODEREAL_USDT_AMOUNT));
      expect(newUSDCBalanceOfCommunityWallet).to.be.eq(prevUSDCBalanceOfCommunityWallet.add(CHAINALYSIS_USDC_AMOUNT));
    });
  });
});
