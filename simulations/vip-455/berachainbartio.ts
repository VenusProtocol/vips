import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip452 from "../../vips/vip-452/bsctestnet";
import vip453 from "../../vips/vip-453/bsctestnet";
import vip454 from "../../vips/vip-454/bsctestnet";
import vip455, { COMPTROLLER_CORE, PRIME, PRIME_LIQUIDITY_PROVIDER } from "../../vips/vip-455/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { berachainbartio } = NETWORK_ADDRESSES;

const XVS_ADMIN = "0x95676A9Ec0d7c11f207Bc180350Bd53bfed31a59";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";

forking(10959187, async () => {
  let prime: Contract;
  let primeLiquidityProvider: Contract;
  let xvsVault: Contract;
  let xvs: Contract;

  testForkedNetworkVipCommands("vip452 configures bridge", await vip452());
  testForkedNetworkVipCommands("vip453 configures bridge", await vip453());
  testForkedNetworkVipCommands("vip454 configures bridge", await vip454());

  before(async () => {
    await impersonateAccount(berachainbartio.NORMAL_TIMELOCK);
    await impersonateAccount(XVS_ADMIN);
    await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

    prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    xvsVault = await ethers.getContractAt(
      XVS_VAULT_ABI,
      berachainbartio.XVS_VAULT_PROXY,
      await ethers.getSigner(berachainbartio.NORMAL_TIMELOCK),
    );
    xvs = await ethers.getContractAt(XVS_ABI, berachainbartio.XVS, await ethers.getSigner(XVS_ADMIN));
  });

  describe("Post-VIP behaviour", async () => {
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

  testForkedNetworkVipCommands("vip455 configures bridge", await vip455());

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: berachainbartio.NORMAL_TIMELOCK, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
      await xvs.mint(GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
      await xvs.mint(berachainbartio.GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        berachainbartio.XVS_VAULT_PROXY,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(
        ERC20_ABI,
        berachainbartio.XVS,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
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
      await xvsVault.deposit(berachainbartio.XVS, 0, parseUnits("1000", 18));
      await expect(prime.claim()).to.be.be.reverted;

      stakedAt = await prime.stakedAt(GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });

    it("xvs vault is resumed", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("prime in comptroller", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      expect(await comptroller.prime()).to.be.equal(PRIME);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
