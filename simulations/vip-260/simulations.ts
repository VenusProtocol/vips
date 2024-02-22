import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_WALLET, USDC, vip260 } from "../../vips/vip-260/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36351188, () => {
  let usdc: ethers.Contract;
  let prevBalanceBinance: BigNumber;

  before(async () => {
    usdc = new ethers.Contract(USDC, IERC20_ABI, ethers.provider);
    prevBalanceBinance = await usdc.balanceOf(BINANCE_WALLET);
  });

  testVip("VIP-260", vip260(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Binance wallet", async () => {
      const currentBalance = await usdc.balanceOf(BINANCE_WALLET);
      const delta = currentBalance.sub(prevBalanceBinance);
      expect(delta).equals(parseUnits("105000", 18));
    });
  });
});
