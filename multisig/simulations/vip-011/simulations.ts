import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip011 } from "../../proposals/vip-011/vip-011-opbnbtestnet";
import ACM_ABI from "./abis/ACM.json";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import XVS_ABI from "./abis/XVS.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const GUARDIAN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const XVS_ADMIN = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";

forking(22879768, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvs: Contract;
    let acm: Contract;

    before(async () => {
      await impersonateAccount(GUARDIAN);
      await impersonateAccount(XVS_ADMIN);
      await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvs = await ethers.getContractAt(XVS_ABI, XVS, await ethers.getSigner(XVS_ADMIN));
      acm = await ethers.getContractAt(ACM_ABI, ACM, await ethers.getSigner(GUARDIAN));
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: GUARDIAN, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("1") });
      await xvs.setMintCap(XVS_ADMIN, parseUnits("1000", 18));
      await acm.giveCallPermission(XVS, "mint(address,uint256)", XVS_ADMIN);
      await xvs.mint(GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(0);
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("claim prime token", async () => {
      await expect(prime.claim()).to.be.reverted;
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(vip011());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        XVS_VAULT_PROXY,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT));
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
      expect(await primeLiquidityProvider.paused()).to.be.equal(true);
    });

    it("stake XVS", async () => {
      let stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);

      await xvs.approve(xvsVault.address, parseUnits("1000", 18));
      await xvsVault.deposit(XVS, 0, parseUnits("1000", 18));
      await expect(prime.claim()).to.be.be.reverted;

      stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
