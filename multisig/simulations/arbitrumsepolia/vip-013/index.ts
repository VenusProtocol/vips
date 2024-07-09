import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013 from "../../../proposals/arbitrumsepolia/vip-013";
import TREASURY_ABI from "./abi/treasury.json";

forking(62418214, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.arbitrumsepolia.VTREASURY);
    await pretendExecutingVip(await vip013());
  });

  describe("Post tx checks", () => {
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});
