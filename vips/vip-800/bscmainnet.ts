import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { createEmodePool, generateEmodePoolCommands, makeUSDCMarketConfig, makeUSDTMarketConfig } from "./common";

export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";

const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const usdtConfig = makeUSDTMarketConfig(vUSDT);
const usdcConfig = makeUSDCMarketConfig(vUSDC);

export { vUSDT, vUSDC };

export const EMODE_POOLS = [
  createEmodePool("LINK", 4, "vLINK", vLINK, "0.63", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("UNI", 5, "vUNI", vUNI, "0.55", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("AAVE", 6, "vAAVE", vAAVE, "0.55", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("DOGE", 7, "vDOGE", vDOGE, "0.43", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("BCH", 8, "vBCH", vBCH, "0.6", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("TWT", 9, "vTWT", vTWT, "0.5", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("ADA", 10, "vADA", vADA, "0.63", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
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

  const { bscmainnet } = NETWORK_ADDRESSES;
  return makeProposal(
    EMODE_POOLS.flatMap(pool => generateEmodePoolCommands(pool, bscmainnet.UNITROLLER)),
    meta,
    ProposalType.REGULAR,
  );
};

export default vip800;
