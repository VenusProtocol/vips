import { Command, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "./addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "./addresses/basemainnet";
import { ETHEREUM_CONFIG } from "./addresses/ethereum";

export interface MonitoredMarket {
  symbol: string;
  token: string;
  pool: string;
  deviationPercent: number;
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

// VIP-666 (Sub-A): bootstrap + permissions. Kept under each chain's block gas
// limit by deferring governance EBrake action grants and market wiring to VIP-667.
// Per-chain command count: 60 (acceptOwnership 4 + admin grants 24 + ebrake→comptroller 4
// + reset 12 + sentinel→ebrake 3 + multisig ebrake action 8 + trusted keepers 5).
const buildChainCommandsA = (cfg: ChainConfig): Command[] => {
  const { acm, dstChainId } = cfg;
  const govAccounts = governanceAccounts(cfg);
  const trustedKeeperAccounts = [cfg.keeper, ...govAccounts];

  return [
    // 1. Accept ownership of the four newly deployed contracts. The deployer
    //    transfers ownership to the local Normal Timelock prior to this VIP.
    ...[cfg.deviationSentinel, cfg.sentinelOracle, cfg.uniswapOracle, cfg.eBrake].map(target => ({
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

export const vip666 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-666 [Ethereum, Arbitrum One, Base] Configure DeviationSentinel + EBrakeV2 — Bootstrap & Permissions (1/2)",
    description: `#### Description

This is the first of two VIPs that configure the **DeviationSentinel** + **EBrakeV2** Emergency Brake stack on **Ethereum**, **Arbitrum One**, and **Base**, mirroring the BSC setup from VIP-590 + VIP-610. Each chain's DeviationSentinel routes automated oracle-deviation enforcement through a local EBrakeV2, which applies per-action, per-market restrictions (pause borrow/supply, zero collateral factor) without manual intervention.

The configuration is split across two VIPs so each per-chain payload fits under the destination chain's block gas limit:

- **VIP-666 (this VIP)** — accept ownership, grant admin/reset/sentinel→ebrake/ebrake→comptroller/multisig permissions, whitelist trusted keepers
- **VIP-667 (follow-up)** — grant Guardian + Timelocks the IL-supported EBrake action permissions, then wire each monitored market on UniswapOracle, SentinelOracle, and DeviationSentinel

Because EBrake on these chains uses \`isIsolatedPool=true\` (single-pool IL Comptroller, not the BSC Diamond), only the IL-supported subset of EBrake action functions is granted. Diamond-only functions (\`pauseFlashLoan\`, \`disablePoolBorrow\`, \`revokeFlashLoanAccess\`, \`decreaseCF(address,uint96,uint256)\`) are omitted as they revert on IL comptrollers.

#### Summary

If approved, this VIP will, for each of Ethereum, Arbitrum One, and Base:

- Accept governance ownership of the **DeviationSentinel**, **SentinelOracle**, **UniswapOracle**, and **EBrakeV2** contracts
- Grant admin permissions on DeviationSentinel, SentinelOracle, and UniswapOracle to Guardian + 3 Timelocks
- Grant **EBrakeV2** the 4 IL-supported Comptroller permissions it needs to execute emergency actions
- Authorize **DeviationSentinel** to call \`pauseBorrow\`, \`pauseSupply\`, and \`decreaseCF\` on EBrake
- Grant **Guardian** and governance **Timelocks** the granular snapshot-reset permissions on EBrake
- Grant the **per-chain 1-of-1 Multisig Pauser** the 8 IL-supported EBrake action functions for manual emergency pausing (Phase 0)
- Whitelist Keeper + Guardian + 3 Timelocks as trusted keepers on DeviationSentinel

**Permission event summary**: 153 PermissionGranted (51 per chain × 3 chains), 0 PermissionRevoked

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

export default vip666;
