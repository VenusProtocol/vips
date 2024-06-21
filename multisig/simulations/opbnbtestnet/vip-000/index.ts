import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip000 from "../../../proposals/opbnbtestnet/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const VTREASURY = "0x3370915301E8a6A6baAe6f461af703e2498409F3";

forking(14541763, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, VTREASURY);
    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
