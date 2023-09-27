import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import vBNB_ABI from "./abi/vBNB.json"
import PSR_ABI from "./abi/PSR.json"
import { vip152 } from "../../../vips/vip-152";

const vBNB_ADDRESS = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VBNBAdmin_ADDRESS = "0x027a815a6825eE98F3dFe57e10B7f354038DEa67"
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const PSR = "0xd405300699D91ED1D87544a3237713fAe642EE95";

forking(32114884, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    let psr: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(NORMAL_TIMELOCK);
    });

    it("config check", async () => {
      expect((await psr.totalDistributions())).to.be.equal(0);
    });

    it("ownership check", async () => {
      expect((await psr.pendingOwner())).to.be.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-152", vip152());

  describe("Post-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    let psr: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(VBNBAdmin_ADDRESS);
    });

    it("config check", async () => {
      expect((await psr.totalDistributions())).to.be.equal(4);
    });

    it("ownership check", async () => {
      expect((await psr.pendingOwner())).to.be.equal("0x0000000000000000000000000000000000000000");
      expect((await psr.owner())).to.be.equal(NORMAL_TIMELOCK);
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
  });
});
