/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip017, {VTREASURY} from "../../../proposals/zksyncmainnet/vip-017";

import VTREASURY_ABI from "./abi/VTreasury.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(52786809, async () => {
  const provider = ethers.provider;
  let treasury: Contract;

  describe("Post-VIP behavior", () => {
    before(async () => {
      treasury = new ethers.Contract(VTREASURY, VTREASURY_ABI, provider);
      await pretendExecutingVip(await vip017());
    });

    it("check pending owner of VTreasury", async () => {
      expect(await treasury.pendingOwner()).to.be.equal(zksyncmainnet.NORMAL_TIMELOCK);
    })
  });
});
