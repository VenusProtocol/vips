import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip152Testnet } from "../../../vips/vip-152-testnet";
import vBNB_ABI from "./abi/vBNB.json";

const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const VBNBAdmin_ADDRESS = "0x7575D142AAb97229e5928f94c03da39b34Bb0E96";
const CURRENT_ADMIN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(32356229, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let vBNB: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(CURRENT_ADMIN);
    });
  });

  testVip("VIP-152", vip152Testnet());

  describe("Post-VIP behavior", async () => {
    let vBNB: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(VBNBAdmin_ADDRESS);
    });
  });
});
