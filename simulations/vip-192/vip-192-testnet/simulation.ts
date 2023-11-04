import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip192Testnet } from "../../../vips/vip-192/vip-192-testnet";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import SETTER_FACET_ABI from "./abis/SetterFacet.json";

const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";
const PRIME = "0xb13Ea8C39594449B2AB5555769580BDB23f5E2Cf";
const STAKED_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

interface vTokenConfig {
  name: string;
  assetAddress: string;
  feed: string;
}

const vTokens: vTokenConfig[] = [
  {
    name: "vUSDC",
    assetAddress: "0x16227D60f7a0e586C66B005219dfc887D13C9531",
    feed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
  },
  {
    name: "vUSDT",
    assetAddress: "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c",
    feed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
  },
  {
    name: "vETH",
    assetAddress: "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7",
    feed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  },
  {
    name: "vBTC",
    assetAddress: "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4",
    feed: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
  },
];

forking(34696892, () => {
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

  testVip("VIP-192 Prime Program", vip192Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewPrimeToken"], [1]);
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
    });

    it("is paused", async () => {
      expect(await prime.paused()).to.be.equal(true);
    });
  });
});
