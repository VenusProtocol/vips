import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip624, { BSC_CTX } from "../../vips/vip-624/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runBehaviorTests,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// FORK_BLOCK must be ≥ the BSC block at which VIP-613 executes (which wired the
// 25 BSC markets at 10%). Otherwise pre-VIP assertions for retunes fail loudly
// with deviation=0. Bump close to head before opening the PR.
const FORK_BLOCK = 95000000;

const a = NETWORK_ADDRESSES.bscmainnet;

const TEST_CONFIG: TestConfig = {
  ctx: BSC_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  chainlinkOracle: a.CHAINLINK_ORACLE,
  redstoneOracle: a.REDSTONE_ORACLE,
  binanceOracle: a.BINANCE_ORACLE,
  // BinanceOracle is the primary feed for most BSC tokens. We bump every symbol
  // that ResilientOracle might consult during behavior tests, plus the common
  // reference tokens that ratio-fed oracles (solvBTC, slisBNB, wBETH) read.
  // Symbols not registered in BinanceOracle silently no-op (try/catch in shared.ts).
  binanceSymbols: [
    "BNB",
    "BTC",
    "BTCB",
    "ETH",
    "USDT",
    "USDC",
    "DAI",
    "TUSD",
    "FDUSD",
    "BCH",
    "DOGE",
    "LINK",
    "SOL",
    "ADA",
    "LTC",
    "XRP",
    "CAKE",
    "TRX",
    "UNI",
    "AAVE",
    "TWT",
    "XVS",
    "XAUM",
    "lisUSD",
    "USD1",
  ],
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.UNITROLLER, type: "core" }],
  // Behavior tests run against markets whose ResilientOracle path goes through
  // Chainlink / RedStone / Binance adapters we can bump from the fork. Excluded:
  //   - U          (AtlasOracle pivot — custom adapter not in our bump pipeline)
  //   - solvBTC    (OneJumpOracle + CorrelatedTokenOracle stack — inner staleness opaque)
  //   - slisBNB    (SlisBNBOracle delegates to StakeManager + an internal BNB feed)
  //   - wBETH      (WBETHOracle delegates to exchangeRate × ETH price internally)
  //   - TWT        (Binance/RedStone path consistently stale at fork time)
  // These markets are still covered by structural tests (config sanity, pre/post-VIP
  // assertions, event counts). Follows VIP-616's SKIP_CHECK_PRICE_DEVIATION precedent.
  expectVToken: new Set(["USDC", "USDT", "USD1", "TUSD", "lisUSD", "BCH", "AAVE"]),
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("BSC", 18);
  runPreVipAssertions(TEST_CONFIG);

  testVip("VIP-624 [BSC] DeviationSentinel Parameter Recommendation", await vip624(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BSC_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
  runBehaviorTests(TEST_CONFIG);
});
