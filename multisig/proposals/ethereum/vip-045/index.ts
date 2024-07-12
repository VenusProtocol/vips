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

export const vWBTC = "0x8716554364f20BCA783cb2BAA744d39361fd1D8d";
export const vWETH = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const vUSDC = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const vUSDT = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";

export const BLOCKS_PER_YEAR = BigNumber.from(2628000); // assuming a block is mined every 12 seconds
export const BLOCKS_IN_30_DAYS = BLOCKS_PER_YEAR.mul(30).div(365);

export const WBTC_PER_90_DAYS_REWARD = parseUnits("0.0772", 8).mul(3);
export const WETH_PER_90_DAYS_REWARD = parseUnits("15.959", 18).mul(3);
export const USDC_PER_90_DAYS_REWARD = parseUnits("4665", 6).mul(3);
export const USDT_PER_90_DAYS_REWARD = parseUnits("4665", 6).mul(3);

export const WBTC_PER_BLOCK_REWARD = WBTC_PER_90_DAYS_REWARD.div(BLOCKS_IN_30_DAYS);
export const WETH_PER_BLOCK_REWARD = WETH_PER_90_DAYS_REWARD.div(BLOCKS_IN_30_DAYS);
export const USDC_PER_BLOCK_REWARD = USDC_PER_90_DAYS_REWARD.div(BLOCKS_IN_30_DAYS);
export const USDT_PER_BLOCK_REWARD = USDT_PER_90_DAYS_REWARD.div(BLOCKS_IN_30_DAYS);

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
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WETH, WETH_PER_90_DAYS_REWARD, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, WBTC_PER_90_DAYS_REWARD, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDC, USDC_PER_90_DAYS_REWARD, PRIME_LIQUIDITY_PROVIDER],
    },
    {
      target: TREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [USDT, USDT_PER_90_DAYS_REWARD, PRIME_LIQUIDITY_PROVIDER],
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
