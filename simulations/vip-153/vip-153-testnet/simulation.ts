import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip153Testnet } from "../../../vips/vip-153-testnet";
import PSR_ABI from "./abi/PSR.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const PSR = "0xB46BDd025F8FB78eD5174155F74Cb452DF15d6D4";
const PROXY_ADMIN = "0xce10739590001705F7FF231611ba4A48B2820327";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const VBNBAdmin = "0x7Ef464ac0BE8A0dC1e90185bf92a20e769f3B114";

forking(33969555, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let psr: ethers.Contract;

    before(async () => {
      await impersonateAccount(PROXY_ADMIN);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("config check", async () => {
      expect(await psr.totalDistributions()).to.be.equal(0);
    });

    it("ownership check", async () => {
      expect(await psr.pendingOwner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-153", vip153Testnet());

  describe("Post-VIP behavior", async () => {
    let psr: ethers.Contract;
    let vBNB: ethers.Contract;
    let vBNBAdmin: ethers.Contract;

    before(async () => {
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      vBNBAdmin = new ethers.Contract(VBNBAdmin, vBNBAdmin_ABI, provider);
    });

    it("config check", async () => {
      expect(await psr.totalDistributions()).to.be.equal(4);
    });

    it("ownership check", async () => {
      expect(await psr.pendingOwner()).to.be.equal("0x0000000000000000000000000000000000000000");
      expect(await psr.owner()).to.be.equal(NORMAL_TIMELOCK);
    });

    it("configurations", async () => {
      let config = await psr.distributionTargets(0);
      expect(config.schema).to.be.equal(0);
      expect(config.percentage).to.be.equal(50);
      expect(config.destination).to.be.equal(RISK_FUND);

      config = await psr.distributionTargets(1);
      expect(config.schema).to.be.equal(0);
      expect(config.percentage).to.be.equal(50);
      expect(config.destination).to.be.equal(TREASURY);

      config = await psr.distributionTargets(2);
      expect(config.schema).to.be.equal(1);
      expect(config.percentage).to.be.equal(40);
      expect(config.destination).to.be.equal(RISK_FUND);

      config = await psr.distributionTargets(3);
      expect(config.schema).to.be.equal(1);
      expect(config.percentage).to.be.equal(60);
      expect(config.destination).to.be.equal(TREASURY);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(VBNBAdmin);
    });

    it("validate PSR", async () => {
      expect(await vBNBAdmin.protocolShareReserve()).to.be.equal(PSR);
    });
  });
});
