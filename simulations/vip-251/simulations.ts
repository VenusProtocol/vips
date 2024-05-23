import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip216 } from "../../vips/vip-216";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DESTINATION_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";

const WITDRAW_AMOUNT = "125281198522370512074148";

forking(34286000, () => {
  let busd: Contract;
  let prevBalance: any;

  before(async () => {
    busd = new ethers.Contract(BUSD, IERC20_ABI, ethers.provider);
    prevBalance = await busd.balanceOf(DESTINATION_ADDRESS);
  });

  testVip("VIP-216", vip216(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should increase balance of the destination wallet", async () => {
      const currentBalance = await busd.balanceOf(DESTINATION_ADDRESS);
      const delta = currentBalance.sub(prevBalance);
      expect(delta).equals(WITDRAW_AMOUNT);
    });
  });
});
