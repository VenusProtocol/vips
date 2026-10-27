import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {
  CollateralMarket,
  DboConfig,
  HUB_STACKS,
  IRM_COLLATERAL,
  IRM_LIQUIDITY,
  LiquidityMarket,
  PENDING,
  U,
  USDC,
  USDT,
  VUSDC_SPOKE,
  VUSDT_SPOKE,
  VU_SPOKE,
} from "../../vip-670/addresses/bscmainnet";

// VIP-674 address book. Re-exports VIP-670's, which re-exports VIP-669's and VIP-668's.
export * from "../../vip-670/addresses/bscmainnet";

// ===================================================================================================
// VIP-674: the "Bluechips" Hub-Funded Spoke pool. A second pool in SPOKE_POOL_REGISTRY, next to the live
// "bStock index" pool (`Comptroller_HubSpoke`), with single-stock bStocks as collateral and USDT, USDC and U as
// liquidity. Its liquidity markets are funded by the same Spoke sources as the bStock index pool's.
//
// STATUS: DRAFT. Four assets wait for Atlas to name their canonical feed, and the risk values are placeholders the risk
// owner still has to confirm. Every `PENDING` fails loudly: the proposals throw with the full list until it is empty.
//
// Token data and feeds read on chain on 2026-10-27 (block ~130,080,000). Every underlying has 18 decimals, so every
// token amount below is 18-decimal scaled.
// ===================================================================================================

export const BLUECHIPS_POOL_NAME = "Bluechips";

/// Suffix of every market's symbol, `vTSLAB_Bluechips`. The bStock index markets use `_bStockIndex`.
const SYMBOL_SUFFIX = "Bluechips";

// ---------------------------------------------------------------------------------------------------
// VIP-674's new contracts, from isolated-pools `025` and `028` (isolated-pools#575). Read back on 2026-10-27
// (block ~130,086,000).
// ---------------------------------------------------------------------------------------------------

/// `Comptroller_Bluechips`, a BeaconProxy over SPOKE_COMPTROLLER_BEACON, so its `poolRegistry()` immutable is
/// SPOKE_POOL_REGISTRY. Initialized with MAX_LOOPS_LIMIT and the ACM, no oracle and no market. Ownable2Step: the
/// deployer still owns it and the Normal Timelock is only nominated.
export const BLUECHIPS_COMPTROLLER = "0xE14175059adc1B3C533184710425805A3063455B";

/// Each a BeaconProxy over SPOKE_VTOKEN_BEACON, built on BLUECHIPS_COMPTROLLER with its rate model below, a 10% reserve
/// factor, the Normal Timelock as `shortfall` (so no `setShortfallContract` is needed) and the ProtocolShareReserve,
/// owned by the Normal Timelock with no pending owner, 8 decimals, no supply and a reserve delta of 0.
export const VUSDT_BLUECHIPS = "0x6bdEB94bcFb8E7B256d05994B156900268BDc469";
export const VUSDC_BLUECHIPS = "0xF2147D0CF323eb0dFCB5ded960d7f87f98EA9Ad8";
export const VU_BLUECHIPS = "0xfBf57056e01D69afc037218f94Dbd00FD1740691";
export const VNVDAB_BLUECHIPS = "0x63a5d9C2f30a1f122D630edF20D522126bC78766";
export const VTSLAB_BLUECHIPS = "0x0e6349BC4a202c0Ace54D8519DdC0ce2eCd3315e";
export const VSPCXB_BLUECHIPS = "0x82499db27652Ada8890E0684bD235dC5144b5179";
export const VSKHYB_BLUECHIPS = "0xc100c81100ce8f83663b74d18B894EE16A862913";
export const VCRCLB_BLUECHIPS = "0xAa1c37495E0eE032e3B2F795559A700396C3eBFF";
export const VGOOGLB_BLUECHIPS = "0x813A5bCa146A625D2c679Cd934BA68ae0A02E5d9";
export const VAAPLB_BLUECHIPS = "0x566467c09c43fdb403D1E30FA1b695d229e158aE";
export const VMSTRB_BLUECHIPS = "0x85afab98CE7745776B7CC3FAA7f4cc7052FEE21E";
export const VSNDKB_BLUECHIPS = "0x808fdAE079D3D04DB7CD7885941995730ceBB042";
export const VMETAB_BLUECHIPS = "0xCFe2505Fc927FDeE6e92631841AD672D1ED07290";
export const VMSFTB_BLUECHIPS = "0x0C2F70A6e4F81DF2F38338ACD83955C95fFCD86b";
export const VNBISB_BLUECHIPS = "0x2Bf449b200EdB61dAB6c90C19562C20C92c501d9";
export const VBEB_BLUECHIPS = "0xa99EC2269B67788f59380ec9D642AFD46d41e83B";
export const VAMDB_BLUECHIPS = "0x628b58ed685D94cef0E3A1b052ef93477529D589";
export const VMRNAB_BLUECHIPS = "0xE63e40d6e2578d1Cf0f8666fCB0aaAE77d8EF6b4";
export const VMUB_BLUECHIPS = "0x0a3743D383DaDF01DDf0Aa04aD9A2a4D414FA91C";
export const VINTCB_BLUECHIPS = "0x3D6239e4c0100ac08226e20d89C016de1a3020eb";
export const VDRAMB_BLUECHIPS = "0x74dD3941432688aC4937e56a5368e47bCcFD58d7";
export const VAMATB_BLUECHIPS = "0xAD69259df05EaC19FDAE4AC234987d7307D6264b";
export const VTSMB_BLUECHIPS = "0xaD7997FbDE9fe81A9Eb9c719209a663d0dC94E3c";
export const VCOINB_BLUECHIPS = "0x9E77a943CC84c304AE0b60ea42e78a75e06dcad0";

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
export const AMATB = "0xa304BD78e739C0F777202B3eB73Ac3736d1df801";
export const TSMB = "0xAB78b89B5bb00236Be0B4B20704cBfa04EfC711c";
export const COINB = "0x585BDE7C54ABB5cCD7791F923D6c2187635f3952";

// ---------------------------------------------------------------------------------------------------
// Feeds. NVDAB, TSLAB, SPCXB and SKHYB are already priced for the Core pool: their Atlas, APRO, band and DBO configs
// are per asset, so this pool shares them and VIP-674 sends none. Their feeds are listed for the simulation to compare.
//
// The other 17 have no Venus oracle or DBO config yet. Atlas has to authorize ATLAS_ORACLE on each of their feeds
// before execution: the DBO's `setTokenConfigs` reads the live price, and every feed set below still rejects
// ATLAS_ORACLE with `OnlyAuthorizedCallerAllowed()` (probed 2026-10-27). Only CRCLB, SNDKB, METAB, MSFTB and MUB have
// an APRO feed on BNB Chain, and APRO_ORACLE already reads each. The rest are priced by Atlas alone, as SPYB is in the
// bStock index pool.
// ---------------------------------------------------------------------------------------------------

/// Live Atlas feeds of the four assets with more than one. Atlas names the canonical one, which goes in the market
/// below; until then the market's `atlasFeed` is `PENDING`. Exported for the simulation, which stands in with the
/// first.
export const ATLAS_FEED_CANDIDATES: Record<string, string[]> = {
  CRCLB: ["0x3Fe4Ad1BBb3ad138AA7d8a63a9A2984eC9641064", "0xA52Ad277276628F35C441D3436F58E36ae56A552"],
  SNDKB: [
    "0xEb856d62Bdf5b00C5a62c44B3fF94caF5F5d32DC",
    "0x41C63Ff9fA041763a86878784C5436c6F531707D",
    "0xAaA14e42F8F907C169a39c53784E997D5922ef4a",
  ],
  MSFTB: ["0x458a78447e43302574d25b6F8AfDEa2Db5d8B5Da", "0xe39fC955A9b926d5ce0242505006611678180307"],
  MUB: [
    "0x8367a2103Ad370c0358BA6d4817BBC8EC92BbA32",
    "0x099e1Df682Aeb873C676c8dB076E59Eec64Ac932",
    "0x59e0FeE765A89329F62B99e9b68ebDBcBB9128F1",
    "0xcC8d5Ffd711A85775EECB4EcE319eDDCC5EeBCE5",
    "0xeCa90386c256EbAB5102e45bcfdd73CB617F8C14",
  ],
};

// ---------------------------------------------------------------------------------------------------
// Markets.
// ---------------------------------------------------------------------------------------------------

/// The listing sheet's tiers. They only drive the risk values; every tier is listed.
export type Tier = 1 | 2 | 3 | 4;

export type BluechipsCollateralMarket = CollateralMarket & {
  tier: Tier;
  /// Listed on the Core pool too, so already priced: VIP-674 sends no oracle or DBO command for it, and its `dbo` is
  /// `null`.
  pricedOnCore: boolean;
};

/// The bStock index pool's market of the same asset, in the same Spoke source.
export type BluechipsLiquidityMarket = LiquidityMarket & { indexMarket: string };

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

export const LIQUIDITY_MARKETS_BLUECHIPS: BluechipsLiquidityMarket[] = [
  {
    ...liquidity,
    symbol: symbol("USDT"),
    vToken: VUSDT_BLUECHIPS,
    underlying: USDT,
    stack: HUB_STACKS[0],
    indexMarket: VUSDT_SPOKE,
  },
  {
    ...liquidity,
    symbol: symbol("USDC"),
    vToken: VUSDC_BLUECHIPS,
    underlying: USDC,
    stack: HUB_STACKS[1],
    indexMarket: VUSDC_SPOKE,
  },
  {
    ...liquidity,
    symbol: symbol("U"),
    vToken: VU_BLUECHIPS,
    underlying: U,
    stack: HUB_STACKS[2],
    indexMarket: VU_SPOKE,
  },
];

// PLACEHOLDER risk values, to be confirmed by the risk owner. The four Core assets take their Core collateral factor,
// liquidation threshold and supply cap; the other 17 take the listing sheet's template defaults (CF 60%, LT 65%) and a
// supply cap of about $100,000 at the 2026-10-27 Atlas price, rounded to two significant figures.
const cap = (tokens: number) => parseUnits(tokens.toString(), 18);
const factors = (cf: string, lt: string) => ({
  collateralFactor: parseUnits(cf, 18),
  liquidationThreshold: parseUnits(lt, 18),
});
const TEMPLATE = factors("0.6", "0.65");

const collateral = {
  interestRateModel: IRM_COLLATERAL,
  borrowCap: BigNumber.from(0),
  reserveFactor: parseUnits("0.1", 18),
  // The pool-wide value, pinned per market: every market with LT above 0 gets an incentive of its own.
  liquidationIncentive: parseUnits("1.1", 18),
};

// The Core assets keep the window they already have: it is global per asset, so changing it would change Core too.
const onCore = { ...collateral, pricedOnCore: true, dbo: null };
const newAsset = { ...collateral, pricedOnCore: false, dbo: DBO_WINDOW };

// Seeds are about $10 each at the 2026-10-27 Atlas price, and their vTokens are minted to SEED_RECEIVER. Re-check them
// against the price before proposing.
export const COLLATERAL_MARKETS_BLUECHIPS: BluechipsCollateralMarket[] = [
  // Tier 1
  {
    ...onCore,
    ...factors("0.6", "0.7"),
    tier: 1,
    symbol: symbol("NVDAB"),
    vToken: VNVDAB_BLUECHIPS,
    underlying: NVDAB,
    supplyCap: cap(1500),
    initialSupply: parseUnits("0.046", 18),
    atlasFeed: "0x8a44cF4E55adD99EB8bAC5D5DB749C63106d54AA",
    aproFeed: "0x310EFC9Fefe89B8085F89E91Ac782Bef6416499E",
  },
  {
    ...onCore,
    ...factors("0.6", "0.7"),
    tier: 1,
    symbol: symbol("TSLAB"),
    vToken: VTSLAB_BLUECHIPS,
    underlying: TSLAB,
    supplyCap: cap(236),
    initialSupply: parseUnits("0.026", 18),
    atlasFeed: "0x63950C265e7CDB4016bA60C288c46291C0148ce2",
    aproFeed: "0xe1bc21701Bc8FFa39DaecDb8f58263C1d5e1c0bc",
  },
  {
    ...onCore,
    ...factors("0.5", "0.65"),
    tier: 1,
    symbol: symbol("SPCXB"),
    vToken: VSPCXB_BLUECHIPS,
    underlying: SPCXB,
    supplyCap: cap(2000),
    initialSupply: parseUnits("0.068", 18),
    atlasFeed: "0x0072e55bff6fEC200708cE82612569a1C0EB4B24",
    aproFeed: "0x44c4173459121690613Bc22C110c4f0624254f3E",
  },
  {
    ...onCore,
    ...factors("0.5", "0.65"),
    tier: 1,
    symbol: symbol("SKHYB"),
    vToken: VSKHYB_BLUECHIPS,
    underlying: SKHYB,
    supplyCap: cap(375),
    initialSupply: parseUnits("0.068", 18),
    atlasFeed: "0x8A87B38D4c8ef07546A1DD87a9D58f0B36B11a2B",
    aproFeed: "0x2446DCeDd294EDB5d90Ee16Fa32Da56Bc2973ACd",
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 1,
    symbol: symbol("CRCLB"),
    vToken: VCRCLB_BLUECHIPS,
    underlying: CRCLB,
    supplyCap: cap(1300),
    initialSupply: parseUnits("0.13", 18),
    atlasFeed: PENDING,
    aproFeed: "0x48e6876A8CDa6cf8db2089128cF20a18e58089D2",
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 1,
    symbol: symbol("GOOGLB"),
    vToken: VGOOGLB_BLUECHIPS,
    underlying: GOOGLB,
    supplyCap: cap(310),
    initialSupply: parseUnits("0.032", 18),
    atlasFeed: "0x2FcEafD81a4dBDa2409B6fe5ce2afFe3cD46eDbC",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 1,
    symbol: symbol("AAPLB"),
    vToken: VAAPLB_BLUECHIPS,
    underlying: AAPLB,
    supplyCap: cap(290),
    initialSupply: parseUnits("0.03", 18),
    atlasFeed: "0xD96eB519e205cEA68522E6639B6464249948294c",
    aproFeed: null,
  },
  // Tier 2
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 2,
    symbol: symbol("MSTRB"),
    vToken: VMSTRB_BLUECHIPS,
    underlying: MSTRB,
    supplyCap: cap(710),
    initialSupply: parseUnits("0.072", 18),
    atlasFeed: "0x5453B1ABf6029A5d05De56D48d3a835Df80b7A7f",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 2,
    symbol: symbol("SNDKB"),
    vToken: VSNDKB_BLUECHIPS,
    underlying: SNDKB,
    supplyCap: cap(78),
    initialSupply: parseUnits("0.008", 18),
    atlasFeed: PENDING,
    aproFeed: "0xDCDa13B927F7d7641470a0d3173709d69443A361",
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 2,
    symbol: symbol("METAB"),
    vToken: VMETAB_BLUECHIPS,
    underlying: METAB,
    supplyCap: cap(160),
    initialSupply: parseUnits("0.016", 18),
    atlasFeed: "0xD53300F42830552D826244fc17a6A0a4a95980A6",
    aproFeed: "0x32Fd1E5E20b091Df7286EE8C69937C4A8D619885",
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 2,
    symbol: symbol("MSFTB"),
    vToken: VMSFTB_BLUECHIPS,
    underlying: MSFTB,
    supplyCap: cap(190),
    initialSupply: parseUnits("0.019", 18),
    atlasFeed: PENDING,
    aproFeed: "0xBC92F296c48E31409eD4DbD638F1fbe0ee5A3724",
  },
  // Tier 3. BNCB is not listed: neither Atlas nor APRO has a feed for it.
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 3,
    symbol: symbol("NBISB"),
    vToken: VNBISB_BLUECHIPS,
    underlying: NBISB,
    supplyCap: cap(640),
    initialSupply: parseUnits("0.064", 18),
    atlasFeed: "0x50f67D3CE440A98fFeC832726260ae03667fbE5E",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 3,
    symbol: symbol("BEB"),
    vToken: VBEB_BLUECHIPS,
    underlying: BEB,
    supplyCap: cap(470),
    initialSupply: parseUnits("0.048", 18),
    atlasFeed: "0xC1972AebD7df78E4687164122E728Bb59EDACDa0",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 3,
    symbol: symbol("AMDB"),
    vToken: VAMDB_BLUECHIPS,
    underlying: AMDB,
    supplyCap: cap(180),
    initialSupply: parseUnits("0.019", 18),
    atlasFeed: "0xBF0D0cDb25bc20C809190836b14AE902AEc17EaC",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 3,
    symbol: symbol("MRNAB"),
    vToken: VMRNAB_BLUECHIPS,
    underlying: MRNAB,
    supplyCap: cap(520),
    initialSupply: parseUnits("0.052", 18),
    atlasFeed: "0x84846012824f993E942519DA3414A43CaBEe6Dd1",
    aproFeed: null,
  },
  // Tier 4
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("MUB"),
    vToken: VMUB_BLUECHIPS,
    underlying: MUB,
    supplyCap: cap(110),
    initialSupply: parseUnits("0.011", 18),
    atlasFeed: PENDING,
    aproFeed: "0x9bDd29A3e175855d3DaD239F15fc7bFe1Fd70095",
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("INTCB"),
    vToken: VINTCB_BLUECHIPS,
    underlying: INTCB,
    supplyCap: cap(1100),
    initialSupply: parseUnits("0.11", 18),
    atlasFeed: "0x04676ef12A9787761DDd0d1e27522c4a65b64262",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("DRAMB"),
    vToken: VDRAMB_BLUECHIPS,
    underlying: DRAMB,
    supplyCap: cap(2000),
    initialSupply: parseUnits("0.21", 18),
    atlasFeed: "0x6eaed198cA7d86C7982C30CAC4dc1c28BE915744",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("AMATB"),
    vToken: VAMATB_BLUECHIPS,
    underlying: AMATB,
    supplyCap: cap(260),
    initialSupply: parseUnits("0.026", 18),
    atlasFeed: "0xA39c1D2E58B872eC90aF6CdeE836e433Fc4A6d11",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("TSMB"),
    vToken: VTSMB_BLUECHIPS,
    underlying: TSMB,
    supplyCap: cap(230),
    initialSupply: parseUnits("0.024", 18),
    atlasFeed: "0x06b4985edCF11538f6b1EE05fF85cdecf16779E2",
    aproFeed: null,
  },
  {
    ...newAsset,
    ...TEMPLATE,
    tier: 4,
    symbol: symbol("COINB"),
    vToken: VCOINB_BLUECHIPS,
    underlying: COINB,
    supplyCap: cap(620),
    initialSupply: parseUnits("0.063", 18),
    atlasFeed: "0x758aB25F2Db37AAE2CC09D5542B2C69b5fC70E61",
    aproFeed: null,
  },
];
