import { vweETH, vwstETH } from "../../multisig/proposals/ethereum/vip-032";
import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip315 = () => {
  const meta = {
    version: "v2",
    title: "VIP-315 Risk Parameters Adjustments (weETH, wstETH)",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Risk Parameter Updates - 05/27/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-05-27-24/4364/1).

- [weETH (Liquid Staked ETH pool)](https://etherscan.io/address/${vweETH})
  - Increase supply cap, from 15K to 50K weETH
  - Increase borrow cap, from 7.5K to 25K weETH
- [wstETH (Liquid Staked ETH pool)](https://etherscan.io/address/${vwstETH})
  - Increase borrow cap, from 4K to 10K wstETH

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/294](https://github.com/VenusProtocol/vips/pull/294)

#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance contracts](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) are deployed. If this VIP passes, [this](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xcde4d485220c45190037c5897bf8ca2aee6d6e05d8a817497a161b297870b18b) multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip315;
