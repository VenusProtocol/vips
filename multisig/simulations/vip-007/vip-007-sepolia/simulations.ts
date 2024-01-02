import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { setMaxStalePeriodInChainlinkOracle } from "../../../../src/utils";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";
import ERC20_ABI from "./abis/ERC20.json";
import { vip007 } from "../../../proposals/vip-007/vip-007-sepolia";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { parseEther, parseUnits } from "ethers/lib/utils";

const PRIME_LIQUIDITY_PROVIDER = "0xF30312DF854742CAAf9E37D789B0F2617CE15239";
const PRIME = "0x1c4B6D86712639b5d9EFaa938457f7a3dEa0de98";
const CHAINLINK_ORACLE = "0x102F0b714E5d321187A4b6E5993358448f7261cE";
const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";
const USER = "0x4116CA92960dF77756aAAc3aFd91361dB657fbF8";
const XVS_VAULT_PROXY = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";
const XVS = "0xDb633C11D3F9E6B8D17aC2c972C9e3B05DA59bF9";

interface vTokenConfig {
  name: string;
  assetAddress: string;
  feed: string;
  marketAddress: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    assetAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    feed: "0x51597f405303c4377e36123cbc172b13269ea163",
    marketAddress: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
  },
  {
    name: "vUSDT",
    assetAddress: "0x55d398326f99059fF775485246999027B3197955",
    feed: "0xb97ad0e74fa7d920791e90258a6e2085088b4320",
    marketAddress: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
  },
  {
    name: "vETH",
    assetAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    feed: "0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e",
    marketAddress: "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8",
  },
  {
    name: "vBTC",
    assetAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    feed: "0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf",
    marketAddress: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
  },
  {
    name: "vXVS",
    assetAddress: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    feed: "0xbf63f430a79d4036a5900c19818aff1fa710f206",
    marketAddress: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
  },
];

forking(5006494, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;


    before(async () => {
      impersonateAccount(USER);
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
      // checkXVSVault();
    });
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;
    let xvsVault: Contract;
    let xvs: Contract;

    before(async () => {
      await pretendExecutingVip(vip007());

      impersonateAccount(USER);
      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: USER, value: parseUnits("10") });

      const signer = await ethers.getSigner(USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY, signer);
      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, GUARDIAN);
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
    });

    it("claim prime token", async () => {
      await xvs.approve(xvsVault.address, parseUnits("1000", 18));
      await xvsVault.deposit(XVS, 0, parseUnits("1000", 18));
      await expect(prime.claim()).to.be.be.reverted;

      // await mine(10000);
      // console.log(await prime.stakedAt(USER));
      // await prime.callStatic.claim();
    })

    describe("generic tests", async () => {
      // checkXVSVault();
    });
  });
});
