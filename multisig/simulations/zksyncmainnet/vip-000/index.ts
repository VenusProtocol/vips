import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip000, { TREASURY } from "../../../proposals/zksyncmainnet/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

forking(42304756, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);

    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.zksyncmainnet.GUARDIAN);
    });
  });
});
