import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip011 } from "../../proposals/vip-011/vip-011-opbnbtestnet";
import { vip012 } from "../../proposals/vip-012/vip-012-opbnbtestnet";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";

const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";
const vBTCB = "0x86F82bca79774fc04859966917D2291A68b870A9";
const vETH = "0x034Cc5097379B13d3Ed5F6c85c8FAf20F48aE480";

forking(22879768, () => {
  before(async () => {
    await pretendExecutingVip(vip011());
  });

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(vETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(vBTCB);
      expect(speed).to.deep.equal(0);
    });

    it("markets", async () => {
      let market = await prime.markets(ETH);
      expect(market.exists).to.deep.equal(false);

      market = await prime.markets(BTCB);
      expect(market.exists).to.deep.equal(false);
    });
  });

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      await pretendExecutingVip(vip012());


      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTCB);
      expect(speed).to.deep.equal(0);
    });

    it("markets", async () => {
      let market = await prime.markets(vETH);
      expect(market.exists).to.deep.equal(true);

      market = await prime.markets(vBTCB);
      expect(market.exists).to.deep.equal(true);
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
