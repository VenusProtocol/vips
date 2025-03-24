import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { FAST_TRACK_TIMELOCK } from "src/vip-framework";

const vip383 = () => {
  const meta = {
    version: "v2",
    title: "VIP-383 [Ethereum] Prime Adjustment Proposal - Q4 2024",
    description: `If passed, this VIP will perform the following actions following the Community proposal [Prime Adjustment Proposal - Q4 2024 [ETH Mainnet]](https://community.venus.io/t/prime-adjustment-proposal-q4-2024-eth-mainnet/4608) and the associated [snapshot](https://snapshot.org/#/venus-xvs.eth/proposal/0x610fcaadd990425a164f59eebc5b7b07fa29261a7a19b31e1cf8aa81191f3215):

- Modify the reward speeds for Prime markets
- Modify the income distribution to the Prime markets

In summary, the changes are the following:

New income distribution proposal (scoped to the 20% of the protocol reserves, allocated to Prime):

- BTC (Core): 5% (-2%)
- WETH (Liquid Staked ETH): 85% (+6%)
- USDC (Core): 5% (-2%)
- USDT (Core): 5% (-2%)

3-month reward distribution:

- BTC (Core): 0.04 (-0.22)
- WETH (Liquid Staked ETH): 15.78 (-37)
- USDC (Core): 2,250 (-13,145)
- USDT (Core): 2,250 (-13,145)
- Total rewards for 3 months: $45,000

#### References

- Community proposal “[Prime Adjustment Proposal - Q4 2024 [ETH Mainnet]](https://community.venus.io/t/prime-adjustment-proposal-q4-2024-eth-mainnet/4608)”
- [VIP-339 [Ethereum] : Venus Prime Deployment - Q3 2024](https://app.venus.io/#/governance/proposal/339?chainId=56) (previous Prime adjustment)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/408)
- [Tokenomics](https://docs-v4.venus.io/governance/tokenomics)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x65fdcf0fd1d3377196dd73e25f7335aa81c693b0ddd41822780ceaed526156f5) multisig transaction will be executed. Otherwise, it will be rejected.
    `,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: FAST_TRACK_TIMELOCK,
        signature: "",
        params: [],
        value: "1",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip383;
