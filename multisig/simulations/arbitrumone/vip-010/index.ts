import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010 from "../../../proposals/arbitrumone/vip-010";
import TREASURY_ABI from "./abi/treasury.json";

forking(230335421, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.arbitrumone.VTREASURY);
    await pretendExecutingVip(await vip010());
  });

  describe("Post tx checks", () => {
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
