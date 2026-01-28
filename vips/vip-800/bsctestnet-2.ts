import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { createEmodePool, generateEmodePoolCommands, makeUSDCMarketConfig, makeUSDTMarketConfig } from "./common";

export const vMATIC = "0x3619bdDc61189F33365CC572DF3a68FB3b316516";
export const vTRX = "0x6AF3Fdb3282c5bb6926269Db10837fa8Aec67C04";
export const vTHE = "0x39A239F5117BFaC7a1b0b3A517c454113323451d";

const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
const usdtConfig = makeUSDTMarketConfig(vUSDT, "0.8", "0.8");
const usdcConfig = makeUSDCMarketConfig(vUSDC, "0.81", "0.81");

export { vUSDT, vUSDC };

export const EMODE_POOLS = [
  // createEmodePool("MATIC", 11, "vMATIC", vMATIC, "0.6", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }), // commented due to oracle issue
  createEmodePool("TRX", 11, "vTRX", vTRX, "0.6", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("THE", 12, "vTHE", vTHE, "0.53", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
];

export const vip800 = () => {
  const meta = {
    version: "v2",
    title: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
    description: "VIP-800 [BNB Chain] Asset Migration from BNB core pool to isolated Emode pools (TRX, THE)",
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
