import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip068, { INITIAL_SUPPLY, eBTC } from "../../../proposals/ethereum/vip-068";
import ERC20_ABI from "./abi/erc20.json";

forking(21135461, async () => {
  let eBTCContract: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      eBTCContract = new ethers.Contract(eBTC, ERC20_ABI, ethers.provider);
      await pretendExecutingVip(await vip068());
    });

    it("check balance", async () => {
      expect(await eBTCContract.balanceOf(NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK)).to.equal(INITIAL_SUPPLY);
      expect(await eBTCContract.balanceOf(NETWORK_ADDRESSES.ethereum.VTREASURY)).to.equal(0);
    });
  });
});
