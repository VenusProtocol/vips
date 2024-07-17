import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip045, {
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  USDC,
  USDC_PER_90_DAYS_REWARD,
  USDC_PER_BLOCK_REWARD,
  USDT,
  USDT_PER_90_DAYS_REWARD,
  USDT_PER_BLOCK_REWARD,
  WBTC,
  WBTC_PER_90_DAYS_REWARD,
  WBTC_PER_BLOCK_REWARD,
  WETH,
  WETH_PER_90_DAYS_REWARD,
  WETH_PER_BLOCK_REWARD,
} from "../../../proposals/ethereum/vip-045";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";

forking(20311017, async () => {
  const erc20At = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
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
      await pretendExecutingVip(await vip045());

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

    it("has enough WBTC for the reward", async () => {
      expect(await erc20At(WBTC).balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.be.greaterThanOrEqual(WBTC_PER_90_DAYS_REWARD);
    });

    it("has enough WETH for the reward", async () => {
      expect(await erc20At(WETH).balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.be.greaterThanOrEqual(WETH_PER_90_DAYS_REWARD);
    });

    it("has enough USDC for the reward", async () => {
      expect(await erc20At(USDC).balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.be.greaterThanOrEqual(USDC_PER_90_DAYS_REWARD);
    });

    it("has enough USDT for the reward", async () => {
      expect(await erc20At(USDT).balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.be.greaterThanOrEqual(USDT_PER_90_DAYS_REWARD);
    });
  });
});
