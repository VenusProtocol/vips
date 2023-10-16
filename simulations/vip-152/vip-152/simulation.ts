import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip152 } from "../../../vips/vip-152";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RISK_FUND_ABI from "./abi/RiskFund.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const vBNB_ADDRESS = "0xa07c5b74c9b40447a954e1466938b865b6bbea36";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const CORE_POOL_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const RANDOM_ADDRESS = "0x0BAC492386862aD3dF4B666Bc096b0505BB694Da";
const VBNBAdmin_ADDRESS = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

const reserves = {
  "0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5": "113920863202075023885",
  "0xd17479997f34dd9156deef8f95a52d81d265be9c": "392463934353680646351",
  "0x55d398326f99059ff775485246999027b3197955": "373825185381094571409",
  "0x52f24a5e03aee338da5fd9df68d2b6fae1178827": "2896097128072106647",
  "0x965f527d9159dce6288a2219db51fc6eef120dd1": "1871488197629226650316",
  "0x4b0f1812e5df2a09796481ff14017e6005508003": "19595449578386658",
  "0x12bb890508c125661e03b09ec06e404bc9289040": "316724376165504616820380",
  "0xfb5b838b6cfeedc2873ab27866079ac55363d37e": "177082682555785184",
  "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275": "586310324618600173",
  "0xc2e9d07f66a89c44062459a47a0d2dc038e4fb16": "208417030571862242",
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": "593600150889113267",
  "0x352cb5e19b12fc216548a2677bd0fce83bae434b": "1392507212379014539551354602",
  "0xce7de646e7208a4ef112cb6ed5038fa6cc6b12e3": "1833688639",
  "0xaef0d72a118ce24fee3cd1d43d383897d05b4e99": "1412410526598519969216500",
};

forking(32659660, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let vBNB: ethers.Contract;
    let psr: ethers.Contract;
    let riskFund: ethers.Contract;

    before(async () => {
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
      riskFund = new ethers.Contract(RISK_FUND, RISK_FUND_ABI, provider);
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

    it("risk fund reserve", async () => {
      for (const [token, amount] of Object.entries(reserves)) {
        expect(await riskFund.assetsReserves(token)).to.be.equal(amount);
      }
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
    let riskFund: ethers.Contract;

    before(async () => {
      await impersonateAccount(RANDOM_ADDRESS);
      const signer = await ethers.getSigner(RANDOM_ADDRESS);

      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, provider);
      psr = new ethers.Contract(PSR, PSR_ABI, signer);
      vBNBAdmin = new ethers.Contract(VBNBAdmin_ADDRESS, vBNBAdmin_ABI, signer);
      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, provider);
      proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, provider);
      riskFund = new ethers.Contract(RISK_FUND, RISK_FUND_ABI, provider);
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
      expect(config.percentage).to.be.equal(40);
      expect(config.destination).to.be.equal(RISK_FUND);

      config = await psr.distributionTargets(1);
      expect(config.schema).to.be.equal(0);
      expect(config.percentage).to.be.equal(60);
      expect(config.destination).to.be.equal(TREASURY);

      config = await psr.distributionTargets(2);
      expect(config.schema).to.be.equal(1);
      expect(config.percentage).to.be.equal(50);
      expect(config.destination).to.be.equal(RISK_FUND);

      config = await psr.distributionTargets(3);
      expect(config.schema).to.be.equal(1);
      expect(config.percentage).to.be.equal(50);
      expect(config.destination).to.be.equal(TREASURY);
    });

    it("risk fund reserve", async () => {
      for (const [token, amount] of Object.entries(reserves)) {
        expect(await riskFund.assetsReserves(token)).to.be.equal(amount);
      }
    });

    it("reduce reserves", async () => {
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("0"));
      await vBNBAdmin.reduceReserves(ethers.utils.parseEther("1"));
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("1"));
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(PSR)).to.be.equal(ethers.utils.parseEther("0"));
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("993600150889113267");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("1193600150889113267");
      await vBNBAdmin.reduceReserves("100");
      expect(await WBNB.balanceOf(PSR)).to.be.equal(100);
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("993600150889113307");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("1193600150889113327");
    });

    it("validate proxy admin", async () => {
      expect(await proxyAdmin.getProxyAdmin(VBNBAdmin_ADDRESS)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(PSR)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(RISK_FUND)).to.be.equal(PROXY_ADMIN);

      expect(await proxyAdmin.owner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
