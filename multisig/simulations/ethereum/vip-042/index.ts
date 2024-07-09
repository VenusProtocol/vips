import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip042 from "../../../proposals/ethereum/vip-042";
import TREASURY_ABI from "./abi/treasury.json";

forking(20267718, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.ethereum.VTREASURY);
    await pretendExecutingVip(await vip042());
  });

  describe("Post tx checks", () => {
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK);
    });
  });
});
