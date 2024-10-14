import { parseUnits } from "ethers/lib/utils";

import { makeProposal } from "../../../../src/utils";

export const USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const BLOCKS_PER_QUARTER = 657000;
export const WETH_AMOUNT = parseUnits("15.78", 18);
export const WBTC_AMOUNT = parseUnits("0.04", 8);
export const USDC_AMOUNT = parseUnits("2250", 6);
export const USDT_AMOUNT = parseUnits("2250", 6);
export const WBTC_REWARD_AMOUNT_PER_BLOCK = WBTC_AMOUNT.div(BLOCKS_PER_QUARTER);
export const WETH_REWARD_AMOUNT_PER_BLOCK = WETH_AMOUNT.div(BLOCKS_PER_QUARTER);
export const USDC_REWARD_AMOUNT_PER_BLOCK = USDC_AMOUNT.div(BLOCKS_PER_QUARTER);
export const USDT_REWARD_AMOUNT_PER_BLOCK = USDT_AMOUNT.div(BLOCKS_PER_QUARTER);

export const vip066 = () => {
  return makeProposal([
    {
      target: PSR,
      signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
      params: [
        [
          [0, 100, USDC_PRIME_CONVERTER],
          [0, 100, USDT_PRIME_CONVERTER],
          [0, 100, WBTC_PRIME_CONVERTER],
          [0, 1700, WETH_PRIME_CONVERTER],
        ],
      ],
    },
    {
      target: PLP,
      signature: "setTokensDistributionSpeed(address[],uint256[])",
      params: [
        [WBTC, WETH, USDC, USDT],
        [
          WBTC_REWARD_AMOUNT_PER_BLOCK,
          WETH_REWARD_AMOUNT_PER_BLOCK,
          USDC_REWARD_AMOUNT_PER_BLOCK,
          USDT_REWARD_AMOUNT_PER_BLOCK,
        ],
      ],
    },
  ]);
};

export default vip066;
