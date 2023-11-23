import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip210 } from "../../../vips/vip-210/vip-210";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import { vip206 } from "../../../vips/vip-206/vip-206";
import PRIME_PROXY_ABI from "./abis/PrimeProxy.json";

const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const STAKED_USER = "0x07cf6eb791b038ecc157a81738b865154579c911";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const OLD_PRIME_IMPL = "0xc86f1aA3cBe1F76F3335a66Db7F490e343CbeF50";
const NEW_PRIME_IMPL = "0x371c0355CC22Ea13404F2fEAc989435DAD9b9d03";
const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";

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

forking(33745732, () => {
  testVip("VIP-206 Prime Program", vip206(), {});

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;
    let primeProxy: Contract;

    before(async () => {
      await impersonateAccount(DEFAULT_PROXY_ADMIN);
      const signer = await ethers.getSigner(DEFAULT_PROXY_ADMIN);

      primeProxy = await ethers.getContractAt(PRIME_PROXY_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(true);
    });

    it("check implementation", async () => {
      const primeImplementation = await primeProxy.callStatic.implementation();
      expect(primeImplementation).to.be.equal(OLD_PRIME_IMPL);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });

  testVip("VIP-210 Prime Program", vip210(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["Unpaused"], [2]);
      await expectEvents(txResponse, [PRIME_PROXY_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;
    let eth: Contract;
    let primeProxy: Contract;

    before(async () => {
      impersonateAccount(STAKED_USER);
      await impersonateAccount(DEFAULT_PROXY_ADMIN);
      const signer = await ethers.getSigner(STAKED_USER);

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      eth = await ethers.getContractAt(ERC20_ABI, ETH);
      primeProxy = await ethers.getContractAt(PRIME_PROXY_ABI, PRIME,await ethers.getSigner(DEFAULT_PROXY_ADMIN));

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, NORMAL_TIMELOCK);
      }
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(false);
    });

    it("rewards", async () => {
      expect(await eth.balanceOf(STAKED_USER)).to.be.equal("0");
      await prime["claimInterest(address)"](vETH);
      expect(await eth.balanceOf(STAKED_USER)).to.be.equal("64026707272536800");
    });

    it("check implementation", async () => {
      const primeImplementation = await primeProxy.callStatic.implementation();
      expect(primeImplementation).to.be.equal(NEW_PRIME_IMPL);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });
});
