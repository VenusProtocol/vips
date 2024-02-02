import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

import { setMaxStalePeriod } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { vip007 } from "../../../proposals/vip-007/vip-007-ethereum";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import RESILIENT_ORACLE_ABI from "./abis/ResilientOracle.json";
import XVS_ABI from "./abis/XVS.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const PRIME_LIQUIDITY_PROVIDER = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const GUARDIAN = "0x285960C5B22fD66A736C7136967A3eB15e93CC67";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const XVS_ADMIN = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(19140554, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await impersonateAccount(GUARDIAN);
      await impersonateAccount(XVS_ADMIN);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, await ethers.getSigner(GUARDIAN));
      xvs = await ethers.getContractAt(XVS_ABI, XVS, await ethers.getSigner(XVS_ADMIN));

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: GUARDIAN, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [
        XVS_ADMIN,
        "0x",
      ]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("1") });
      await xvsVault.resume();
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
      await pretendExecutingVip(vip007());

      // await impersonateAccount(USER);
      // const accounts = await ethers.getSigners();
      // await accounts[0].sendTransaction({ to: USER, value: parseUnits("10") });

      // const signer = await ethers.getSigner(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY);
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT));
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
      expect(await primeLiquidityProvider.paused()).to.be.equal(true);
    });

    it("claim prime token", async () => {
      await xvs.approve(xvsVault.address, parseUnits("1000", 18));
      // await xvsVault.deposit(XVS, 0, parseUnits("1000", 18));
      // await expect(prime.claim()).to.be.be.reverted;

      // let stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      // expect(stakedAt).to.be.equal(0);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
