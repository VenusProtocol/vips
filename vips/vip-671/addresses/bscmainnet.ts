import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain] — Hub-Funded Spoke pool address book, for VIP-A and VIP-B.
//
// VIP-A (part 1) stands up the empty pool: ownership, ACM grants, both oracles, the ProtocolShareReserve
// upgrade, `addPool`, and the `BStockLiquidator` upgrade. It lists no market. VIP-B (part 2) upgrades the
// Liquidity Hub, swaps the live adapters and registers an empty Spoke source on each Hub. VIP-C (part 3,
// markets and Hub wiring) follows both.
//
// ---------------------------------------------------------------------------------------------------
// STATUS: NOT ADDRESS-COMPLETE.
//
// Nothing VIP-A creates is deployed on bscmainnet yet, nor is the new Hub implementation or the Spoke family
// VIP-B registers. Every `PENDING` address below is filled from its deployment, then re-read from chain before
// the proposal is opened. `PENDING` fails loudly: each part collects every one it needs that survives and
// throws with the full list, so no proposal can be built, simulated or proposed half-filled.
//
// WHAT IS REAL: every address in the "already on chain" sections was read back from bscmainnet, not taken
// from a deployment record alone. VIP-A's on 2026-10-13 (block ~127,396,000), VIP-B's on 2026-10-14
// (block ~127,532,000).
// ===================================================================================================

/// Sentinel for an address that does not exist on bscmainnet yet. The guard in each part is the only real
/// protection: the zero address does NOT fail safe command by command. A call aimed at it reaches an empty
/// account and succeeds silently (`acceptOwnership`, `setPriceOracle`, `addPool`), and `giveCallPermission` with it
/// as the contract grants a WILDCARD over every contract that checks the role. What would still revert the whole
/// proposal is `addPoolRegistry(0)` (`ensureNonzeroAddress`), a `ProxyAdmin.upgrade` or `UpgradeableBeacon.upgradeTo`
/// to a non-contract, and `addYieldGroup(0, ...)`. Never remove a guard on the strength of those.
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
/// as that owner, it makes the two follow-up calls after execution (see ../bscmainnet-part-1.ts). VIP-B gives it
/// on each Spoke source the six roles it holds on every live Core and Flux source.
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

/// TODO(deploy): reference only. `UpgradeableBeacon` is plain `Ownable`, and the `025` and `027` deploy scripts
/// hand both to the Normal Timelock, so VIP-A has no command for either.
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

// ===================================================================================================
// VIP-B: Liquidity Hub infrastructure. Already on chain, read on 2026-10-14 (block ~127,532,000).
// ===================================================================================================

/// The one beacon behind all three Hubs, owned by the Normal Timelock. `upgradeTo` is `onlyOwner`, so it needs no
/// ACM grant, and it moves every Hub at once.
export const HUB_BEACON = "0x0f20e1004962e2DF16c16FC15460Dc6480626321";

/// The Hub implementation live today. Its runtime bytecode matches venus-liquidity-hub `main`'s `Hub.sol`.
export const HUB_LIVE_IMPL = "0x44BCabAF2e63A7B883EDeA6A721d47b4bC081d02";

export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";

export const HUB_USDT = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
export const HUB_USDC = "0x9D2D9592cF8DFbf59107fAab703d08494BE14617";
export const HUB_U = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";

/// The eleven live yield groups. FRVSource_USDC holds no resource, so the adapter swap skips it, but it is
/// registered on Hub_USDC and in its withdraw queue.
export const CORE_SOURCE_USDT = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
export const CORE_SOURCE_USDC = "0x299D9Be7CEfff91c68F13F267d525CFC18e965ef";
export const CORE_SOURCE_U = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
export const FLUX_SOURCE_USDT = "0xe3df38E12E37ED80E1b3ccf2bdf84F9e1527ce14";
export const FLUX_SOURCE_USDC = "0xA65bB4b20542268B64CF08871a98D75342AFE927";
export const FLUX_SOURCE_U = "0xe31B8851c3fa9B3dD39a04a2ed9493869A410616";
export const FRV_SOURCE_USDT = "0x621eF38cE0C4e7060fF0bF3D609E3D46EC144bE7";
export const FRV_SOURCE_USDC = "0x438388847eE16850Ab4f5b82dc7954c0d043B716";
export const FRV_SOURCE_U = "0x30908eddB9E94add7AC9944a0adda66d80B89143";
export const CENTRIFUGE_SOURCE_USDT = "0xDA5AFfeb43719f517676E031a727071c7D400983";
export const CENTRIFUGE_SOURCE_USDC = "0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c";

/// The adapters every live resource points at today.
export const ADAPTER_CORE_V1_LIVE = "0x4E514a0C7aB9d140eE204dfA0017574270D92944";
export const ADAPTER_FLUX_LIVE = "0xA81bDf813A428053E764C34Bc679b3E4d0807be3";
export const ADAPTER_FRV_LIVE = "0x1FA0365bDd603452CE96BE3c0e12Db5515a35902";
export const ADAPTER_CENTRIFUGE_LIVE = "0x680cE4422264ecDAd3590cB50FE254D4c153f427";

/// Their replacements, deployed on 2026-09-22 by `deploy/11_DeployAdapters` (venus-liquidity-hub#20). Runtime
/// bytecode matches venus-liquidity-hub#22 head, with metadata and immutables (the adapter's own address, and
/// the Flux resolver below) masked.
export const ADAPTER_CORE_V1 = "0xa061cC2F62BDa2D6bA53Fb98847aD9822DA085dd";
export const ADAPTER_FLUX = "0x9a1a7F6aebA4a1A3e85Ae1Dba90a7A2A52803404";
export const ADAPTER_FRV = "0x1824caA965Ac05ae5C9C2819e045337e2cF5657c";
export const ADAPTER_CENTRIFUGE = "0xaa9D52758890997D91950E595886FF9CDEca81ae";

/// `AdapterFlux`'s only constructor argument. The live and the new Flux adapter both read it back.
export const FLUID_LENDING_RESOLVER = "0x48D32f49aFeAEC7AE66ad7B9264f446fc11a1569";

export type AdapterSwap = {
  name: string;
  yieldGroup: string;
  resource: string;
  liveAdapter: string;
  newAdapter: string;
};

/// Every resource registered on every yield group of the three Hubs, with its live adapter. Each swap was dry-run
/// from the Normal Timelock; the simulation re-reads the full list.
export const ADAPTER_SWAPS: AdapterSwap[] = [
  {
    name: "CoreSource_USDT: vUSDT",
    yieldGroup: CORE_SOURCE_USDT,
    resource: "0xfD5840Cd36d94D7229439859C0112a4185BC0255",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "CoreSource_USDC: vUSDC",
    yieldGroup: CORE_SOURCE_USDC,
    resource: "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "CoreSource_U: vU",
    yieldGroup: CORE_SOURCE_U,
    resource: "0x3d5E269787d562b74aCC55F18Bd26C5D09Fa245E",
    liveAdapter: ADAPTER_CORE_V1_LIVE,
    newAdapter: ADAPTER_CORE_V1,
  },
  {
    name: "FluxSource_USDT: fUSDT",
    yieldGroup: FLUX_SOURCE_USDT,
    resource: "0xA5b8FCa32E5252B0B58EAbf1A8c79d958F8EE6A2",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FluxSource_USDC: fUSDC",
    yieldGroup: FLUX_SOURCE_USDC,
    resource: "0xfE60462E93cee34319F48Cfc6AcFbc13c2882Df9",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FluxSource_U: fU",
    yieldGroup: FLUX_SOURCE_U,
    resource: "0x007df53Cda786450Cf8145a73B2748B241a0069c",
    liveAdapter: ADAPTER_FLUX_LIVE,
    newAdapter: ADAPTER_FLUX,
  },
  {
    name: "FRVSource_USDT: FRV-sv-17AUG2026-30",
    yieldGroup: FRV_SOURCE_USDT,
    resource: "0x086fd7972510dF9d9cFdc4efB8677fc72d290103",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "FRVSource_U: FRV-ast-13AUG2026-30",
    yieldGroup: FRV_SOURCE_U,
    resource: "0x41179fc6ff878b7795B900888E0B61fd8029bceA",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "FRVSource_U: FRV-hg-05OCT2026-30",
    yieldGroup: FRV_SOURCE_U,
    resource: "0xfE419E150d63ff288b9802533f6Fe2f886DB6FED",
    liveAdapter: ADAPTER_FRV_LIVE,
    newAdapter: ADAPTER_FRV,
  },
  {
    name: "CentrifugeSource_USDT: Janus Henderson Treasury Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDT,
    resource: "0x6e6B8498415083a4386BE83DD59Edd4366402FFa",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDT: Janus Henderson AAA CLO Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDT,
    resource: "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDC: Janus Henderson Treasury Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDC,
    resource: "0x5aa84705a2CB2054ed303565336F188e6bfFbAF5",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
  {
    name: "CentrifugeSource_USDC: Janus Henderson AAA CLO Fund",
    yieldGroup: CENTRIFUGE_SOURCE_USDC,
    resource: "0x9effaa5614c689fA12892379e097b3ACaD239961",
    liveAdapter: ADAPTER_CENTRIFUGE_LIVE,
    newAdapter: ADAPTER_CENTRIFUGE,
  },
];

// ---------------------------------------------------------------------------------------------------
// TODO(deploy): VIP-B's new contracts, from venus-liquidity-hub#22 `deploy/12` to `deploy/14`. Fill each from
// the deployment, verify its source on BscScan, then re-read it from chain.
// ---------------------------------------------------------------------------------------------------

/// TODO(deploy): the new Hub implementation (`12_DeployHubImpl`). #22's `Hub` has the same storage layout as the
/// live implementation (`forge inspect` against `main`), so the upgrade needs no reinitializer. It links the
/// external `HubAdminLib`; check the linked library's source too.
export const HUB_IMPL = PENDING;

/// TODO(deploy): the Spoke family beacon (`13_DeploySpoke`). Plain `Ownable`; the script transfers it to
/// `governance` from `deploy/config/bscmainnet.json`, which is the Normal Timelock.
export const SPOKE_BEACON = PENDING;

/// TODO(deploy): the generic `YieldGroup` implementation behind SPOKE_BEACON (`13_DeploySpoke`, recorded as
/// `YieldGroupSpokeImpl`).
export const SPOKE_SOURCE_IMPL = PENDING;

/// TODO(deploy): one Spoke source per Hub (`14_DeploySpokeSource`), a BeaconProxy on SPOKE_BEACON initialized with
/// its Hub, that Hub's asset, `blocksPerYear` 0 and the ACM. No owner, and no setter for its Hub or its ACM.
export const SPOKE_SOURCE_USDT = PENDING;
export const SPOKE_SOURCE_USDC = PENDING;
export const SPOKE_SOURCE_U = PENDING;

/// TODO(deploy): reference only (`10_DeployHubLens`); nothing in VIP-B uses it. After the upgrade, Hub `maxDeposit`
/// and `maxMint` return `type(uint256).max` and `HubLens` reports the real capacity, so deploy it first.
export const HUB_LENS = PENDING;

export type HubStack = {
  name: string;
  hub: string;
  asset: string;
  spokeSource: string;
  /// Read on chain. Holds every registered group.
  withdrawQueueBefore: string[];
  /// Read on chain. VIP-B does not change it.
  depositQueue: string[];
};

/// The three Hubs. VIP-B appends each Spoke source to the end of its Hub's withdraw queue, the order the VIP
/// document sets (§3.4).
export const HUB_STACKS: HubStack[] = [
  {
    name: "Hub_USDT",
    hub: HUB_USDT,
    asset: USDT,
    spokeSource: SPOKE_SOURCE_USDT,
    withdrawQueueBefore: [FLUX_SOURCE_USDT, CORE_SOURCE_USDT, FRV_SOURCE_USDT, CENTRIFUGE_SOURCE_USDT],
    depositQueue: [CORE_SOURCE_USDT, FLUX_SOURCE_USDT],
  },
  {
    name: "Hub_USDC",
    hub: HUB_USDC,
    asset: USDC,
    spokeSource: SPOKE_SOURCE_USDC,
    withdrawQueueBefore: [FLUX_SOURCE_USDC, CORE_SOURCE_USDC, FRV_SOURCE_USDC, CENTRIFUGE_SOURCE_USDC],
    depositQueue: [CORE_SOURCE_USDC, FLUX_SOURCE_USDC],
  },
  {
    name: "Hub_U",
    hub: HUB_U,
    asset: U,
    spokeSource: SPOKE_SOURCE_U,
    withdrawQueueBefore: [FLUX_SOURCE_U, CORE_SOURCE_U, FRV_SOURCE_U],
    depositQueue: [CORE_SOURCE_U, FLUX_SOURCE_U],
  },
];

/// Both caps start at 0, so the effective cap is 0 until VIP-C raises it. `raiseYieldGroupCap` needs both values
/// at or above the current ones, so the percentage starts at 0, not at the 10000 sentinel that disables it: from
/// 10000, any lower percentage would need `lowerYieldGroupCap` first.
export const SPOKE_ABSOLUTE_CAP = 0;
export const SPOKE_PERCENTAGE_CAP_BPS = 0;

// ---------------------------------------------------------------------------------------------------
// VIP-B: ACM batching through the AuxiliaryCommandsAggregator (VIP-628). See ../bscmainnet-part-2.ts for why.
//
// Read on 2026-10-14: the Normal Timelock owns the aggregator, holds `executeBatch(uint256)` on it and is an
// authorized batcher. Of the Normal, Fast-track and Critical timelocks and the two guardians, only the Normal
// Timelock holds DEFAULT_ADMIN_ROLE on the ACM. The aggregator does not hold it.
// ---------------------------------------------------------------------------------------------------

export const AUX_COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

/// TODO(ops): the aggregator slot of the Spoke source grants batch. 5 is the next free slot on 2026-10-14
/// (`batchCount()`); any batch stored before ours moves it. Set it to the live `batchCount()` just before running
/// ../provisionAcmBatches.ts, which refuses to store on a mismatch.
export const SPOKE_SOURCE_GRANTS_BATCH_INDEX = 5;
