/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019, { VTREASURY } from "../../../proposals/arbitrumone/vip-019";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(291487747, async () => {
  const provider = ethers.provider;
  let treasury: Contract;

  describe("Post-VIP behavior", () => {
    before(async () => {
      treasury = new ethers.Contract(VTREASURY, VTREASURY_ABI, provider);
      await pretendExecutingVip(await vip019());
    });

    it("check pending owner of VTreasury", async () => {
      expect(await treasury.pendingOwner()).to.be.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
