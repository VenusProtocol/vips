import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const ETHEREUM_PLP = "0x8ba6aFfd0e7Bcd0028D1639225C84DdCf53D8872";
export const ETHEREUM_WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const ETHEREUM_WBTC_PER_BLOCK_REWARD = parseUnits("0.00000001", 8).toString();

export const BSCMAINNET_VTREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const BSCMAINNET_PLP = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const BSCMAINNET_BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const BSCMAINNET_ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BSCMAINNET_USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BSCMAINNET_USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BSCMAINNET_AMOUNT_BTCB = parseUnits("0.03", 18);
export const BSCMAINNET_AMOUNT_ETH = parseUnits("3.33", 18);
export const BSCMAINNET_AMOUNT_USDC = parseUnits("18000", 18);
export const BSCMAINNET_AMOUNT_USDT = parseUnits("33000", 18);

export const vip491 = () => {
  const meta = {
    version: "v2",
    title: "VIP-491 [Ethereum][BNB Chain] Prime Adjustment - Q2 2025",
    description: `If passed, this VIP will perform the following actions following the Community proposals [Prime Adjustment Proposal - Q2 2025 [ETH Mainnet]](https://community.venus.io/t/prime-adjustment-proposal-q2-2025-eth-mainnet/4997) and [Prime Adjustment Proposal - Q2 2025 [BNB Chain]](https://community.venus.io/t/prime-adjustment-proposal-q2-2025-bnb-chain/4996), and the associated snapshots ([here](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xd0bba63cc1f5a2a6191ce054a80764b2f30aa406f2721d765a6b253c1dff9cab) and [here](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3e4c0f597c498e44ba14396d8ff8bf7bfdceba16f8668d10e2cfb33921820bbe)):

- Ethereum: set the prime distribution speed for WBTC to 0.00000001 WBTC per block (the minimum amount defined in WBTC)
- BNB Chain: withdraw the following amounts from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [PrimeLiquidityProvider](https://bscscan.com/address/0x23c4f844ffddc6161174eb32c770d4d8c07833f2) contract (where Prime rewards are stored), consuming $60,000 from the Prime budget:
    - 33,000 USDT (55% of $60K)
    - 18,000 USDC (30% of $60K)
    - 3.33 ETH ($6,000, 10% of $60K, assuming an ETH price of $1,800)
    - 0.03 BTCB ($3,000, 5% of $60K, assuming a BTCB price of $97,000)

The distributions of the $60K from the Prime budget follow the rules defined in the community proposal [Prime Adjustment Proposal - Q2 2025 [BNB Chain]](https://community.venus.io/t/prime-adjustment-proposal-q2-2025-bnb-chain/4996). After this VIP, the Prime budget is $225,080.

#### References

- [VIP-472 [Ethereum][BNB Chain] Prime Adjustment Proposal - Q2 2025](https://app.venus.io/#/governance/proposal/472?chainId=56)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/553)
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
        params: [[ETHEREUM_WBTC], [ETHEREUM_WBTC_PER_BLOCK_REWARD]],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: BSCMAINNET_VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BSCMAINNET_BTCB, BSCMAINNET_AMOUNT_BTCB, BSCMAINNET_PLP],
      },
      {
        target: BSCMAINNET_VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BSCMAINNET_ETH, BSCMAINNET_AMOUNT_ETH, BSCMAINNET_PLP],
      },
      {
        target: BSCMAINNET_VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BSCMAINNET_USDC, BSCMAINNET_AMOUNT_USDC, BSCMAINNET_PLP],
      },
      {
        target: BSCMAINNET_VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BSCMAINNET_USDT, BSCMAINNET_AMOUNT_USDT, BSCMAINNET_PLP],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip491;
