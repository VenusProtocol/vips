import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const ETHEREUM_PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const ETHEREUM_USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E"; // 3
export const ETHEREUM_USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD"; // 4
export const ETHEREUM_WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0"; // 5
export const ETHEREUM_WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D"; // 6
export const ETHEREUM_WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const ETHEREUM_WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const ETHEREUM_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const ETHEREUM_USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const ETHEREUM_BLOCKS_PER_QUARTER = 657000;
export const ETHEREUM_WBTC_PER_BLOCK_REWARD = parseUnits("0.01", 8).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_WETH_PER_BLOCK_REWARD = parseUnits("11.36", 18).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_USDC_PER_BLOCK_REWARD = parseUnits("2700", 6).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_USDT_PER_BLOCK_REWARD = parseUnits("2700", 6).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();

export const BSCMAINNET_PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const BSCMAINNET_PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BSCMAINNET_USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b"; // 3
export const BSCMAINNET_USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3"; // 4
export const BSCMAINNET_WBTC_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53"; // 5
export const BSCMAINNET_WETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E"; // 6
export const BSCMAINNET_WBTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BSCMAINNET_WETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BSCMAINNET_USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BSCMAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BSCMAINNET_BLOCKS_PER_QUARTER = 2628000;
export const BSCMAINNET_WBTC_PER_BLOCK_REWARD = parseUnits("0.38", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_WETH_PER_BLOCK_REWARD = parseUnits("21.38", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_USDC_PER_BLOCK_REWARD = parseUnits("216000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_USDT_PER_BLOCK_REWARD = parseUnits("396000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();

export const vip427 = () => {
  const meta = {
    version: "v2",
    title: "VIP-427",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: ETHEREUM_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 120, ETHEREUM_USDC_PRIME_CONVERTER],
            [0, 120, ETHEREUM_USDT_PRIME_CONVERTER],
            [0, 60, ETHEREUM_WBTC_PRIME_CONVERTER],
            [0, 1700, ETHEREUM_WETH_PRIME_CONVERTER],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [ETHEREUM_WBTC, ETHEREUM_WETH, ETHEREUM_USDC, ETHEREUM_USDT],
          [
            ETHEREUM_WBTC_PER_BLOCK_REWARD,
            ETHEREUM_WETH_PER_BLOCK_REWARD,
            ETHEREUM_USDC_PER_BLOCK_REWARD,
            ETHEREUM_USDT_PER_BLOCK_REWARD,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BSCMAINNET_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 600, BSCMAINNET_USDC_PRIME_CONVERTER],
            [0, 1100, BSCMAINNET_USDT_PRIME_CONVERTER],
            [0, 100, BSCMAINNET_WBTC_PRIME_CONVERTER],
            [0, 200, BSCMAINNET_WETH_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: BSCMAINNET_PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BSCMAINNET_WBTC, BSCMAINNET_WETH, BSCMAINNET_USDC, BSCMAINNET_USDT],
          [
            BSCMAINNET_WBTC_PER_BLOCK_REWARD,
            BSCMAINNET_WETH_PER_BLOCK_REWARD,
            BSCMAINNET_USDC_PER_BLOCK_REWARD,
            BSCMAINNET_USDT_PER_BLOCK_REWARD,
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip427;
