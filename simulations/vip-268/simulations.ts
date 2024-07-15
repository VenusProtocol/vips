import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { NORMAL_TIMELOCK, TREASURY, WBNB, WBNB_WITHDRAW_AMOUNT, vBNB, vip268 } from "../../vips/vip-268/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

forking(36789065, async () => {
  let treasuryWBNBBalPrev: BigNumber;
  let timelockVBNBBalPrev: BigNumber;
  let wbnbContract: Contract;
  let vbnbContract: Contract;

  before(async () => {
    wbnbContract = new ethers.Contract(WBNB, IERC20_ABI, ethers.provider);
    treasuryWBNBBalPrev = await wbnbContract.balanceOf(TREASURY);
    vbnbContract = new ethers.Contract(vBNB, VTOKEN_ABI, ethers.provider);
    timelockVBNBBalPrev = await vbnbContract.balanceOf(NORMAL_TIMELOCK);
  });

  testVip("VIP-268", await vip268(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["Mint"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Treasury balance checks", async () => {
      const currWBNBBal = await wbnbContract.balanceOf(TREASURY);
      expect(treasuryWBNBBalPrev.sub(currWBNBBal)).equals(WBNB_WITHDRAW_AMOUNT);

      const currVBNBBal = await vbnbContract.balanceOf(NORMAL_TIMELOCK);
      expect(currVBNBBal).to.gt(timelockVBNBBalPrev);
    });
  });
});
