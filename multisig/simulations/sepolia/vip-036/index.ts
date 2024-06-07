import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip036, { NORMAL_TIMELOCK, TREASURY } from "../../../proposals/sepolia/vip-036";
import TREASURY_ABI from "./abi/treasury.json";

const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

forking(6049863, async () => {
  let treasury: Contract;
  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check owner", async () => {
      expect(await treasury.owner()).to.be.equal(GUARDIAN);
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip036());
    });
    it("check owner", async () => {
      expect(await treasury.owner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
