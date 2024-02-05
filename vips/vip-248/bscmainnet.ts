import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
export const ACM = "0x4788629abc6cfca10f9f969efdeaa1cf70c23555";
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";

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
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setSymbolOverride(string,string)", ORACLE_GUARDIAN],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", FAST_TRACK_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", CRITICAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BINANCE_ORACLE, "setMaxStalePeriod(string,uint256)", ORACLE_GUARDIAN],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip248;
