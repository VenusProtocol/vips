import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain Testnet] — Hub-Funded Spoke pool, PHASE 1 address book.
//
// Phase 1 covers the spoke-pool side only (isolated-pools#559). The Liquidity Hub wiring
// (venus-liquidity-hub#22) and the bStock liquidation leg (venus-protocol#707) are Phase 2 and have
// no addresses here on purpose.
//
// Verified on bsctestnet (chainId 97) at block 129,788,112 while drafting:
//   - DeviationBoundedOracle 0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8 reports bounded pricing
//     ENABLED for USDT, TSLAB, NVDAB and SPCXB. It resolves `vToken.underlying()` and keys its config
//     on the UNDERLYING, so the new spoke vTokens inherit that configuration and this VIP needs no
//     oracle command at all.
//   - ResilientOracle 0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823 prices all four underlyings. Same
//     underlying-keyed reasoning, so no `setTokenConfig` either.
//   - ProtocolShareReserve owner() == NormalTimelock, poolRegistry() == the isolated-pools registry.
//   - bsctestnet USDT has 6 DECIMALS (BSC mainnet USDT has 18). Every USDT amount is 6-decimal.
// ===================================================================================================

const {
  ACCESS_CONTROL_MANAGER,
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  GUARDIAN,
  RESILIENT_ORACLE,
  VTREASURY,
} = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, RESILIENT_ORACLE, VTREASURY };

/// Every governance timelock. Testnet convention (VIP-633) is to grant new pool roles to all three.
export const TIMELOCKS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// ---------------------------------------------------------------------------------------------------
// Live infrastructure.
// ---------------------------------------------------------------------------------------------------

/// Not carried by the pinned @venusprotocol/oracle deployment package; taken from
/// oracle/deployments/bsctestnet_addresses.json (DeviationBoundedOracle_Proxy). Same address VIP-633 uses.
export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";

/// @venusprotocol/protocol-reserve deployments/bsctestnet_addresses.json (ProtocolShareReserve_Proxy).
/// Owned by the Normal Timelock, so the registry call in this VIP needs no ACM grant.
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

/// ProtocolShareReserve income destinations, both live.
///
/// bsctestnet still routes 20% of both income schemas to `RiskFundConverter`, a destination bscmainnet
/// retired in VIP-618 when it moved to the buyback contracts. That drift is why this VIP touches the
/// distribution config: `RiskFundConverter` resolves the paying pool through a single `poolRegistry`
/// of its own and reverts `MarketNotExistInPool` (selector 0x983f1fb5, reproduced against the live
/// contract) for a comptroller that registry does not know, which would take down every
/// `releaseFunds` call naming the spoke pool.
///
/// `RiskFundBuyback` is already deployed on this chain (VIP-618) and holds exactly the 20% share on
/// both schemas on bscmainnet, so moving the row here is the mainnet shape, not a new allocation.
/// Verified against the live contract: called as ProtocolShareReserve, it accepts a comptroller no
/// registry knows.
export const RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const RISK_FUND_BUYBACK = "0x1a063a07853b9bC797E571E54B5Ce632195071fE";

/// The transparent-proxy admin both protocol-reserve and isolated-pools upgrade through on this chain.
/// Verified: it is the admin of the ProtocolShareReserve proxy above, and it is owned by the Normal
/// Timelock, so the upgrade in this VIP needs no ACM grant either.
export const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

/// The isolated-pools registry. Referenced only to make the contrast explicit: this pool is NOT
/// listed here, and the wildcard ACM grants this address holds name it as the account, so none of
/// them carry over to the spoke registry.
export const ISOLATED_POOL_REGISTRY = NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY;

// ---------------------------------------------------------------------------------------------------
// Underlying assets — live. All four are MockToken with a public `faucet(uint256)` on this chain.
// ---------------------------------------------------------------------------------------------------
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c"; // 6 decimals
export const TSLAB = "0x10d63B1203E5A0719AbbE927C8BFc87135b2F129"; // 18 decimals, MockTSLAB (VIP-633)
export const NVDAB = "0x8A7d8589A597619A7842d3BC284b9a5a276FaE56"; // 18 decimals, MockNVDAB (VIP-633)
export const SPCXB = "0x6D9e91cB766259af42619c14c994E694E57e6E85"; // 18 decimals, MockSPCXB (VIP-633)

// ===================================================================================================
// TODO(deploy) — NOT DEPLOYED YET. Every address below is a placeholder and MUST be replaced before
// this VIP is simulated or proposed. Left as the zero address on purpose: an obviously empty value is
// harder to miss in review than a plausible-looking literal.
// ===================================================================================================

/// TODO(deploy): the multi-registry `ProtocolShareReserve` implementation from protocol-reserve#168.
/// The proxy above is upgraded to it in this VIP, in the same proposal as `addPoolRegistry` — the PR
/// requires the two to ship together, per chain.
/// The current implementation on this chain is 0x6eFa596c53E6A753DdA643e3e3FEcA1570879b7C, which has
/// `setPoolRegistry` but not `addPoolRegistry` (checked against the deployed bytecode).
/// No reinitializer and no migration: PSR is a leaf contract, the new state is appended at slots
/// 305/306 and slots 301-304 are untouched.
export const PROTOCOL_SHARE_RESERVE_IMPL = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `deploy/024-deploy-spoke-pool-registry.ts` -> `SpokePoolRegistry`.
/// A SECOND `PoolRegistry` instance, behind the chain's existing DefaultProxyAdmin. The spoke pool is
/// deliberately kept out of the isolated-pools directory that the indexer, the frontend pool list and
/// the risk tooling all iterate.
/// `Ownable2Step`: the deploy script only NOMINATES the Normal Timelock, so this VIP must call
/// `acceptOwnership()` before `addPool`.
export const SPOKE_POOL_REGISTRY = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `deploy/025-deploy-spoke-comptroller.ts` -> `Comptroller_HubSpoke`.
/// BeaconProxy over SpokeComptrollerBeacon.
/// `Ownable2Step`, nominated only, so `acceptOwnership()` is this VIP's first command.
/// NOTE: the implementation takes the pool registry as a CONSTRUCTOR IMMUTABLE and `supportMarket`
/// checks `msg.sender == poolRegistry`, so the implementation must have been constructed with
/// SPOKE_POOL_REGISTRY above. There is no `setPoolRegistry` on this fork; a mismatch can only be
/// fixed by redeploying the implementation and re-pointing the beacon.
export const SPOKE_COMPTROLLER = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `SpokeComptrollerBeacon`. Reference only. Plain `Ownable`, and the
/// deploy script transfers it to the Normal Timelock inside the deploy transaction, so this VIP has
/// no command for it.
export const SPOKE_COMPTROLLER_BEACON = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `deploy/027-deploy-spoke-vtoken-beacon.ts` -> `SpokeVTokenBeacon`.
/// A VToken beacon of its own, so a VToken upgrade for this pool cannot move every isolated market on
/// the chain, or the other way round. The implementation is the same `VToken` with the same
/// constructor arguments the shared beacon points at, so the two behave identically until an upgrade
/// deliberately separates them.
/// Reference only: `UpgradeableBeacon` is plain `Ownable` and the script hands it to the Normal
/// Timelock inside the deploy transaction, so this VIP has no command for it.
export const SPOKE_VTOKEN_BEACON = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): isolated-pools `deploy/026-deploy-spoke-pool-lens.ts` -> `SpokePoolLens`.
/// Deployed alongside `PoolLens` rather than replacing it: this one answers about spoke pools, that
/// one about the pools in the shared registry. The spoke fields that were briefly added to `PoolLens`
/// are reverted, so no network without a spoke pool needs a lens redeploy.
/// Reference only: it holds no state, has no owner and no AccessControlManager, takes the registry to
/// read as a call argument, and nothing on chain stores its address. It therefore needs NO command in
/// this or any VIP. Listed here so the deployment is not forgotten.
export const SPOKE_POOL_LENS = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): one `JumpRateModelV2` for the liquidity side and one for the collateral side, or a
/// shared model. Must be constructed with `timeBased = false` and the chain's `blocksPerYear` to match
/// the VToken implementation the beacon points at.
/// TODO(risk): curve parameters (base / multiplier / jump / kink) are not specified in the PRD.
export const IRM_USDT = "0x0000000000000000000000000000000000000000";
export const IRM_BSTOCK = "0x0000000000000000000000000000000000000000";

/// TODO(deploy): the spoke markets, BeaconProxy over SPOKE_VTOKEN_BEACON, comptroller =
/// SPOKE_COMPTROLLER.
/// vUSDT lists at initialExchangeRate 10 ** (18 + 6 - 8) = 1e16, BELOW 1e18, because the underlying
/// has 6 decimals. The three bStock markets list at 1e28.
export const VUSDT_SPOKE = "0x0000000000000000000000000000000000000000";
export const VTSLAB_SPOKE = "0x0000000000000000000000000000000000000000";
export const VNVDAB_SPOKE = "0x0000000000000000000000000000000000000000";
export const VSPCXB_SPOKE = "0x0000000000000000000000000000000000000000";
