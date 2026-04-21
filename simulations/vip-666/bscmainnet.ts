import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip666 from "../../vips/vip-666/bscmainnet";
import {
  BTCB,
  CAKE,
  DEVIATION_SENTINEL,
  DEVIATION_THRESHOLD,
  ETH,
  MARKETS,
  PANCAKESWAP_ORACLE,
  POOL_CAKE_WBNB_025,
  SENTINEL_ORACLE,
  USDT,
  WBNB,
} from "../../vips/vip-666/config";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import PANCAKESWAP_ORACLE_ABI from "./abi/PancakeSwapOracle.json";
import PANCAKESWAP_V3_POOL_ABI from "./abi/PancakeSwapV3Pool.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import VTOKEN_UNDERLYING_ABI from "./abi/VToken.json";

// VIP-590 wired CAKE to the CAKE/BUSD 0.25% pool; this VIP repoints CAKE to CAKE/WBNB 0.25%.
const OLD_CAKE_BUSD_POOL = "0x7f51c8AaA6B0599aBd16674e2b17FEc7a9f674A1";

// CAKE is pre-configured from VIP-590; the remaining 28 markets are untouched.
const NON_CAKE_MARKETS = MARKETS.filter(m => m.symbol !== "CAKE");

// Used to cross-check every MARKETS[i].token against the live Core Pool vToken underlyings.
const CORE_POOL_COMPTROLLER = NETWORK_ADDRESSES.bscmainnet.UNITROLLER;

// Reference tokens used by the 29 pools. PancakeSwapOracle.getPrice(market) calls
// RESILIENT_ORACLE.getPrice(referenceToken) — where referenceToken is the pool's other side.
// Across all 29 pools the reference set is {USDT, WBNB, BTCB, ETH}; extending stale periods
// on these keeps the post-VIP getPrice sanity check honest after testVip advances fork time
// past Chainlink/Binance heartbeats (voting period + 48h timelock delay).
const REFERENCE_TOKENS: { asset: string; binanceSymbol: string }[] = [
  { asset: USDT, binanceSymbol: "USDT" },
  { asset: WBNB, binanceSymbol: "BNB" },
  { asset: BTCB, binanceSymbol: "BTCB" },
  { asset: ETH, binanceSymbol: "ETH" },
];

forking(93782100, async () => {
  let deviationSentinel: Contract;
  let sentinelOracle: Contract;
  let pancakeSwapOracle: Contract;

  before(async () => {
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, SENTINEL_ORACLE);
    pancakeSwapOracle = await ethers.getContractAt(PANCAKESWAP_ORACLE_ABI, PANCAKESWAP_ORACLE);

    for (const { asset, binanceSymbol } of REFERENCE_TOKENS) {
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
        asset,
        ethers.constants.AddressZero, // auto-resolve feed from tokenConfigs(asset).feed
        NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      );
      await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bscmainnet.BINANCE_ORACLE, binanceSymbol);
    }
  });

  describe("Config sanity", () => {
    // Guards the 29 hand-entered token addresses in config.ts. Pulls the live list of
    // Core Pool vToken underlyings from the Comptroller and asserts every MARKETS[i].token
    // is one of them. Prevents a typo (wrong checksum, copy-paste from the wrong chain)
    // from silently binding a Sentinel pool to a random address.
    it("every MARKETS[i].token is a real Core Pool vToken underlying", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_POOL_COMPTROLLER);
      const vTokens: string[] = await comptroller.getAllMarkets();

      const underlyings = new Set<string>();
      for (const vToken of vTokens) {
        const vt = await ethers.getContractAt(VTOKEN_UNDERLYING_ABI, vToken);
        try {
          const u: string = await vt.underlying();
          underlyings.add(u.toLowerCase());
        } catch {
          // vBNB is the native BNB market and has no underlying() — skip.
        }
      }

      for (const { symbol, token } of MARKETS) {
        expect(underlyings.has(token.toLowerCase())).to.equal(
          true,
          `${symbol} (${token}) is not a Core Pool underlying`,
        );
      }
    });

    // Guards the 28 hand-entered PCS V3 pool addresses in config.ts. For each market, reads
    // token0()/token1() from the pool and asserts one of them equals MARKETS[i].token. Catches
    // wrong-pool-address, wrong-chain-pool, and non-PCS-V3 addresses — any of which would make
    // PancakeSwapOracle return a garbage price for that market.
    it("every MARKETS[i].pool is a PCS V3 pool that contains the market token", async () => {
      for (const { symbol, token, pool } of MARKETS) {
        const p = await ethers.getContractAt(PANCAKESWAP_V3_POOL_ABI, pool);
        const [t0, t1] = await Promise.all([p.token0(), p.token1()]);
        const tokens = [t0.toLowerCase(), t1.toLowerCase()];
        expect(tokens).to.include(
          token.toLowerCase(),
          `${symbol} pool ${pool} does not contain ${token} (token0=${t0}, token1=${t1})`,
        );
      }
    });
  });

  describe("Pre-VIP behavior", () => {
    it("CAKE is the only market configured on DeviationSentinel (from VIP-590)", async () => {
      const cakeConfig = await deviationSentinel.tokenConfigs(CAKE);
      expect(cakeConfig.deviation).to.equal(20);
      expect(cakeConfig.enabled).to.equal(true);
    });

    it("CAKE on PancakeSwapOracle is still bound to the old CAKE/BUSD pool", async () => {
      const bound: string = await pancakeSwapOracle.tokenPools(CAKE);
      expect(bound.toLowerCase()).to.equal(OLD_CAKE_BUSD_POOL.toLowerCase());
    });

    it("CAKE on SentinelOracle is already routed to PancakeSwapOracle (from VIP-590)", async () => {
      expect(await sentinelOracle.tokenConfigs(CAKE)).to.equal(PANCAKESWAP_ORACLE);
    });

    it("Non-CAKE markets have no DeviationSentinel config", async () => {
      for (const { symbol, token } of NON_CAKE_MARKETS) {
        const config = await deviationSentinel.tokenConfigs(token);
        expect(config.deviation).to.equal(0, `${symbol} should have no deviation config`);
        expect(config.enabled).to.equal(false, `${symbol} should not be enabled`);
      }
    });

    it("Non-CAKE markets have no PancakeSwapOracle pool binding", async () => {
      for (const { symbol, token } of NON_CAKE_MARKETS) {
        expect(await pancakeSwapOracle.tokenPools(token)).to.equal(
          ethers.constants.AddressZero,
          `${symbol} should have no pool`,
        );
      }
    });

    it("Non-CAKE markets have no SentinelOracle routing", async () => {
      for (const { symbol, token } of NON_CAKE_MARKETS) {
        expect(await sentinelOracle.tokenConfigs(token)).to.equal(
          ethers.constants.AddressZero,
          `${symbol} should have no oracle config`,
        );
      }
    });
  });

  testVip("VIP-666 [BNB Chain] Expand DeviationSentinel coverage to 29 Core Pool markets", await vip666(), {
    callbackAfterExecution: async txResponse => {
      // 29 PoolConfigUpdated (PancakeSwapOracle) + 29 TokenOracleConfigUpdated (SentinelOracle)
      //   + 29 TokenConfigUpdated (DeviationSentinel) = 87 events.
      await expectEvents(txResponse, [PANCAKESWAP_ORACLE_ABI], ["PoolConfigUpdated"], [MARKETS.length]);
      await expectEvents(txResponse, [SENTINEL_ORACLE_ABI], ["TokenOracleConfigUpdated"], [MARKETS.length]);
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenConfigUpdated"], [MARKETS.length]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Every market is bound to the expected PancakeSwap V3 pool", async () => {
      // On-chain returns are checksummed (EIP-55); config.ts addresses are lowercase — compare caseless.
      for (const { symbol, token, pool } of MARKETS) {
        const bound: string = await pancakeSwapOracle.tokenPools(token);
        expect(bound.toLowerCase()).to.equal(pool.toLowerCase(), `${symbol} pool mismatch`);
      }
    });

    it("Every market routes through PancakeSwapOracle on SentinelOracle", async () => {
      for (const { symbol, token } of MARKETS) {
        expect(await sentinelOracle.tokenConfigs(token)).to.equal(PANCAKESWAP_ORACLE, `${symbol} oracle mismatch`);
      }
    });

    it("Every market has the unified 10% deviation threshold enabled", async () => {
      for (const { symbol, token } of MARKETS) {
        const config = await deviationSentinel.tokenConfigs(token);
        expect(config.deviation).to.equal(DEVIATION_THRESHOLD, `${symbol} threshold mismatch`);
        expect(config.enabled).to.equal(true, `${symbol} should be enabled`);
      }
    });

    it("CAKE is repointed from CAKE/BUSD to CAKE/WBNB 0.25%", async () => {
      const bound: string = await pancakeSwapOracle.tokenPools(CAKE);
      expect(bound.toLowerCase()).to.equal(POOL_CAKE_WBNB_025.toLowerCase());
      expect(bound.toLowerCase()).to.not.equal(OLD_CAKE_BUSD_POOL.toLowerCase());
    });

    it("CAKE threshold is tightened from 20% to 10%", async () => {
      const config = await deviationSentinel.tokenConfigs(CAKE);
      expect(config.deviation).to.equal(10);
    });

    it("SentinelOracle.getPrice returns a non-zero price for every market", async () => {
      // End-to-end check that each market's pool + reference-token pairing produces a real price.
      // This catches pool/reference mismatches (e.g. a pegged asset wired to a USD pool instead
      // of a peg pool) that the pure config-state checks above would miss. Reference-token stale
      // periods are extended in before() to tolerate testVip's ~72h fork-time advance.
      const failures: string[] = [];
      for (const { symbol, token } of MARKETS) {
        try {
          const price = await sentinelOracle.getPrice(token);
          if (price.isZero()) failures.push(`${symbol} (${token}): price is zero`);
        } catch (e) {
          const msg = (e as Error).message?.split("\n")[0] ?? String(e);
          failures.push(`${symbol} (${token}): ${msg}`);
        }
      }
      expect(failures, `\n${failures.join("\n")}`).to.deep.equal([]);
    });
  });
});
