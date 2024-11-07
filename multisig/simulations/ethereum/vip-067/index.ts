import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip067, { EIGEN } from "../../../proposals/ethereum/vip-067";
import ERC20_ABI from "./abi/erc20.json";

forking(21135461, async () => {
  let eigenContract: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      eigenContract = new ethers.Contract(EIGEN, ERC20_ABI, ethers.provider);
      await pretendExecutingVip(await vip067());
    });

    it("check balance", async () => {
      expect(await eigenContract.balanceOf(NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK)).to.equal(
        parseUnits("2204.501208", 18),
      );
      expect(await eigenContract.balanceOf(NETWORK_ADDRESSES.ethereum.VTREASURY)).to.equal(0);
    });
  });
});
