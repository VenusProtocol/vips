import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip189Testnet } from "../../../vips/vip-189/vip-189-testnet";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const VBNBAdmin_ADDRESS = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const CORE_POOL_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const PSR = "0xF1d8bcED87d5e077e662160490797cd2B5494d4A";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(34112000, () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    let vBNB: Contract;
    let psr: Contract;

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

  testVip("VIP-189", vip189Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigAdded"], [4]);
      await expectEvents(txResponse, [PSR_ABI], ["PoolRegistryUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let vBNB: Contract;
    let psr: Contract;
    let vBNBAdmin: Contract;
    let WBNB: Contract;
    let proxyAdmin: Contract;

    before(async () => {
      await impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

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
      await vBNBAdmin.reduceReserves(100);
      expect(await WBNB.balanceOf(PSR)).to.be.equal(100);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("0");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000000");
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(PSR)).to.be.equal(0);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("50");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000050");
    });

    it("validate proxy admin", async () => {
      expect(await proxyAdmin.getProxyAdmin(VBNBAdmin_ADDRESS)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(PSR)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(RISK_FUND)).to.be.equal(PROXY_ADMIN);

      expect(await proxyAdmin.owner()).to.be.equal(NORMAL_TIMELOCK);
    });
  });
});
