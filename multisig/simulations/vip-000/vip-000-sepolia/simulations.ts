import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index.ts";
import { ADDRESSES } from "../../../helpers/config.ts";
import { vip000 } from "../../../proposals/vip-000/vip-000-sepolia.ts";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";

const { sepoliaContracts } = ADDRESSES;

forking(4646931, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(sepoliaContracts.TIMELOCK);
    });
  });
});
