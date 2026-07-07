/**
 * Oracle price-feed update — data for the [Multi-Chain] Oracle Price Feed Update folded into VIP-647.
 *
 * The provided addresses are raw Chainlink-style feeds (latestRoundData / decimals / "X / USD"), NOT Venus oracle
 * adapters. So the update repoints the feed INSIDE each asset's MAIN oracle adapter — the contract sitting in slot 0
 * of that asset's ResilientOracle config — via that adapter's setTokenConfig((asset, feed, maxStalePeriod)).
 * The ResilientOracle slot layout is unchanged; only the MAIN adapter's underlying feed changes.
 *
 * MAIN adapters and current feeds were read on-chain (2026-07-06). maxStalePeriod is set to each new Chainlink
 * feed's published heartbeat plus a latency cushion (the on-chain updatedAt interval runs ~30-60s past the nominal
 * heartbeat): daily feeds → heartbeat + ~1h (86400→90000, 82800→86400), sub-hourly feeds keep their existing
 * heartbeat×~1.3-2 margin. On BNB Chain native BNB (vBNB) is priced under the sentinel underlying 0xbBbB...bBbB,
 * which holds its own adapter config separate from WBNB — both are repointed to the new feed.
 */

export interface OracleFeed {
  symbol: string;
  asset: string;
  mainAdapter: string; // Venus oracle adapter whose feed we repoint (getPrice-capable)
  feed: string; // new raw Chainlink-style feed
  maxStalePeriod: number; // new feed's published heartbeat + latency cushion
}

export const ORACLE_UPDATE: Record<"bscmainnet" | "ethereum" | "arbitrumone", OracleFeed[]> = {
  bscmainnet: [
    {
      symbol: "WBNB",
      asset: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0xA59395678BB6a010a7206f46b6dab8A1e7aC7221",
      maxStalePeriod: 60,
    },
    {
      // Native BNB is priced under the sentinel underlying (vBNB market), configured separately from WBNB
      // in the same MAIN adapter. Both must be repointed to the new feed or vBNB stays on the old one.
      symbol: "BNB",
      asset: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0xA59395678BB6a010a7206f46b6dab8A1e7aC7221",
      maxStalePeriod: 60,
    },
    {
      symbol: "USDC",
      asset: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0x4641327e9aD5df9568AF01363D9E7aEdDDEb33e9",
      maxStalePeriod: 1200,
    },
    {
      // THE's new feed is a Chainlink feed, so it is configured on the ChainlinkOracle adapter (matching the
      // other BSC assets) rather than the RedStoneOracle adapter it used before. THE_MAIN_REPOINT then moves
      // the ResilientOracle MAIN slot onto this adapter so the new feed is actually used.
      symbol: "THE",
      asset: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0xD55a9E7e00b6b86ee5C92cA0D9DD218b251E8e4B",
      maxStalePeriod: 1200,
    },
    {
      symbol: "CAKE",
      asset: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0x4e3464353E99E7cFB0E53918222411C08ae3606a",
      maxStalePeriod: 120,
    },
    {
      symbol: "ADA",
      asset: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0x131AC00f2CFa72dc06fEdE8C594B3E842D0E864a",
      maxStalePeriod: 900,
    },
    {
      symbol: "XRP",
      asset: "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE",
      mainAdapter: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
      feed: "0xB5543DA4D87D13b736c31b9C2c21F95667E20dF7",
      maxStalePeriod: 900,
    },
  ],
  ethereum: [
    {
      symbol: "USDT",
      asset: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      mainAdapter: "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2",
      feed: "0x023dfc789db466DD5C900DC04706727a3A9Cf3DE",
      maxStalePeriod: 90000,
    },
    {
      symbol: "USDC",
      asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      mainAdapter: "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2",
      feed: "0x37be050e75C7F0a80F0E8abBFC2c4Ff826728cAa",
      maxStalePeriod: 86400,
    },
    {
      symbol: "WETH",
      asset: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      mainAdapter: "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2",
      feed: "0xc0053f3FBcCD593758258334Dfce24C2A9A673aD",
      maxStalePeriod: 6000,
    },
    {
      symbol: "WBTC",
      asset: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      mainAdapter: "0x94c3A2d6B7B2c051aDa041282aec5B0752F8A1F2",
      feed: "0x91D32e6f01d6473b596f54c6E304e06d774f86b2",
      maxStalePeriod: 6000,
    },
  ],
  arbitrumone: [
    {
      symbol: "USDT",
      asset: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      mainAdapter: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
      feed: "0x6AA147E11E423F529BEDAed75F3128D5fbE67939",
      maxStalePeriod: 90000,
    },
    {
      symbol: "USDC",
      asset: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      mainAdapter: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
      feed: "0xe4c892BE702F8e0771122CCaAA0E50BF9639e2Fd",
      maxStalePeriod: 90000,
    },
    {
      symbol: "WETH",
      asset: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      mainAdapter: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
      feed: "0xe4dF63Bf89fD868A899F2422B030709FD79Be921",
      maxStalePeriod: 90000,
    },
    {
      symbol: "WBTC",
      asset: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      mainAdapter: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
      feed: "0x06047dD6f43552831BB51319917DC0C99c29A44c",
      maxStalePeriod: 90000,
    },
    {
      symbol: "ARB",
      asset: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      mainAdapter: "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113",
      feed: "0x54a82Bc6C6540F95C0b84690773635aCC97A92ff",
      maxStalePeriod: 90000,
    },
  ],
};

// The MAIN adapter's setTokenConfig takes (asset, feed, maxStalePeriod).
export const SET_TOKEN_CONFIG_SIG = "setTokenConfig((address,address,uint256))";
// Signature string the adapter passes to the ACM for the permission check.
export const SET_TOKEN_CONFIG_ACM_SIG = "setTokenConfig(TokenConfig)";

// THE moves from the RedStoneOracle adapter to the ChainlinkOracle adapter as its ResilientOracle MAIN
// source (its new feed is a Chainlink feed). After THE's config is written on the ChainlinkOracle adapter
// (via the ORACLE_UPDATE entry above), this repoints the ResilientOracle MAIN slot onto that adapter.
// OracleRole.MAIN = 0. The RedStoneOracle adapter's stale THE config is left orphaned (harmless).
export const THE_MAIN_REPOINT = {
  resilientOracle: "0x6592b5DE802159F3E74B2486b091D11a8256ab8A",
  asset: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11",
  chainlinkOracle: "0x1B2103441A0A108daD8848D8F5d790e4D402921F",
  mainRole: 0,
};
// ResilientOracle.setOracle(asset, oracle, role) — the ACM-checked signature.
export const SET_ORACLE_SIG = "setOracle(address,address,uint8)";

export const tokenConfigParams = (f: OracleFeed) => [[f.asset, f.feed, f.maxStalePeriod]];

// Distinct MAIN adapters on a chain (for the ACM grant/revoke — one per adapter, not per asset).
export const distinctAdapters = (feeds: OracleFeed[]): string[] => [...new Set(feeds.map(f => f.mainAdapter))];
