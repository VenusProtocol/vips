import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const IRM = "0x46D9269a8Db9623ac2baAB305B119a39BAfd8668";
export const VBNB_ADMIN = "0x04109575c1dbB4ac2e59e60c783800ea10441BBe";

const vip484 = () => {
  const meta = {
    version: "v2",
    title: "VIP-484 Update IR of vBNB",
    description: `VIP-484 Update IR of vBNB`,
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

export default vip484;
