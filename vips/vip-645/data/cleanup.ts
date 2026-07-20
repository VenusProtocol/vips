//   ACM maintenance cleanup on all mainnets:
//   1. syncCash() normalized to the wildcard (address(0)) convention used by every other vToken setter.
//   2. Stale/dangling grants on removed setters and retired contracts.
//   3. Redundant target-specific grants shadowed by an identical wildcard grant (behavior-preserving).
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import type { Permission } from "../utils/commands";
import {
  BNB_GUARDIANS,
  CONTRACTS,
  Chain,
  DEPRECATED_GRANTEES,
  RemoteChain,
  SYNC_CASH_MARKETS,
  ZERO,
} from "./addresses";

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
const { guardian1, guardian2, guardian3 } = BNB_GUARDIANS;

export const STALE_ROWS: { target: string; signature: string; revokeFrom: string[] }[] = [
  // Removed setter — the current RiskFundV2 implementation no longer has this function.
  {
    target: CONTRACTS.bscmainnet.RiskFundV2,
    signature: "sweepTokenFromPool(address,address,address,uint256)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL],
  },
  // Legacy 2-arg setter; Guardian 1 already holds the current 3/4-arg setters.
  {
    target: CONTRACTS.bscmainnet.Unitroller,
    signature: "_setCollateralFactor(address,uint256)",
    revokeFrom: [guardian1],
  },
  // Retired risk-config contract — dangling target grants. Holders confirmed on-chain:
  // pause/unpause held by Normal+FastTrack+Critical+Guardian2; setRiskParameterConfig only by Normal;
  // toggleConfigActive by Normal+FastTrack+Critical (not Guardian2).
  {
    target: CONTRACTS.bscmainnet.RetiredRiskConfig,
    signature: "pause()",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL, guardian2],
  },
  {
    target: CONTRACTS.bscmainnet.RetiredRiskConfig,
    signature: "unpause()",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL, guardian2],
  },
  {
    target: CONTRACTS.bscmainnet.RetiredRiskConfig,
    signature: "setRiskParameterConfig(string,address,uint256)",
    revokeFrom: [NORMAL],
  },
  {
    target: CONTRACTS.bscmainnet.RetiredRiskConfig,
    signature: "toggleConfigActive(string)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL],
  },
  // Retired risk steward — dangling target grant.
  {
    target: CONTRACTS.bscmainnet.RetiredRiskSteward,
    signature: "setMaxDeltaBps(uint256)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL],
  },
  // Retired oracle — dangling target grant.
  {
    target: CONTRACTS.bscmainnet.RetiredTwapOracle,
    signature: "setTokenConfig(TokenConfig)",
    revokeFrom: [NORMAL, FASTTRACK, CRITICAL, guardian3],
  },
  // Deprecated BUSDLiquidator still holds a target-specific pause grant on the core-pool Comptroller.
  {
    target: CONTRACTS.bscmainnet.Unitroller,
    signature: "_setActionsPaused(address[],uint8[],bool)",
    revokeFrom: [DEPRECATED_GRANTEES.BUSDLiquidator],
  },
];

// Wildcard grants on the legacy BNB ACM held by deprecated grantees. These live under the 32-byte wildcard
// role, which the aggregator's revokeCallPermission cannot reach, so they are cleared with a direct
// ACM.revokeRole.
export const CLEANUP_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  // Retired risk steward still holds live wildcard cap powers.
  { signature: "setMarketBorrowCaps(address[],uint256[])", account: CONTRACTS.bscmainnet.RetiredRiskSteward },
  { signature: "setMarketSupplyCaps(address[],uint256[])", account: CONTRACTS.bscmainnet.RetiredRiskSteward },
  // Retired SetCheckpoint deploy contracts still holding wildcard interest-rate-model powers. The core-pool
  // vTokens use _setInterestRateModel(address); the isolated-pool vTokens use setInterestRateModel(address).
  { signature: "_setInterestRateModel(address)", account: DEPRECATED_GRANTEES.SetCheckpoint_Fermi },
  { signature: "_setInterestRateModel(address)", account: DEPRECATED_GRANTEES.SetCheckpoint_LorentzCore },
  { signature: "_setInterestRateModel(address)", account: DEPRECATED_GRANTEES.SetCheckpoint_MaxwellCore },
  { signature: "setInterestRateModel(address)", account: DEPRECATED_GRANTEES.SetCheckpoint_LorentzIsolated },
  { signature: "setInterestRateModel(address)", account: DEPRECATED_GRANTEES.SetCheckpoint_MaxwellIsolated },
];

// ===================================================================================================
// 3. Redundant target-specific grants shadowed by an identical wildcard grant
// ===================================================================================================
// Timelocks / guardians per chain, keyed by networkAddresses (cast for uniform string access).
const na = NETWORK_ADDRESSES as unknown as Record<Chain, Record<string, string>>;

// A single target-specific grant to revoke.
interface RedundantRevoke {
  contract: string;
  signature: string;
  account: string;
}

// The 75 redundant target-specific grants, per chain.
export const REDUNDANT_REVOKES: Record<Chain, RedundantRevoke[]> = {
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
