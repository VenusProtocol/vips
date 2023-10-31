import { ethers } from "hardhat";
import { Contract } from "ethers";
import { forking, testVip } from "../../../src/vip-framework";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import { expect } from "chai";
import { vip194Testnet } from "../../../vips/vip-194/vip-194-testnet";

const PRIME_LIQUIDITY_PROVIDER = "0xce20cACeF98DC03b2e30cD63b7B56B018d171E9c";

forking(34696892, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      // should be true after previous VIPs are executed
      expect(paused).to.be.equal(false);
    });
  });

  testVip("VIP-194 Prime Program", vip194Testnet(), {});

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider:  Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);
    });
  });
});

