import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { PENDING, U, USDC, USDT } from "../../vip-671/addresses/bscmainnet";
import { HUB_STACKS, HubStack } from "../../vip-672/addresses/bscmainnet";

// VIP-673 address book. Re-exports VIP-672's, which re-exports VIP-671's.
export * from "../../vip-672/addresses/bscmainnet";

const { ATLAS_ORACLE, VTREASURY } = NETWORK_ADDRESSES.bscmainnet;

// ===================================================================================================
// VIP-673: markets and Hub wiring. Already on chain, read on 2026-10-14 (block ~127,552,000).
//
// Market values are the risk listing sheet's ("bStock index spoke pool listing"). All five underlyings have 18
// decimals (read on chain), so every token amount below is 18-decimal scaled.
// ===================================================================================================

/// Owned by the Normal Timelock. Pays each market's seed through `withdrawTreasuryBEP20` (`onlyOwner`). It held none
/// of the five underlyings on 2026-10-14, so it has to be funded before execution.
export { VTREASURY };

/// Main and pivot oracle of the Core bStocks, both `ChainlinkOracle` proxies owned by the Normal Timelock. TSLAB reads
/// Atlas with a 3800s and APRO with a 3900s max stale period, inside a 0.95 to 1.05 `BoundValidator` band.
export { ATLAS_ORACLE };
export const APRO_ORACLE = "0x04480f1Ba2252CDF89deB022B58d0a03d1B4cF91";
export const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
export const ATLAS_MAX_STALE_PERIOD = 3800;
export const APRO_MAX_STALE_PERIOD = 3900;
export const BOUND_UPPER_RATIO = parseUnits("1.05", 18);
export const BOUND_LOWER_RATIO = parseUnits("0.95", 18);

/// The live isolated-pools `Shortfall`. `028` initializes every market with it, but it cannot auction this pool's bad
/// debt: auctions are paused, and `startAuction` resolves pools through the isolated-pools registry only. VIP-673
/// points each market's `shortfall` at the Normal Timelock instead.
export const SHORTFALL = "0xf37530A8a810Fcb501AA0Ecd0B0699388F0F2209";

/// Beacon proxies of the same token family as TSLAB (same proxy code and beacon). No Venus oracle or DBO config for
/// either on 2026-10-14.
export const QQQB = "0x205812CdBed920aFf76C6580abD681a46D11efc7";
export const SPYB = "0x7138b48df7D98D7e3cc221BfE7192D0a178182D8";

/// Receives every market's seed vTokens, per the risk listing sheet. `addMarket` rejects address(0).
export const SEED_RECEIVER = "0x000000000000000000000000000000000000dEaD";

// ---------------------------------------------------------------------------------------------------
// QQQB and SPYB feeds, per the risk sheet. APRO's access controller on the QQQB feed already allows APRO_ORACLE.
// TODO(feed): Atlas has not authorized ATLAS_ORACLE on either Atlas feed yet (`isAuthorizedCaller` false on
// 2026-10-16), so `ATLAS_ORACLE` reads revert `OnlyAuthorizedCallerAllowed()` until it does. The risk sheet has no
// SPYB APRO feed yet.
// ---------------------------------------------------------------------------------------------------

export const QQQB_ATLAS_FEED = "0x7D2f703D2A188f32310dC9707E86acE503207027";
export const QQQB_APRO_FEED = "0x2708567c468db65a72095716FCff023dcDfEA07A";
export const SPYB_ATLAS_FEED = "0xCda6d5cE036AC0D6A387A377062EBd18Dd531177";
export const SPYB_APRO_FEED = PENDING;

// ---------------------------------------------------------------------------------------------------
// VIP-673's new contracts.
// ---------------------------------------------------------------------------------------------------

/// The five markets, from isolated-pools `028` (#570, e285a412). Read back on 2026-10-19 (block 128,482,331): each is
/// a BeaconProxy on SPOKE_VTOKEN_BEACON, built on SPOKE_COMPTROLLER with its rate model below, a 10% reserve factor,
/// SHORTFALL and the ProtocolShareReserve, owned by the Normal Timelock with no pending owner, and not listed yet.
export const VUSDT_SPOKE = "0xEA0096142fBB56AAc0F594ED1D4de3E4De638f22";
export const VUSDC_SPOKE = "0x6adb5e462ac6eA880246F24E3C47D23f70FCCbF6";
export const VU_SPOKE = "0x713bBaA44Dc99e691F1F9fE8086FC328E94B6f27";
export const VQQQB_SPOKE = "0xeA32B70f4106d9ef6f0fF95f7422Fa679494c362";
export const VSPYB_SPOKE = "0x259311A868B49CdA457C1843F89D4dDA33be0390";

/// Reference only: no command targets them. The rate models `028` built the markets with, both at 70,080,000 blocks
/// per year as the markets are: LIQUIDITY_IRM below for USDT, USDC and U, and for QQQB and SPYB a WhitePaper model with
/// both rates 0, for the risk sheet's IRM of 0.
export const IRM_LIQUIDITY = "0xb3AEAcC027991171F8f6C05e4D9254DF507b52C7";
export const IRM_COLLATERAL = "0x11C29b4b3cDbC7069920b2bE9A0b9D1711617A4d";

/// `AdapterSpokeV1` (venus-liquidity-hub `13_DeploySpoke`, #39). Stateless, no constructor argument.
export const ADAPTER_SPOKE_V1 = "0x231915FfE3e3A6Be09B0E5c73EFA2F1a4FF8Aa69";

/// `CollateralGateway` (venus-periphery `028`, #85, which carries the #78 and #83 fixes). Not upgradeable. Read back
/// on 2026-10-15: CORE_COMPTROLLER and SPOKE_POOL_REGISTRY as its immutables, owner the Normal Timelock.
export const COLLATERAL_GATEWAY = "0xd0F7B94BF06675D13e8bA9a2546835a1c32a80b8";

// ---------------------------------------------------------------------------------------------------
// Market parameters.
// ---------------------------------------------------------------------------------------------------

/// Blocks between reserve sweeps to the ProtocolShareReserve, on every market. No deploy script sets it.
export const REDUCE_RESERVES_BLOCK_DELTA = 28800;

/// Every market's protocol seize share, per the risk sheet. It is the VToken default, so VIP-673 has no
/// `setProtocolSeizeShare`.
export const PROTOCOL_SEIZE_SHARE = parseUnits("0.05", 18);

/// The liquidity markets' JumpRateModelV2, per the risk sheet. Per-year values; the model divides them by its
/// `blocksOrSecondsPerYear`.
export const LIQUIDITY_IRM = {
  baseRatePerYear: BigNumber.from("14888916156458044"),
  multiplierPerYear: BigNumber.from("37459988156559232"),
  jumpMultiplierPerYear: BigNumber.from("998472797360528128"),
  kink: parseUnits("0.9", 18),
};

export type SpokeMarket = {
  symbol: string;
  vToken: string;
  underlying: string;
  interestRateModel: string;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  reserveFactor: BigNumber;
  /// Pulled from the VTreasury and minted to SEED_RECEIVER by `addMarket`.
  initialSupply: BigNumber | null;
};

/// Supplied only by its Hub's Spoke source, through the supply allowlist. CF and LT 0, so supplying gives no borrow
/// power, and it never needs an incentive of its own.
export type LiquidityMarket = SpokeMarket & {
  stack: HubStack;
};

export type DboConfig = {
  cooldownPeriod: number;
  triggerThreshold: BigNumber;
  resetThreshold: BigNumber;
  enableBoundedPricing: boolean;
  enableCaching: boolean;
};

/// Open to any supplier, usable as collateral, not borrowable: borrow cap 0 and BORROW paused.
export type CollateralMarket = SpokeMarket & {
  liquidationIncentive: BigNumber;
  atlasFeed: string;
  aproFeed: string;
  /// `setTokenConfig` runs once per asset and reverts `MarketAlreadyInitialized` after that.
  dbo: DboConfig | null;
};

const liquidity = {
  interestRateModel: IRM_LIQUIDITY,
  collateralFactor: BigNumber.from(0),
  liquidationThreshold: BigNumber.from(0),
  supplyCap: parseUnits("5000000", 18),
  borrowCap: parseUnits("5000000", 18),
  reserveFactor: parseUnits("0.1", 18),
  initialSupply: parseUnits("10", 18),
};

/// USDT, USDC and U, one per Hub.
export const LIQUIDITY_MARKETS: LiquidityMarket[] = [
  { ...liquidity, symbol: "vUSDT_bStockIndex", vToken: VUSDT_SPOKE, underlying: USDT, stack: HUB_STACKS[0] },
  { ...liquidity, symbol: "vUSDC_bStockIndex", vToken: VUSDC_SPOKE, underlying: USDC, stack: HUB_STACKS[1] },
  { ...liquidity, symbol: "vU_bStockIndex", vToken: VU_SPOKE, underlying: U, stack: HUB_STACKS[2] },
];

const collateral = {
  interestRateModel: IRM_COLLATERAL,
  collateralFactor: parseUnits("0.8", 18),
  liquidationThreshold: parseUnits("0.85", 18),
  supplyCap: parseUnits("10000", 18),
  borrowCap: BigNumber.from(0),
  reserveFactor: parseUnits("0.1", 18),
  // The pool-wide value, pinned per market: every market with LT above 0 gets an incentive of its own.
  liquidationIncentive: parseUnits("1.1", 18),
  // Fixed seed of 0.014 tokens per collateral market, approximately $10 at preparation time.
  // The seed vTokens are minted to SEED_RECEIVER.
  initialSupply: parseUnits("0.014", 18),
  dbo: {
    cooldownPeriod: 3600,
    triggerThreshold: parseUnits("0.125", 18),
    resetThreshold: parseUnits("0.05", 18),
    enableBoundedPricing: true,
    enableCaching: false,
  },
};

export const COLLATERAL_MARKETS: CollateralMarket[] = [
  {
    ...collateral,
    symbol: "vQQQB_bStockIndex",
    vToken: VQQQB_SPOKE,
    underlying: QQQB,
    atlasFeed: QQQB_ATLAS_FEED,
    aproFeed: QQQB_APRO_FEED,
  },
  {
    ...collateral,
    symbol: "vSPYB_bStockIndex",
    vToken: VSPYB_SPOKE,
    underlying: SPYB,
    atlasFeed: SPYB_ATLAS_FEED,
    aproFeed: SPYB_APRO_FEED,
  },
];
