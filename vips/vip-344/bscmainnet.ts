import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";

const vip344 = () => {
  const meta = {
    version: "v2",
    title: "VIP-344 [Ethereum] VIP to increase supply cap of PT token on Ethereum",
    description: `This VIP will perform the following Risk Parameter actions as per Chaos Labs' latest recommendations in this Venus community forum publication: [Chaos Labs - Supply Cap Recommendation for PT-weETH - 07.24.2024](https://community.venus.io/t/chaos-labs-supply-cap-recommendation-for-pt-weeth-07-24-2024/4483/2).

    - [PT-wETH-26DEC2024 (Liquid Staked ETH)](https://etherscan.io/address/0x76697f8eaeA4bE01C678376aAb97498Ee8f80D5C): increase supply cap from 1,200 to 2,400

    Complete analysis and details of these recommendations are available in the above publication.

    #### References
    - [VIP simulation](https://github.com/VenusProtocol/vips/pull/329)

    #### Disclaimer for Ethereum VIPs
    Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, this multisig transaction will be executed. Otherwise, it will be rejected.`,
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

export default vip344;
