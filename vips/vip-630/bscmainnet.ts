import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet } = NETWORK_ADDRESSES;

// Core Pool vToken addresses for migrated assets (from vip-587 part 1)
export const vLINK = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
export const vUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
export const vAAVE = "0x26DA28954763B92139ED49283625ceCAf52C6f94";
export const vDOGE = "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71";
export const vBCH = "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176";
export const vTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const vADA = "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec";

// Core Pool vToken addresses for migrated assets (from vip-588 part 2)
export const vLTC = "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B";
export const vFIL = "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343";
export const vTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
export const vDOT = "0x1610bc33319e9398de5f57B33a5b184c806aD217";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

// TUSD — pausing in Core Pool (no e-mode migration)
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

// Migrated assets — CF and borrow disabled in Core Pool (still active in E-Mode pools)
export const MARKETS_TO_DISABLE = [
  { symbol: "LINK", vToken: vLINK, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "UNI", vToken: vUNI, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "AAVE", vToken: vAAVE, liquidationThreshold: parseUnits("0.55", 18) },
  { symbol: "DOGE", vToken: vDOGE, liquidationThreshold: parseUnits("0.43", 18) },
  { symbol: "BCH", vToken: vBCH, liquidationThreshold: parseUnits("0.6", 18) },
  { symbol: "TWT", vToken: vTWT, liquidationThreshold: parseUnits("0.5", 18) },
  { symbol: "ADA", vToken: vADA, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "LTC", vToken: vLTC, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "FIL", vToken: vFIL, liquidationThreshold: parseUnits("0.63", 18) },
  { symbol: "TRX", vToken: vTRX, liquidationThreshold: parseUnits("0.525", 18) },
  { symbol: "DOT", vToken: vDOT, liquidationThreshold: parseUnits("0.65", 18) },
  { symbol: "THE", vToken: vTHE, liquidationThreshold: parseUnits("0.53", 18) },
];

// TUSD — fully paused in Core Pool (no e-mode migration, safe to pause actions)
export const TUSD_MARKET = { symbol: "TUSD", vToken: vTUSD, liquidationThreshold: parseUnits("0.75", 18) };

export const Actions = {
  MINT: 0,
};

// All markets whose CF and borrow will be disabled
export const ALL_MARKETS = [...MARKETS_TO_DISABLE, TUSD_MARKET];

export const CORE_POOL_ID = 0;

export const vip630 = () => {
  const meta = {
    version: "v2",
    title: "VIP-630 [BNB Chain] Asset Migration from Core Pool to Isolated E-Mode — Phase 2 (Final Switch)",
    description: `## Summary

This VIP executes **Phase 2 (Final Switch)** of the asset migration from the Venus Core Pool to Isolated E-Mode.

In Phase 1 (VIP-587), the following 12 assets were added to Isolated E-Mode pools alongside USDT and USDC, while remaining active in the Core Pool:

- LINK, UNI, AAVE, DOGE, BCH, TWT, ADA (Part 1 — VIP-587)
- LTC, FIL, TRX, DOT, THE (Part 2 - VIP-587)

This VIP completes the migration by disabling these assets in the Core Pool:

- **Set Collateral Factor to 0** in Core Pool for all 12 migrated assets + TUSD
- **Disable borrowing** in Core Pool for all 12 migrated assets + TUSD
- **Pause mint action** for TUSD in the Core Pool (no e-mode migration for TUSD)
- **Liquidation Thresholds remain unchanged** to allow orderly wind-down of existing positions

After this VIP, users must enable Isolated E-Mode to use these assets as collateral or to borrow them. TUSD is fully paused in the Core Pool. Existing Core Pool positions remain unaffected and can be repaid/withdrawn normally.

## References

- [VIP-587: Phase 1](https://github.com/VenusProtocol/vips/pull/661)
- [Community post](https://community.venus.io/t/asset-migration-from-core-pool-to-isolated-e-mode/5648)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Set Collateral Factor to 0 for all markets (keep LT unchanged)
      ...ALL_MARKETS.map(market => ({
        target: bscmainnet.UNITROLLER,
        signature: "setCollateralFactor(uint96,address,uint256,uint256)",
        params: [CORE_POOL_ID, market.vToken, 0, market.liquidationThreshold],
      })),
      // Disable borrowing in Core Pool (pool 0) for all markets
      ...ALL_MARKETS.map(market => ({
        target: bscmainnet.UNITROLLER,
        signature: "setIsBorrowAllowed(uint96,address,bool)",
        params: [CORE_POOL_ID, market.vToken, false],
      })),
      // Pause mint action for TUSD in Core Pool
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vTUSD], [Actions.MINT], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip630;
