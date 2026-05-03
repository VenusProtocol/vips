import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "./addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "./addresses/basemainnet";
import { ETHEREUM_CONFIG } from "./addresses/ethereum";

export type OracleType = "uniswap" | "curve" | "aerodrome";

export interface MonitoredMarket {
  symbol: string;
  token: string;
  pool: string;
  deviationPercent: number;
  // Defaults to "uniswap" for the existing UniswapOracle path. "curve" routes through
  // CurveOracle and requires coinIndex + refCoinIndex + referenceToken + assetDecimals;
  // "aerodrome" routes through AerodromeSlipstreamOracle and uses the Uniswap-shaped (token, pool) signature.
  oracleType?: OracleType;
  // Curve-only: coins() index of the priced asset in the StableSwap-NG pool.
  coinIndex?: number;
  // Curve-only: coins() index of the reference asset (whose USD price ResilientOracle supplies).
  refCoinIndex?: number;
  // Curve-only: address of the reference asset.
  referenceToken?: string;
  // Curve-only: decimals of the priced asset (used to scale get_dy() output).
  assetDecimals?: number;
}

export interface ChainConfig {
  name: string;
  dstChainId: number;
  acm: string;
  guardian: string;
  normalTimelock: string;
  fastTrackTimelock: string;
  criticalTimelock: string;
  comptroller: string;
  deviationSentinel: string;
  eBrake: string;
  sentinelOracle: string;
  uniswapOracle: string;
  // Optional, per-chain DEX oracles. Present only on chains that need them; bootstrap
  // permissions + ownership transfer are conditionally added when set.
  curveOracle?: string;
  aerodromeOracle?: string;
  multisigPauser: string;
  keeper: string;
  monitoredMarkets: MonitoredMarket[];
}

export const governanceAccounts = (cfg: ChainConfig): string[] => [
  cfg.guardian,
  cfg.normalTimelock,
  cfg.fastTrackTimelock,
  cfg.criticalTimelock,
];

const NETWORKS: ChainConfig[] = [ETHEREUM_CONFIG, ARBITRUMONE_CONFIG, BASEMAINNET_CONFIG];

// setTokenConfig uses the struct-tuple form (uint8,bool), matching DeviationSentinel.sol.
export const SENTINEL_ADMIN_PERMS = [
  "setTrustedKeeper(address,bool)",
  "setTokenConfig(address,(uint8,bool))",
  "setTokenMonitoringEnabled(address,bool)",
];

// SentinelOracle access-controlled functions
export const SENTINEL_ORACLE_ADMIN_PERMS = ["setTokenOracleConfig(address,address)", "setDirectPrice(address,uint256)"];

// UniswapOracle access-controlled functions
export const UNISWAP_ORACLE_ADMIN_PERMS = ["setPoolConfig(address,address)"];

// CurveOracle access-controlled functions — distinct setPoolConfig signature
// (StableSwap-NG needs coinIndex + refCoinIndex + referenceToken + assetDecimals in addition to token + pool).
export const CURVE_ORACLE_ADMIN_PERMS = ["setPoolConfig(address,address,uint8,uint8,address,uint8)"];

// AerodromeSlipstreamOracle access-controlled functions — same shape as UniswapOracle.
export const AERODROME_ORACLE_ADMIN_PERMS = ["setPoolConfig(address,address)"];

// IL Comptroller permissions for EBrake.
// setActionsPaused uses uint256[] (not uint8[]) in the IL Comptroller.
export const EBRAKE_COMPTROLLER_PERMS_IL = [
  "setActionsPaused(address[],uint256[],bool)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
];

// Granular snapshot-reset functions governance Timelocks and Guardian can call on EBrake.
export const RESET_PERMS = [
  "resetCFSnapshot(address)",
  "resetBorrowCapSnapshot(address)",
  "resetSupplyCapSnapshot(address)",
];

// EBrake functions DeviationSentinel.handleDeviation invokes (single-arg decreaseCF
// is the IL-supported form).
export const SENTINEL_EBRAKE_PERMS = ["pauseBorrow(address)", "pauseSupply(address)", "decreaseCF(address,uint256)"];

// IL-supported subset of EBrake action functions granted to governance + multisig.
// Excludes: pauseFlashLoan(), disablePoolBorrow(uint96,address),
// revokeFlashLoanAccess(address), decreaseCF(address,uint96,uint256) — all revert
// on isIsolatedPool=true (they target Diamond-only Comptroller methods).
export const GOVERNANCE_EBRAKE_PERMS_IL = [
  "pauseSupply(address)",
  "pauseRedeem(address)",
  "pauseBorrow(address)",
  "pauseTransfer(address)",
  "pauseActions(address[],uint8[])",
  "setMarketBorrowCaps(address[],uint256[])",
  "setMarketSupplyCaps(address[],uint256[])",
  "decreaseCF(address,uint256)",
];

// Diamond-only EBrake fns deliberately NOT granted on IL chains (would revert).
export const DIAMOND_ONLY_EBRAKE_PERMS = [
  "pauseFlashLoan()",
  "disablePoolBorrow(uint96,address)",
  "revokeFlashLoanAccess(address)",
  "decreaseCF(address,uint96,uint256)",
];

export const grant = (acm: string, contract: string, sig: string, account: string, dstChainId: number) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
  dstChainId,
});

// VIP-616 (Sub-A): bootstrap + permissions. Kept under each chain's block gas
// limit by deferring governance EBrake action grants and market wiring to VIP-617.
// Per-chain command count varies with the optional CurveOracle (Ethereum) and
// AerodromeSlipstreamOracle (Base): each adds 1 acceptOwnership + 4 admin grants.
//   - Ethereum: 60 + 5 (CurveOracle)            = 65
//   - Arbitrum: 60                              = 60
//   - Base:     60 + 5 (AerodromeSlipstream)    = 65
const buildChainCommandsA = (cfg: ChainConfig): Command[] => {
  const { acm, dstChainId } = cfg;
  const govAccounts = governanceAccounts(cfg);
  const trustedKeeperAccounts = [cfg.keeper, ...govAccounts];

  const ownershipTargets: string[] = [cfg.deviationSentinel, cfg.sentinelOracle, cfg.uniswapOracle, cfg.eBrake];
  if (cfg.curveOracle) ownershipTargets.push(cfg.curveOracle);
  if (cfg.aerodromeOracle) ownershipTargets.push(cfg.aerodromeOracle);

  return [
    // 1. Accept ownership of the newly deployed contracts. The deployer transfers
    //    ownership to the local Normal Timelock prior to this VIP. Always 4 (the
    //    base stack); +1 each for CurveOracle / AerodromeSlipstreamOracle when present.
    ...ownershipTargets.map(target => ({
      target,
      signature: "acceptOwnership()",
      params: [],
      dstChainId,
    })),

    // 2. Grant Guardian + governance Timelocks admin permissions on DeviationSentinel
    ...govAccounts.flatMap(account =>
      SENTINEL_ADMIN_PERMS.map(sig => grant(acm, cfg.deviationSentinel, sig, account, dstChainId)),
    ),

    // 3. Grant Guardian + governance Timelocks admin permissions on SentinelOracle
    ...govAccounts.flatMap(account =>
      SENTINEL_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.sentinelOracle, sig, account, dstChainId)),
    ),

    // 4. Grant Guardian + governance Timelocks admin permission on UniswapOracle
    ...govAccounts.flatMap(account =>
      UNISWAP_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.uniswapOracle, sig, account, dstChainId)),
    ),

    // 4b. Grant Guardian + governance Timelocks admin permission on CurveOracle (when present)
    ...(cfg.curveOracle
      ? govAccounts.flatMap(account =>
          CURVE_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.curveOracle as string, sig, account, dstChainId)),
        )
      : []),

    // 4c. Grant Guardian + governance Timelocks admin permission on AerodromeSlipstreamOracle (when present)
    ...(cfg.aerodromeOracle
      ? govAccounts.flatMap(account =>
          AERODROME_ORACLE_ADMIN_PERMS.map(sig => grant(acm, cfg.aerodromeOracle as string, sig, account, dstChainId)),
        )
      : []),

    // 5. Grant EBrake the IL-Comptroller-supported emergency-action permissions
    ...EBRAKE_COMPTROLLER_PERMS_IL.map(sig => grant(acm, cfg.comptroller, sig, cfg.eBrake, dstChainId)),

    // 6. Grant Guardian + governance Timelocks granular snapshot-reset perms on EBrake
    ...govAccounts.flatMap(account => RESET_PERMS.map(sig => grant(acm, cfg.eBrake, sig, account, dstChainId))),

    // 7. Grant DeviationSentinel the three EBrake actions handleDeviation invokes
    ...SENTINEL_EBRAKE_PERMS.map(sig => grant(acm, cfg.eBrake, sig, cfg.deviationSentinel, dstChainId)),

    // 8. Grant the per-chain 1-of-1 Multisig Pauser the IL-supported EBrake action
    //    functions, so the Venus team can manually trigger emergency actions during
    //    the early operational phase (mirror of VIP-610 step 7).
    ...GOVERNANCE_EBRAKE_PERMS_IL.map(sig => grant(acm, cfg.eBrake, sig, cfg.multisigPauser, dstChainId)),

    // 9. Whitelist Keeper + Guardian + governance Timelocks as trusted keepers on
    //    DeviationSentinel so VIPs (and the off-chain keeper) can invoke handleDeviation.
    ...trustedKeeperAccounts.map(account => ({
      target: cfg.deviationSentinel,
      signature: "setTrustedKeeper(address,bool)",
      params: [account, true],
      dstChainId,
    })),
  ];
};

export const vip616 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-616 [Ethereum, Arbitrum One, Base] Configure DeviationSentinel + EBrakeV2 — Bootstrap & Permissions (1/2)",
    description: `#### Context

Deploys the DeviationSentinel + EBrakeV2 stack on the three non-BSC chains — the same oracle-manipulation protection layer that's been running on BSC since VIP-590 / VIP-610. This VIP accepts ownership of the newly deployed contracts and wires up the permissions between Sentinel, EBrake, the IL Comptroller, governance, and the Multisig Pauser. The actual market monitoring is turned on in VIP-617.

#### Per-chain Actions (×3 chains)

For each chain, the VIP performs the following 7 steps:

1. **Accept ownership** of the newly deployed contracts: DeviationSentinel, SentinelOracle, UniswapOracle, EBrake (+ CurveOracle on Ethereum, + AerodromeSlipstreamOracle on Base).
2. **Grant admin perms** to Guardian + 3 Timelocks (Normal / Fast-track / Critical) on each oracle and the DeviationSentinel — so governance can update pool configs and monitoring settings.
3. **Authorize EBrake → IL Comptroller** for the 4 emergency action types (pause, collateral factor, borrow cap, supply cap).
4. **Grant snapshot-reset perms on EBrake** to Guardian + 3 Timelocks — so governance can restore market config after a brake event fires.
5. **Authorize DeviationSentinel → EBrake** for the 3 actions Sentinel auto-invokes when a deviation triggers (pause borrow, pause supply, decrease CF).
6. **Grant the Multisig Pauser the 8 IL-supported EBrake actions** — manual emergency control during the early operational phase.
7. **Whitelist trusted keepers** on DeviationSentinel — the off-chain keeper + Guardian + 3 Timelocks.

#### References

- [VIP-590 (BSC)](https://app.venus.io/governance/proposal/590)
- [VIP-610 (BSC)](https://app.venus.io/governance/proposal/610)
- [Original Proposal: Emergency Brake — Price Deviation Safeguard Mechanism](https://community.venus.io/t/proposal-emergency-brake-price-deviation-safeguard-mechanism/5668)
- [GitHub PR](https://github.com/VenusProtocol/vips/pull/702)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(NETWORKS.flatMap(buildChainCommandsA), meta, ProposalType.REGULAR);
};

export default vip616;
