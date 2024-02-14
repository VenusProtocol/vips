import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
export const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
export const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
export const SnBNB = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
export const HAY = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";
export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const TEMP_VTOKEN_IMPL = "0x3b8b6E96e57f0d1cD366AaCf4CcC68413aF308D0";
export const VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const VTOKEN_BEACON_SnBNB = "0x1103Bec24Eb194d69ae116d62DD9559412E7C23A";
export const vSnBNB = "0xeffE7874C345aE877c1D893cd5160DDD359b24dA";
export const vHAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";
export const VTOKEN_IMPL = "0xE21251bC79Ee0abebA71FaABDC2Ad36762A0b82F";

export const vip256 = () => {
  const meta = {
    version: "v2",
    title: "VIP-256 Stale Period Configuration for lisUSD and slisBNB",
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
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: VTOKEN_BEACON_SnBNB,
        signature: "upgradeTo(address)",
        params: [TEMP_VTOKEN_IMPL],
      },
      {
        target: vHAY,
        signature: "setName(string)",
        params: ["Venus lisUSD (Stablecoins)"],
      },
      {
        target: vHAY,
        signature: "setSymbol(string)",
        params: ["vlisUSD_Stablecoins"],
      },
      {
        target: vSnBNB,
        signature: "setName(string)",
        params: ["Venus slisBNB (Liquid Staked BNB)"],
      },
      {
        target: vSnBNB,
        signature: "setSymbol(string)",
        params: ["vslisBNB_LiquidStakedBNB"],
      },
      {
        target: VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMPL],
      },
      {
        target: VTOKEN_BEACON_SnBNB,
        signature: "upgradeTo(address)",
        params: [VTOKEN_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip256;
