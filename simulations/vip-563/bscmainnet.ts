import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip563, { BINANCE, BINANCE_AMOUNT, USDT_BSC } from "../../vips/vip-563/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(66983359, async () => {
  const usdt = new Contract(USDT_BSC, ERC20_ABI, ethers.provider);
  const binanceBalanceBefore = await usdt.balanceOf(BINANCE);
  const vtreasuryUSDTBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);

  testVip("VIP-563", await vip563(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check binance USDT balance", async () => {
      const binanceBalanceAfter = await usdt.balanceOf(BINANCE);
      expect(binanceBalanceAfter).to.equal(binanceBalanceBefore.add(BINANCE_AMOUNT));
    });

    it("check VTreasury USDT balance", async () => {
      const vtreasuryUSDTBalanceAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDTBalanceAfter).to.equal(vtreasuryUSDTBalanceBefore.sub(BINANCE_AMOUNT));
    });
  });
});
