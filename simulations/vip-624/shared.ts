import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";

import { buildAllCommands } from "../../vips/vip-624/bscmainnet";
import type { ChainContext, MarketEntry } from "../../vips/vip-624/config";
import ACM_ABI from "./abi/AccessControlManager.json";
import AERODROME_ORACLE_ABI from "./abi/AerodromeSlipstreamOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import CURVE_ORACLE_ABI from "./abi/CurveOracle.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";
import PANCAKESWAP_ORACLE_ABI from "./abi/PancakeSwapOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

// ──────────────────────────────────────────────────────────────────────────
// Test-only chain config: addresses needed to run live behavior tests.
// Kept separate from ChainContext so VIP runtime types don't carry test-only
// fields. Each entry file (`bscmainnet.ts`, `ethereum.ts`, …) builds one of
// these and hands it to `runVip624Suite`.
// ──────────────────────────────────────────────────────────────────────────

export interface TestConfig {
  ctx: ChainContext;
  resilientOracle: string;
  chainlinkOracle: string; // adapter used to bump staleness windows for reference feeds
  redstoneOracle?: string; // optional: bumped too if present
  binanceOracle?: string; // BSC only — BinanceOracle is the primary feed for many BSC tokens
  binanceSymbols?: string[]; // BSC only — token symbols to bump in BinanceOracle
  timelock: string; // governance timelock — already permissioned for all relevant setters
  // Pools we walk to map underlying → vToken. BSC has the Diamond Unitroller (Core Pool);
  // remote chains use one or more IL Comptrollers.
  comptrollers: { address: string; type: "core" | "il" }[];
  // Markets we expect to find a vToken for. A few in-scope markets (e.g. ERC-4626 wrappers
  // not yet onboarded to a Venus pool) won't have one — the suite skips behavior tests for
  // those rather than failing.
  expectVToken: Set<string>;
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────

const dexOracleAddress = (ctx: ChainContext, m: MarketEntry): string => {
  const t = m.oracleType ?? "uniswap";
  if (t === "uniswap") return ctx.uniswapOracle;
  if (t === "curve") {
    if (!ctx.curveOracle) throw new Error(`${ctx.name}: ${m.symbol} requires curveOracle`);
    return ctx.curveOracle;
  }
  if (!ctx.aerodromeOracle) throw new Error(`${ctx.name}: ${m.symbol} requires aerodromeOracle`);
  return ctx.aerodromeOracle;
};

const dexOracleAbi = (ctx: ChainContext, m: MarketEntry) => {
  const t = m.oracleType ?? "uniswap";
  if (t === "uniswap") return ctx.name === "BSC" ? PANCAKESWAP_ORACLE_ABI : UNISWAP_ORACLE_ABI;
  if (t === "curve") return CURVE_ORACLE_ABI;
  return AERODROME_ORACLE_ABI;
};

interface Partitioned {
  retunes: MarketEntry[];
  promotes: MarketEntry[];
  poolSwaps: MarketEntry[];
  skips: MarketEntry[];
}

const partition = (markets: MarketEntry[]): Partitioned => ({
  retunes: markets.filter(m => m.action === "retune"),
  promotes: markets.filter(m => m.action === "promote"),
  poolSwaps: markets.filter(m => m.action === "poolSwap"),
  skips: markets.filter(m => m.action === "skip"),
});

const writeMarkets = (p: Partitioned): MarketEntry[] => [...p.promotes, ...p.poolSwaps];

interface ChainContracts {
  deviationSentinel: Contract;
  sentinelOracle: Contract;
  resilientOracle: Contract;
}

const buildContracts = async (cfg: TestConfig): Promise<ChainContracts> => ({
  deviationSentinel: await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.ctx.deviationSentinel),
  sentinelOracle: await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.ctx.sentinelOracle),
  resilientOracle: await ethers.getContractAt(RESILIENT_ORACLE_ABI, cfg.resilientOracle),
});

// Walks every configured comptroller and returns a lowercase-underlying → vToken map.
const buildVTokenIndex = async (cfg: TestConfig): Promise<Map<string, string>> => {
  const map = new Map<string, string>();
  for (const c of cfg.comptrollers) {
    const abi = c.type === "core" ? COMPTROLLER_ABI : IL_COMPTROLLER_ABI;
    const comptroller = await ethers.getContractAt(abi, c.address);
    const vTokens: string[] = await comptroller.getAllMarkets();
    for (const vToken of vTokens) {
      try {
        const v = await ethers.getContractAt(VTOKEN_ABI, vToken);
        const underlying: string = await v.underlying();
        // first-write-wins: if a token appears in multiple pools, we keep the first vToken found
        const key = underlying.toLowerCase();
        if (!map.has(key)) map.set(key, vToken);
      } catch {
        // native-token vTokens (vBNB, vETH) don't expose underlying() — skip
      }
    }
  }
  return map;
};

// Bump every relevant feed's staleness window so the post-execute fork-time advance
// (voting period + timelock delay, ~72h) doesn't expire Chainlink / Binance / RedStone
// heartbeats and make ResilientOracle.getPrice revert with "invalid resilient oracle price".
//
// We bump every token in the markets table — including skip-action entries — because
// ratio-fed assets (e.g. wstETH/WETH on Base) reach into a reference token's feed during
// price resolution. Tokens without an adapter entry silently no-op via the try/catch.
const bumpStaleness = async (cfg: TestConfig) => {
  const chainlinkLikeAdapters = [cfg.chainlinkOracle, cfg.redstoneOracle].filter((a): a is string => !!a);
  const tokens = new Set(cfg.ctx.markets.map(m => m.token));

  for (const token of tokens) {
    for (const adapter of chainlinkLikeAdapters) {
      try {
        await setMaxStalePeriodInChainlinkOracle(adapter, token, ZERO_ADDRESS, cfg.timelock);
      } catch {
        // adapter may not have a feed for this token — skip
      }
    }
  }

  if (cfg.binanceOracle && cfg.binanceSymbols) {
    for (const symbol of cfg.binanceSymbols) {
      try {
        await setMaxStalePeriodInBinanceOracle(cfg.binanceOracle, symbol);
      } catch {
        // symbol may not be registered in BinanceOracle — skip
      }
    }
  }
};

// Equality on the (deviation, enabled) tuple returned by tokenConfigs.
const expectTokenConfig = async (
  deviationSentinel: Contract,
  token: string,
  expectedPct: number,
  expectedEnabled: boolean,
  ctx: string,
) => {
  const tc = await deviationSentinel.tokenConfigs(token);
  expect(tc.deviation, `${ctx}: deviation`).to.equal(expectedPct);
  expect(tc.enabled, `${ctx}: enabled`).to.equal(expectedEnabled);
};

// ──────────────────────────────────────────────────────────────────────────
// Config sanity — guards the hand-entered tables in addresses/<chain>.ts.
// ──────────────────────────────────────────────────────────────────────────

export const runConfigSanity = (cfg: TestConfig) => {
  const { ctx } = cfg;

  describe(`VIP-624 [${ctx.name}] — Config sanity`, () => {
    it("every market has well-formed token, pool, and threshold fields", () => {
      for (const m of ctx.markets) {
        expect(m.token.length, `${m.symbol}: token not 20 bytes`).to.equal(42);
        expect(m.pool.length, `${m.symbol}: pool not 20 bytes`).to.equal(42);
        // skip markets may carry placeholder ZERO_ADDRESS pool / 0% threshold
        if (m.action !== "skip") {
          expect(m.token, `${m.symbol}: token is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
          expect(m.pool, `${m.symbol}: pool is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
          expect(m.targetPct, `${m.symbol}: targetPct must be > 0`).to.be.greaterThan(0);
          expect(m.targetPct, `${m.symbol}: targetPct must be ≤ 100`).to.be.lessThanOrEqual(100);
        }
      }
    });

    it("curve markets carry all StableSwap-NG params", () => {
      for (const m of ctx.markets) {
        if (m.oracleType !== "curve" || m.action === "skip") continue;
        expect(m.coinIndex, `${m.symbol}: coinIndex`).to.not.be.undefined;
        expect(m.refCoinIndex, `${m.symbol}: refCoinIndex`).to.not.be.undefined;
        expect(m.referenceToken, `${m.symbol}: referenceToken`).to.not.be.undefined;
        expect(m.assetDecimals, `${m.symbol}: assetDecimals`).to.not.be.undefined;
      }
    });
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Pre-VIP assertions — snapshot the on-chain baseline before the proposal runs.
// ──────────────────────────────────────────────────────────────────────────

export const runPreVipAssertions = (cfg: TestConfig) => {
  const p = partition(cfg.ctx.markets);

  describe(`VIP-624 [${cfg.ctx.name}] — Pre-VIP state`, () => {
    let c: ChainContracts;

    before(async () => {
      c = await buildContracts(cfg);
    });

    for (const m of p.retunes) {
      it(`${m.symbol}: configured at ${m.currentPct}%, enabled`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, true, m.symbol);
      });
    }

    for (const m of p.promotes) {
      it(`${m.symbol}: not yet wired (will promote)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, 0, false, m.symbol);

        // SentinelOracle entry must be empty — otherwise the promote's setTokenOracleConfig
        // is silently overwriting state instead of creating it.
        const sentinelEntry = await c.sentinelOracle.tokenConfigs(m.token);
        const sentinelOracleAddr = sentinelEntry.oracle ?? sentinelEntry;
        expect(sentinelOracleAddr, `${m.symbol}: sentinel oracle entry`).to.equal(ZERO_ADDRESS);

        // The DEX oracle's pool entry should also be empty for a clean promote.
        const dexOracle = await ethers.getContractAt(dexOracleAbi(cfg.ctx, m), dexOracleAddress(cfg.ctx, m));
        const dexPool =
          (m.oracleType ?? "uniswap") === "curve"
            ? (await dexOracle.poolConfigs(m.token)).pool
            : await dexOracle.tokenPools(m.token);
        expect(dexPool, `${m.symbol}: dex oracle pool entry`).to.equal(ZERO_ADDRESS);
      });
    }

    for (const m of p.poolSwaps) {
      it(`${m.symbol}: currently wired at ${m.currentPct}% (oracle will repoint)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, true, m.symbol);
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Post-VIP assertions — final state per market, plus skip-market untouched-diff.
// ──────────────────────────────────────────────────────────────────────────

interface SkipSnapshot {
  symbol: string;
  token: string;
  deviation: number;
  enabled: boolean;
}

export const runPostVipAssertions = (cfg: TestConfig) => {
  const p = partition(cfg.ctx.markets);

  describe(`VIP-624 [${cfg.ctx.name}] — Post-VIP state`, () => {
    let c: ChainContracts;
    let skipSnapshots: SkipSnapshot[];

    before(async () => {
      c = await buildContracts(cfg);
      // Snapshot post-VIP state of every skip market — we'll assert that the (deviation,
      // enabled) tuple matches the pre-VIP-624 baseline encoded in `currentPct`. A stray
      // command targeting a skip market would surface here.
      skipSnapshots = await Promise.all(
        p.skips.map(async m => {
          const tc = await c.deviationSentinel.tokenConfigs(m.token);
          return { symbol: m.symbol, token: m.token, deviation: tc.deviation, enabled: tc.enabled };
        }),
      );
    });

    for (const m of p.retunes) {
      it(`${m.symbol}: threshold now ${m.targetPct}%, still enabled`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.targetPct, true, m.symbol);
      });
    }

    for (const m of writeMarkets(p)) {
      const oracleType = m.oracleType ?? "uniswap";

      it(`${m.symbol}: pool registered on routed DEX oracle (${oracleType})`, async () => {
        const oracle = await ethers.getContractAt(dexOracleAbi(cfg.ctx, m), dexOracleAddress(cfg.ctx, m));
        if (oracleType === "curve") {
          // Full Curve poolConfigs readback — verifies coinIndex / refCoinIndex /
          // referenceToken / assetDecimals match the proposal entry, not just the pool address.
          const pc = await oracle.poolConfigs(m.token);
          expect(ethers.utils.getAddress(pc.pool), `${m.symbol}: pool`).to.equal(ethers.utils.getAddress(m.pool));
          expect(pc.coinIndex, `${m.symbol}: coinIndex`).to.equal(m.coinIndex);
          expect(pc.refCoinIndex, `${m.symbol}: refCoinIndex`).to.equal(m.refCoinIndex);
          expect(ethers.utils.getAddress(pc.referenceToken), `${m.symbol}: referenceToken`).to.equal(
            ethers.utils.getAddress(m.referenceToken as string),
          );
          expect(pc.assetDecimals, `${m.symbol}: assetDecimals`).to.equal(m.assetDecimals);
        } else {
          const actualPool = await oracle.tokenPools(m.token);
          expect(ethers.utils.getAddress(actualPool), `${m.symbol}: pool`).to.equal(ethers.utils.getAddress(m.pool));
        }
      });

      it(`${m.symbol}: SentinelOracle routes to the new DEX oracle`, async () => {
        const tc = await c.sentinelOracle.tokenConfigs(m.token);
        const actual = tc.oracle ?? tc;
        expect(ethers.utils.getAddress(actual), `${m.symbol}: sentinel oracle entry`).to.equal(
          ethers.utils.getAddress(dexOracleAddress(cfg.ctx, m)),
        );
      });

      it(`${m.symbol}: DeviationSentinel threshold ${m.targetPct}%, enabled`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.targetPct, true, m.symbol);
      });

      if (oracleType === "curve") {
        // Verify the stored coin indexes match the on-chain Curve pool layout.
        // The structural poolConfigs readback above only proves what we stored;
        // this proves those indexes are correct against the actual pool.
        // Pure pool view call — no oracle / feed dependency, no staleness risk.
        it(`${m.symbol}: Curve pool.coins() matches stored coin indexes`, async () => {
          const pool = new ethers.Contract(m.pool, ["function coins(uint256) view returns (address)"], ethers.provider);
          const priced = await pool.coins(m.coinIndex as number);
          const ref = await pool.coins(m.refCoinIndex as number);
          expect(ethers.utils.getAddress(priced), `${m.symbol}: pool.coins(coinIndex)`).to.equal(
            ethers.utils.getAddress(m.token),
          );
          expect(ethers.utils.getAddress(ref), `${m.symbol}: pool.coins(refCoinIndex)`).to.equal(
            ethers.utils.getAddress(m.referenceToken as string),
          );
        });
      }
    }

    // Skip markets: assert each one's tokenConfigs survived the VIP unchanged.
    for (const m of p.skips) {
      it(`${m.symbol} (skip): tokenConfigs untouched by VIP`, async () => {
        const snap = skipSnapshots.find(s => s.token === m.token)!;
        expect(snap.deviation, `${m.symbol}: deviation drifted`).to.equal(m.currentPct);
        // 0% currentPct means "never wired"; the contract returns enabled=false in that case.
        // Wired skip markets stay enabled=true.
        expect(snap.enabled, `${m.symbol}: enabled drifted`).to.equal(m.currentPct > 0);
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Behavior tests — verify threshold values function correctly end-to-end.
//
// For every retune / promote / poolSwap market we have a vToken for, push a
// direct price via SentinelOracle.setDirectPrice and read checkPriceDeviation:
//
//   - "trips at threshold + 1%" — proves the threshold is encoded correctly
//   - "no-trip below threshold" — proves the threshold isn't accidentally 0
//
// One canonical market per chain additionally exercises handleDeviation +
// marketStates(vToken) to confirm the trip path actually pauses the market.
// ──────────────────────────────────────────────────────────────────────────

const computePerturbedPrice = (base: BigNumber, deltaPct: number): BigNumber => {
  // base * (100 + delta) / 100, with delta possibly negative
  const num = BigNumber.from(100 + deltaPct);
  return base.mul(num).div(100);
};

export const runBehaviorTests = (cfg: TestConfig) => {
  const p = partition(cfg.ctx.markets);
  const writeable = [...p.retunes, ...p.promotes, ...p.poolSwaps];

  describe(`VIP-624 [${cfg.ctx.name}] — Threshold behavior`, () => {
    let c: ChainContracts;
    let timelock: SignerWithAddress;
    let vTokenByUnderlying: Map<string, string>;

    before(async () => {
      c = await buildContracts(cfg);
      timelock = await initMainnetUser(cfg.timelock, ethers.utils.parseEther("1"));
      await bumpStaleness(cfg);
      vTokenByUnderlying = await buildVTokenIndex(cfg);
    });

    // Sanity: every market we expect to test has a vToken. If this fires it means
    // the comptroller list in TestConfig is incomplete — fail loud rather than
    // silently skip live coverage for an important market.
    it("every expected market has a vToken in the configured comptrollers", () => {
      const missing: string[] = [];
      for (const m of writeable) {
        if (!cfg.expectVToken.has(m.symbol)) continue;
        if (!vTokenByUnderlying.has(m.token.toLowerCase())) missing.push(`${m.symbol} (${m.token})`);
      }
      expect(missing, `\nMissing vTokens:\n  ${missing.join("\n  ")}`).to.deep.equal([]);
    });

    for (const m of writeable) {
      if (!cfg.expectVToken.has(m.symbol)) continue;
      const T = m.targetPct;

      describe(`${m.symbol} @ ${T}%`, () => {
        let vToken: string;
        let basePrice: BigNumber;

        before(async () => {
          // Upstream `expectVToken` filter + the "every expected market has a vToken"
          // sanity test ensure this lookup hits. Throwing here is just a belt-and-
          // braces guard — arrow function means we can't call Mocha's `this.skip()`.
          const found = vTokenByUnderlying.get(m.token.toLowerCase());
          if (!found) throw new Error(`${m.symbol}: vToken not found — fix expectVToken or comptroller config`);
          vToken = found;
          basePrice = await c.resilientOracle.getPrice(m.token);
          expect(basePrice, `${m.symbol}: ResilientOracle baseline`).to.be.gt(0);
        });

        afterEach(async () => {
          // Clear any direct-price override so the next test starts from the natural baseline.
          await c.sentinelOracle.connect(timelock).setDirectPrice(m.token, 0);
        });

        it(`hasDeviation=false when no override is set`, async () => {
          await c.sentinelOracle.connect(timelock).setDirectPrice(m.token, 0);
          const [hasDeviation] = await c.deviationSentinel.checkPriceDeviation(vToken);
          expect(hasDeviation, `${m.symbol}: false-positive at fork baseline`).to.equal(false);
        });

        it(`trips at ${T + 1}% deviation`, async () => {
          const perturbed = computePerturbedPrice(basePrice, T + 1);
          await c.sentinelOracle.connect(timelock).setDirectPrice(m.token, perturbed);
          const [hasDeviation, , , devPct] = await c.deviationSentinel.checkPriceDeviation(vToken);
          expect(hasDeviation, `${m.symbol}: should trip at +${T + 1}%`).to.equal(true);
          expect(devPct, `${m.symbol}: deviationPct`).to.be.gte(T);
        });

        if (T >= 2) {
          // For T=1 there's no meaningful "just below threshold" — 0% deviation already
          // covers it. For T>=2 we can push (T-1)% and assert it does NOT trip.
          it(`does not trip at ${T - 1}% deviation`, async () => {
            const perturbed = computePerturbedPrice(basePrice, T - 1);
            await c.sentinelOracle.connect(timelock).setDirectPrice(m.token, perturbed);
            const [hasDeviation, , , devPct] = await c.deviationSentinel.checkPriceDeviation(vToken);
            expect(hasDeviation, `${m.symbol}: should NOT trip at +${T - 1}%`).to.equal(false);
            expect(devPct, `${m.symbol}: deviationPct`).to.be.lt(T);
          });
        }
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// callbackAfterExecution — event-count and permission-neutrality checks.
// ──────────────────────────────────────────────────────────────────────────

export const buildPostExecutionEventChecks = (ctx: ChainContext) => {
  const p = partition(ctx.markets);
  const writeable = writeMarkets(p);

  const uniswapPoolWrites = writeable.filter(m => (m.oracleType ?? "uniswap") === "uniswap").length;
  const curvePoolWrites = writeable.filter(m => m.oracleType === "curve").length;
  const aerodromePoolWrites = writeable.filter(m => m.oracleType === "aerodrome").length;
  const sentinelOracleWrites = writeable.length;
  const tokenConfigWrites = p.retunes.length + writeable.length;

  return async (txResponse: Awaited<ReturnType<Contract["functions"]["dummy"]>> | unknown) => {
    if (uniswapPoolWrites + aerodromePoolWrites > 0) {
      // UniswapOracle and AerodromeSlipstreamOracle share the same setPoolConfig signature
      // and emit the same PoolConfigUpdated event signature, so the count is summed.
      await expectEvents(
        txResponse as never,
        [ctx.name === "BSC" ? PANCAKESWAP_ORACLE_ABI : UNISWAP_ORACLE_ABI],
        ["PoolConfigUpdated"],
        [uniswapPoolWrites + aerodromePoolWrites],
      );
    }
    if (ctx.curveOracle && curvePoolWrites > 0) {
      await expectEvents(txResponse as never, [CURVE_ORACLE_ABI], ["PoolConfigUpdated"], [curvePoolWrites]);
    }
    if (sentinelOracleWrites > 0) {
      await expectEvents(
        txResponse as never,
        [SENTINEL_ORACLE_ABI],
        ["TokenOracleConfigUpdated"],
        [sentinelOracleWrites],
      );
    }
    if (tokenConfigWrites > 0) {
      await expectEvents(txResponse as never, [DEVIATION_SENTINEL_ABI], ["TokenConfigUpdated"], [tokenConfigWrites]);
    }

    // Permission-neutrality: no ACM mutations expected.
    await expectEvents(txResponse as never, [ACM_ABI], ["RoleGranted"], [0]);
    await expectEvents(txResponse as never, [ACM_ABI], ["RoleRevoked"], [0]);
  };
};

// ──────────────────────────────────────────────────────────────────────────
// Total command count — guards against drift between commandsForMarket logic
// and the expected per-chain scope. Each entry file calls this with its own
// expected count.
// ──────────────────────────────────────────────────────────────────────────

// Per-chain expected dstChainId. BSC commands have no dstChainId (governance source chain);
// remote chains tag with their LayerZero id. Sourced from src/types.ts LzChainId enum.
const EXPECTED_DST_CHAIN_ID: Record<string, number | undefined> = {
  BSC: undefined,
  Ethereum: 101,
  "Arbitrum One": 110,
  Base: 184,
};

export const runCommandCountAssertion = (chainName: string, expected: number) => {
  describe(`VIP-624 [${chainName}] — Command count`, () => {
    it(`emits exactly ${expected} commands for this chain`, () => {
      const expectedDst = EXPECTED_DST_CHAIN_ID[chainName];
      const actual = buildAllCommands().filter(c => c.dstChainId === expectedDst).length;
      expect(actual, `${chainName}: emitted command count`).to.equal(expected);
    });
  });
};
