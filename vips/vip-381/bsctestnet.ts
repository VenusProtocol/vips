import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x86954c6fCA6B464269Aa7011B143c4D93Dfa1146";
export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";

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
