import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
export const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
export const TEMP_VTOKEN_IMPL = "0xD2E69514F33111093586a25D75A306B66f75F658";
export const vagEUR = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";
export const VTOKEN_IMPL = "0x9A8ADe92b2D71497b6F19607797F2697cF30f03A";

export const vip273 = () => {
  const meta = {
    version: "v2",
    title: "VIP-273",
    description: "",
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["EURA", 1500],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: vagEUR,
        signature: "setName(string)",
        params: ["Venus EURA (Stablecoins)"],
      },
      {
        target: vagEUR,
        signature: "setSymbol(string)",
        params: ["eura_Stablecoins"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip273;
