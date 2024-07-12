import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip045, {
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  USDC,
  USDC_PER_BLOCK_REWARD,
  USDC_PER_MONTH_REWARD,
  USDT,
  USDT_PER_BLOCK_REWARD,
  USDT_PER_MONTH_REWARD,
  WBTC,
  WBTC_PER_BLOCK_REWARD,
  WBTC_PER_MONTH_REWARD,
  WETH,
  WETH_PER_BLOCK_REWARD,
  WETH_PER_MONTH_REWARD,
} from "../../../proposals/ethereum/vip-045";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";

forking(20282042, () => {
  let prevBTCBBalance: any;
  let prevETHBalance: any;
  let prevUSDCBalance: any;
  let prevUSDTBalance: any;
  let btcbContract: Contract;
  let ethContract: Contract;
  let usdcContract: Contract;
  let usdtContract: Contract;

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);

      btcbContract = await ethers.getContractAt(ERC20_ABI, WBTC);
      ethContract = await ethers.getContractAt(ERC20_ABI, WETH);
      usdcContract = await ethers.getContractAt(ERC20_ABI, USDC);
      usdtContract = await ethers.getContractAt(ERC20_ABI, USDT);

      prevBTCBBalance = await btcbContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      prevETHBalance = await ethContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      prevUSDCBalance = await usdcContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      prevUSDTBalance = await usdtContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(WETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(WBTC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
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
      await pretendExecutingVip(vip045());

      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
      prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(WETH);
      expect(speed).to.deep.equal(WETH_PER_BLOCK_REWARD);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(WBTC);
      expect(speed).to.deep.equal(WBTC_PER_BLOCK_REWARD);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDC);
      expect(speed).to.deep.equal(USDC_PER_BLOCK_REWARD);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(speed).to.deep.equal(USDT_PER_BLOCK_REWARD);
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
      const currentUSDCBalance = await usdcContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const currentUSDTBalance = await usdtContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);

      expect(currentBTCBBalance.sub(prevBTCBBalance)).to.be.equal(WBTC_PER_MONTH_REWARD);
      expect(currentETHBalance.sub(prevETHBalance)).to.be.equal(WETH_PER_MONTH_REWARD);
      expect(currentUSDCBalance.sub(prevUSDCBalance)).to.be.equal(USDC_PER_MONTH_REWARD);
      expect(currentUSDTBalance.sub(prevUSDTBalance)).to.be.equal(USDT_PER_MONTH_REWARD);
    });
  });
});
