import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { ADDRESSES_2 } from "../vip-239";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

const commands = [
  ...ADDRESSES_2.map(address => {
    return {
      target: PRIME,
      signature: "burn(address)",
      params: [address],
    };
  }),
];

export const vip256 = () => {
  const meta = {
    version: "v2",
    title: "VIP-256 Burn Prime tokens of the Venus 3rd Anniversary x Polyhedra Campaign winners (2/2)",
    description: `If passed, this VIP will burn the remaining 13 (30 days) Prime tokens minted in the [VIP-239](https://app.venus.io/#/governance/proposal/239), related to the [Venus 3rd Anniversary x Polyhedra Campaign](https://community.venus.io/t/venus-3rd-anniversary-x-polyhedra-campaign-results/4020).`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      ...commands,
      {
        target: PRIME,
        signature: "setLimit(uint256,uint256)",
        params: [0, 500],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip256;
