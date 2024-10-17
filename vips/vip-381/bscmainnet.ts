import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0xC682145a767ca98B743B895f1Bd2D4696bC9C2eC";
export const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";

const vip381 = () => {
  const meta = {
    version: "v2",
    title: "VIP-381",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [IRM],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip381;
