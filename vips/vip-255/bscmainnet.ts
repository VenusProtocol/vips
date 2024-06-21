import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ADDRESSES_1 } from "../vip-238";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

const commands = [
  ...ADDRESSES_1.map(address => {
    return {
      target: PRIME,
      signature: "burn(address)",
      params: [address],
    };
  }),
];

export const vip255 = () => {
  const meta = {
    version: "v2",
    title: "VIP-255 Burn Prime tokens of the Venus 3rd Anniversary x Polyhedra Campaign winners (1/2)",
    description: `If passed, this VIP will burn the 10 (30 Days) Prime tokens minted in the [VIP-238](https://app.venus.io/#/governance/proposal/238), related to the [Venus 3rd Anniversary x Polyhedra Campaign](https://community.venus.io/t/venus-3rd-anniversary-x-polyhedra-campaign-results/4020).

There will be a second VIP burning the Prime tokens for the rest of the winners.`,
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
        params: [13, 500],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip255;
