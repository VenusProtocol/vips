import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriod } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { vip016 } from "../../../proposals/vip-016/vip-016-sepolia";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import RESILIENT_ORACLE_ABI from "./abis/ResilientOracle.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const PRIME_LIQUIDITY_PROVIDER = "0x15242a55Ad1842A1aEa09c59cf8366bD2f3CE9B4";
const PRIME = "0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC";
const USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const RESILIENT_ORACLE = "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264";

forking(5533300, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let resilientOracle: Contract;

    before(async () => {
      await impersonateAccount(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE);

      setMaxStalePeriod(resilientOracle, "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9");
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
      await pretendExecutingVip(vip016());

      await impersonateAccount(USER);
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: USER, value: parseUnits("10") });

      const signer = await ethers.getSigner(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, signer);
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(0);
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
      await xvsVault.deposit(XVS, 0, parseUnits("1000", 18));

      await mine(10000);
      await expect(prime.claim()).to.be.reverted;
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
