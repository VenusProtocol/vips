import { NETWORK_ADDRESSES } from "src/networkAddresses";

// ===================================================================================================
// VIP-671 [BNB Chain Testnet] — Hub-Funded Spoke pool, PHASE 1 address book.
//
// Phase 1 covers the spoke pool side only (isolated-pools#559). The Liquidity Hub wiring
// (venus-liquidity-hub#22) and the bStock liquidation leg (venus-protocol#707) are Phase 2 and have
// no addresses here on purpose.
//
// The spoke stack below is deployed and was read back from bsctestnet (chainId 97) while drafting:
//   - SpokePoolRegistry and Comptroller_HubSpoke are both Ownable2Step with the deployer still the
//     live owner and the Normal Timelock only nominated, so both need `acceptOwnership()`.
//   - Comptroller_HubSpoke.poolRegistry() == SpokePoolRegistry. That is a constructor immutable with
//     no setter, and `supportMarket` checks it, so this is the check that must never drift.
//   - Both beacons are already owned by the Normal Timelock, so neither needs a command.
//   - Both oracles on the comptroller are still the zero address, and the registry holds no pools.
//   - Both markets carry the 10% reserve factor and the 5% protocol seize share their initializer
//     set, and neither is listed yet.
//
// Underlying decimals: bsctestnet USDT and USDC both have 6 DECIMALS, so every amount in ../config.ts
// is 6-decimal and both markets list at an initial exchange rate of 1e16, below 1e18.
// ===================================================================================================

// The Normal Timelock and the Guardian are the two grantees. The Fast-track and Critical timelocks are
// deliberately absent from this file: they receive nothing from this VIP. The Guardian's grants are a
// bsctestnet decision, made so QA can drive this pool without a proposal per test case, and they do not
// carry to a mainnet listing. See ../permissions.ts.
const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY } = NETWORK_ADDRESSES.bsctestnet;

export const ACM = ACCESS_CONTROL_MANAGER;
export { GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY };

// ---------------------------------------------------------------------------------------------------
// The spoke stack. isolated-pools deploy/024 through deploy/028, all live on bsctestnet.
// ---------------------------------------------------------------------------------------------------

/// `SpokePoolRegistry`, a second `PoolRegistry` instance behind the chain's DefaultProxyAdmin. The
/// spoke pool is kept out of the isolated-pools directory that the indexer, the frontend pool list
/// and the risk tooling all iterate. Ownable2Step, nominated only: `acceptOwnership()` comes first.
export const SPOKE_POOL_REGISTRY = "0xeAA45288d804971e5a76f33559e629F5b2b1Cb8B";

/// `Comptroller_HubSpoke`, a BeaconProxy over SpokeComptrollerBeacon. Ownable2Step, nominated only.
export const SPOKE_COMPTROLLER = "0x11960c84d6c4F2a978a12372721C3A6A88C78f4c";

/// Reference only. `UpgradeableBeacon` is plain `Ownable` and both were handed to the Normal Timelock
/// inside their deploy transactions, so this VIP has no command for either.
export const SPOKE_COMPTROLLER_BEACON = "0x076f3fb34C8937a62aD562c33249798367542d75";
export const SPOKE_VTOKEN_BEACON = "0xB9c3b5A6f13FD5BEF51eE8B62ED3EA384a9d1B45";

/// Reference only. The lens holds no state, has no owner and no AccessControlManager, takes the
/// registry to read as a call argument, and nothing on chain stores its address, so it needs no
/// command in this or any VIP.
export const SPOKE_POOL_LENS = "0xfbCBFF4ca8b2fFe3231b0c0BBEa25C79F4B0597c";

// ---------------------------------------------------------------------------------------------------
// Markets and underlyings.
// ---------------------------------------------------------------------------------------------------
// Both are 6 decimals and both mint through `allocateTo(address,uint256)`, not the `faucet(uint256)`
// the bStock mocks carry. Checked against the deployed bytecode.
export const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
export const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

export const VUSDT_SPOKE = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a"; // vUSDT_HubSpoke
export const VUSDC_SPOKE = "0xD05514217FD359659aE7da7740e79C11947eBB32"; // vUSDC_HubSpoke

/// One shared `JumpRateModelV2` for both markets. Verified on chain: kink 0.8e18, 70,080,000 blocks
/// per year. Constructed by deploy/028 from the curve in isolated-pools helpers/spokeDeploymentConfig.
export const IRM_SPOKE = "0x6700020659b6100A92ac1817D5489d67ee8D8F32";

// ---------------------------------------------------------------------------------------------------
// Oracles — both live. The ResilientOracle needs no command; the bounded oracle takes one.
// ---------------------------------------------------------------------------------------------------

/// Taken from oracle/deployments/bsctestnet_addresses.json (DeviationBoundedOracle_Proxy), the same
/// address VIP-633 uses. It resolves `vToken.underlying()` and keys its config on the UNDERLYING, so
/// the new spoke vTokens inherit whatever the underlying already carries.
///
/// USDT already carries a price window here; USDC carried none, so this VIP gives USDC USDT's exact
/// configuration and both sides of the pool end up priced the same way. See ../config.ts.
export const DEVIATION_BOUNDED_ORACLE = "0xE0dafC97895B3c98d3B96D3f8739AaC73166beB8";

// ---------------------------------------------------------------------------------------------------
// ProtocolShareReserve.
// ---------------------------------------------------------------------------------------------------

/// @venusprotocol/protocol-reserve deployments/bsctestnet_addresses.json (ProtocolShareReserve_Proxy).
/// Owned by the Normal Timelock, so the calls in this VIP need no ACM grant.
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";

/// The multi-registry `ProtocolShareReserve` implementation from protocol-reserve#168, deployed but
/// not yet adopted: the proxy above still points at 0x6eFa596c53E6A753DdA643e3e3FEcA1570879b7C, which
/// carries `setPoolRegistry` but not `addPoolRegistry`. This VIP performs the upgrade.
///
/// Verified against the deployed bytecode: `addPoolRegistry`, `removePoolRegistry`,
/// `getPoolRegistries` and `isMarketRegistered` are all present, and every constructor immutable
/// matches the implementation in use today (CORE_POOL_COMPTROLLER 0x94d1…b77D, which is the
/// bsctestnet Unitroller, plus WBNB and vBNB). An immutable that drifted here would silently break
/// the core-pool bypass in `updateAssetsState`.
///
/// No reinitializer and no migration: PSR is a leaf contract, the new state is appended at slots
/// 305/306 and slots 301-304 are untouched.
export const PROTOCOL_SHARE_RESERVE_IMPL = "0x248Ea902F2f50cb232799196530bCDaDcF2659E9";

/// The transparent-proxy admin both protocol-reserve and isolated-pools upgrade through on this chain.
/// Verified: it is the admin of the ProtocolShareReserve proxy above, and it is owned by the Normal
/// Timelock, so the upgrade in this VIP needs no ACM grant either.
export const DEFAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

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

/// The isolated-pools registry. Referenced only to make the contrast explicit: this pool is NOT
/// listed here, and the wildcard ACM grants this address holds name it as the account, so none of
/// them carry over to the spoke registry.
export const ISOLATED_POOL_REGISTRY = NETWORK_ADDRESSES.bsctestnet.POOL_REGISTRY;
