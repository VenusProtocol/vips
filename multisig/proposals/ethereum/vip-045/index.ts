import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const PRIME_LIQUIDITY_PROVIDER = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const PRIME = "0x14C4525f47A7f7C984474979c57a2Dccb8EACB39";
export const CORE_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";

export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
export const BLOCKS_IN_90_DAYS = BLOCKS_PER_YEAR.mul(90).div(365);

export const WBTC_PER_90_DAYS_REWARD = parseUnits("0.25476", 8);
export const WETH_PER_90_DAYS_REWARD = parseUnits("52.6647", 18);
export const USDC_PER_90_DAYS_REWARD = parseUnits("15395", 6);
export const USDT_PER_90_DAYS_REWARD = parseUnits("15395", 6);

export const WBTC_PER_BLOCK_REWARD = WBTC_PER_90_DAYS_REWARD.div(BLOCKS_IN_90_DAYS);
export const WETH_PER_BLOCK_REWARD = WETH_PER_90_DAYS_REWARD.div(BLOCKS_IN_90_DAYS);
export const USDC_PER_BLOCK_REWARD = USDC_PER_90_DAYS_REWARD.div(BLOCKS_IN_90_DAYS);
export const USDT_PER_BLOCK_REWARD = USDT_PER_90_DAYS_REWARD.div(BLOCKS_IN_90_DAYS);

export const vip045 = () => {
  return makeProposal([
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [WBTC, WETH, USDC, USDT],
        [WBTC_PER_BLOCK_REWARD, WETH_PER_BLOCK_REWARD, USDC_PER_BLOCK_REWARD, USDT_PER_BLOCK_REWARD],
      ],
    },
    {
      target: PRIME_LIQUIDITY_PROVIDER,
      signature: "resumeFundsTransfer()",
      params: [],
    },
    {
      target: PRIME,
      signature: "togglePause()",
      params: [],
    },
  ]);
};

export default vip045;
