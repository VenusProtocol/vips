import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

export const vip248 = () => {
  const meta = {
    version: "v2",
    title: "VIP-248 Symbol Override and Stale Period Configuration for lisUSD and slisBNB",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["lisUSD", 1500],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["slisBNB", 1500],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["lisUSD", "HAY"],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["slisBNB", "SnBNB"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip248;
