import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip459 from "../../vips/vip-459/bsctestnet";
import vip460 from "../../vips/vip-460/bsctestnet";
import vip461, { COMPTROLLER_CORE, PRIME, PRIME_LIQUIDITY_PROVIDER } from "../../vips/vip-461/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { berachainbepolia } = NETWORK_ADDRESSES;

const XVS_ADMIN = "0x723b7CB226d86bd89638ec77936463453a46C656";
const GENERIC_TEST_USER_ACCOUNT = "0x2DDd1c54B7d32C773484D23ad8CB4F0251d330Fc";

forking(5698279, async () => {
  let prime: Contract;
  let primeLiquidityProvider: Contract;
  let xvsVault: Contract;
  let xvs: Contract;

  testForkedNetworkVipCommands("vip459", await vip459());
  testForkedNetworkVipCommands("vip460", await vip460());

  before(async () => {
    await impersonateAccount(berachainbepolia.NORMAL_TIMELOCK);
    await impersonateAccount(XVS_ADMIN);
    await impersonateAccount(GENERIC_TEST_USER_ACCOUNT);

    prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    xvsVault = await ethers.getContractAt(
      XVS_VAULT_ABI,
      berachainbepolia.XVS_VAULT_PROXY,
      await ethers.getSigner(berachainbepolia.NORMAL_TIMELOCK),
    );
    xvs = await ethers.getContractAt(XVS_ABI, berachainbepolia.XVS, await ethers.getSigner(XVS_ADMIN));
  });

  describe("Pre-VIP behaviour", async () => {
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

  testForkedNetworkVipCommands("vip461", await vip461());

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: GENERIC_TEST_USER_ACCOUNT, value: parseUnits("1") });
      await accounts[0].sendTransaction({ to: berachainbepolia.NORMAL_TIMELOCK, value: parseUnits("1") });

      await network.provider.send("hardhat_setCode", [XVS_ADMIN, "0x"]);

      await accounts[0].sendTransaction({ to: XVS_ADMIN, value: parseUnits("4") });
      await xvs.mint(GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));
      await xvs.mint(berachainbepolia.GENERIC_TEST_USER_ACCOUNT, parseUnits("1000", 18));

      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(
        XVS_VAULT_ABI,
        berachainbepolia.XVS_VAULT_PROXY,
        await ethers.getSigner(GENERIC_TEST_USER_ACCOUNT),
      );
      xvs = await ethers.getContractAt(
        ERC20_ABI,
        berachainbepolia.XVS,
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
      await xvsVault.deposit(berachainbepolia.XVS, 0, parseUnits("1000", 18));
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
