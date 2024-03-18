import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

export const vip274 = () => {
  const meta = {
    version: "v2",
    title: "VIP-274",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["EURA", "AGEUR"],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip274;
