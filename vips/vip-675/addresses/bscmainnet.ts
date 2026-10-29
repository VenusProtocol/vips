import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {
  CollateralMarket,
  DboConfig,
  HUB_STACKS,
  IRM_COLLATERAL,
  IRM_LIQUIDITY,
  LiquidityMarket,
  U,
  USDC,
  USDT,
  VUSDC_SPOKE,
  VUSDT_SPOKE,
  VU_SPOKE,
} from "../../vip-670/addresses/bscmainnet";

// VIP-675 address book. Re-exports VIP-670's, which re-exports VIP-669's and VIP-668's.
export * from "../../vip-670/addresses/bscmainnet";

// ===================================================================================================
// VIP-675: the "bStock mainstream" Hub-Funded Spoke pool. A second pool in SPOKE_POOL_REGISTRY, next to the live
// "bStock index" pool (`Comptroller_HubSpoke`), with single-stock bStocks as collateral and USDT, USDC and U as
// liquidity. Its liquidity markets are funded by the same Spoke sources as the bStock index pool's.
//
// STATUS: DRAFT. Every `PENDING` fails loudly: the proposals throw with the full list until it is empty.
//
// Token data read on chain on 2026-10-27 (block ~130,080,000), Atlas feeds on 2026-10-29 (block ~130,460,000). Every
// underlying has 18 decimals, so every token amount below is 18-decimal scaled.
// ===================================================================================================

export const MAINSTREAM_POOL_NAME = "bStock mainstream";

/// Each pool's registry description, shown under its name on the Spoke pools page.
export const MAINSTREAM_POOL_DESCRIPTION = "Borrow against mainstream bStocks";
export const INDEX_POOL_DESCRIPTION = "Borrow against bStock index";

/// Suffix of every market's symbol, `vTSLAB_bStockMainstream`. The bStock index markets use `_bStockIndex`.
const SYMBOL_SUFFIX = "bStockMainstream";

// ---------------------------------------------------------------------------------------------------
// VIP-675's new contracts, from isolated-pools `025` and `028` (isolated-pools#575).
// ---------------------------------------------------------------------------------------------------

/// `Comptroller_bStockMainstream`, a BeaconProxy over SPOKE_COMPTROLLER_BEACON, so its `poolRegistry()` immutable is
/// SPOKE_POOL_REGISTRY. Initialized with MAX_LOOPS_LIMIT and the ACM, no oracle and no market. Ownable2Step: the
/// deployer still owns it and the Normal Timelock is only nominated.
export const MAINSTREAM_COMPTROLLER = "0xE14175059adc1B3C533184710425805A3063455B";

/// Each a BeaconProxy over SPOKE_VTOKEN_BEACON on MAINSTREAM_COMPTROLLER, owned by the Normal Timelock, with a 10%
/// reserve factor and the Normal Timelock as `shortfall`, so no `setShortfallContract` is needed.
export const VUSDT_MAINSTREAM = "0x2b12bC29044CE8f018Ae0aF5929450a8A6259Ed8";
export const VUSDC_MAINSTREAM = "0xD7608E9dFe6CB4b527d41abF40d0f46D917c9EeA";
export const VU_MAINSTREAM = "0x24Ee5A3F631f9c2FAf8a730d43F059D3eA9566AD";
export const VNVDAB_MAINSTREAM = "0x7f47B2B501Faf33cbE38435C4aEf3Da023340586";
export const VTSLAB_MAINSTREAM = "0xeC2476Fcc45AC88b0D2E2B977Fee19768e130a06";
export const VSPCXB_MAINSTREAM = "0x4fbF32E1ED761A98747b8f4870E8ccAC6052eEF0";
export const VSKHYB_MAINSTREAM = "0x31884079bCbE980d38DD48a32F62B46Abd177632";
export const VCRCLB_MAINSTREAM = "0x47F80e9D3727F2297268fe6b2a861DCe3e6a4488";
export const VGOOGLB_MAINSTREAM = "0x56009e54E2Aa6C36f3777f07DC7ec945b0b11BA6";
export const VAAPLB_MAINSTREAM = "0xD77456aa785E4B0FF998dc626781C60e3E281dBB";
export const VMSTRB_MAINSTREAM = "0x7b809DE9D18dBdab00f04506c7F82F253fc8d904";
export const VSNDKB_MAINSTREAM = "0x410b649F5B29F8344Bf84a999778aeA2C9bab13c";
export const VMETAB_MAINSTREAM = "0x44E91730193Ee0Ab539904bC24FC65A47c04d3d5";
export const VMSFTB_MAINSTREAM = "0xb4CCfb60A9F20E37205AB60A0D2335BaCdd42Be6";
export const VNBISB_MAINSTREAM = "0x8D36c5645185989edDaA37952C23e7360B544153";
export const VBEB_MAINSTREAM = "0x8DEA78aC2A09b11Bf8732c5041a0F1CC28daeD31";
export const VAMDB_MAINSTREAM = "0x23d96082D85562bC757194c045263778f8C1EFf7";
export const VMRNAB_MAINSTREAM = "0xb074a42fc36998B47F126F49d1c134B8e891894c";
export const VMUB_MAINSTREAM = "0x7318C484C6F51315F963279ef056F22740346e2A";
export const VINTCB_MAINSTREAM = "0x188B98fc54fB5343AbB38fa657826EbC1eD42953";
export const VDRAMB_MAINSTREAM = "0x7C790b26128112516f4beA9FCE763b2623023E0E";
export const VTSMB_MAINSTREAM = "0x28e19e1edD491F01BcFD13f96D99b5c04E176428";
export const VCOINB_MAINSTREAM = "0x04B9F583e59673c11Fa8603ea019C5B24644acc6";

// ---------------------------------------------------------------------------------------------------
// Underlyings. Beacon proxies of the same bStock token family as the Core pool's TSLAB.
// ---------------------------------------------------------------------------------------------------

export const NVDAB = "0x02Fca66C1D1aFB4E2A7884261eB00F63598a7436";
export const TSLAB = "0x5b1910eAaD6450E50f816082Aa078C41F10C292f";
export const SPCXB = "0xbe9D156892E55e7154BcD3cB0FEA677F9D3103E1";
export const SKHYB = "0xCA750eF65f295BBECd685Abf54e82CAf297BDB61";
export const CRCLB = "0x80f3D493EBCe97e343c53D29a137942416B4ffC0";
export const GOOGLB = "0x3F53De71c126BdaBAe20f9cD64848d317f6C3238";
export const AAPLB = "0x431a3BEE82E2ca41e49895CbECE5bB0F76A89b7A";
export const MSTRB = "0xE87afb3076AeB0f9B14E368DE8145ae6a2826A14";
export const SNDKB = "0x3eE4dF61bd4F867E349BEaE8bFE07bc31b4850fb";
export const METAB = "0x7425889FE94F9d693E8daefE88BCCed6AcFEf4c0";
export const MSFTB = "0x80106cb3EAD06659A5ad19DF39D9b4733863B9b0";
export const NBISB = "0xE256BC2A4F5297F8ba6f043F180a46300eCbCbB1";
export const BEB = "0x5519de00F5388c17d886b97Cb5D2D43a812a82bC";
export const AMDB = "0x75Fd4cF6f8392E41E70391D60c90C0D5211603a1";
export const MRNAB = "0x5fd86da9B05abE396fe9d02a4A213A7c00556503";
export const MUB = "0xcdf2f3e0fa43C47A6662a91C9E4a7C5f69762699";
export const INTCB = "0xe614E2fc6C787035FF51f452e8E826Bfd32D5283";
export const DRAMB = "0x93862d63fd9Fd488B1328E9b47717d75e994a84B";
export const TSMB = "0xAB78b89B5bb00236Be0B4B20704cBfa04EfC711c";
export const COINB = "0x585BDE7C54ABB5cCD7791F923D6c2187635f3952";

// ---------------------------------------------------------------------------------------------------
// Feeds. NVDAB, TSLAB, SPCXB and SKHYB are already priced for the Core pool: their Atlas, APRO, band and DBO configs
// are per asset, so this pool shares them and VIP-675 sends none. Their feeds are listed for the simulation to compare.
//
// The other 16 have no Venus oracle or DBO config yet. Each uses the Atlas feed Atlas lists for Venus, which
// authorizes ATLAS_ORACLE (all 16 since block 130,433,478). The DBO's `setTokenConfigs` reads the live price, so a
// feed that does not authorize it reverts the part with `OnlyAuthorizedCallerAllowed()`. Only CRCLB, SNDKB, METAB,
// MSFTB and MUB have an APRO feed on BNB Chain, and APRO_ORACLE already reads each. The rest are priced by Atlas
// alone, as SPYB is in the bStock index pool.
// ---------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------
// Markets.
// ---------------------------------------------------------------------------------------------------

/// The listing sheet's tiers. They only drive the risk values; every tier is listed.
export type Tier = 1 | 2 | 3 | 4;

export type MainstreamCollateralMarket = CollateralMarket & {
  tier: Tier;
  /// Listed on the Core pool too, so already priced: VIP-675 sends no oracle or DBO command for it, and its `dbo` is
  /// `null`.
  pricedOnCore: boolean;
  /// Set with `setProtocolSeizeShare` where it differs from the PROTOCOL_SEIZE_SHARE the market is deployed with.
  protocolSeizeShare: BigNumber;
};

/// The bStock index pool's market of the same asset, in the same Spoke source.
export type MainstreamLiquidityMarket = LiquidityMarket & { indexMarket: string };

/// The bStock index values, accepted for the new assets and to be tuned with `setThresholds` if needed.
export const DBO_WINDOW: DboConfig = {
  cooldownPeriod: 3600,
  triggerThreshold: parseUnits("0.125", 18),
  resetThreshold: parseUnits("0.05", 18),
  enableBoundedPricing: true,
  enableCaching: false,
};

const liquidity = {
  // The bStock index pool's rate model, reused by `028`: the listing sheet gives this pool the same one.
  interestRateModel: IRM_LIQUIDITY,
  collateralFactor: BigNumber.from(0),
  liquidationThreshold: BigNumber.from(0),
  supplyCap: parseUnits("5000000", 18),
  borrowCap: parseUnits("5000000", 18),
  reserveFactor: parseUnits("0.1", 18),
  initialSupply: parseUnits("10", 18),
};

const symbol = (asset: string) => `v${asset}_${SYMBOL_SUFFIX}`;

export const LIQUIDITY_MARKETS_MAINSTREAM: MainstreamLiquidityMarket[] = [
  {
    ...liquidity,
    symbol: symbol("USDT"),
    vToken: VUSDT_MAINSTREAM,
    underlying: USDT,
    stack: HUB_STACKS[0],
    indexMarket: VUSDT_SPOKE,
  },
  {
    ...liquidity,
    symbol: symbol("USDC"),
    vToken: VUSDC_MAINSTREAM,
    underlying: USDC,
    stack: HUB_STACKS[1],
    indexMarket: VUSDC_SPOKE,
  },
  {
    ...liquidity,
    symbol: symbol("U"),
    vToken: VU_MAINSTREAM,
    underlying: U,
    stack: HUB_STACKS[2],
    indexMarket: VU_SPOKE,
  },
];

// The listing sheet's risk values. Supply caps are sized in USD by tier (T1 $1M, T2 $300k, T3 and T4 $100k, at most 15%
// of the on-chain float) at the 2026-10-28 oracle price; re-convert them at the price before proposing.
const cap = (tokens: number) => parseUnits(tokens.toString(), 18);
/// Every collateral market gets an incentive of its own, even where it equals the pool-wide 10%.
const risk = (cf: string, lt: string, incentive: string, seizeShare: string) => ({
  collateralFactor: parseUnits(cf, 18),
  liquidationThreshold: parseUnits(lt, 18),
  liquidationIncentive: parseUnits(incentive, 18),
  protocolSeizeShare: parseUnits(seizeShare, 18),
});

const collateral = {
  interestRateModel: IRM_COLLATERAL,
  borrowCap: BigNumber.from(0),
  reserveFactor: parseUnits("0.1", 18),
};

// The Core assets keep the window they already have: it is global per asset, so changing it would change Core too.
const onCore = { ...collateral, pricedOnCore: true, dbo: null };
const newAsset = { ...collateral, pricedOnCore: false, dbo: DBO_WINDOW };

// Seeds are about $10 each at the 2026-10-27 Atlas price, and their vTokens are minted to SEED_RECEIVER. Re-check them
// against the price before proposing.
export const COLLATERAL_MARKETS_MAINSTREAM: MainstreamCollateralMarket[] = [
  // Tier 1
  {
    ...onCore,
    ...risk("0.75", "0.8", "1.08", "0.04"),
    tier: 1,
    symbol: symbol("NVDAB"),
    vToken: VNVDAB_MAINSTREAM,
    underlying: NVDAB,
    supplyCap: cap(4580),
    initialSupply: parseUnits("0.046", 18),
    atlasFeed: "0x8a44cF4E55adD99EB8bAC5D5DB749C63106d54AA",
    aproFeed: "0x310EFC9Fefe89B8085F89E91Ac782Bef6416499E",
  },
  {
    ...onCore,
    ...risk("0.75", "0.8", "1.08", "0.04"),
    tier: 1,
    symbol: symbol("TSLAB"),
    vToken: VTSLAB_MAINSTREAM,
    underlying: TSLAB,
    supplyCap: cap(2460),
    initialSupply: parseUnits("0.026", 18),
    atlasFeed: "0x63950C265e7CDB4016bA60C288c46291C0148ce2",
    aproFeed: "0xe1bc21701Bc8FFa39DaecDb8f58263C1d5e1c0bc",
  },
  {
    ...onCore,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 1,
    symbol: symbol("SPCXB"),
    vToken: VSPCXB_MAINSTREAM,
    underlying: SPCXB,
    supplyCap: cap(6700),
    initialSupply: parseUnits("0.068", 18),
    atlasFeed: "0x0072e55bff6fEC200708cE82612569a1C0EB4B24",
    aproFeed: "0x44c4173459121690613Bc22C110c4f0624254f3E",
  },
  {
    ...onCore,
    ...risk("0.55", "0.65", "1.15", "0.075"),
    tier: 1,
    symbol: symbol("SKHYB"),
    vToken: VSKHYB_MAINSTREAM,
    underlying: SKHYB,
    supplyCap: cap(6480),
    initialSupply: parseUnits("0.068", 18),
    atlasFeed: "0x8A87B38D4c8ef07546A1DD87a9D58f0B36B11a2B",
    aproFeed: "0x2446DCeDd294EDB5d90Ee16Fa32Da56Bc2973ACd",
  },
  {
    ...newAsset,
    ...risk("0.6", "0.7", "1.125", "0.0625"),
    tier: 1,
    symbol: symbol("CRCLB"),
    vToken: VCRCLB_MAINSTREAM,
    underlying: CRCLB,
    supplyCap: cap(12340),
    initialSupply: parseUnits("0.13", 18),
    atlasFeed: "0x19a018Bab6bF304abF43D19b55c6fE20EDEb68E0",
    aproFeed: "0x48e6876A8CDa6cf8db2089128cF20a18e58089D2",
  },
  {
    ...newAsset,
    ...risk("0.7", "0.75", "1.1", "0.05"),
    tier: 1,
    symbol: symbol("GOOGLB"),
    vToken: VGOOGLB_MAINSTREAM,
    underlying: GOOGLB,
    supplyCap: cap(3060),
    initialSupply: parseUnits("0.032", 18),
    atlasFeed: "0x4b4EF9Ee552bD84ba7a1bDd7Fa3d244be95d05b1",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.7", "0.75", "1.1", "0.05"),
    tier: 1,
    symbol: symbol("AAPLB"),
    vToken: VAAPLB_MAINSTREAM,
    underlying: AAPLB,
    supplyCap: cap(2330),
    initialSupply: parseUnits("0.03", 18),
    atlasFeed: "0xA71aC40d70973dBa9293c097cb67E7212324F9B9",
    aproFeed: null,
  },
  // Tier 2
  {
    ...newAsset,
    ...risk("0.6", "0.7", "1.125", "0.0625"),
    tier: 2,
    symbol: symbol("MSTRB"),
    vToken: VMSTRB_MAINSTREAM,
    underlying: MSTRB,
    supplyCap: cap(2120),
    initialSupply: parseUnits("0.072", 18),
    atlasFeed: "0xf71fBB759ADcAb021c1c752b167F9657554C5C76",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 2,
    symbol: symbol("SNDKB"),
    vToken: VSNDKB_MAINSTREAM,
    underlying: SNDKB,
    supplyCap: cap(220),
    initialSupply: parseUnits("0.008", 18),
    atlasFeed: "0x60952D780DC6D6dF7D88446bD38231d15873c980",
    aproFeed: "0xDCDa13B927F7d7641470a0d3173709d69443A361",
  },
  {
    ...newAsset,
    ...risk("0.7", "0.75", "1.1", "0.05"),
    tier: 2,
    symbol: symbol("METAB"),
    vToken: VMETAB_MAINSTREAM,
    underlying: METAB,
    supplyCap: cap(480),
    initialSupply: parseUnits("0.016", 18),
    atlasFeed: "0x1255aCf579422C98B4fE1C228ddAABE2Bc56f97D",
    aproFeed: "0x32Fd1E5E20b091Df7286EE8C69937C4A8D619885",
  },
  {
    ...newAsset,
    ...risk("0.75", "0.8", "1.08", "0.04"),
    tier: 2,
    symbol: symbol("MSFTB"),
    vToken: VMSFTB_MAINSTREAM,
    underlying: MSFTB,
    supplyCap: cap(560),
    initialSupply: parseUnits("0.019", 18),
    atlasFeed: "0x2446ce421C462a5fe5E083933b2B7c98027Ca1A7",
    aproFeed: "0xBC92F296c48E31409eD4DbD638F1fbe0ee5A3724",
  },
  // Tier 3. BNCB is not listed: neither Atlas nor APRO has a feed for it.
  {
    ...newAsset,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 3,
    symbol: symbol("NBISB"),
    vToken: VNBISB_MAINSTREAM,
    underlying: NBISB,
    supplyCap: cap(580),
    initialSupply: parseUnits("0.064", 18),
    atlasFeed: "0xEb6E6513BF28955A3e238EDF5748c47a09fE3CE9",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 3,
    symbol: symbol("BEB"),
    vToken: VBEB_MAINSTREAM,
    underlying: BEB,
    supplyCap: cap(450),
    initialSupply: parseUnits("0.048", 18),
    atlasFeed: "0xE62Db2289efA9Ff89B7654E94a331CeD74a7367d",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.65", "0.75", "1.125", "0.0625"),
    tier: 3,
    symbol: symbol("AMDB"),
    vToken: VAMDB_MAINSTREAM,
    underlying: AMDB,
    supplyCap: cap(180),
    initialSupply: parseUnits("0.019", 18),
    atlasFeed: "0x5724f378060097d851ec603d2278384bBbAC7bb1",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 3,
    symbol: symbol("MRNAB"),
    vToken: VMRNAB_MAINSTREAM,
    underlying: MRNAB,
    supplyCap: cap(490),
    initialSupply: parseUnits("0.052", 18),
    atlasFeed: "0xBA7932cb2F1ad5b5049F764e1A7D2Cd6bd767E3B",
    aproFeed: null,
  },
  // Tier 4
  {
    ...newAsset,
    ...risk("0.65", "0.75", "1.125", "0.0625"),
    tier: 4,
    symbol: symbol("MUB"),
    vToken: VMUB_MAINSTREAM,
    underlying: MUB,
    supplyCap: cap(100),
    initialSupply: parseUnits("0.011", 18),
    atlasFeed: "0x4764E68621eFF6C86F619c903e6D3Fb1c233ecD5",
    aproFeed: "0x9bDd29A3e175855d3DaD239F15fc7bFe1Fd70095",
  },
  {
    ...newAsset,
    ...risk("0.65", "0.75", "1.125", "0.0625"),
    tier: 4,
    symbol: symbol("INTCB"),
    vToken: VINTCB_MAINSTREAM,
    underlying: INTCB,
    supplyCap: cap(1060),
    initialSupply: parseUnits("0.11", 18),
    atlasFeed: "0x03012ABAAe5E63FC2353cDF31Cb2a06d73EA66B0",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.55", "0.65", "1.15", "0.075"),
    tier: 4,
    symbol: symbol("DRAMB"),
    vToken: VDRAMB_MAINSTREAM,
    underlying: DRAMB,
    supplyCap: cap(1920),
    initialSupply: parseUnits("0.21", 18),
    atlasFeed: "0x17E2B7BBf4A79fc7718ceb90529e5E644656EEbC",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.65", "0.75", "1.125", "0.0625"),
    tier: 4,
    symbol: symbol("TSMB"),
    vToken: VTSMB_MAINSTREAM,
    underlying: TSMB,
    supplyCap: cap(230),
    initialSupply: parseUnits("0.024", 18),
    atlasFeed: "0xFB838FD6e67606BB6fd59b33c2442c58BAf01605",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...risk("0.5", "0.6", "1.15", "0.075"),
    tier: 4,
    symbol: symbol("COINB"),
    vToken: VCOINB_MAINSTREAM,
    underlying: COINB,
    supplyCap: cap(630),
    initialSupply: parseUnits("0.063", 18),
    atlasFeed: "0xF7a8CCAcAffD563e673f73FbD2E26f25A81B0D7C",
    aproFeed: null,
  },
];
