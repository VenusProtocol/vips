import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const RISK_FUND = "0x487CeF72dacABD7E12e633bb3B63815a386f7012";
const NEW_RISK_FUND_IMPLEMENTATION = "0x50B26c741Db8F45b24498575C203c862Fe70d934";
const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

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
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RISK_FUND, NEW_RISK_FUND_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
