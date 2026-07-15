// VIP-665 — ACM maintenance cleanup on all mainnets:
//   1. syncCash() normalized to the wildcard (address(0)) convention used by every other vToken setter.
//   2. Stale/dangling grants on removed setters and retired contracts.
//   3. Redundant target-specific grants shadowed by an identical wildcard grant (behavior-preserving).
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import type { Permission } from "../utils/commands";
import { RemoteChain } from "./criticalChanges";
import { BNB_GUARDIANS, REDUNDANT_CONTRACTS as CONTRACTS, RETIRED, SYNC_CASH_MARKETS, ZERO } from "./addresses";

const { bscmainnet } = NETWORK_ADDRESSES;

// ===================================================================================================
// 1. syncCash() wildcard normalization (remote chains)
// ===================================================================================================
export const SYNC_CASH_SIG = "syncCash()";

// The single wildcard grant: syncCash() on address(0) → NormalTimelock.
export const syncCashGrants = (chain: RemoteChain): Permission[] => {
  const normalTimelock = (NETWORK_ADDRESSES[chain] as Record<string, string>).NORMAL_TIMELOCK;
  return [{ contractAddress: ZERO, functionSig: SYNC_CASH_SIG, account: normalTimelock }];
};

// The per-market revokes: syncCash() → NormalTimelock, one per market.
export const syncCashRevokes = (chain: RemoteChain): Permission[] => {
  const normalTimelock = (NETWORK_ADDRESSES[chain] as Record<string, string>).NORMAL_TIMELOCK;
  return SYNC_CASH_MARKETS[chain].map(market => ({
    contractAddress: market,
    functionSig: SYNC_CASH_SIG,
    account: normalTimelock,
  }));
};

// ===================================================================================================
// 2. Stale / dangling grants (bscmainnet)
// ===================================================================================================
const NORMAL = bscmainnet.NORMAL_TIMELOCK;
const FASTTRACK = bscmainnet.FAST_TRACK_TIMELOCK;
const CRITICAL = bscmainnet.CRITICAL_TIMELOCK;
const G1 = BNB_GUARDIANS.guardian1;
const G2 = BNB_GUARDIANS.guardian2;
const G3 = BNB_GUARDIANS.guardian3;
const RISK_FUND_V2 = RETIRED.RiskFundV2;
const UNITROLLER = RETIRED.Unitroller;
const RETIRED_RISK_CONFIG = RETIRED.RiskConfig;
const RETIRED_RISK_STEWARD = RETIRED.RiskSteward;
const RETIRED_TWAP_ORACLE = RETIRED.TwapOracle;

// target = contract the permission is scoped to (ZERO = wildcard); signature = function signature;
// revokeFrom = grantees to drop it from.
export const STALE_ROWS: { target: string; signature: string; revokeFrom: string[] }[] = [
  // Removed setter — the current RiskFundV2 implementation no longer has this function.
  {
    target: RISK_FUND_V2,
    signature: "sweepTokenFromPool(address,address,address,uint256)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL],
  },
  // Legacy 2-arg setter; Guardian 1 already holds the current 3/4-arg setters.
  { target: UNITROLLER, signature: "_setCollateralFactor(address,uint256)", revokeFrom: [G1] },
  // Retired risk-config contract — dangling target grants. Holders confirmed on-chain:
  // pause/unpause held by Normal+FastTrack+Critical+G2; setRiskParameterConfig only by Normal;
  // toggleConfigActive by Normal+FastTrack+Critical (not G2).
  { target: RETIRED_RISK_CONFIG, signature: "pause()", revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G2] },
  { target: RETIRED_RISK_CONFIG, signature: "unpause()", revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G2] },
  { target: RETIRED_RISK_CONFIG, signature: "setRiskParameterConfig(string,address,uint256)", revokeFrom: [NORMAL] },
  { target: RETIRED_RISK_CONFIG, signature: "toggleConfigActive(string)", revokeFrom: [NORMAL, FASTTRACK, CRITICAL] },
  // Retired risk steward — dangling target grant.
  { target: RETIRED_RISK_STEWARD, signature: "setMaxDeltaBps(uint256)", revokeFrom: [NORMAL, FASTTRACK, CRITICAL] },
  // Retired oracle — dangling target grant.
  {
    target: RETIRED_TWAP_ORACLE,
    signature: "setTokenConfig(TokenConfig)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL, G3],
  },
];

// Retired risk steward still holds live wildcard cap powers as a grantee. On the legacy BNB ACM these
// wildcard grants must be cleared with a direct ACM.revokeRole (see legacyWildcardRole in utils/commands.ts).
export const CLEANUP_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  { signature: "setMarketBorrowCaps(address[],uint256[])", account: RETIRED_RISK_STEWARD },
  { signature: "setMarketSupplyCaps(address[],uint256[])", account: RETIRED_RISK_STEWARD },
];

// ===================================================================================================
// 3. Redundant target-specific grants shadowed by an identical wildcard grant
// ===================================================================================================
export type RedundantChain =
  | "bscmainnet"
  | "ethereum"
  | "arbitrumone"
  | "basemainnet"
  | "opmainnet"
  | "unichainmainnet"
  | "zksyncmainnet"
  | "opbnbmainnet";

// Timelocks / guardians per chain, keyed by networkAddresses (cast for uniform string access).
const na = NETWORK_ADDRESSES as unknown as Record<RedundantChain, Record<string, string>>;

// A single target-specific grant to revoke.
export interface RedundantRevoke {
  contract: string;
  signature: string;
  account: string;
}

// The 75 redundant target-specific grants, per chain.
export const REDUNDANT_REVOKES: Record<RedundantChain, RedundantRevoke[]> = {
  bscmainnet: [
    {
      contract: CONTRACTS.bscmainnet.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.PrimeLeaderboard,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.PrimeV2,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      account: na.bscmainnet.FAST_TRACK_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      account: na.bscmainnet.CRITICAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "setCollateralFactor(address,uint256,uint256)",
      account: na.bscmainnet.CRITICAL_GUARDIAN,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "unlistMarket(address)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "unlistMarket(address)",
      account: na.bscmainnet.FAST_TRACK_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "unlistMarket(address)",
      account: na.bscmainnet.CRITICAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.Unitroller,
      signature: "unlistMarket(address)",
      account: na.bscmainnet.GUARDIAN,
    },
    {
      contract: CONTRACTS.bscmainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.vUNI,
      signature: "_setReserveFactor(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.bscmainnet.vUNI,
      signature: "setReduceReservesBlockDelta(uint256)",
      account: na.bscmainnet.NORMAL_TIMELOCK,
    },
  ],
  ethereum: [
    {
      contract: CONTRACTS.ethereum.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.ethereum.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.ethereum.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.ethereum.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.ethereum.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.ethereum.NORMAL_TIMELOCK,
    },
  ],
  arbitrumone: [
    {
      contract: CONTRACTS.arbitrumone.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.arbitrumone.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.arbitrumone.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.arbitrumone.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.arbitrumone.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.arbitrumone.NORMAL_TIMELOCK,
    },
  ],
  basemainnet: [
    {
      contract: CONTRACTS.basemainnet.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.basemainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.basemainnet.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.basemainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.basemainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.basemainnet.NORMAL_TIMELOCK,
    },
  ],
  opmainnet: [
    {
      contract: CONTRACTS.opmainnet.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.opmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.opmainnet.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.opmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.opmainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.opmainnet.NORMAL_TIMELOCK,
    },
  ],
  unichainmainnet: [
    {
      contract: CONTRACTS.unichainmainnet.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.unichainmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.unichainmainnet.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.unichainmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.unichainmainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.unichainmainnet.NORMAL_TIMELOCK,
    },
  ],
  zksyncmainnet: [
    {
      contract: CONTRACTS.zksyncmainnet.Prime,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.zksyncmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.zksyncmainnet.PrimeLiquidityProvider,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.zksyncmainnet.NORMAL_TIMELOCK,
    },
    {
      contract: CONTRACTS.zksyncmainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.zksyncmainnet.NORMAL_TIMELOCK,
    },
  ],
  opbnbmainnet: [
    {
      contract: CONTRACTS.opbnbmainnet.VenusERC4626Factory,
      signature: "setMaxLoopsLimit(uint256)",
      account: na.opbnbmainnet.NORMAL_TIMELOCK,
    },
  ],
};
