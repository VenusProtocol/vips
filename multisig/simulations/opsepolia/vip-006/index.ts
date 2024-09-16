import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip006 from "../../../proposals/opsepolia/vip-006";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const { opsepolia } = NETWORK_ADDRESSES;

const PRIME_LIQUIDITY_PROVIDER = "0xE3EC955b94D197a8e4081844F3f25F81047A9AF5";
const PRIME = "0x54dEb59698c628be5EEd5AD41Fd825Eb3Be89704";
const XVS_ADMIN = "0x79a36dc9a43D05Db4747c59c02F48ed500e47dF1";
const COMPTROLLER_CORE = "0x59d10988974223B042767aaBFb6D926863069535";
const XVS_STORE = "0xE888FA54b32BfaD3cE0e3C7D566EFe809a6A0143";

forking(17338837, async () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await impersonateAccount(opsepolia.GUARDIAN);
      await impersonateAccount(XVS_ADMIN);
      await impersonateAccount(opsepolia.GENERIC_TEST_USER_ACCOUNT);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        opsepolia.XVS_VAULT_PROXY,
        await ethers.getSigner(opsepolia.GUARDIAN),
      );
      xvs = await ethers.getContractAt(XVS_ABI, opsepolia.XVS, await ethers.getSigner(XVS_ADMIN));

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: opsepolia.GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: opsepolia.GUARDIAN, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
      await xvs.mint(opsepolia.GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
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
      await pretendExecutingVip(await vip006());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        opsepolia.XVS_VAULT_PROXY,
        await ethers.getSigner(opsepolia.GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(
        ERC20_ABI,
        opsepolia.XVS,
        await ethers.getSigner(opsepolia.GENERIC_TEST_USER_ACCOUNT),
      );
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
      expect(await primeLiquidityProvider.paused()).to.be.equal(true);
    });

    it("set PRIME for Comptroller", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
      expect(await comptroller.prime()).to.be.equal(PRIME);
    });

    it("stake opsepolia.XVS", async () => {
      let stakedAt = await prime.stakedAt(opsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.equal(0);

      await xvs.approve(xvsVault.address, parseUnits("1000", 18));
      await xvsVault.deposit(opsepolia.XVS, 0, parseUnits("1000", 18));
      await expect(prime.claim()).to.be.be.reverted;

      stakedAt = await prime.stakedAt(opsepolia.GENERIC_TEST_USER_ACCOUNT);
      expect(stakedAt).to.be.gt(0);
    });
  });

  // Need to test the generic tests
  describe("generic tests", async () => {
    before(async () => {
      const xvsMinter = await initMainnetUser(XVS_ADMIN, ethers.utils.parseEther("1"));
      const xvsHolder = await initMainnetUser(opsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("10"));
      const xvs = await ethers.getContractAt(ERC20_ABI, opsepolia.XVS, xvsHolder);

      await xvs.connect(xvsMinter).mint(opsepolia.GENERIC_TEST_USER_ACCOUNT, parseEther("10"));
      await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
    });

    checkXVSVault();
  });
});
