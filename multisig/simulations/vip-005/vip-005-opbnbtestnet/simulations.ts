import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip005 } from "../../../proposals/vip-005/vip-005-opbnbtestnet";
import TREASURY_ABI from "./abi/treasury.json";

forking(14541763, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, NETWORK_ADDRESSES.opbnbtestnet.VTREASURY);
    await pretendExecutingVip(vip005());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
