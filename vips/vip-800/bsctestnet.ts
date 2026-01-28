import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { createEmodePool, generateEmodePoolCommands, makeUSDCMarketConfig, makeUSDTMarketConfig } from "./common";

export const vUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";
export const vAAVE = "0x714db6c38A17883964B68a07d56cE331501d9eb6";
export const vDOGE = "0xF912d3001CAf6DC4ADD366A62Cc9115B4303c9A9";
export const vTWT = "0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF";
export const vADA = "0x37C28DE42bA3d22217995D146FC684B2326Ede64";
export const vLTC = "0xAfc13BC065ABeE838540823431055D2ea52eBA52";

const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
const usdtConfig = makeUSDTMarketConfig(vUSDT, "0.8", "0.8");
const usdcConfig = makeUSDCMarketConfig(vUSDC, "0.81", "0.81");

export { vUSDT, vUSDC };

export const EMODE_POOLS = [
  createEmodePool("UNI", 5, "vUNI", vUNI, "0.55", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("AAVE", 6, "vAAVE", vAAVE, "0.55", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("DOGE", 7, "vDOGE", vDOGE, "0.8", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("TWT", 8, "vTWT", vTWT, "0.5", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("ADA", 9, "vADA", vADA, "0.6", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("LTC", 10, "vLTC", vLTC, "0.6", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
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

  const { bsctestnet } = NETWORK_ADDRESSES;
  return makeProposal(
    EMODE_POOLS.flatMap(pool => generateEmodePoolCommands(pool, bsctestnet.UNITROLLER)),
    meta,
    ProposalType.REGULAR,
  );
};
