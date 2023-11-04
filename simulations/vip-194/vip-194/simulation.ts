import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip194 } from "../../../vips/vip-194/vip-194";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import PRIME_ABI from "./abis/Prime.json";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

const PRIME_LIQUIDITY_PROVIDER = "0x103Af40c4C30A564A2158D7Db6c57a0802b9217A";
const PRIME = "0x78d8dD5b0003723826E1FDb2031e9466000469Fe";
const STAKED_USER = "0x2e7a15e186cc81f7efc4bf7df12dbd5e3db4fefb";

const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";

forking(33118003, () => {
  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal(0);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);
    });
  });

  testVip("VIP-194 Prime Program", vip194(), {});

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal("24438657407407");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTC);
      expect(speed).to.deep.equal("1261574074074");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal("36881637731481481");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal("87191261574074074");
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);
    });

    it("rewards", async () => {
      await mine(1000)
      let rewards = await prime.callStatic.getInterestAccrued(vETH, STAKED_USER);
      expect(rewards).to.be.not.equal("0");
    });
  });
});
