import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0xfc78B2C1441D968944F418C822Cac0237c380f5F";
export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";

const vip479 = () => {
  const meta = {
    version: "v2",
    title: "VIP-479 Update IR of vBNB",
    description: `VIP-479 Update IR of vBNB`,
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
    ProposalType.CRITICAL,
  );
};

export default vip479;
