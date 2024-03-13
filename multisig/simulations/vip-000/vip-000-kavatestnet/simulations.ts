import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip000 } from "../../../proposals/vip-000/vip-000-kavatestnet";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x87123996F4287A10a8627C86E5786E4Cf1962849";

forking(10302190, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.kavatestnet.NORMAL_TIMELOCK);
    });
  });
});
