import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip811, {
  NEW_PRIME_SPEED_FOR_USDT,
  PRIME_LIQUIDITY_PROVIDER,
  PSR,
  USDC,
  USDC_PRIME_CONVERTER,
  USDC_TOKENS_TO_SWAP,
  USDT,
  USDT_PRIME_CONVERTER,
  USDT_TOKENS_TO_RECEIVE,
} from "../../vips/vip-811/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

forking(79249790, async () => {
  let primeLiquidityProvider: Contract;
  let usdc: Contract;
  let usdt: Contract;
  let psr: Contract;
  let usdtPreviousBalance: any;
  let usdcPreviousBalance: any;
  let normalTimelockUsdcPreviousBalance: any;

  before(async () => {
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    usdtPreviousBalance = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    usdcPreviousBalance = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
    normalTimelockUsdcPreviousBalance = await usdc.balanceOf(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
    psr = await ethers.getContractAt(PSR_ABI, PSR);
  });

  describe("Pre-VIP state", async () => {
    it("check current distribution configs", async () => {
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(1000);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1000);
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 1)).to.equal(0);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 1)).to.equal(0);
    });

    it("check current prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(3246930795942361n);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(3246930795942361n);
    });
  });

  testVip("vip-811", await vip811(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // percentage distribution updates for those two assets
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [2]);

      // setTokensDistributionSpeed for USDT
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should update Prime rewards distribution speed for USDC and USDT", async () => {
      const usdtSpeed = await primeLiquidityProvider.tokenDistributionSpeeds(USDT);
      expect(usdtSpeed).to.equal(NEW_PRIME_SPEED_FOR_USDT);
    });

    it("check sweep and token conversion status", async () => {
      // PLP USDC decreased
      const usdcBalance = await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const usdcDecreaseBalance = usdcPreviousBalance.sub(usdcBalance);
      expect(usdcDecreaseBalance).to.eq(USDC_TOKENS_TO_SWAP);

      // PLP USDT increased
      const usdtBalance = await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER);
      const usdtIncreasedBalance = usdtBalance.sub(usdtPreviousBalance);
      expect(usdtIncreasedBalance).to.eq(USDT_TOKENS_TO_RECEIVE);

      // Normal timelock USDT balance remains the same
      const normalTimelockUsdtBalance = await usdt.balanceOf(NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK);
      expect(normalTimelockUsdcPreviousBalance).to.be.closeTo(normalTimelockUsdtBalance, parseUnits("100", 18)); // +-100
      const NTusdtIncreasedBalance = normalTimelockUsdtBalance.sub(normalTimelockUsdcPreviousBalance);

      console.log("NT USDT BALANCE DIFFERENCE :", formatUnits(NTusdtIncreasedBalance, 18));
    });
  });
});
