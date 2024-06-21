import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000 from "../../../proposals/ethereum/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0xfd9b071168bc27dbe16406ec3aba050ce8eb22fa";

forking(18527497, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.ethereum.NORMAL_TIMELOCK);
    });
  });
});
