import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip010 from "../../../proposals/unichainmainnet/vip-010";
import TREASURY_ABI from "./abi/treasury.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(10406551, async () => {
  let treasury: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      treasury = await ethers.getContractAt(TREASURY_ABI, unichainmainnet.VTREASURY);
    });

    it("correct pending owner", async () => {
      expect(await treasury.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it("Should set pendingOwner to normal timelock", async () => {
      const pendingOwner = await treasury.pendingOwner();
      expect(pendingOwner).equals(unichainmainnet.NORMAL_TIMELOCK);
    });
  });
});
