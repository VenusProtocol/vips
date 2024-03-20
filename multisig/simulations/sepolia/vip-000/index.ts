import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_CONFIG } from "../../../../src/networkConfig";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000 from "../../../proposals/sepolia/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

forking(4646931, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_CONFIG.sepolia.NORMAL_TIMELOCK);
    });
  });
});
