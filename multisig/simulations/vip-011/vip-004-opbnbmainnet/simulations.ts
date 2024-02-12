import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { TREASURY, WBNB, WBNB_AMOUNT, vip011 } from "../../../proposals/vip-011/vip-011-opbnbmainnet";
import WBNB_ABI from "./abi/ERC20.json";

forking(15988638, () => {
  let wbnb: Contract;
  let prevBal: BigNumber;

  before(async () => {
    wbnb = await ethers.getContractAt(WBNB_ABI, WBNB);
    prevBal = await wbnb.balanceOf(TREASURY);
    console.log(prevBal);

    await pretendExecutingVip(vip011());
  });

  describe("Post tx checks", () => {
    it("Should increase balance of WBNB", async () => {
      const currBal = await wbnb.balanceOf(TREASURY);
      expect(currBal).equals(prevBal.add(WBNB_AMOUNT));
    });
  });
});
