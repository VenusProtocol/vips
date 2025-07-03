import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const ETHEREUM_WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const ETHEREUM_WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const ETHEREUM_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const ETHEREUM_USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const ETHEREUM_BLOCKS_PER_QUARTER = 657000;
export const ETHEREUM_WBTC_PER_BLOCK_REWARD = parseUnits("0.0055", 8).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_WETH_PER_BLOCK_REWARD = parseUnits("6.78", 18).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_USDC_PER_BLOCK_REWARD = parseUnits("900", 6).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();
export const ETHEREUM_USDT_PER_BLOCK_REWARD = parseUnits("900", 6).div(ETHEREUM_BLOCKS_PER_QUARTER).toString();

export const BSCMAINNET_PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BSCMAINNET_BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BSCMAINNET_ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BSCMAINNET_USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BSCMAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BSCMAINNET_BLOCKS_PER_QUARTER = 2628000;
export const BSCMAINNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.40", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_ETH_PER_BLOCK_REWARD = parseUnits("35.11", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_USDC_PER_BLOCK_REWARD = parseUnits("198000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();
export const BSCMAINNET_USDT_PER_BLOCK_REWARD = parseUnits("363000", 18).div(BSCMAINNET_BLOCKS_PER_QUARTER).toString();

export const vip472 = () => {
  const meta = {
    version: "v2",
    title: "VIP-472 [Ethereum][BNB Chain] Prime Adjustment Proposal - Q2 2025",
    description: `If passed, this VIP will perform the following actions following the Community proposals [Prime Adjustment Proposal - Q2 2025 [ETH Mainnet]](https://community.venus.io/t/prime-adjustment-proposal-q2-2025-eth-mainnet/4997) and [Prime Adjustment Proposal - Q2 2025 [BNB Chain]](https://community.venus.io/t/prime-adjustment-proposal-q2-2025-bnb-chain/4996), and the associated snapshots ([here](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xd0bba63cc1f5a2a6191ce054a80764b2f30aa406f2721d765a6b253c1dff9cab) and [here](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3e4c0f597c498e44ba14396d8ff8bf7bfdceba16f8668d10e2cfb33921820bbe)):

- Modify the reward speeds for Prime markets on Ethereum and BNB Chain

In summary, the changes in the 3-month reward distributions are the following:

**BNB Chain**

- USDT (Core): 363,000 (-33,000)
- USDC (Core): 198,000 (-18,000)
- ETH (Core): 35.11 (+13.73)
- BTCB (Core): 0.40 (+0.02)
- Total rewards for 3 months: $660,000

**Ethereum**

- WBTC (Core): 0.0055 (-0.0045)
- WETH (Liquid Staked ETH): 6.78 (-4.58)
- USDC (Core): 900 (-1,800)
- USDT (Core): 900 (-1,800)
- Total rewards for 3 months: $15,000

#### References

- [VIP-432 [Ethereum][BNB Chain] Prime Adjustment Proposal - Q1 2025](https://app.venus.io/#/governance/proposal/432?chainId=1) (previous Prime adjustment)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/526)
- [Tokenomics](https://docs-v4.venus.io/governance/tokenomics)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
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
        target: BSCMAINNET_PLP,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BSCMAINNET_BTCB, BSCMAINNET_ETH, BSCMAINNET_USDC, BSCMAINNET_USDT],
          [
            BSCMAINNET_BTCB_PER_BLOCK_REWARD,
            BSCMAINNET_ETH_PER_BLOCK_REWARD,
            BSCMAINNET_USDC_PER_BLOCK_REWARD,
            BSCMAINNET_USDT_PER_BLOCK_REWARD,
          ],
        ],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip472;
