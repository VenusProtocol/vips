import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip201 } from "../../../vips/vip-201/vip-201";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import SETTER_FACET_ABI from "./abis/SetterFacet.json";
import XVS_VAULT_ABI from "./abis/XVSVault.json";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";

const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";
const STAKED_USER = "0x2e7a15e186cc81f7efc4bf7df12dbd5e3db4fefb";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

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

forking(33490463, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;

    before(async () => {
      impersonateAccount(STAKED_USER);
      const signer = await ethers.getSigner(STAKED_USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
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
  });

  testVip("VIP-201 Prime Program", vip201(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewPrimeToken"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["PrimeTokenUpdated"], [1]);
      await expectEvents(txResponse, [PRIME_ABI], ["MarketAdded"], [4]);
      await expectEvents(txResponse, [PRIME_ABI], ["MintLimitsUpdated"], [1]);
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["Paused"], [1]);
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["NewPrimeToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider: Contract;

    before(async () => {
      impersonateAccount(STAKED_USER);
      const signer = await ethers.getSigner(STAKED_USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);

      for (let i = 0; i < vTokens.length; i++) {
        const vToken = vTokens[i];
        await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, vToken.assetAddress, vToken.feed, NORMAL_TIMELOCK);
      }
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(4);
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });

    it("claim prime token", async () => {
      await expect(prime.claim()).to.be.not.be.reverted;

      await mine(100);
      let interestAccrued = await prime.callStatic.getInterestAccrued(vTokens[0].marketAddress, STAKED_USER);
      expect(interestAccrued).to.be.equal(0);

      interestAccrued = await prime.callStatic.getInterestAccrued(vTokens[1].marketAddress, STAKED_USER);
      expect(interestAccrued).to.be.equal(0);

      interestAccrued = await prime.callStatic.getInterestAccrued(vTokens[2].marketAddress, STAKED_USER);
      expect(interestAccrued).to.be.equal(0);

      interestAccrued = await prime.callStatic.getInterestAccrued(vTokens[3].marketAddress, STAKED_USER);
      expect(interestAccrued).to.be.equal(0);
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller()
      checkXVSVault()
    })
  });
});
