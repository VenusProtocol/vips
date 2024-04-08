import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

const vip286 = () => {
  const meta = {
    version: "v2",
    title: "VIP-286 Ethereum: increase XVS mint cap",
    description: `#### Disclaimer for Ethereum VIPs

Privilege commands on Ethereum will be executed by the [Guardian wallet](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are deployed. If this VIP passes, [this multisig transaction](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0xa8306df72040b6882b82b599569661a680b542ff708438a5456fd7969ac70f86) will be executed. Otherwise, it will be rejected.

#### Description

This VIP will perform the following Risk Parameter actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs Recommendations - Increase XVS Minting Cap 04/07/24](https://community.venus.io/t/chaos-labs-recommendations-increase-xvs-minting-cap-04-07-24/4247).

- Increase mint cap of the [XVS](https://etherscan.io/address/0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A) token on Ethereum via the [XVS bridge](https://etherscan.io/address/0x888E317606b4c590BBAD88653863e8B345702633), from 500,000 XVS to 1,250,000 XVS

Simulation of the multisig transaction: [https://github.com/VenusProtocol/vips/pull/257](https://github.com/VenusProtocol/vips/pull/257)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: NORMAL_TIMELOCK,
        signature: "",
        params: [],
        value: "0",
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip286;
