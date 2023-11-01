import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";
import commands192 from "../vip-192/commands-testnet";
import commands from "./commands-testnet";

export const vip193Testnet = () => {
  const meta = {
    version: "v2",
    title: "Prime Program Setup",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with setting the prime program",
    againstDescription:
      "I do not think that Venus Protocol should proceed with setting the prime program",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with setting the prime program",
  };

  return makeProposal(
    [
      ...commands192,
      ...commands
    ],
    meta,
    ProposalType.REGULAR,
  );
};
