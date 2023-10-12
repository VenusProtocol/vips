import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip152 } from "../../../vips/vip-152";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const vBNB_ADDRESS = "0xa07c5b74c9b40447a954e1466938b865b6bbea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const VBNBAdmin_ADDRESS = "0x1b73Be3D91d3E32AE617234C0118f47eA1d44Ed1";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const PSR = "0x09272ee826C5293bde7dA3C6767176994653E94C";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const CORE_POOL_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const RANDOM_ADDRESS = "0x0BAC492386862aD3dF4B666Bc096b0505BB694Da"

forking(32512704, () => {
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

  testVip("VIP-152", vip152(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigAdded"], [4]);
      await expectEvents(txResponse, [PSR_ABI], ["PoolRegistryUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    let psr: ethers.Contract;
    let vBNBAdmin: ethers.Contract;
    let WBNB: ethers.Contract;
    let proxyAdmin: ethers.Contract;

    before(async () => {
      await impersonateAccount(RANDOM_ADDRESS);
      const signer = await ethers.getSigner(RANDOM_ADDRESS);

      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, signer);
      vBNBAdmin = new ethers.Contract(VBNBAdmin_ADDRESS, vBNBAdmin_ABI, signer);
      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, provider);
      proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
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

    it("reduce reserves", async () => {
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("0"));
      await vBNBAdmin.reduceReserves(ethers.utils.parseEther("1"));
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("1"));
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("1093600150889113267");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("1093600150889113267");
      await vBNBAdmin.reduceReserves("100");
      expect(await WBNB.balanceOf(PSR)).to.be.equal(100);
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("1093600150889113317");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("1093600150889113317");
    });

    it("validate proxy admin", async () => {
      expect(await proxyAdmin.getProxyAdmin(VBNBAdmin_ADDRESS)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(PSR)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(RISK_FUND)).to.be.equal(PROXY_ADMIN);

      expect(await proxyAdmin.owner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
