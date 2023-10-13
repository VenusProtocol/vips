import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";
import { vip153Testnet } from "../../../vips/vip-153";

const VBNBAdmin_ADDRESS = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const PSR = "0xF1d8bcED87d5e077e662160490797cd2B5494d4A";

forking(34165973, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let psr: ethers.Contract;

    before(async () => {
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("config check", async () => {
      expect(await psr.totalDistributions()).to.be.equal(4);
    });

    it("max percent", async () => {
      await expect(psr.MAX_PERCENT()).to.be.reverted
    });
  });

  testVip("VIP-153", vip153Testnet(), {
    callbackAfterExecution: async txResponse => {
    },
  });

  describe("Post-VIP behavior", async () => {
    let psr: ethers.Contract;

    before(async () => {
      await impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

      psr = new ethers.Contract(PSR, PSR_ABI, signer);
    });

    it("config check", async () => {
      expect(await psr.totalDistributions()).to.be.equal(4);
    });

    it("max percent", async () => {
      expect(await psr.MAX_PERCENT()).to.be.equal(100)
    });
  });
});
