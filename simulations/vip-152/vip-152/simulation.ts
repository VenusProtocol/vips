import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip152 } from "../../../vips/vip-152";
import PSR_ABI from "./abi/PSR.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const vBNB_ADDRESS = "0xa07c5b74c9b40447a954e1466938b865b6bbea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VBNBAdmin_ADDRESS = "0xBC612ec01bB52349De615112F65A3DA66fb02648";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const PSR = "0x4382Da07e0fFba15CbB3F1013EcD56285542d27f";

forking(32368819, () => {
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
      expect(await psr.totalDistributions()).to.be.equal(0);
    });

    it("ownership check", async () => {
      expect(await psr.pendingOwner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-152", vip152());

  describe("Post-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    let psr: ethers.Contract;
    let vBNBAdmin: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
      vBNBAdmin = new ethers.Contract(VBNBAdmin_ADDRESS, vBNBAdmin_ABI, provider);
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(VBNBAdmin_ADDRESS);
    });

    it("validate PSR", async () => {
      expect(await vBNBAdmin.protocolShareReserve()).to.be.equal(PSR);
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
  });
});
