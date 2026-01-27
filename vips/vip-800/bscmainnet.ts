import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { createEmodePool, generateEmodePoolCommands, vUSDC, vUSDT } from "./common";

export { vUSDC, vUSDT };

export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";

export const EMODE_POOLS = [
  createEmodePool("LINK", 4, "vLINK", vLINK, "0.63"),
  createEmodePool("UNI", 5, "vUNI", vUNI, "0.55"),
  createEmodePool("AAVE", 6, "vAAVE", vAAVE, "0.55"),
  createEmodePool("DOGE", 7, "vDOGE", vDOGE, "0.43"),
  createEmodePool("BCH", 8, "vBCH", vBCH, "0.6"),
  createEmodePool("TWT", 9, "vTWT", vTWT, "0.5"),
  createEmodePool("ADA", 10, "vADA", vADA, "0.63"),
];

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools",
    description: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(EMODE_POOLS.flatMap(generateEmodePoolCommands), meta, ProposalType.REGULAR);
};
