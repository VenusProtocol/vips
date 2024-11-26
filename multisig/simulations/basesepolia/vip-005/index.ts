import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip001 from "../../../proposals/basesepolia/vip-001";
import vip002 from "../../../proposals/basesepolia/vip-002";
import { vip005 } from "../../../proposals/basesepolia/vip-005";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import XVS_ABI from "./abis/XVS.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const XVS_VAULT_PROXY = "0xA0D5C7FD3c498ea0a0FDeBaDe3a83D56DA8E2356";
const PRIME_LIQUIDITY_PROVIDER = "0x48Cbe3cC65ca042a4f0bA23A43bBF5F1F4d47DFa";
const PRIME = "0xCE199d89431E63B262D6dbe398C6653117028A88";
const XVS = "0xE657EDb5579B82135a274E85187927C42E38C021";
const GUARDIAN = "0xdf3b635d2b535f906BB02abb22AED71346E36a00";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";
const XVS_ADMIN = "0xD5Cd1fD17B724a391C1bce55Eb9d88E3205eED60";

const basesepolia = NETWORK_ADDRESSES.basesepolia;

forking(18426741, async () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(await vip001());
      await pretendExecutingVip(await vip002());

      await impersonateAccount(GUARDIAN);
      await impersonateAccount(XVS_ADMIN);
      await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, await ethers.getSigner(GUARDIAN));
      xvs = await ethers.getContractAt(XVS_ABI, XVS, await ethers.getSigner(XVS_ADMIN));

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: GUARDIAN, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
      await xvs.mint(GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
      await xvs.mint(basesepolia.GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
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

    it("xvs vault is paused", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(true);
    });
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(await vip005());

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

    it("xvs vault is resumed", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
