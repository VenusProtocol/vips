import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands from "../vip-192/commands";
import staked from "./staked-users";

export const vip193 = () => {
  const meta = {
    version: "v2",
    title: "Prime Program Setup",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the prime program",
    againstDescription: "I do not think that Venus Protocol should proceed with setting the prime program",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with setting the prime program",
  };

  return makeProposal([...commands, staked], meta, ProposalType.REGULAR);
};
