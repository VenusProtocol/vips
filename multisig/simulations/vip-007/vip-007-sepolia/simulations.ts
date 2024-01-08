import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { setMaxStalePeriod } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { vip007 } from "../../../proposals/vip-007/vip-007-sepolia";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import RESILIENT_ORACLE_ABI from "./abis/ResilientOracle.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";

const PRIME_LIQUIDITY_PROVIDER = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
const PRIME = "0x27A8ca2aFa10B9Bc1E57FC4Ca610d9020Aab3739";
const USER = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const RESILIENT_ORACLE = "0x8000eca36201dddf5805Aa4BeFD73d1EB4D23264";

interface vTokenConfig {
  name: string;
  assetAddress: string;
  marketAddress: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    assetAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    marketAddress: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  },
  {
    name: "vUSDT",
    assetAddress: "0x55d398326f99059fF775485246999027B3197955",
    marketAddress: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  },
  {
    name: "vETH",
    assetAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    marketAddress: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  },
  {
    name: "vBTC",
    assetAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    marketAddress: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  },
  {
    name: "vXVS",
    assetAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    marketAddress: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  },
];

forking(5007188, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;

    before(async () => {
      await impersonateAccount(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
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
    let resilientOracle: Contract;

    before(async () => {
      await pretendExecutingVip(vip007());

      await impersonateAccount(USER);
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: USER, value: parseUnits("10") });

      const signer = await ethers.getSigner(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, signer);
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, RESILIENT_ORACLE, signer);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriod(resilientOracle, await ethers.getContractAt(ERC20_ABI, vToken.assetAddress, signer));
      }
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(4);
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
      await expect(prime.claim()).to.be.be.reverted;

      await mine(10000);
      await expect(prime.claim()).to.be.not.be.reverted;
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
