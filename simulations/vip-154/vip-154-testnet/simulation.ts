import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip154Testnet } from "../../../vips/vip-154-testnet";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/PSR.json";
import vBNB_ABI from "./abi/vBNB.json";
import vBNBAdmin_ABI from "./abi/vBNBAdmin.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const PSR = "0xB46BDd025F8FB78eD5174155F74Cb452DF15d6D4";
const vBNB_ADDRESS = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";
const VBNBAdmin = "0x78459C0a0Fe91d382322D09FF4F86A10dbAF78a4";
const WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
const CORE_POOL_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

forking(34058573, () => {
  describe("Pre-VIP behavior", async () => {
    let WBNB: ethers.Contract;

    before(async () => {
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, signer);
    });

    it("reduce reserves", async () => {
      expect(await WBNB.balanceOf(PSR)).to.be.equal("100000");
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("0");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000000");
    });
  });

  testVip("VIP-154", vip154Testnet());

  describe("Post-VIP behavior", async () => {
    let psr: ethers.Contract;
    let vBNBAdmin: ethers.Contract;
    let WBNB: ethers.Contract;

    before(async () => {
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(NORMAL_TIMELOCK);

      psr = new ethers.Contract(PSR, PSR_ABI, signer);
      vBNB = new ethers.Contract(vBNB_ADDRESS, vBNB_ABI, signer);
      vBNBAdmin = new ethers.Contract(VBNBAdmin, vBNBAdmin_ABI, signer);
      WBNB = new ethers.Contract(WBNB_ADDRESS, ERC20_ABI, signer);
    });

    it("reduce reserves", async () => {
      expect(await WBNB.balanceOf(PSR)).to.be.equal("100000");
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("0");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000000000");
      await vBNBAdmin.reduceReserves("100");
      expect(await WBNB.balanceOf(PSR)).to.be.equal("100100");
      await psr.releaseFunds(CORE_POOL_COMPTROLLER, [WBNB_ADDRESS]);
      expect(await WBNB.balanceOf(RISK_FUND)).to.be.equal("50050");
      expect(await WBNB.balanceOf(TREASURY)).to.be.equal("100000000000050050");
    });
  });
});
