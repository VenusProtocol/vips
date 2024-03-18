import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";

export const vip273 = () => {
  const meta = {
    version: "v2",
    title: "VIP-273 Override EURA symbol to AGEUR in Binance Oracle",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setSymbolOverride(string,string)",
        params: ["EURA", "AGEUR"],
        value: "0",
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip273;
