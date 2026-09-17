import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool, PHASE 1 address book and market table.
//
// Phase 1 covers the spoke pool side only (isolated-pools#559), plus the multi-registry
// ProtocolShareReserve upgrade (protocol-reserve#168) that has to ride the same proposal. The
// Liquidity Hub wiring (venus-liquidity-hub#22), the bStock liquidation leg (venus-protocol#707) and
// `HubRouter` (venus-liquidity-hub#24) are Phase 2 and have no addresses here on purpose.
//
// ---------------------------------------------------------------------------------------------------
// STATUS: NOT ADDRESS-COMPLETE, AND NOT PARAMETER-COMPLETE.
//
// Two things do not exist on this chain yet, and both are gates in the shipment plan rather than in
// this VIP:
//   1. The spoke stack. `helpers/spokeDeploymentConfig.ts` in isolated-pools has `hardhat` and
//      `bsctestnet` entries only, so `yarn hardhat deploy --network bscmainnet --tags HubSpoke` logs
//      and returns without deploying anything. Every `PENDING` address below is filled by that run.
//   2. The multi-registry `ProtocolShareReserve` implementation.
//
// Every risk parameter is likewise unset. They are the same values that have to be written into
// `spokeDeploymentConfig.ts` before the deployment, so the listing matches what was deployed rather
// than being a second opinion about it.
//
// Nothing here is a default that quietly works. `PENDING` and `null` both fail loudly: the `need` and
// `deployed` collectors in ../bscmainnet.ts gather every one that survives and throw with the full
// list, so the proposal cannot be built, simulated or proposed half-filled.
//
// ---------------------------------------------------------------------------------------------------
// WHAT IS REAL: every address in the "already on chain" section was read back from bscmainnet on
// 2026-09-17, not taken from a deployment record alone.
// ===================================================================================================

/// Sentinel for an address that does not exist on bscmainnet yet. The zero address is used
/// deliberately: if the guard in ../bscmainnet.ts were ever removed, `ensureNonzeroAddress` and
/// `addPool`'s own oracle check would still reject it on chain rather than accept it as a value.
export const PENDING = "0x0000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------------------------------
// Already on chain.
// ---------------------------------------------------------------------------------------------------

const {
  ACCESS_CONTROL_MANAGER,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  GUARDIAN,
  NORMAL_TIMELOCK,
  RESILIENT_ORACLE,
  VTREASURY,
} = NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY };

/// The isolated-pools registry. Referenced only to make the contrast explicit: this pool is NOT listed
/// here, and the wildcard ACM grants this address holds name it as the account, so none of them carry
/// over to the spoke registry. That is what the six registry grants in this VIP are for.
export const ISOLATED_POOL_REGISTRY = NETWORK_ADDRESSES.bscmainnet.POOL_REGISTRY;

/// Prices borrow, redeem, transfer and exit-market: collateral at the low end of its recent window,
/// debt at the high end, while protection is active. Keyed on the UNDERLYING, so the spoke markets
/// inherit whatever their underlying already carries.
///
/// Its immutable `RESILIENT_ORACLE` reads back as the address above, so the two are already paired.
/// Owner is the Normal Timelock.
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";

/// Income destination. Holds one pool registry today and 18 distribution targets.
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

/// The transparent-proxy admin both protocol-reserve and isolated-pools upgrade through on this chain.
/// Read from the EIP-1967 admin slot of the ProtocolShareReserve proxy, and its `owner()` is the
/// Normal Timelock, so the upgrade in this VIP needs no ACM grant.
export const DEFAULT_PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";

// ---------------------------------------------------------------------------------------------------
// TODO(deploy): the spoke stack. isolated-pools deploy/024 through deploy/028.
//
// Fill each of these from the deployment, then re-read them from chain before the proposal is opened.
// `028-deploy-spoke-vtokens.ts` refuses to run if the comptroller does not read back the registry, so
// a mismatch between the first two is caught at deploy time rather than here.
// ---------------------------------------------------------------------------------------------------

/// `SpokePoolRegistry`, a second `PoolRegistry` instance behind the chain's DefaultProxyAdmin, so the
/// spoke pool stays out of the directory the indexer, the frontend pool list and the risk tooling all
/// iterate. `024` is Ownable2Step and only nominates, so `acceptOwnership()` comes first in the VIP.
export const SPOKE_POOL_REGISTRY = PENDING;

/// `Comptroller_HubSpoke`, a BeaconProxy over SpokeComptrollerBeacon. Ownable2Step, nominated only.
///
/// Its `poolRegistry()` is a CONSTRUCTOR IMMUTABLE with no setter, and `supportMarket` checks it. A
/// value that does not equal SPOKE_POOL_REGISTRY can only be fixed by redeploying the implementation
/// and re-pointing the beacon. Nothing in this VIP can correct it.
export const SPOKE_COMPTROLLER = PENDING;

/// Reference only. `UpgradeableBeacon` is plain `Ownable` and `027` hands both over to the Normal
/// Timelock inside the deploy transaction, so this VIP has no command for either.
export const SPOKE_COMPTROLLER_BEACON = PENDING;
export const SPOKE_VTOKEN_BEACON = PENDING;

/// Reference only. The lens holds no state, has no owner and no AccessControlManager, takes the
/// registry to read as a call argument, and nothing on chain stores its address, so it needs no
/// command in this or any VIP.
export const SPOKE_POOL_LENS = PENDING;

/// TODO(deploy): the multi-registry `ProtocolShareReserve` implementation from protocol-reserve#168.
/// Not deployed on bscmainnet.
///
/// Before filling this in, verify against the deployed bytecode that `addPoolRegistry`,
/// `removePoolRegistry`, `getPoolRegistries` and `isMarketRegistered` are all present, and that every
/// constructor immutable matches the implementation in use today. An immutable that drifted here would
/// silently break the core-pool bypass in `updateAssetsState`.
export const PROTOCOL_SHARE_RESERVE_IMPL = PENDING;

// ---------------------------------------------------------------------------------------------------
// Underlyings. All five are live Core markets on this chain, so each already has a working
// ResilientOracle feed, and all five are 18 decimals. The vTokens are 8, as everywhere.
// ---------------------------------------------------------------------------------------------------

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const TSLAB = "0x5b1910eAaD6450E50f816082Aa078C41F10C292f";
export const NVDAB = "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436";
export const SPCXB = "0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1";
export const SKHYB = "0xCA750eF65f295BBECd685Abf54e82CAf297BDB61";

// ---------------------------------------------------------------------------------------------------
// Pool-level parameters.
//
// TODO(risk): every value marked `null`. These are deployment input as well as VIP input: the same
// numbers go into the `bscmainnet` entry of `helpers/spokeDeploymentConfig.ts`.
// ---------------------------------------------------------------------------------------------------

/// Must match the `name` in the deployment config exactly. `025-deploy-spoke-comptroller.ts` names the
/// per-pool deployment record `Comptroller_HubSpoke` from the same id.
export const POOL_NAME = "Hub-funded spoke";

/// TODO(risk): fraction of a borrow that one liquidation may repay. bsctestnet runs 0.5.
export const CLOSE_FACTOR: BigNumber | null = null;

/// TODO(risk): the pool-wide liquidation incentive, consumed by `addPool`.
///
/// FLOOR IS 1.05e18, NOT 1e18. `SpokeComptroller` raises the upstream floor to
/// `MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA` (SpokeComptrollerStorage.sol), so a pool cannot be
/// registered paying a default-seize-share market's liquidator less collateral than it repaid. A value
/// at or just above 1e18 fails the VIP at `addPool` with `InvalidLiquidationIncentive`.
export const POOL_LIQUIDATION_INCENTIVE: BigNumber | null = null;

/// TODO(risk): USD value below which a position is closed with `liquidateAccount` rather than
/// market-by-market. bsctestnet runs 100 USD. Always 18 decimals, it is a USD figure not a token one.
export const MIN_LIQUIDATABLE_COLLATERAL: BigNumber | null = null;

/// How often reserves sweep to the ProtocolShareReserve. 28800 is what every other BNB Chain isolated
/// market runs, roughly a day of blocks, and there is no reason for this pool to differ. Confirm it
/// rather than inherit it: no deploy script sets this and it is not an `AddMarketInput` field, so the
/// VIP command is its only chance to be set at all. Left at zero the sweep runs on every accrual.
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

/// TODO(eng): `SpokeComptroller.setMaxLoopsLimit(uint256)` is `onlyOwner`, so the VIP can correct the
/// value `025` initialized the comptroller with, after `acceptOwnership()`.
///
/// Leave `null` to keep the initialization value, which is the normal case. Set it only if the
/// measurement in the shipment plan lands after deployment: borrow, redeem and transfer now walk an
/// account's markets twice per call (`_updatePrices` and `_updateProtectionStates`), and neither walk
/// is bounded by `_ensureMaxLoops`, so a limit chosen before the second walk existed can be wrong in
/// either direction.
export const MAX_LOOPS_LIMIT: BigNumber | null = null;

// ---------------------------------------------------------------------------------------------------
// DeviationBoundedOracle.
// ---------------------------------------------------------------------------------------------------

export type DboConfig = {
  asset: string;
  cooldownPeriod: number;
  triggerThreshold: BigNumber;
  resetThreshold: BigNumber;
  enableBoundedPricing: boolean;
  enableCaching: boolean;
};

/// TODO(risk): does the liquidity market's underlying need a bounded price window?
///
/// Read from `assetProtectionConfig` on 2026-09-17: TSLAB, NVDAB, SPCXB and SKHYB are all configured,
/// identically — bounded pricing on, cooldown 3600s, trigger 1.667e17, reset 5e16, caching off. The
/// config is per underlying, set for their Core markets, so the spoke collateral markets inherit it
/// with no command here. USDT has no config at all (`asset == address(0)`).
///
/// An unconfigured asset does NOT revert: `_computeBoundedPrices` returns `(spot, spot)` when bounded
/// pricing is off. So this is a protection decision, not a correctness one, and it only affects the
/// debt leg of a borrow check. A stablecoin's window is a Risk call.
///
/// Leave `null` to ship USDT unbounded. To add a window, fill this in with USDT as the asset. Do NOT
/// add entries for the four bStock assets: `_setTokenConfig` reverts `MarketAlreadyInitialized(asset)`
/// for an asset that already has a config, and takes the whole proposal down with it.
///
/// The oracle seeds the window itself, reading the current spot into both minPrice and maxPrice, so no
/// price is passed and there is nothing to time.
export const USDT_DBO_CONFIG: DboConfig | null = null;

// ---------------------------------------------------------------------------------------------------
// Markets.
//
// One pool, two sides, and the split is configuration rather than a code flag:
//
//   Liquidity side (USDT) — borrowable, but collateral factor 0 so supplying it gives no borrow power,
//   and supply is restricted to the allowlist this VIP arms empty.
//
//   Collateral side (bStock) — permissionless to supply, and NOT borrowable: `borrowCap = 0` with the
//   BORROW action paused as the backup.
//
// TODO(risk): every `null` below. Which bStock assets actually list is itself open; the four here are
// the shipment plan's set. Removing one means removing its entry, not zeroing it.
// ---------------------------------------------------------------------------------------------------

export type SpokeMarketDraft = {
  symbol: string;
  side: "liquidity" | "collateral";
  /// TODO(deploy): filled by `028-deploy-spoke-vtokens.ts`.
  vToken: string;
  underlying: string;
  /// All five underlyings are 18 decimals. Every amount below is scaled to the UNDERLYING, never to
  /// the vToken's 8. Initial exchange rate is `10 ** (18 + underlyingDecimals - 8)`.
  underlyingDecimals: number;
  collateralFactor: BigNumber | null;
  /// Must be >= collateralFactor.
  liquidationThreshold: BigNumber | null;
  supplyCap: BigNumber | null;
  borrowCap: BigNumber | null;
  reserveFactor: BigNumber | null;
  /// Seed supply pulled from the VTreasury and minted to it at listing.
  initialSupply: BigNumber | null;
  /// `SpokeComptroller.setMarketLiquidationIncentive`, keyed on the COLLATERAL market: the discount
  /// prices the collateral being seized, not the debt being repaid.
  ///
  /// Floor is dynamic: `MANTISSA_ONE + VToken(vToken).protocolSeizeShareMantissa()`. `null` leaves the
  /// market on the pool-wide value, which is what the liquidity market does — with collateral factor 0
  /// it is never the collateral leg of a liquidation, so a per-market discount on it prices nothing.
  liquidationIncentive: BigNumber | null;
  /// `null` keeps whatever the vToken initializer set. Fill it in ONLY if the Risk value differs.
  ///
  /// If it is set, it must be set BEFORE `setMarketLiquidationIncentive`, because that setter's floor
  /// reads this value back. The two setters bound each other: `setProtocolSeizeShare` rejects
  /// `share + 1e18 > incentive`, and `setMarketLiquidationIncentive` rejects an incentive below
  /// `1e18 + share`.
  protocolSeizeShare: BigNumber | null;
};

/// The liquidity side. Collateral factor and liquidation threshold are both 0 by design, not TODO:
/// supplying USDT here gives no borrow power. Supply is metered by the allowlist this VIP arms with no
/// members, so in Phase 1 the market's cash is the seed alone and borrowing is capped at it.
export const MARKET_USDT: SpokeMarketDraft = {
  symbol: "vUSDT_HubSpoke",
  side: "liquidity",
  vToken: PENDING,
  underlying: USDT,
  underlyingDecimals: 18,
  collateralFactor: parseUnits("0", 18),
  liquidationThreshold: parseUnits("0", 18),
  supplyCap: null,
  borrowCap: null,
  reserveFactor: null,
  initialSupply: null,
  liquidationIncentive: null,
  protocolSeizeShare: null,
};

/// The collateral side. `borrowCap` is 0 by design, not TODO, and the BORROW action is paused on top
/// of it: a cap is a parameter someone can retune, a pause is a second independent gate.
const collateralDraft = {
  side: "collateral" as const,
  vToken: PENDING,
  underlyingDecimals: 18,
  collateralFactor: null,
  liquidationThreshold: null,
  supplyCap: null,
  borrowCap: parseUnits("0", 18),
  reserveFactor: null,
  initialSupply: null,
  liquidationIncentive: null,
  protocolSeizeShare: null,
};

export const MARKET_TSLAB: SpokeMarketDraft = { ...collateralDraft, symbol: "vTSLAB_HubSpoke", underlying: TSLAB };
export const MARKET_NVDAB: SpokeMarketDraft = { ...collateralDraft, symbol: "vNVDAB_HubSpoke", underlying: NVDAB };
export const MARKET_SPCXB: SpokeMarketDraft = { ...collateralDraft, symbol: "vSPCXB_HubSpoke", underlying: SPCXB };
export const MARKET_SKHYB: SpokeMarketDraft = { ...collateralDraft, symbol: "vSKHYB_HubSpoke", underlying: SKHYB };

/// Liquidity market FIRST. It has to be listed and seeded before its supply allowlist is armed, and
/// the allowlist gates the account credited with the vTokens, so arming it earlier would block the
/// registry's own seed mint.
export const MARKETS: SpokeMarketDraft[] = [MARKET_USDT, MARKET_TSLAB, MARKET_NVDAB, MARKET_SPCXB, MARKET_SKHYB];

export const LIQUIDITY_MARKET = MARKET_USDT;
export const COLLATERAL_MARKETS = MARKETS.filter(m => m.side === "collateral");

/// `Action` in isolated-pools/contracts/ComptrollerInterface.sol, in declaration order:
/// MINT, REDEEM, BORROW, REPAY, SEIZE, LIQUIDATE, TRANSFER, ENTER_MARKET, EXIT_MARKET.
export const BORROW_ACTION = 2;

// ---------------------------------------------------------------------------------------------------
// Permissions this VIP RELIES ON but does not grant, because bscmainnet already holds them and a
// wildcard (an address(0)-keyed grant) reaches a contract deployed after it was made.
//
// Read from the ACM on 2026-09-17 by calling `isAllowedToCall(account, roleString)` with an UNRELATED
// `msg.sender`, so a true proves a wildcard rather than a grant against one specific contract. Plain
// `hasRole` reads are not reliable for this.
//
// Recorded as data rather than prose so the simulation can assert them BEFORE the proposal runs: a
// revocation between now and execution then fails the simulation instead of the proposal. That is the
// assumption this VIP is most exposed to, because nothing in the proposal touches it and it would only
// surface at execution.
// ---------------------------------------------------------------------------------------------------

export const ASSUMED_WILDCARD_ROLES = {
  /// Held by the Normal Timelock on the comptroller. The first six are the same strings the spoke
  /// registry is granted in this VIP: the wildcard covers the timelock as an account, it does not
  /// cover the registry.
  comptroller: [
    "setCloseFactor(uint256)",
    "setLiquidationIncentive(uint256)",
    "setMinLiquidatableCollateral(uint256)",
    "setCollateralFactor(address,uint256,uint256)",
    "setMarketSupplyCaps(address[],uint256[])",
    "setMarketBorrowCaps(address[],uint256[])",
    "unlistMarket(address)",
  ],

  /// Held by the Normal Timelock, on each spoke vToken. The VIP calls the first two directly, and the
  /// third only if `protocolSeizeShare` is filled in above.
  vToken: [
    "setReduceReservesBlockDelta(uint256)",
    "setReserveFactor(uint256)",
    "setProtocolSeizeShare(uint256)",
    "setInterestRateModel(address)",
  ],

  /// Held by the Normal Timelock, on the spoke registry. The VIP calls the first two directly, and
  /// they are why a brand-new registry needs no grant of its own for the timelock to drive it.
  poolRegistry: [
    "addPool(string,address,uint256,uint256,uint256)",
    "addMarket(AddMarketInput)",
    "setPoolName(address,string)",
    "updatePoolMetadata(address,VenusPoolMetaData)",
  ],

  /// Held by the Normal Timelock, the Fast-track Timelock and the Guardian, on the comptroller. Called
  /// by this VIP to pause BORROW on every collateral market.
  ///
  /// The role string carries `uint256[]` while the CALL signature carries `uint8[]`, because `Action`
  /// is an enum. Confirmed on chain: the `uint256[]` form is the granted one and the `uint8[]` form is
  /// held by nobody. Do not "fix" either to match the other.
  pause: ["setActionsPaused(address[],uint256[],bool)"],
};

/// Not wildcards. These two are granted against ONE specific contract, so they are asserted with
/// `msg.sender` set to that contract rather than to an unrelated address. Held by the Normal Timelock
/// and the Fast-track Timelock.
export const ASSUMED_PER_CONTRACT_ROLES = {
  [DEVIATION_BOUNDED_ORACLE]: ["setTokenConfig((address,uint64,uint256,uint256,bool,bool))"],
  [PROTOCOL_SHARE_RESERVE]: [
    "addOrUpdateDistributionConfigs(DistributionConfig[])",
    "removeDistributionConfig(Schema,address)",
  ],
};

/// Held by the Guardian as wildcards on the comptroller, before this VIP and without any grant from
/// it. Asserted because the decision to grant the Guardian nothing rests on them: the emergency pause
/// path reaches this pool from its first block regardless.
export const ASSUMED_GUARDIAN_ROLES = ["unlistMarket(address)", "setActionsPaused(address[],uint256[],bool)"];
