import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool, VIP-A (spoke pool infrastructure) address book.
//
// VIP-A stands up the empty pool: ownership, ACM grants, both oracles, the ProtocolShareReserve upgrade,
// `addPool`, and the `BStockLiquidator` upgrade. It lists no market. VIP-B (Hub infrastructure) and
// VIP-C (markets and Hub wiring) are parts 2 and 3 in this directory.
//
// ---------------------------------------------------------------------------------------------------
// STATUS: NOT ADDRESS-COMPLETE.
//
// Nothing VIP-A creates is deployed on bscmainnet yet. Every `PENDING` address below is filled from its
// deployment, then re-read from chain before the proposal is opened. `PENDING` fails loudly: ../bscmainnet-part-1.ts
// collects every one that survives and throws with the full list, so the proposal cannot be built,
// simulated or proposed half-filled.
//
// WHAT IS REAL: every address in the "already on chain" section was read back from bscmainnet on
// 2026-10-13 (block ~127,396,000), not taken from a deployment record alone.
// ===================================================================================================

/// Sentinel for an address that does not exist on bscmainnet yet. The guard in ../bscmainnet-part-1.ts is the only
/// real protection: the zero address does NOT fail safe command by command. A call aimed at it reaches an empty
/// account and succeeds silently (`acceptOwnership`, `setPriceOracle`, `addPool`), and `giveCallPermission` with it
/// as the contract grants a WILDCARD over every contract that checks the role. What would still revert the whole
/// proposal is `addPoolRegistry(0)` (`ensureNonzeroAddress`) and a `ProxyAdmin.upgrade` to a non-contract. Never
/// remove the guard on the strength of those two.
export const PENDING = "0x0000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------------------------------
// Already on chain.
// ---------------------------------------------------------------------------------------------------

const {
  ACCESS_CONTROL_MANAGER,
  CRITICAL_GUARDIAN,
  CRITICAL_TIMELOCK,
  DEFAULT_PROXY_ADMIN,
  FAST_TRACK_TIMELOCK,
  GUARDIAN,
  NORMAL_TIMELOCK,
  POOL_REGISTRY,
  RESILIENT_ORACLE,
  UNITROLLER,
} = NETWORK_ADDRESSES.bscmainnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { CRITICAL_TIMELOCK, DEFAULT_PROXY_ADMIN, FAST_TRACK_TIMELOCK, NORMAL_TIMELOCK, RESILIENT_ORACLE };

/// The multisig for risk parameters. Holds the collateral factor and cap wildcards today; VIP-A adds the
/// five pool-level and per-market liquidation levers.
export { CRITICAL_GUARDIAN };

/// The multisig for pauses and unlisting, `GUARDIAN` in this repo. Holds the `setActionsPaused` and
/// `unlistMarket` wildcards today; VIP-A adds the two liquidation-allowlist levers.
export const PAUSE_GUARDIAN = GUARDIAN;

/// Day-to-day Hub multisig and the `BStockLiquidator` owner. Gets nothing from VIP-A. Referenced because,
/// as that owner, it makes the two follow-up calls after execution (see ../bscmainnet-part-1.ts).
export const OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";

/// Oracle-only multisig. Holds nothing on this pool and gets nothing. Referenced only so the simulation can
/// prove no wildcard reaches it either.
export const ORACLE_GUARDIAN = "0x3a3284dC0FaFfb0b5F0d074c4C704D14326C98cF";

/// The Core pool Comptroller (Unitroller). Constructor immutable of `BStockLiquidator` and of the
/// ProtocolShareReserve, read back to prove both new implementations keep it.
export const CORE_COMPTROLLER = UNITROLLER;

/// The isolated-pools registry. Referenced only to make the contrast explicit: this pool is NOT listed here,
/// and the wildcard ACM grants this address holds name it as the account, so none of them carry over to the
/// spoke registry. That is what the six registry grants in VIP-A are for.
export const ISOLATED_POOL_REGISTRY = POOL_REGISTRY;

/// Prices borrow, redeem, transfer and exit-market: collateral at the low end of its recent window, debt at
/// the high end, while protection is active. Shared with the Core pool. Owner is the Normal Timelock, and its
/// immutable `RESILIENT_ORACLE` reads back as RESILIENT_ORACLE above, so the two are already paired.
export const DEVIATION_BOUNDED_ORACLE = "0xc79Cb7efEBd121DC4B39eA141C214606595D665A";

/// Income destination. Transparent proxy behind DEFAULT_PROXY_ADMIN, owned by the Normal Timelock. Holds the
/// isolated-pools registry as its one `poolRegistry`, and 18 distribution targets totalling 10000 bps on each
/// schema with `RiskFundConverter` on neither.
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

/// The ProtocolShareReserve implementation live today, recorded so the simulation can prove the upgrade is
/// not a no-op.
export const PROTOCOL_SHARE_RESERVE_LIVE_IMPL = "0x4eC6D748a2647000895b455c408f85602A144Ed6";

/// From `@venusprotocol/protocol-reserve` deployments. Referenced only so the simulation can prove it stays off
/// both distribution schemas: it resolves pools through a registry of its own, so a row naming it would make
/// every `releaseFunds` for this pool revert.
export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";

/// The atomic bStock backstop liquidator, live for the Core pool. Transparent proxy whose EIP-1967 admin slot
/// holds BSTOCK_LIQUIDATOR_PROXY_ADMIN. Owned by the OPERATOR multisig. Not in the pinned
/// `@venusprotocol/venus-protocol` deployments package, so it is a literal here.
export const BSTOCK_LIQUIDATOR = "0x5974Badab6911a78Ba15229045514C2C1bD42343";

/// The `BStockLiquidator` implementation live today, built from the code before venus-protocol#707.
export const BSTOCK_LIQUIDATOR_LIVE_IMPL = "0xde9734DD7AEad610Dd41FFE9Abc25C5cCf142487";

/// The admin of the `BStockLiquidator` proxy, read from its EIP-1967 admin slot. It is the oracle repo's
/// DefaultProxyAdmin, NOT DEFAULT_PROXY_ADMIN above, and its owner is the Normal Timelock, so the upgrade
/// needs no ACM grant.
export const BSTOCK_LIQUIDATOR_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";

/// Constructor immutables of the live `BStockLiquidator`, read from the proxy. The new implementation must be
/// built with exactly these, or the Core path changes under the upgrade.
export const BSTOCK_LIQUIDATOR_VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
export const BSTOCK_LIQUIDATOR_VWBNB = "0x6bCa74586218dB34cdB402295796b79663d816e9";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

/// Routers allowlisted on the live `BStockLiquidator`, with the spender each one pulls through (zero means
/// the router itself). Read from chain; the addresses are the ones the operator scripts in
/// venus-protocol/scripts/bstock use. The simulation reads them again after the upgrade to prove the
/// implementation swap left the liquidator's storage where it was.
export const BSTOCK_LIQUIDATOR_ROUTERS = [
  {
    name: "PancakeSwap V2",
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    spender: "0x0000000000000000000000000000000000000000",
  },
  {
    name: "Liquid Mesh",
    router: "0x3d90f66B534Dd8482b181e24655A9e8265316BE9",
    spender: "0x8157a9d65807521FBB8db8f37EEEcEfDD247E9B1",
  },
];

// ---------------------------------------------------------------------------------------------------
// TODO(deploy): the spoke stack. isolated-pools deploy/024 through deploy/027.
//
// `028` (the markets) is not run before VIP-A: it logs and returns until a `bscmainnet` market entry exists.
// Fill each of these from the deployment, then re-read them from chain before the proposal is opened.
// ---------------------------------------------------------------------------------------------------

/// TODO(deploy): `SpokePoolRegistry`, a second `PoolRegistry` instance behind DEFAULT_PROXY_ADMIN (`024`).
/// Ownable2Step and only nominated, so `acceptOwnership()` comes first in the VIP.
export const SPOKE_POOL_REGISTRY = PENDING;

/// TODO(deploy): `Comptroller_HubSpoke`, a BeaconProxy over SpokeComptrollerBeacon (`025`). Ownable2Step,
/// nominated only.
///
/// Its `poolRegistry()` is a CONSTRUCTOR IMMUTABLE of the implementation with no setter, and `supportMarket`
/// checks it. A value that does not equal SPOKE_POOL_REGISTRY can only be fixed by redeploying the
/// implementation and re-pointing the beacon. Nothing in this VIP can correct it.
export const SPOKE_COMPTROLLER = PENDING;

/// TODO(deploy): reference only. `UpgradeableBeacon` is plain `Ownable`, and `025` and `027` hand both to the
/// Normal Timelock inside the deploy transaction, so VIP-A has no command for either.
export const SPOKE_COMPTROLLER_BEACON = PENDING;
export const SPOKE_VTOKEN_BEACON = PENDING;

/// TODO(deploy): reference only (`026`). The lens holds no state, has no owner and no AccessControlManager,
/// and takes the registry to read as a call argument, so it needs no command in this or any VIP.
export const SPOKE_POOL_LENS = PENDING;

/// TODO(deploy): the multi-registry `ProtocolShareReserve` implementation, deployed from the
/// protocol-reserve#170 head. Before filling it in, read back on chain that `CORE_POOL_COMPTROLLER`, `WBNB`
/// and `vBNB` equal the live implementation's. `deploy/000-psr.ts` falls back to `ADDRESS_ONE` when an
/// artifact is missing, and a drifted CORE_POOL_COMPTROLLER silently breaks the core-pool bypass in
/// `updateAssetsState`.
export const PROTOCOL_SHARE_RESERVE_IMPL = PENDING;

/// TODO(deploy): the `BStockLiquidator` implementation from venus-protocol#707, constructed with
/// CORE_COMPTROLLER, BSTOCK_LIQUIDATOR_VBNB, BSTOCK_LIQUIDATOR_VWBNB and WBNB. Deployed with an
/// implementation-only script: `019-deploy-bstock-liquidator` is recorded as run on bscmainnet, so
/// hardhat-deploy skips it.
export const BSTOCK_LIQUIDATOR_IMPL = PENDING;

// ---------------------------------------------------------------------------------------------------
// Pool-level parameters, consumed by `addPool`. Values from the shipment plan (VIP-A, `addPool`).
// ---------------------------------------------------------------------------------------------------

export const POOL_NAME = "bStock index";

/// Fraction of a borrow one liquidation may repay. The contract accepts 0.05e18 to 0.9e18.
export const CLOSE_FACTOR = parseUnits("0.5", 18);

/// The pool-wide liquidation incentive. FLOOR IS 1.05e18, NOT 1e18: `SpokeComptroller` raises the upstream
/// floor to `MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA`, so a pool cannot be registered paying a
/// default-seize-share market's liquidator less collateral than it repaid. Below it `addPool` reverts
/// `InvalidLiquidationIncentive`.
export const POOL_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);

/// USD value below which a position is closed with `liquidateAccount` rather than market by market. Always 18
/// decimals: it is a USD figure, not a token one.
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18);

/// What `025` initializes the comptroller with on bscmainnet. Read back in the simulation; `setMaxLoopsLimit`
/// can only raise it, so VIP-A carries no command for it.
export const MAX_LOOPS_LIMIT = 50;
