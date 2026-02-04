import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

export const PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
/// assume 192000 blocks per Day
/// 0.010044642857142858 * (192000 * 28 days) = 54,000 usd
export const NEW_PRIME_SPEED_FOR_USDT = parseUnits("0.010044642857142858", 18);
export const USDC_TOKENS_TO_SWAP = parseUnits("27000", 18);
export const USDT_TOKENS_TO_RECEIVE = parseUnits("26900", 18);

export const UNISWAP_SWAP_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14";

export const vip811 = () => {
  const meta = {
    version: "v2",
    title: "vip811",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // Adjust Prime Rewards Distributions
      {
        target: PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 2000, USDT_PRIME_CONVERTER],
            [0, 0, USDC_PRIME_CONVERTER],
          ],
        ],
      },
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [[USDT], [NEW_PRIME_SPEED_FOR_USDT]],
      },

      // Swap USDC to USDT
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "sweepToken(address,address,uint256)",
        params: [USDC, NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK, USDC_TOKENS_TO_SWAP],
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, USDC_TOKENS_TO_SWAP],
      },
      {
        target: UNISWAP_SWAP_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [
            USDC,
            USDT,
            100,
            bscmainnet.NORMAL_TIMELOCK,
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days from now
            USDC_TOKENS_TO_SWAP,
            USDT_TOKENS_TO_RECEIVE,
            0n,
          ],
        ],
      },
      {
        target: USDT,
        signature: "transfer(address,uint256)",
        params: [PRIME_LIQUIDITY_PROVIDER, USDT_TOKENS_TO_RECEIVE],
      },
      {
        target: USDC,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, 0],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip811;
