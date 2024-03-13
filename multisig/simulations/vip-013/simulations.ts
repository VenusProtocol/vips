import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip011 } from "../../proposals/vip-011/vip-011-opbnbtestnet";
import { vip012 } from "../../proposals/vip-012/vip-012-opbnbtestnet";
import { vip013 } from "../../proposals/vip-013/vip-013-opbnbtestnet";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import ERC20_ABI from "./abis/ERC20.json";

const PRIME_LIQUIDITY_PROVIDER = "0xF68E8925d45fb6679aE8caF7f859C76BdD964325";
const PRIME = "0x7831156A181288ce76B5952624Df6C842F4Cc0c1";
const BTCB = "0x7Af23F9eA698E9b953D2BD70671173AaD0347f19";
const ETH = "0x94680e003861D43C6c0cf18333972312B6956FF1";

forking(23470140, () => {
  before(async () => {
    await pretendExecutingVip(vip011());
    await pretendExecutingVip(vip012());
  });

  let prevBTCBBalance: any;
  let prevETHBalance: any;
  let btcbContract: Contract;
  let ethContract: Contract;

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);

      btcbContract = await ethers.getContractAt(ERC20_ABI, BTCB);
      ethContract = await ethers.getContractAt(ERC20_ABI, ETH);

      prevBTCBBalance = await btcbContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      prevETHBalance = await ethContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTCB);
      expect(speed).to.deep.equal(0);
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(true);
    });
  });

  describe("Post-VIP behavior", async () => {
    let primeLiquidityProvider: Contract;
    let prime: Contract;

    before(async () => {
      await pretendExecutingVip(vip013());

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(ETH);
      expect(speed).to.deep.equal("24438657407407");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(BTCB);
      expect(speed).to.deep.equal("126");
    });

    it("paused", async () => {
      const paused = await primeLiquidityProvider.paused();
      expect(paused).to.be.equal(false);

      const primePaused = await prime.paused();
      expect(primePaused).to.be.equal(false);
    });

    it("check balance", async () => {
      const currentBTCBBalance = await btcbContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const currentETHBalance = await ethContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);

      expect(currentBTCBBalance.sub(prevBTCBBalance)).to.be.equal("2180000000000000000");
      expect(currentETHBalance.sub(prevETHBalance)).to.be.equal("42230000000000000000");
    });

    describe("generic tests", async () => {
      checkXVSVault();
    });
  });
});
