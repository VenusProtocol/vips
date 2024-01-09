import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import { ADDRESSES } from "../vip-234/vip-234";

export const PRIME = "0xBbCD063efE506c3D42a0Fa2dB5C08430288C71FC";

const commands = ADDRESSES.map(address => {
  return {
    target: PRIME,
    signature: "burn(address)",
    params: [address],
  };
});

export const vip235 = () => {
  const meta = {
    version: "v2",
    title: "VIP-234 Venus Prime: Mint Irrevocable Prime Tokens",
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
    ProposalType.REGULAR,
  );
};
