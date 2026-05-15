import { ZERO_ADDRESS } from "src/networkAddresses";
import { Command, LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ARBITRUMONE_CONFIG } from "./addresses/arbitrumone";
import { BASEMAINNET_CONFIG } from "./addresses/basemainnet";
import { ETHEREUM_CONFIG } from "./addresses/ethereum";

// ---------------------------------------------------------------------------
// Shared types + ACM permission constants. Exported for simulation use; the
// VIP itself only delegates into per-chain DeviationSentinelConfigurator.execute().
// ---------------------------------------------------------------------------

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
  dstChainId: LzChainId;
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
  curveOracle?: string;
  aerodromeOracle?: string;
  multisigPauser: string;
  keeper: string;
  monitoredMarkets: MonitoredMarket[];
  // Per-chain DeviationSentinelConfigurator address. ZERO_ADDRESS until deployed.
  configurator: string;
}

export const governanceAccounts = (cfg: ChainConfig): string[] => [
  cfg.guardian,
  cfg.normalTimelock,
  cfg.fastTrackTimelock,
  cfg.criticalTimelock,
];

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

// Per-chain configs are the single source of truth — see addresses/<chain>.ts.
// Adding a new chain only requires creating an addresses/<chain>.ts and
// extending this array.
const NETWORKS: ChainConfig[] = [ETHEREUM_CONFIG, ARBITRUMONE_CONFIG, BASEMAINNET_CONFIG];

const buildChainCommands = (cfg: ChainConfig): Command[] => {
  if (cfg.configurator === ZERO_ADDRESS) {
    throw new Error(`${cfg.name}: configurator address unset; deploy and update addresses/<chain>.ts.`);
  }

  const { acm, dstChainId, configurator } = cfg;

  const ownershipTargets: string[] = [cfg.deviationSentinel, cfg.sentinelOracle, cfg.uniswapOracle, cfg.eBrake];
  if (cfg.curveOracle) ownershipTargets.push(cfg.curveOracle);
  if (cfg.aerodromeOracle) ownershipTargets.push(cfg.aerodromeOracle);

  return [
    // Accept pending-ownership
    ...ownershipTargets.map(target => ({
      target,
      signature: "acceptOwnership()",
      params: [],
      dstChainId,
    })),

    // Grant DEFAULT_ADMIN_ROLE on the local ACM so execute() can call giveCallPermission /
    // revokeCallPermission (both internally call grantRole / revokeRole, which require
    // DEFAULT_ADMIN_ROLE per OZ AccessControl). The configurator renounces this role at the
    // very end of execute() via _selfRevokeACMPermissions().
    {
      target: acm,
      signature: "grantRole(bytes32,address)",
      params: ["0x0000000000000000000000000000000000000000000000000000000000000000", configurator],
      dstChainId,
    },

    // Apply all grants + market wiring atomically. See DeviationSentinelConfigurator.execute().
    {
      target: configurator,
      signature: "execute()",
      params: [],
      dstChainId,
    },
  ];
};

export const vip616 = () => {
  const meta = {
    version: "v2",
    title: "VIP-616 [Ethereum, Arbitrum One, Base] Configure DeviationSentinel + EBrakeV2",
    description: `#### Description

This VIP configures the **DeviationSentinel** + **EBrakeV2** Emergency Brake stack on **Ethereum**, **Arbitrum One**, and **Base**, mirroring the BSC setup from VIP-590 + VIP-610. Each chain's DeviationSentinel routes automated oracle-deviation enforcement through a local EBrakeV2, which applies per-action, per-market restrictions (pause borrow/supply, zero collateral factor) without manual intervention.

The full bootstrap — ownership transfer, ACM grants for Guardian + 3 Timelocks, EBrake action permissions, multisig-pauser permissions, trusted-keeper whitelisting, and per-market deviation wiring across UniswapOracle / CurveOracle / AerodromeSlipstreamOracle — is encoded inside a per-chain **DeviationSentinelConfigurator** contract deployed to venus-periphery.

The on-chain VIP needs only to (1) accept ownership of the periphery contracts, (2) grant the configurator \`DEFAULT_ADMIN_ROLE\` on the local ACM (required by OZ \`grantRole\` / \`revokeRole\`, which both \`giveCallPermission\` and \`revokeCallPermission\` wrap internally), and (3) call \`configurator.execute()\`. The configurator applies every grant and wiring atomically, then renounces \`DEFAULT_ADMIN_ROLE\` at the very end, so it retires permanently in a single transaction with no follow-up cleanup VIP required.

This packaging keeps the cross-chain payload tiny — well under LayerZero V1's RelayerV2 payload-size ceiling — without splitting the bootstrap across multiple VIPs.

In addition to UniswapOracle, two extra DEX oracles are bootstrapped on the chains that need them:

- **CurveOracle (Ethereum only)** — prices eBTC against WBTC via \`get_dy\` on the eBTC/WBTC Curve StableSwap-NG pool, which the existing UniswapOracle can't read (StableSwap-NG isn't Uniswap V3 ABI-compatible).
- **AerodromeSlipstreamOracle (Base only)** — prices cbBTC and wstETH on the most liquid Aerodrome Slipstream pools (cbBTC/USDC and wstETH/WETH). Aerodrome Slipstream's \`slot0()\` returns a 6-tuple (no \`feeProtocol\`) so the Solidity decoder reverts when read against the Uniswap V3 7-tuple ABI used by UniswapOracle.

Because EBrake on these chains uses \`isIsolatedPool=true\` (single-pool IL Comptroller, not the BSC Diamond), only the IL-supported subset of EBrake action functions is granted. Diamond-only functions (\`pauseFlashLoan\`, \`disablePoolBorrow\`, \`revokeFlashLoanAccess\`, \`decreaseCF(address,uint96,uint256)\`) are omitted as they revert on IL comptrollers.

#### Summary

If approved, this VIP will, for each of Ethereum, Arbitrum One, and Base:

- Accept governance ownership of **DeviationSentinel**, **SentinelOracle**, **UniswapOracle**, and **EBrakeV2** (plus **CurveOracle** on Ethereum and **AerodromeSlipstreamOracle** on Base)
- Grant the per-chain **DeviationSentinelConfigurator** \`DEFAULT_ADMIN_ROLE\` on the local ACM so \`execute()\` can call \`giveCallPermission\` / \`revokeCallPermission\` (both wrap OZ \`grantRole\` / \`revokeRole\`, which require that role). The configurator renounces \`DEFAULT_ADMIN_ROLE\` at the end of \`execute()\` so it retires permanently.
- Invoke \`configurator.execute()\`, which atomically applies all admin grants, EBrake permissions, multisig-pauser permissions, trusted-keeper whitelisting, and per-market deviation wiring at the unified 10% threshold (10 markets on Ethereum, 5 on Arbitrum One, 4 on Base) — and renounces its own \`DEFAULT_ADMIN_ROLE\` at the end

#### References

- [VIP-590 (BSC)](https://app.venus.io/governance/proposal/590)
- [VIP-610 (BSC)](https://app.venus.io/governance/proposal/610)
- [Original Proposal: Emergency Brake — Price Deviation Safeguard Mechanism](https://community.venus.io/t/proposal-emergency-brake-price-deviation-safeguard-mechanism/5668)
- [GitHub PR](https://github.com/VenusProtocol/vips/pull/702)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(NETWORKS.flatMap(buildChainCommands), meta, ProposalType.REGULAR);
};

export default vip616;
