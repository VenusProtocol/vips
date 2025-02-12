import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000 from "../../../proposals/unichainmainnet/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(8428680, async () => {
  let treasury: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      treasury = await ethers.getContractAt(TREASURY_ABI, unichainmainnet.VTREASURY);
    });

    it("correct pending owner", async () => {
      expect(await treasury.pendingOwner()).to.equal(unichainmainnet.GUARDIAN);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip000());
    });

    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(unichainmainnet.GUARDIAN);
    });
  });
});
