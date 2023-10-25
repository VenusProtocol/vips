import { ethers } from "hardhat";
import { Contract } from "ethers";
import { forking, testVip } from "../../../src/vip-framework";
import { vip192Testnet } from "../../../vips/vip-192/vip-192-tetsnet";
import SETTER_FACET_ABI from "./abis/SetterFacet.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import { expectEvents } from "../../../src/utils";
import { expect } from "chai";

const PRIME = "0x78d72e8078878B6259ffA48B1035F927Ff43F0b4";
const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";

forking(34514247, () => {
  describe("Pre-VIP behavior", () => {
    let prime: Contract;
    let primeLiquidityProvider =  Contract;

    before(async () => {
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(0);
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal("0x0000000000000000000000000000000000000000");
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
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("prime markets", async () => {
      expect((await prime.getAllMarkets()).length).to.equal(4);
    });

    it("prime address", async () => {
      expect(await primeLiquidityProvider.prime()).to.equal(PRIME);
    });
  });
});
