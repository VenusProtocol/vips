import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
export const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
export const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const DEFAULT_PROXY_ADMIN = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";

export const RESILIENT_ORACLE_IMPLEMENTATION = "0xA75688E4F2f9f9a43ccB35ffb0E31376A37c2cAA";
export const BINANCE_ORACLE_IMPLEMENTATION = "0x05CEE4B936C654be43993D3A8Baa76c8fdd5BeCC";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xe630fa259c893D9a1d8b1d61EdFB1B59EF574df4";

export const vip491 = () => {
  const meta = {
    version: "v2",
    title: "",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip491;
