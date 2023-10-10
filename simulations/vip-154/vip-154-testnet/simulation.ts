import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip154Testnet } from "../../../vips/vip-154-testnet";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
const CORE_POOL_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const PSR = "0x9B34c7aDCEa239b83Ef364627071Be7665bcb2E9";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const VBNBAdmin = "0x78459C0a0Fe91d382322D09FF4F86A10dbAF78a4";

forking(34082979, () => {
  describe("Pre-VIP behavior", async () => {
    let WBNB: ethers.Contract;

    before(async () => {
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, signer);
    });

    it("WBNB balances", async () => {
      expect(await WBNB.balanceOf(PSR)).to.be.equal("0");
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("0");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000000");
    });
  });

  testVip("VIP-154", vip154Testnet());

  describe("Post-VIP behavior", async () => {
    let psr: ethers.Contract;
    let vBNBAdmin: ethers.Contract;
    let WBNB: ethers.Contract;
    let vBNB: ethers.Contract;
    let proxyAdmin: ethers.Contract;

    before(async () => {
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

      psr = new ethers.Contract(PSR, PSR_ABI, signer);
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, signer);
      vBNBAdmin = new ethers.Contract(VBNBAdmin, vBNBAdmin_ABI, signer);
      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, signer);
      proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, signer);
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
      expect(await WBNB.balanceOf(PSR)).to.be.equal("0");
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("0");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000000");
      await vBNBAdmin.reduceReserves("100");
      expect(await WBNB.balanceOf(PSR)).to.be.equal("100");
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("50");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000050");
    });

    it("validate admin", async () => {
      expect(await vBNB.admin()).to.be.equal(VBNBAdmin);
    });

    it("validate PSR", async () => {
      expect(await vBNBAdmin.protocolShareReserve()).to.be.equal(PSR);
    });

    it("validate proxy admin", async () => {
      expect(await proxyAdmin.getProxyAdmin(VBNBAdmin)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(PSR)).to.be.equal(PROXY_ADMIN);
      expect(await proxyAdmin.getProxyAdmin(RISK_FUND)).to.be.equal(PROXY_ADMIN);

      expect(await proxyAdmin.owner()).to.be.equal(NORMAL_TIMELOCK);
    })
  });
});
