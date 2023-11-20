import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import staked from "./command";

export const vip206 = () => {
  const meta = {
    version: "v2",
    title: "VIP-206",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal([staked], meta, ProposalType.FAST_TRACK);
};
