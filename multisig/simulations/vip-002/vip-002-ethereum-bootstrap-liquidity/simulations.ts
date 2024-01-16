import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip002 } from "../../../proposals/vip-002/vip-002-ethereum-bootstrap-liquidity";
import ERC20_ABI from "./abis/ERC20.json";

const VTREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const BBTC = "0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541";

const BBTC_AMOUNT = "30000000";

forking(19020650, () => {
  let bbtc: ethers.Contract;
  let oldBBTCBal: BigNumber;
  let oldBBTCBalTreasury: BigNumber;

  before(async () => {
    bbtc = new ethers.Contract(BBTC, ERC20_ABI, ethers.provider);
    oldBBTCBal = await bbtc.balanceOf(COMMUNITY_WALLET);
    oldBBTCBalTreasury = await bbtc.balanceOf(VTREASURY);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip002());
    });

    it("Should transfer BBTC", async () => {
      const currBBTCBal = await bbtc.balanceOf(COMMUNITY_WALLET);
      expect(currBBTCBal.sub(oldBBTCBal)).equals(BBTC_AMOUNT);
      const currBBTCBalTreasury = await bbtc.balanceOf(VTREASURY);
      expect(currBBTCBalTreasury.add(BBTC_AMOUNT)).equals(oldBBTCBalTreasury);
    });
  });
});
