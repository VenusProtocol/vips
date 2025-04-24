import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework/index";

import { expectEvents } from "../../src/utils";
import vip487, {
  FAIRYPROOF_AMOUNT,
  FAIRYPROOF_RECEIVER,
  PESSIMISTIC_AMOUNT,
  PESSIMISTIC_RECEIVER,
  USDT,
} from "../../vips/vip-487/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

forking(48602303, async () => {
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  let prevUSDTBalanceOfTreasury: BigNumber;
  let prevUSDTBalanceOfPessimistic: BigNumber;
  let prevUSDTBalanceOfFairyproof: BigNumber;

  before(async () => {
    prevUSDTBalanceOfTreasury = await usdt.balanceOf(VTREASURY);
    prevUSDTBalanceOfPessimistic = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
    prevUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);
  });

  testVip("VIP-487", await vip487(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check balance", async () => {
      const currentUSDTBalanceOfTreasury = await usdt.balanceOf(VTREASURY);
      const currentUSDTBalanceOfPessimistic = await usdt.balanceOf(PESSIMISTIC_RECEIVER);
      const currentUSDTBalanceOfFairyproof = await usdt.balanceOf(FAIRYPROOF_RECEIVER);

      expect(currentUSDTBalanceOfTreasury).equals(
        prevUSDTBalanceOfTreasury.sub(PESSIMISTIC_AMOUNT).sub(FAIRYPROOF_AMOUNT),
      );
      expect(currentUSDTBalanceOfPessimistic).equals(prevUSDTBalanceOfPessimistic.add(PESSIMISTIC_AMOUNT));
      expect(currentUSDTBalanceOfFairyproof).equals(prevUSDTBalanceOfFairyproof.add(FAIRYPROOF_AMOUNT));
    });
  });
});
