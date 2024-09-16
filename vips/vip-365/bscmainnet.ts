import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const VBNB_ADMIN = "0x9A7890534d9d91d473F28cB97962d176e2B65f1d";
const NEW_IR = "0xDb8347b96c94Be24B9c077A4CDDAAD074F6480cf";

export const vip365 = () => {
  const meta = {
    version: "v2",
    title: "VIP-365 Risk Parameters Adjustments (BNB)",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this proposal",
  };

  return makeProposal(
    [
      {
        target: VBNB_ADMIN,
        signature: "setInterestRateModel(address)",
        params: [NEW_IR],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip365;
