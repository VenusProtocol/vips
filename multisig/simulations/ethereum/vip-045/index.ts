import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip045, {
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  WBTC, 
  WETH,
  USDC,
  USDT,
} from "../../../proposals/ethereum/vip-045";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";

import PRIME_LIQUIDITY_PROVIDER_ABI from "./abis/PrimeLiquidityProvider.json";
import ERC20_ABI from "./abis/ERC20.json";
import PRIME_ABI from "./abis/Prime.json";

forking(20282042, () => {
  let prevBTCBBalance: any;
  let prevETHBalance: any;
  let btcbContract: Contract;
  let ethContract: Contract;

  describe("Pre-VIP behavior", () => {
    let primeLiquidityProvider: Contract;

    before(async () => {
      primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);

      btcbContract = await ethers.getContractAt(ERC20_ABI, WBTC);
      ethContract = await ethers.getContractAt(ERC20_ABI, WETH);

      prevBTCBBalance = await btcbContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      prevETHBalance = await ethContract.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    });

    it("speeds", async () => {
      let speed = await primeLiquidityProvider.tokenDistributionSpeeds(WETH);
      expect(speed).to.deep.equal(0);

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(WBTC);
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
      expect(speed).to.deep.equal("126");

      speed = await primeLiquidityProvider.tokenDistributionSpeeds(WBTC);
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