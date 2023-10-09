import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const NEW_RISK_FUND_IMPLEMENTATION = "0x50B26c741Db8F45b24498575C203c862Fe70d934";

export const vip154Testnet = () => {
  const meta = {
    version: "v2",
    title: "Upgrade Risk Fund",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with upgrading Risk Fund",
    againstDescription: "I do not think that Venus Protocol should proceed with upgrading Risk Fund",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with upgrading Risk Fund",
  };

  return makeProposal(
    [
      {
        target: RISK_FUND,
        signature: "upgradeTo(address)",
        params: [NEW_RISK_FUND_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
