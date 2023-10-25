import { ethers } from "hardhat";
import { Contract } from "ethers";
import { forking, testVip } from "../../../src/vip-framework";
import { vip192Testnet } from "../../../vips/vip-192/vip-192-tetsnet";
import SETTER_FACET_ABI from "./abis/SetterFacet.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import { expectEvents } from "../../../src/utils";
import { expect } from "chai";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";

const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";
const PRIME = "0xDd83Ed95672bDFdcbF6124f17554D1C37523de72";
const STAKED_USER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(34524479, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider =  Contract;

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
  });

  testVip("VIP-192 Prime Program", vip192Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewPrimeToken"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    let prime: Contract;
    let primeLiquidityProvider =  Contract;

    before(async () => {
      impersonateAccount(STAKED_USER);
      const signer = await ethers.getSigner(STAKED_USER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME, signer);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
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
  });
});
