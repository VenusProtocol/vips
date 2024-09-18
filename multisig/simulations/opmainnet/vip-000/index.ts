import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000 from "../../../proposals/opmainnet/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da";

forking(125518550, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.opmainnet.GUARDIAN);
    });
  });
});
