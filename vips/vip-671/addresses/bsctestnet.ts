import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain Testnet] — Hub-Funded Spoke pool, address book.
//
// One reference for every address the VIP touches, split into what is already live on bsctestnet and
// what still has to be deployed. Governance / ACM / PoolRegistry / oracles come from the
// @venusprotocol/* deployment packages via NETWORK_ADDRESSES wherever the pinned package carries them;
// anything the pinned package does not carry is inlined with its source file noted.
//
// Verified against bsctestnet (chainId 97) while drafting:
//   - DeviationBoundedOracle 0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8 has USDT, TSLAB, NVDAB and
//     SPCXB initialized with bounded pricing ENABLED, so the spoke pool's collateral-factor paths
//     price through a live window rather than a permissive fallback.
//   - Hub_USDT.asset() == USDT (0xA11c…782c) and Hub_USDT.owner() == NormalTimelock.
//   - The Normal Timelock already holds WILDCARD (address(0)-keyed) ACM roles for every pooled
//     Comptroller setter this pool needs, and PoolRegistry holds the six it drives during
//     addPool/addMarket. See ./../permissions.ts for the ones that are NOT covered.
//   - bsctestnet USDT has 6 DECIMALS (mainnet BSC USDT has 18). Every USDT amount below is 6-decimal,
//     and the spoke vUSDT lists at an initial exchange rate BELOW 1e18.
// ===================================================================================================

const {
  ACCESS_CONTROL_MANAGER,
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  POOL_REGISTRY,
  RESILIENT_ORACLE,
} = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, POOL_REGISTRY, RESILIENT_ORACLE };

/// Every governance timelock. Testnet convention (VIP-633) is to grant new pool/oracle roles to all three.
export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// ---------------------------------------------------------------------------------------------------
// Oracles — live.
// ---------------------------------------------------------------------------------------------------
// Not in the pinned @venusprotocol/oracle (1.10.0) deployment package; taken from
// oracle/deployments/bsctestnet_addresses.json (DeviationBoundedOracle_Proxy). Same address VIP-633 uses.
export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";

// ---------------------------------------------------------------------------------------------------
// Underlying assets — live (all four are MockToken with a public `faucet(uint256)` on this chain).
// ---------------------------------------------------------------------------------------------------
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c"; // 6 decimals
export const TSLAB = "0x10d63B1203E5A0719AbbE927C8BFc87135b2F129"; // 18 decimals, MockTSLAB (VIP-633)
export const NVDAB = "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56"; // 18 decimals, MockNVDAB (VIP-633)
export const SPCXB = "0x6D9e91cB766259af42619c14c994E694E57e6E85"; // 18 decimals, MockSPCXB (VIP-633)

// ---------------------------------------------------------------------------------------------------
// Liquidity Hub — live. Source: venus-liquidity-hub/deployments/bsctestnet_addresses.json.
// That repo is not published as an @venusprotocol/*-deployments package, so its addresses are inlined.
// ---------------------------------------------------------------------------------------------------
export const HUB_USDT = "0x7cE6ADF754D0eC81A6CF8ACd9C7454F45077dc61";

// ---------------------------------------------------------------------------------------------------
// Core pool — live. Referenced only by the BStock liquidation leg (see ../bsctestnet.ts, still TODO).
// ---------------------------------------------------------------------------------------------------
export const VUSDT_CORE = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

// ===================================================================================================
// TODO — NOT DEPLOYED YET. Every address below is a placeholder and MUST be replaced with the real
// deployment before this VIP is simulated or proposed. They are exported as `undefined`-safe zero
// addresses on purpose: a wrong-looking literal is easier to miss than an obviously empty one.
// ===================================================================================================

/// TODO(deploy): isolated-pools `deploy/024-deploy-spoke-comptroller.ts` -> `Comptroller_HubSpoke`.
/// Beacon proxy over SpokeComptrollerBeacon. Ownable2Step: the script only NOMINATES the Normal
/// Timelock, so this VIP's first command must be `acceptOwnership()`.
export const SPOKE_COMPTROLLER = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `SpokeComptrollerBeacon`. Reference only — plain Ownable, already
/// owned by the Normal Timelock at the end of the deploy script, so this VIP does not touch it.
export const SPOKE_COMPTROLLER_BEACON = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): one `JumpRateModelV2` per spoke market, or one shared model. Must be constructed
/// with `timeBased = false` and `blocksPerYear = 42_048_000` to match the VToken implementation the
/// live VTokenBeacon (0xBF85A90673E61956f8c79b9150BAB7893b791bDd) points at.
/// TODO(risk): curve parameters (base / multiplier / jump / kink) are not specified in the PRD.
export const IRM_USDT = "0x0000000000000000000000000000000000000000";
export const IRM_BSTOCK = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): spoke markets, all BeaconProxy over the live VTokenBeacon, comptroller =
/// SPOKE_COMPTROLLER, riskManagement = { shortfall: 0x503574a82fE2A9f968d355C8AAc1Ba0481859369,
/// protocolShareReserve: <IL PSR on bsctestnet> }.
/// vUSDT lists at initialExchangeRate 10 ** (18 + 6 - 8) = 1e16 (BELOW 1e18 — the low-decimal regime
/// AdapterSpokeV1._bumpToSettleable exists for). The three bStock markets list at 1e28.
export const VUSDT_SPOKE = "0x0000000000000000000000000000000000000000";
export const VTSLAB_SPOKE = "0x0000000000000000000000000000000000000000";
export const VNVDAB_SPOKE = "0x0000000000000000000000000000000000000000";
export const VSPCXB_SPOKE = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): venus-liquidity-hub `deploy/08_DeploySpoke.s.sol` -> AdapterSpokeV1 (stateless,
/// one per chain, reached by delegatecall from every spoke YieldGroup) and SpokeBeacon.
export const ADAPTER_SPOKE_V1 = "0x0000000000000000000000000000000000000000";
export const SPOKE_BEACON = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): venus-liquidity-hub `deploy/09_DeploySpokeSource.s.sol` -> `SpokeSource_USDT`,
/// a generic YieldGroup proxy over SPOKE_BEACON, initialised with (Hub_USDT, USDT, blocksPerYear=0,
/// ACM). One source per Hub; each spoke market for that asset is a separate resource inside it.
export const SPOKE_SOURCE_USDT = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): BStockLiquidator is NOT deployed on bsctestnet at all (it exists only on bscmainnet,
/// 0x5974Badab6911a78Ba15229045514C2C1bD42343). The spoke-liquidation leg of this programme
/// (venus-protocol PR #707) therefore has no testnet target yet. See ../bsctestnet.ts.
export const BSTOCK_LIQUIDATOR = "0x0000000000000000000000000000000000000000";
