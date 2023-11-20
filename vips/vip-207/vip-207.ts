import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import command from "./command";

export const vip207 = () => {
  const meta = {
    version: "v2",
    title: "VIP-207",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal([command], meta, ProposalType.FAST_TRACK);
};
