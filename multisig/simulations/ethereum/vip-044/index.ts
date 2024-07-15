import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip044, { BBTC, COMMUNITY_WALLET, PRIME_LIQUIDITY_PROVIDER } from "../../../proposals/ethereum/vip-044";
import ERC20 from "./abi/erc20.json";

forking(20270578, async () => {
  let bbtc: Contract;
  let bbtcBalanceBefore: string;

  before(async () => {
    bbtc = await ethers.getContractAt(ERC20, BBTC);
    bbtcBalanceBefore = await bbtc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip044());
    });

    it("Prime Liquidity Provider should not have any bbtc tokens", async () => {
      expect(await bbtc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.equal("0");
    });

    it("Community Wallet should not receive all bbtc tokens", async () => {
      expect(await bbtc.balanceOf(COMMUNITY_WALLET)).to.equal(bbtcBalanceBefore);
    });
  });
});
