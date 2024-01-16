import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";
import { ADDRESSES_2 } from "./vip-239";

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

export const vip241 = () => {
  const meta = {
    version: "v2",
    title: "VIP-234 Venus Prime: Burn Irrevocable Prime Tokens",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
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
