import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { TREASURY, VTOKEN_AMOUNT, WBNB, WBNB_WITHDRAW_AMOUNT, vBNB, vip268 } from "../../vips/vip-268/bscmainnet";
import IERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTreasurey_ABI from "./abi/VTreasury.json";

const EXCHANGE_RATE_AFTER_MINT = parseUnits("239107672.531201498829432328", "18");

forking(36789065, () => {
  let treasuryWBNBBalPrev: BigNumber;
  let treasuryVBNBBalPrev: BigNumber;
  let wbnbContract: ethers.Contract;
  let vbnbContract: ethers.Contract;

  before(async () => {
    wbnbContract = new ethers.Contract(WBNB, IERC20_ABI, ethers.provider);
    treasuryWBNBBalPrev = await wbnbContract.balanceOf(TREASURY);
    vbnbContract = new ethers.Contract(vBNB, VTOKEN_ABI, ethers.provider);
    treasuryVBNBBalPrev = await vbnbContract.balanceOf(TREASURY);
  });

  testVip("VIP-268", vip268(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTreasurey_ABI], ["WithdrawTreasuryBEP20"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["Mint"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Treasury balance checks", async () => {
      const currWBNBBal = await wbnbContract.balanceOf(TREASURY);
      expect(treasuryWBNBBalPrev.sub(currWBNBBal)).equals(WBNB_WITHDRAW_AMOUNT);

      const currVBNBBal = await vbnbContract.balanceOf(TREASURY);
      expect(currVBNBBal.sub(treasuryVBNBBalPrev)).equals(VTOKEN_AMOUNT);

      const exchangeRate = await vbnbContract.exchangeRateStored();
      expect(exchangeRate).equals(EXCHANGE_RATE_AFTER_MINT);

      const vTokenBalance = exchangeRate.mul(VTOKEN_AMOUNT).div(BigNumber.from(10).pow(18));
      expect(vTokenBalance).be.closeTo(WBNB_WITHDRAW_AMOUNT, parseUnits("0.0000000001", 18));
    });
  });
});
