import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import PSR_ABI from "./abi/PSR.json"
import { vip153Testnet } from "../../../vips/vip-153-testnet";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

const PSR = "0x24b63EA72aFC326deFA526Ed031aedb6a5E0fA4A";


forking(33711562, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let psr: ethers.Contract;

    before(async () => {
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("config check", async () => {
      expect((await psr.totalDistributions())).to.be.equal(0);
    });

    it("ownership check", async () => {
      expect((await psr.pendingOwner())).to.be.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-152", vip153Testnet());

  describe("Post-VIP behavior", async () => {
    let psr: ethers.Contract;

    before(async () => {
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("config check", async () => {
      expect((await psr.totalDistributions())).to.be.equal(1);
    });

    it("ownership check", async () => {
      expect((await psr.pendingOwner())).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
