import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip260, BINANCE_WALLET, TUSDOLD } from "../../vips/vip-260/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36351188, () => {
  let tusdold: ethers.Contract;
  let prevBalanceBinance: BigNumber;

  before(async () => {
    tusdold = new ethers.Contract(TUSDOLD, IERC20_ABI, ethers.provider);
    prevBalanceBinance = await tusdold.balanceOf(BINANCE_WALLET);
  });

  testVip("VIP-260", vip260(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balances of Pessimistic receiver", async () => {
      const currentBalance = await tusdold.balanceOf(BINANCE_WALLET);
      const delta = currentBalance.sub(prevBalanceBinance);
      expect(delta).equals(parseUnits("105000", 18));
    });
  });
});
