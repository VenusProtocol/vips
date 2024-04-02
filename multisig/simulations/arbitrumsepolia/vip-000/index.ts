import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip000 } from "../../../proposals/arbitrumsepolia/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x4e7ab1fD841E1387Df4c91813Ae03819C33D5bdB";

forking(25777800, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});
