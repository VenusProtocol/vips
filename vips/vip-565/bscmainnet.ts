import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { ethereum } = NETWORK_ADDRESSES;

export const MESSARI = "0x8f0f345c908c176fc829f69858c3ad6fdd3bee9a";

export const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT_ETH = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const MESSARI_USDC_AMOUNT_1 = parseUnits("20836", 6);
export const MESSARI_USDC_AMOUNT_2 = parseUnits("2914", 6);
export const USDT_TO_SWAP = parseUnits("2916", 6);

export const UNISWAP_SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const vip565 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-565 Payments issuance to Providers",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDT_ETH, USDT_TO_SWAP, ethereum.NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDT_ETH,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, USDT_TO_SWAP],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: UNISWAP_SWAP_ROUTER,
        signature: "exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))",
        params: [
          [
            USDT_ETH,
            USDC_ETH,
            100,
            ethereum.NORMAL_TIMELOCK,
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14, // 14 days from now
            USDT_TO_SWAP,
            MESSARI_USDC_AMOUNT_2,
            0n,
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ethereum.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [USDC_ETH, MESSARI_USDC_AMOUNT_1, MESSARI],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDC_ETH,
        signature: "transfer(address,uint256)",
        params: [MESSARI, MESSARI_USDC_AMOUNT_2],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: USDT_ETH,
        signature: "approve(address,uint256)",
        params: [UNISWAP_SWAP_ROUTER, 0],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip565;
