import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { createEmodePool, generateEmodePoolCommands, makeUSDCMarketConfig, makeUSDTMarketConfig } from "./common";

export const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
export const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const usdtConfig = makeUSDTMarketConfig(vUSDT);
const usdcConfig = makeUSDCMarketConfig(vUSDC);

export { vUSDT, vUSDC };

export const EMODE_POOLS = [
  createEmodePool("LTC", 11, "vLTC", vLTC, "0.63", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("FIL", 12, "vFIL", vFIL, "0.63", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("TRX", 13, "vTRX", vTRX, "0.525", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("DOT", 14, "vDOT", vDOT, "0.65", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
  createEmodePool("THE", 15, "vTHE", vTHE, "0.53", { usdtMarketConfig: usdtConfig, usdcMarketConfig: usdcConfig }),
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

  const { bscmainnet } = NETWORK_ADDRESSES;
  return makeProposal(
    EMODE_POOLS.flatMap(pool => generateEmodePoolCommands(pool, bscmainnet.UNITROLLER)),
    meta,
    ProposalType.REGULAR,
  );
};
