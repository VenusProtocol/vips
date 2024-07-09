import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020 from "../../../proposals/opbnbmainnet/vip-020";
import TREASURY_ABI from "./abi/treasury.json";

forking(28761242, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.opbnbmainnet.VTREASURY);
    await pretendExecutingVip(await vip020());
  });

  describe("Post tx checks", () => {
    it("Should set pendingOwner to Normal Timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(NETWORK_ADDRESSES.opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
