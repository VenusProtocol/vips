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

export const vip588 = () => {
  const meta = {
    version: "v2",
    title: "VIP-588 [BNB Chain] The migration of certain assets from the Venus Core Pool to Isolated E-Mode(Part 2)",
    description: `## Summary

This VIP proposes the migration of certain assets from the Venus Core to Isolated E-Mode. Isolated E-Mode is a feature that allows riskier assets to be collateralised and borrowed while leveraging Core Pool liquidity and limiting associated risks.

Assets were selected for migration based on project fundamentals, liquidity, utilisation rate, value to the protocol, and price volatility.

**This proposal will be executed in two separate VIPs. This VIP represents Part 2 of the migration proposal.**

If approved, this VIP will execute **Phase 1 (Buffer Phase)** of the migration:

- Migrate 5 assets to Isolated E-Mode alongside USDT and USDC
- Assets will exist in both Core Pool and Isolated E-Mode simultaneously
- Existing Core Pool positions remain unaffected
- Asset parameters (LTV, LT, supply/borrow caps, collateral cap, IRM) remain unchanged

## Assets Proposed for Migration

- LTC
- FIL
- TRX
- DOT
- THE

## Migration Phases

**Phase 1: Buffer Phase (This VIP)**

- Assets will exist in both Core Pool and Isolated E-Mode simultaneously
- Users may choose to use assets in either mode
- Existing Core Pool positions remain unaffected
- Updates will be communicated via X and Telegram

**Phase 2: Final Switch Phase (Future VIP)**

- Assets will only be usable in Isolated E-Mode (with USDT and USDC)
- Users must enable Isolated E-Mode to use these assets as collateral or borrow
- Existing Core Pool positions remain unaffected

## References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/661/changes#diff-c31ce6dbded7aa36db06a47518f663c2b50f735caf6628c5611fe58c5cb30f5d)
- [Community post](https://community.venus.io/t/asset-migration-from-core-pool-to-isolated-e-mode/5648)`,
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

export default vip588;
