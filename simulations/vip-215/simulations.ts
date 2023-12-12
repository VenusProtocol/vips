import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip215 } from "../../vips/vip-215";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DESTINATION_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";

const WITDRAW_AMOUNT = "125281198522370512074148";

forking(34286000, () => {
  let busd: ethers.Contract;
  let prevBalance: any;

  before(async () => {
    busd = new ethers.Contract(BUSD, IERC20_ABI, ethers.provider);
    prevBalance = await busd.balanceOf(DESTINATION_ADDRESS);
  });

  testVip("VIP-215", vip215(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balance of Community wallet", async () => {
      const currentBalance = await busd.balanceOf(DESTINATION_ADDRESS);
      const delta = currentBalance.sub(prevBalance);
      expect(delta).equals(WITDRAW_AMOUNT);
    });
  });
});
