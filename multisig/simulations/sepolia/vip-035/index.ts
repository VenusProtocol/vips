import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip035, { NORMAL_TIMELOCK, TREASURY } from "../../../proposals/sepolia/vip-035";
import TREASURY_ABI from "./abi/treasury.json";

const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

forking(6049863, async () => {
  let treasury: Contract;
  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);
    await setBalance(NORMAL_TIMELOCK, parseUnits("1000", 18));
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY, await ethers.getSigner(NORMAL_TIMELOCK));
  });
  describe("Pre-VIP behaviour", async () => {
    it("check owner", async () => {
      expect(await treasury.owner()).to.be.equal(GUARDIAN);
    });
  });
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip035());
    });
    it("check owner", async () => {
      await treasury.acceptOwnership();
      expect(await treasury.owner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
