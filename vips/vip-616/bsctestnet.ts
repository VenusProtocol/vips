import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { SEPOLIA_CONFIG, SEPOLIA_GUARDIAN_OWNER } from "./addresses/sepolia";
import { EBRAKE_COMPTROLLER_PERMS_IL, SENTINEL_EBRAKE_PERMS } from "./bscmainnet";

// ACM `giveCallPermission` command builder. Inlined here because this VIP is
// the only consumer — the mainnet VIP delegates all grants into the
// configurator helper and doesn't need it.
const grant = (acm: string, target: string, signature: string, account: string, dstChainId: LzChainId): Command => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [target, signature, account],
  dstChainId,
});

// Exported for simulation imports.
export const DEPLOYER_SENTINEL_ORACLE_PERMS = ["setDirectPrice(address,uint256)"];
export const DEPLOYER_EBRAKE_PERMS = [
  "resetCFSnapshot(address)",
  "resetBorrowCapSnapshot(address)",
  "resetSupplyCapSnapshot(address)",
];
export const DEPLOYER_COMPTROLLER_PERMS = [
  "setCollateralFactor(address,uint256,uint256)",
  "setActionsPaused(address[],uint256[],bool)",
];

// Minimal single-VIP Sepolia testnet bootstrap for DeviationSentinel + EBrakeV2 E2E testing.
//
// Command count: 3 (ownership) + 2 (normalTimelock DS perms) + 4 (EBrake→Comptroller)
//             + 3 (Sentinel→EBrake) + 2 (trusted keepers) + 6 (deployer extra) + 2 (market config) = 22
//
// 22 × ~411 bytes ≈ 9.2 KB — under the LZ V1 testnet relayer 10 KB payload ceiling.
//
// The broader governance permission set (all 4 gov accounts × every sig) from the mainnet
// split is intentionally omitted: the LZ testnet relayer rejects payloads > ~10 KB, and
// those admin grants are not needed to drive the E2E deviation → pause → reset flow.
export const vip666Sepolia = () => {
  const cfg = SEPOLIA_CONFIG;
  const { acm, dstChainId } = cfg;

  const meta = {
    version: "v2",
    title: "VIP-666 [Sepolia] DeviationSentinel + EBrakeV2 — Minimal E2E Bootstrap",
    description: `#### Summary

One-time Sepolia testnet VIP to wire the **DeviationSentinel** + **EBrakeV2** stack for E2E deviation testing.

Since Sepolia has no live DEX feeds, price deviation is simulated via \`SentinelOracle.setDirectPrice()\`. Only the permissions strictly needed for the E2E test cycle are granted; the full governance admin set from the mainnet VIPs is omitted to stay within the LZ testnet relayer payload limit (~10 KB).

**E2E test cycle after this VIP:**
1. Deployer calls \`SentinelOracle.setDirectPrice(token, artificialPrice)\`
2. Deployer calls \`DeviationSentinel.handleDeviation(vToken)\` as trusted keeper → EBrake pauses the market
3. Deployer calls \`EBrake.resetCFSnapshot / resetBorrowCapSnapshot / resetSupplyCapSnapshot\`
4. Deployer calls \`Comptroller.setCollateralFactor\` / \`setActionsPaused\` to restore state`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // 1. Accept ownership of the three deployed contracts.
      //    UniswapOracle is ZERO_ADDRESS on Sepolia — skip.
      { target: cfg.deviationSentinel, signature: "acceptOwnership()", params: [], dstChainId },
      { target: cfg.sentinelOracle, signature: "acceptOwnership()", params: [], dstChainId },
      { target: cfg.eBrake, signature: "acceptOwnership()", params: [], dstChainId },

      // 2. Grant Normal Timelock the two DeviationSentinel functions it calls later in this VIP.
      //    These grants must precede the setTrustedKeeper and setTokenConfig calls below.
      grant(acm, cfg.deviationSentinel, "setTrustedKeeper(address,bool)", cfg.normalTimelock, dstChainId),
      grant(acm, cfg.deviationSentinel, "setTokenConfig(address,(uint8,bool))", cfg.normalTimelock, dstChainId),

      // 3. Grant EBrake the IL-supported emergency-action permissions on the Comptroller. (4)
      ...EBRAKE_COMPTROLLER_PERMS_IL.map(sig => grant(acm, cfg.comptroller, sig, cfg.eBrake, dstChainId)),

      // 4. Grant DeviationSentinel the three EBrake functions handleDeviation invokes. (3)
      ...SENTINEL_EBRAKE_PERMS.map(sig => grant(acm, cfg.eBrake, sig, cfg.deviationSentinel, dstChainId)),

      // 5. Whitelist trusted keepers. (2)
      //    - SEPOLIA_GUARDIAN_OWNER (deployer EOA): drives the manual E2E test cycle
      //    - cfg.keeper (= on-chain Guardian): standard keeper backup
      {
        target: cfg.deviationSentinel,
        signature: "setTrustedKeeper(address,bool)",
        params: [SEPOLIA_GUARDIAN_OWNER, true],
        dstChainId,
      },
      {
        target: cfg.deviationSentinel,
        signature: "setTrustedKeeper(address,bool)",
        params: [cfg.keeper, true],
        dstChainId,
      },

      // 6. Grant deployer EOA the extra permissions needed to drive the full E2E test cycle. (6)
      ...DEPLOYER_SENTINEL_ORACLE_PERMS.map(sig =>
        grant(acm, cfg.sentinelOracle, sig, SEPOLIA_GUARDIAN_OWNER, dstChainId),
      ),
      ...DEPLOYER_EBRAKE_PERMS.map(sig => grant(acm, cfg.eBrake, sig, SEPOLIA_GUARDIAN_OWNER, dstChainId)),
      ...DEPLOYER_COMPTROLLER_PERMS.map(sig => grant(acm, cfg.comptroller, sig, SEPOLIA_GUARDIAN_OWNER, dstChainId)),

      // 7. Enable deviation monitoring (10% threshold) for WETH and WBTC. (2)
      //    setPoolConfig / setTokenOracleConfig are skipped — no live DEX pools on Sepolia;
      //    prices are injected manually via SentinelOracle.setDirectPrice().
      ...cfg.monitoredMarkets.map(market => ({
        target: cfg.deviationSentinel,
        signature: "setTokenConfig(address,(uint8,bool))",
        params: [market.token, [market.deviationPercent, true]],
        dstChainId,
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip666Sepolia;
