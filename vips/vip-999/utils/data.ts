import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";

const { bscmainnet, ethereum, arbitrumone, basemainnet } = NETWORK_ADDRESSES;
const ZERO = ethers.constants.AddressZero;

export const ATLAS_ORACLE = "0x9E6928Ec418948ceb9f1cd9872fD312b13D841D0";

// BSC oracle adapters (from src/networkAddresses.ts)
const CL = bscmainnet.CHAINLINK_ORACLE;
const RS = bscmainnet.REDSTONE_ORACLE;
const BN = bscmainnet.BINANCE_ORACLE;

const WBETH_MAIN_ORACLE = "0x49938fc72262c126eb5D4BdF6430C55189AEB2BA"; // wBETH correlated/OneJump oracle
const SOLVBTC_FUNDAMENTAL_ORACLE = "0x1f785B1AFE0808d69d1188db9e47b7B9Dd95ab09"; // CorrelatedTokenOracle (RS fundamental)
const SOLVBTC_CHAINLINK_OJ_ORACLE = "0x3f4bC081E749032cffF29dcA2E8408Ec375e745A"; // OneJumpOracle (Chainlink ER)
const SOLVBTC_REDSTONE_OJ_ORACLE = "0xA3E6F08e3C1baD83e1971909483F27Cdd19937FC"; // OneJumpOracle (RedStone cross-market)

// Special non-BSC MAIN oracle (eBTC on Ethereum uses a dedicated adapter, not the generic ChainlinkOracle)
const ETHEREUM_EBTC_MAIN_ORACLE = "0x04d6096A6F089047C7af6E4644D18fB766B8d4cE";

// BoundValidator per chain. Enabling a PIVOT requires a per-asset anchor-bound config.
export const ETHEREUM_BOUND_VALIDATOR = "0x1Cd5f336A1d28Dff445619CC63d3A0329B4d8a58";
export const ARBITRUM_BOUND_VALIDATOR = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const BASE_BOUND_VALIDATOR = "0x66dDE062D3DC1BB5223A0096EbB89395d1f11DB0";

// Anchor bounds for the new remote PIVOTs: stablecoins ±1%, everything else ±5%.
const BOUND_STABLE = { upperBoundRatio: parseUnits("1.01", 18), lowerBoundRatio: parseUnits("0.99", 18) };
const BOUND_DEFAULT = { upperBoundRatio: parseUnits("1.05", 18), lowerBoundRatio: parseUnits("0.95", 18) };

export type OracleTriplet = [string, string, string];
export type FlagTriplet = [boolean, boolean, boolean];

export interface AdapterFeed {
  feed: string;
  maxStalePeriod: number;
}

export interface BoundConfig {
  upperBoundRatio: BigNumber;
  lowerBoundRatio: BigNumber;
}

export interface AssetMigration {
  symbol: string;
  asset: string;
  // ResilientOracle slot config: [MAIN, PIVOT, FALLBACK]
  oldOracles: OracleTriplet;
  oldFlags: FlagTriplet;
  newOracles: OracleTriplet;
  newFlags: FlagTriplet;
  cachingEnabled: boolean;
  // Adapter feed configs to write before the ResilientOracle wiring
  atlasFeed?: AdapterFeed; // set on ATLAS_ORACLE (BSC)
  redstoneFeed?: AdapterFeed; // set on the chain's REDSTONE_ORACLE (non-BSC)
  // BoundValidator anchor bounds
  boundConfig?: BoundConfig;
}

const NO_CACHE = false;

// =====================================================================================================
// BNB Chain markets
// =====================================================================================================
export const BSC_MIGRATIONS: AssetMigration[] = [
  // ---- PIVOT Binance -> Atlas (MAIN Chainlink, FALLBACK RedStone unchanged) ----
  {
    symbol: "AAVE",
    asset: "0xfb6115445Bff7b52FeB98650C87f44907E58f802",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xe20536BC715AaC6560394e33deB66ed205AEeC33", maxStalePeriod: 86700 },
  },
  {
    symbol: "BCH",
    asset: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x0Ca9F44ad16a52C502052a6c332F575380ddF9eB", maxStalePeriod: 86700 },
  },
  {
    symbol: "DOGE",
    asset: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x94faD182E9deEDaf4d9535d3Ff7e590921cB4721", maxStalePeriod: 86700 },
  },
  {
    symbol: "DOT",
    asset: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x070C3AAF3b2829E3C8910d263C7456BCb978b1F8", maxStalePeriod: 86700 },
  },
  {
    symbol: "FDUSD",
    asset: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x122589967CbE77Dd6061D212D198ca45F77fd02c", maxStalePeriod: 1200 },
  },
  {
    symbol: "FIL",
    asset: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x0a1c737f5553aA2FF9fCa00f129DA5f2ca8fD3cd", maxStalePeriod: 86700 },
  },
  {
    symbol: "LINK",
    asset: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x18faC939a313B33c83032bFC9b841486559e908F", maxStalePeriod: 86700 },
  },
  {
    symbol: "LTC",
    asset: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xED0551dc84095461074AC6Cc31979777B4BF00d2", maxStalePeriod: 86700 },
  },
  {
    symbol: "SOL",
    asset: "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x12de2a7DA7A8288F5eb3C65C8BA34D9d3c5c5d5A", maxStalePeriod: 86700 },
  },
  {
    symbol: "UNI",
    asset: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, ATLAS_ORACLE, RS],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xBe44FAdF178A860c9bb7A9c331ba31babA46EF24", maxStalePeriod: 86700 },
  },
  // ---- PIVOT Binance -> Atlas, MAIN RedStone unchanged ----
  {
    symbol: "THE",
    asset: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
    oldOracles: [RS, BN, ZERO],
    oldFlags: [true, true, false],
    newOracles: [RS, ATLAS_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x52C792D4D176C3A78261164924B4BBaB668ca7a6", maxStalePeriod: 86700 },
  },
  // ---- PIVOT Binance -> Atlas, 2-slot config (no FALLBACK) ----
  {
    symbol: "TUSD",
    asset: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
    oldOracles: [CL, BN, ZERO],
    oldFlags: [true, true, false],
    newOracles: [CL, ATLAS_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x48D8A09B22D17028fcbea6FB021966c2576e6Ce0", maxStalePeriod: 86700 },
  },
  {
    symbol: "WBETH",
    asset: "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
    oldOracles: [WBETH_MAIN_ORACLE, BN, ZERO],
    oldFlags: [true, true, false],
    newOracles: [WBETH_MAIN_ORACLE, ATLAS_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x20f13Ee7D9959724F89EB2d0F29a90fD8168944f", maxStalePeriod: 1200 },
  },
  // ---- FALLBACK Binance -> Atlas (MAIN Chainlink, PIVOT RedStone unchanged) ----
  {
    symbol: "BTCB",
    asset: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    oldOracles: [CL, RS, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x4f6c53fb9CdD46269d24bCa4E68bB680879132fc", maxStalePeriod: 120 },
  },
  {
    symbol: "ETH",
    asset: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    oldOracles: [CL, RS, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x7942b8DD9f552c57Eb94D16ea8215aEf6CAc948f", maxStalePeriod: 120 },
  },
  {
    symbol: "TRX",
    asset: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
    oldOracles: [CL, RS, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xA12d88C25B4E4649b88C0bae3451576CC867Ddf9", maxStalePeriod: 86700 },
  },
  {
    symbol: "USDT",
    asset: "0x55d398326f99059fF775485246999027B3197955",
    oldOracles: [CL, RS, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x9Fc000FC9C17578b49853278A517e357201D01e4", maxStalePeriod: 86700 },
  },
  // ---- MAIN Binance -> Atlas (no Chainlink adapter yet; interim MAIN) ----
  {
    symbol: "TWT",
    asset: "0x4B0F1812e5Df2A09796481Ff14017e6005508003",
    oldOracles: [BN, RS, ZERO],
    oldFlags: [true, true, false],
    newOracles: [ATLAS_ORACLE, RS, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x87F6986a5C061B0b5A51914E829B25D6d588D25b", maxStalePeriod: 1200 },
  },
  {
    symbol: "lisUSD",
    asset: "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5",
    oldOracles: [BN, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ATLAS_ORACLE, ZERO, ZERO],
    newFlags: [true, false, false],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x84B1C686A1cc5d43ab7Fc7555ecCf8483aB2462d", maxStalePeriod: 1200 },
  },
  // ---- MAIN<->PIVOT swap (Chainlink->MAIN, RedStone->PIVOT) + FALLBACK Binance->Atlas ----
  {
    symbol: "ADA",
    asset: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xe82a8149860D329b661f2Ae0c4dB6204d66AEDA6", maxStalePeriod: 86700 },
  },
  {
    symbol: "BNB",
    asset: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x9C0517F5b4c8657c7F18D68d2d79e2b3b1cd6438", maxStalePeriod: 120 }, // ATL:BNB/USD
  },
  {
    symbol: "CAKE",
    asset: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x55aD1D026D1bC49939b0bA9A451E393c79ad8e93", maxStalePeriod: 86700 },
  },
  {
    symbol: "USD1",
    asset: "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x09889916D5E356c828CcF267937562934c2DDA3A", maxStalePeriod: 86700 },
  },
  {
    symbol: "USDC",
    asset: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x2Fd873e39e65B5F7f0E03e5079eCd4da7FC4067B", maxStalePeriod: 86700 },
  },
  {
    symbol: "WBNB",
    asset: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x9C0517F5b4c8657c7F18D68d2d79e2b3b1cd6438", maxStalePeriod: 120 }, // ATL:BNB/USD (shared w/ BNB)
  },
  {
    symbol: "XRP",
    asset: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
    oldOracles: [RS, CL, BN],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xFd52B47fddf57885950e51aC50128DC6D43bFa8a", maxStalePeriod: 86700 },
  },
  // ---- RedStone promoted PIVOT, Atlas low-confidence in FALLBACK ----
  // (DAI/XVS RedStone feed already configured on-chain — only ResilientOracle wiring + Atlas feed change.)
  {
    symbol: "DAI",
    asset: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0x01E73ca3019aA1D4A576f27221a9830a0Be470b7", maxStalePeriod: 86700 },
  },
  {
    symbol: "XVS",
    asset: "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63",
    oldOracles: [CL, BN, RS],
    oldFlags: [true, true, true],
    newOracles: [CL, RS, ATLAS_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
    atlasFeed: { feed: "0xA5a05e3FC5d60538e89622C2f306C0c013C3DE0F", maxStalePeriod: 86700 },
  },
  // ---- solvBTC: pure MAIN<->PIVOT reorder between two existing adapters (no feed/adapter change) ----
  {
    symbol: "solvBTC",
    asset: "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
    oldOracles: [SOLVBTC_FUNDAMENTAL_ORACLE, SOLVBTC_CHAINLINK_OJ_ORACLE, SOLVBTC_REDSTONE_OJ_ORACLE],
    oldFlags: [true, true, true],
    newOracles: [SOLVBTC_CHAINLINK_OJ_ORACLE, SOLVBTC_FUNDAMENTAL_ORACLE, SOLVBTC_REDSTONE_OJ_ORACLE],
    newFlags: [true, true, true],
    cachingEnabled: NO_CACHE,
  },
];

// =====================================================================================================
// Ethereum Chain markets
// =====================================================================================================
export const ETHEREUM_MIGRATIONS: AssetMigration[] = [
  {
    symbol: "EIGEN",
    asset: "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x2ee5Ce6556599E16c226579BA14F94926d8Cb86d", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "USDC",
    asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xeeF31c7d9F2E82e8A497b140cc60cc082Be4b94e", maxStalePeriod: 86700 },
    boundConfig: BOUND_STABLE,
  },
  {
    symbol: "USDT",
    asset: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x02E1F8d15762047b7a87BA0E5d94B9a0c5b54Ed2", maxStalePeriod: 86700 },
    boundConfig: BOUND_STABLE,
  },
  {
    symbol: "WBTC",
    asset: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xAB7f623fb2F6fea6601D4350FA0E2290663C28Fc", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "WETH",
    asset: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x67F6838e58859d612E4ddF04dA396d6DABB66Dc4", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "eBTC",
    asset: "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
    oldOracles: [ETHEREUM_EBTC_MAIN_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ETHEREUM_EBTC_MAIN_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xAB7f623fb2F6fea6601D4350FA0E2290663C28Fc", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "tBTC",
    asset: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
    oldOracles: [ethereum.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [ethereum.CHAINLINK_ORACLE, ethereum.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xAB7f623fb2F6fea6601D4350FA0E2290663C28Fc", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
];

export const ARBITRUM_MIGRATIONS: AssetMigration[] = [
  {
    symbol: "ARB",
    asset: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    oldOracles: [arbitrumone.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [arbitrumone.CHAINLINK_ORACLE, arbitrumone.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x09639692CE6ff12A06CA3AE9A24b3Aae4CD80DC8", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "USDC",
    asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    oldOracles: [arbitrumone.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [arbitrumone.CHAINLINK_ORACLE, arbitrumone.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x4BAD96DD1C7D541270a0C92e1D4e5f12EEEA7a57", maxStalePeriod: 86700 },
    boundConfig: BOUND_STABLE,
  },
  {
    symbol: "USDT",
    asset: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    oldOracles: [arbitrumone.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [arbitrumone.CHAINLINK_ORACLE, arbitrumone.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x3fd49f2146FE0e10c4AE7E3fE04b3d5126385Ac4", maxStalePeriod: 86700 },
    boundConfig: BOUND_STABLE,
  },
  {
    symbol: "WBTC",
    asset: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    oldOracles: [arbitrumone.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [arbitrumone.CHAINLINK_ORACLE, arbitrumone.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xbbF121624c3b85C929Ac83872bf6c86b0976A55e", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "WETH",
    asset: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    oldOracles: [arbitrumone.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [arbitrumone.CHAINLINK_ORACLE, arbitrumone.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x197225B3B017eb9b72Ac356D6B3c267d0c04c57c", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
];

export const BASE_MIGRATIONS: AssetMigration[] = [
  {
    symbol: "USDC",
    asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    oldOracles: [basemainnet.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [basemainnet.CHAINLINK_ORACLE, basemainnet.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xDd87FD0FD6F68AcB6897d05fCf31F3AB1165a49F", maxStalePeriod: 86700 },
    boundConfig: BOUND_STABLE,
  },
  {
    symbol: "WETH",
    asset: "0x4200000000000000000000000000000000000006",
    oldOracles: [basemainnet.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [basemainnet.CHAINLINK_ORACLE, basemainnet.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0xe8D9FbC10e00ecc9f0694617075fDAF657a76FB2", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
  {
    symbol: "cbBTC",
    asset: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    oldOracles: [basemainnet.CHAINLINK_ORACLE, ZERO, ZERO],
    oldFlags: [true, false, false],
    newOracles: [basemainnet.CHAINLINK_ORACLE, basemainnet.REDSTONE_ORACLE, ZERO],
    newFlags: [true, true, false],
    cachingEnabled: NO_CACHE,
    redstoneFeed: { feed: "0x8B4736f5eaD8ed579Ecf65a13F9c1E8B44dEdF20", maxStalePeriod: 86700 },
    boundConfig: BOUND_DEFAULT,
  },
];
