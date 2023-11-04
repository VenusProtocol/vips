import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip195 } from "../../../vips/vip-195/vip-195";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import PRIME_ABI from "./abis/Prime.json";

const PRIME_LIQUIDITY_PROVIDER = "0x103Af40c4C30A564A2158D7Db6c57a0802b9217A";
const PRIME = "0x78d8dD5b0003723826E1FDb2031e9466000469Fe";

forking(33118003, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      // should be true after previous VIPs are executed
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(true);
    });
  });

  testVip("VIP-195 Prime Program", vip195(), {});

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(false);
    });
  });
});
