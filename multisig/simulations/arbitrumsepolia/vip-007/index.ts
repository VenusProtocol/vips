import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip007, {
  POOL_REGISTRY,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  XVS,
  XVS_VAULT_PROXY,
} from "../../../proposals/arbitrumsepolia/vip-007";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;
const GENERIC_TEST_USER_ACCOUNT = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const XVS_ADMIN = "0xFdC5cEC63FD167DA46cF006585b30D03B104eFD4";
const XVS_STORE = "0x4e909DA6693215dC630104715c035B159dDb67Dd";

forking(41798687, async () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvs: Contract;

    before(async () => {
      await impersonateAccount(arbitrumsepolia.NORMAL_TIMELOCK);
      await impersonateAccount(XVS_ADMIN);
      await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvs = await ethers.getContractAt(XVS_ABI, XVS, await ethers.getSigner(XVS_ADMIN));

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: arbitrumsepolia.NORMAL_TIMELOCK, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
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
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(await vip007());

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        XVS_VAULT_PROXY,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT));
    });

    it("prime should have correct pool registry address", async () => {
      expect(await prime.poolRegistry()).to.be.equal(POOL_REGISTRY);
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
      before(async () => {
        const xvsMinter = await initMainnetUser(XVS_ADMIN, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(
          arbitrumsepolia.GENERIC_TEST_USER_ACCOUNT,
          ethers.utils.parseEther("1"),
        );

        await xvs.connect(xvsMinter).mint(arbitrumsepolia.GENERIC_TEST_USER_ACCOUNT, parseEther("10"));
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
      });

      checkXVSVault();
    });
  });
});
