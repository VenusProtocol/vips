import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";

import { buildAllCommands, dexOracleFor } from "../../vips/vip-658/bscmainnet";
import type { ChainContext, MarketEntry } from "../../vips/vip-658/config";
import ACM_ABI from "./abi/AccessControlManager.json";
import AERODROME_ORACLE_ABI from "./abi/AerodromeSlipstreamOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import CURVE_ORACLE_ABI from "./abi/CurveOracle.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

// ──────────────────────────────────────────────────────────────────────────
// Test-only chain config: addresses needed to run live behavior tests.
// Kept separate from ChainContext so VIP runtime types don't carry test-only
// fields. Each entry file (`bscmainnet.ts`, `ethereum.ts`, …) builds one of
// these and hands it to the suite helpers.
// ──────────────────────────────────────────────────────────────────────────

export interface TestConfig {
  ctx: ChainContext;
  resilientOracle: string;
  timelock: string; // governance timelock — already permissioned for all relevant setters
  // Pools we walk to map underlying → vToken. BSC has the Diamond Unitroller (Core Pool);
  // remote chains use one or more IL Comptrollers.
  comptrollers: { address: string; type: "core" | "il" }[];
  // Keeper permitted to call handleDeviation (BSC only) — used to prove a disabled market reverts.
  keeper?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────────────────────────────────

// DEX-oracle address for a market — reuses the proposal builder's resolver so the
// simulation checks against exactly the address the VIP targets.
const dexOracleAddress = dexOracleFor;

const dexOracleAbi = (m: MarketEntry) => {
  // BSC's PancakeSwapOracle shares the UniswapOracle ABI (same setPoolConfig /
  // PoolConfigUpdated shape), so one Uniswap ABI covers every "uniswap" market.
  const t = m.oracleType ?? "uniswap";
  if (t === "uniswap") return UNISWAP_ORACLE_ABI;
  if (t === "curve") return CURVE_ORACLE_ABI;
  return AERODROME_ORACLE_ABI;
};

// Pre-VIP `enabled` flag: a wired-but-disabled market (e.g. BSC DAI) sets it explicitly.
const currentEnabled = (m: MarketEntry): boolean => m.currentEnabled ?? m.currentPct > 0;

interface Partitioned {
  retunes: MarketEntry[]; // setTokenConfig only (threshold change)
  poolSwaps: MarketEntry[]; // pool + oracle + setTokenConfig (rebind + retune)
  poolOnly: MarketEntry[]; // pool + oracle (threshold left unchanged)
  disables: MarketEntry[]; // setTokenMonitoringEnabled(token, false)
  skips: MarketEntry[]; // no on-chain action
}

const partition = (markets: MarketEntry[]): Partitioned => ({
  retunes: markets.filter(m => m.action === "retune"),
  poolSwaps: markets.filter(m => m.action === "poolSwap"),
  poolOnly: markets.filter(m => m.action === "poolOnly"),
  disables: markets.filter(m => m.action === "disable"),
  skips: markets.filter(m => m.action === "skip"),
});

// Markets that write a pool config (the pool always changes for these).
const poolWriteMarkets = (p: Partitioned): MarketEntry[] => [...p.poolSwaps, ...p.poolOnly];
// Markets that write a SentinelOracle repoint (all pool-writers except the verified no-ops).
const oracleRepointMarkets = (p: Partitioned): MarketEntry[] => poolWriteMarkets(p).filter(m => !m.skipOracleRepoint);
// Markets that write a DeviationSentinel threshold (setTokenConfig).
const thresholdWriteMarkets = (p: Partitioned): MarketEntry[] => [...p.retunes, ...p.poolSwaps];

const V3_POOL_ABI = ["function token0() view returns (address)", "function token1() view returns (address)"];
const ERC20_DECIMALS_ABI = ["function decimals() view returns (uint8)"];
const BPS_SCALE = 10_000;
const MAX_BASELINE_DEVIATION_BPS = 100; // 1% — catches wrong sides/decimals without pinning exact spot prices

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

// Assert SentinelOracle routes `token` to `expectedOracle` (tokenConfigs(token).oracle).
const expectSentinelRoutesTo = async (sentinelOracle: Contract, token: string, expectedOracle: string, ctx: string) => {
  const tc = await sentinelOracle.tokenConfigs(token);
  const actual = tc.oracle ?? tc;
  expect(ethers.utils.getAddress(actual), `${ctx}: sentinel oracle entry`).to.equal(
    ethers.utils.getAddress(expectedOracle),
  );
};

const absoluteDifference = (a: BigNumber, b: BigNumber): BigNumber => (a.gte(b) ? a.sub(b) : b.sub(a));

const configureTargetPricePath = async (cfg: TestConfig, c: ChainContracts, m: MarketEntry) => {
  const timelock = await initMainnetUser(cfg.timelock, ethers.utils.parseEther("1"));
  const dexOracle = await ethers.getContractAt(dexOracleAbi(m), dexOracleAddress(cfg.ctx, m));

  if (m.oracleType === "curve") {
    await dexOracle
      .connect(timelock)
      .setPoolConfig(m.token, m.pool, m.coinIndex, m.refCoinIndex, m.referenceToken, m.assetDecimals);
  } else {
    await dexOracle.connect(timelock).setPoolConfig(m.token, m.pool);
  }
  await c.sentinelOracle.connect(timelock).setTokenOracleConfig(m.token, dexOracleAddress(cfg.ctx, m));

  return dexOracle;
};

// ──────────────────────────────────────────────────────────────────────────
// Config sanity — guards the hand-entered tables in addresses/<chain>.ts.
// ──────────────────────────────────────────────────────────────────────────

export const runConfigSanity = (cfg: TestConfig) => {
  const { ctx } = cfg;
  const p = partition(ctx.markets);

  describe(`VIP-658 [${ctx.name}] — Config sanity`, () => {
    it("every market has well-formed token, pool, and threshold fields", () => {
      for (const m of ctx.markets) {
        expect(m.token.length, `${m.symbol}: token not 20 bytes`).to.equal(42);
        expect(m.pool.length, `${m.symbol}: pool not 20 bytes`).to.equal(42);
        // skip / disable markets may carry placeholder pools; they emit no pool command.
        if (m.action !== "skip" && m.action !== "disable") {
          expect(m.token, `${m.symbol}: token is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
          expect(m.pool, `${m.symbol}: pool is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
          expect(m.targetPct, `${m.symbol}: targetPct must be > 0`).to.be.greaterThan(0);
          expect(m.targetPct, `${m.symbol}: targetPct must be ≤ 100`).to.be.lessThanOrEqual(100);
        }
      }
    });

    it("threshold-write markets target 5% (unified tier)", () => {
      // Every retune / poolSwap in this VIP moves to the unified 5% tier.
      for (const m of thresholdWriteMarkets(p)) {
        expect(m.targetPct, `${m.symbol}: targetPct`).to.equal(5);
      }
    });

    it("poolOnly markets keep their threshold (targetPct == currentPct)", () => {
      for (const m of p.poolOnly) {
        expect(m.targetPct, `${m.symbol}: targetPct should equal currentPct`).to.equal(m.currentPct);
      }
    });

    it("curve markets carry all StableSwap params", () => {
      for (const m of ctx.markets) {
        if (m.oracleType !== "curve" || m.action === "skip" || m.action === "disable") continue;
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

  describe(`VIP-658 [${cfg.ctx.name}] — Pre-VIP state`, () => {
    let c: ChainContracts;
    let vTokenByUnderlying: Map<string, string>;

    before(async () => {
      c = await buildContracts(cfg);
      vTokenByUnderlying = await buildVTokenIndex(cfg);
    });

    for (const m of p.retunes) {
      it(`${m.symbol}: configured at ${m.currentPct}%, enabled`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, true, m.symbol);
      });
    }

    for (const m of [...p.poolSwaps, ...p.poolOnly]) {
      it(`${m.symbol}: currently wired at ${m.currentPct}% (oracle will repoint)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, true, m.symbol);
      });

      // Where we elide the SentinelOracle repoint as a no-op, prove the current binding
      // already equals the target DEX oracle — otherwise the elision would leave it wrong.
      if (m.skipOracleRepoint) {
        it(`${m.symbol}: SentinelOracle already routes to the target DEX oracle (elided repoint)`, async () => {
          await expectSentinelRoutesTo(c.sentinelOracle, m.token, dexOracleAddress(cfg.ctx, m), m.symbol);
        });
      }
    }

    for (const m of p.disables) {
      it(`${m.symbol}: currently monitored at ${m.currentPct}% (will disable)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, currentEnabled(m), m.symbol);
        expect(currentEnabled(m), `${m.symbol}: expected enabled pre-VIP`).to.equal(true);
      });
    }

    // Configure each target pool and route inside a snapshot while oracle feeds are
    // fresh, then roll the state back. The full VIP simulation below independently
    // proves that the emitted governance commands produce the same stored config.
    for (const m of poolWriteMarkets(p)) {
      it(`${m.symbol}: target pool supports the full DeviationSentinel price path`, async () => {
        const snapshot = await ethers.provider.send("evm_snapshot", []);

        try {
          const dexOracle = await configureTargetPricePath(cfg, c, m);
          const directPrice = await c.sentinelOracle.directPrices(m.token);
          expect(directPrice, `${m.symbol}: direct price bypasses the configured DEX oracle`).to.equal(0);

          const dexPrice = await dexOracle.getPrice(m.token);
          const sentinelPrice = await c.sentinelOracle.getPrice(m.token);
          const resilientPrice = await c.resilientOracle.getPrice(m.token);

          expect(dexPrice, `${m.symbol}: DEX oracle price`).to.be.gt(0);
          expect(sentinelPrice, `${m.symbol}: SentinelOracle price`).to.equal(dexPrice);
          expect(resilientPrice, `${m.symbol}: ResilientOracle price`).to.be.gt(0);

          const deviationBps = absoluteDifference(sentinelPrice, resilientPrice).mul(BPS_SCALE).div(resilientPrice);
          expect(deviationBps, `${m.symbol}: Sentinel/Resilient baseline deviation (bps)`).to.be.lt(
            MAX_BASELINE_DEVIATION_BPS,
          );

          const vToken = vTokenByUnderlying.get(m.token.toLowerCase());
          expect(vToken, `${m.symbol}: no listed Venus market found for the pool-write asset`).to.not.be.undefined;

          const [hasDeviation, oraclePrice, checkedSentinelPrice, deviationPercent] =
            await c.deviationSentinel.checkPriceDeviation(vToken);
          expect(oraclePrice, `${m.symbol}: DeviationSentinel oraclePrice`).to.equal(resilientPrice);
          expect(checkedSentinelPrice, `${m.symbol}: DeviationSentinel sentinelPrice`).to.equal(sentinelPrice);
          expect(deviationPercent, `${m.symbol}: deviationPercent`).to.be.lt(m.currentPct);
          expect(hasDeviation, `${m.symbol}: target pool would immediately trigger the sentinel`).to.equal(false);
        } finally {
          expect(await ethers.provider.send("evm_revert", [snapshot]), `${m.symbol}: snapshot revert`).to.equal(true);
        }
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Post-VIP assertions — final state per market, plus skip-market untouched-diff.
// ──────────────────────────────────────────────────────────────────────────

interface StateSnapshot {
  symbol: string;
  token: string;
  deviation: number;
  enabled: boolean;
}

export const runPostVipAssertions = (cfg: TestConfig) => {
  const p = partition(cfg.ctx.markets);

  describe(`VIP-658 [${cfg.ctx.name}] — Post-VIP state`, () => {
    let c: ChainContracts;
    let skipSnapshots: StateSnapshot[];

    before(async () => {
      c = await buildContracts(cfg);
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

    for (const m of poolWriteMarkets(p)) {
      const oracleType = m.oracleType ?? "uniswap";

      it(`${m.symbol}: pool registered on routed DEX oracle (${oracleType})`, async () => {
        const oracle = await ethers.getContractAt(dexOracleAbi(m), dexOracleAddress(cfg.ctx, m));
        if (oracleType === "curve") {
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
        await expectSentinelRoutesTo(c.sentinelOracle, m.token, dexOracleAddress(cfg.ctx, m), m.symbol);
      });

      if (oracleType === "curve") {
        it(`${m.symbol}: Curve pool.coins() matches stored coin indexes`, async () => {
          const pool = new ethers.Contract(m.pool, ["function coins(uint256) view returns (address)"], ethers.provider);
          const token = new ethers.Contract(m.token, ERC20_DECIMALS_ABI, ethers.provider);
          const priced = await pool.coins(m.coinIndex as number);
          const ref = await pool.coins(m.refCoinIndex as number);
          expect(ethers.utils.getAddress(priced), `${m.symbol}: pool.coins(coinIndex)`).to.equal(
            ethers.utils.getAddress(m.token),
          );
          expect(ethers.utils.getAddress(ref), `${m.symbol}: pool.coins(refCoinIndex)`).to.equal(
            ethers.utils.getAddress(m.referenceToken as string),
          );
          expect(await token.decimals(), `${m.symbol}: assetDecimals`).to.equal(m.assetDecimals);
        });
      } else {
        it(`${m.symbol}: target token is present in the V3-compatible pool`, async () => {
          const pool = new ethers.Contract(m.pool, V3_POOL_ABI, ethers.provider);
          const tokens = [await pool.token0(), await pool.token1()].map(token => token.toLowerCase());
          expect(tokens, `${m.symbol}: target token is neither token0 nor token1`).to.include(m.token.toLowerCase());
        });
      }
    }

    // poolSwap: threshold set to targetPct, enabled.
    for (const m of p.poolSwaps) {
      it(`${m.symbol}: DeviationSentinel threshold ${m.targetPct}%, enabled`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.targetPct, true, m.symbol);
      });
    }

    // poolOnly: threshold left unchanged (== currentPct), still enabled.
    for (const m of p.poolOnly) {
      it(`${m.symbol}: threshold unchanged at ${m.currentPct}%, still enabled (pool-only)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, true, m.symbol);
      });
    }

    // disable: monitoring off, stored deviation preserved.
    for (const m of p.disables) {
      it(`${m.symbol}: monitoring disabled, deviation config preserved (${m.currentPct}%)`, async () => {
        await expectTokenConfig(c.deviationSentinel, m.token, m.currentPct, false, m.symbol);
      });
    }

    // Skip markets: assert each one's tokenConfigs survived the VIP unchanged.
    for (const m of p.skips) {
      it(`${m.symbol} (skip): tokenConfigs untouched by VIP`, async () => {
        const snap = skipSnapshots.find(s => s.token === m.token)!;
        expect(snap.deviation, `${m.symbol}: deviation drifted`).to.equal(m.currentPct);
        expect(snap.enabled, `${m.symbol}: enabled drifted`).to.equal(currentEnabled(m));
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Disable behavior — prove a disabled market can no longer be acted on.
// handleDeviation on a disabled market reverts with TokenMonitoringDisabled.
// (BSC only — remote chains have no local keeper signer in the forked-command harness.)
// ──────────────────────────────────────────────────────────────────────────

export const runDisableBehaviorTests = (cfg: TestConfig) => {
  const p = partition(cfg.ctx.markets);
  if (p.disables.length === 0 || !cfg.keeper) return;

  describe(`VIP-658 [${cfg.ctx.name}] — Disable behavior`, () => {
    let deviationSentinel: Contract;
    let vTokenByUnderlying: Map<string, string>;

    before(async () => {
      deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.ctx.deviationSentinel);
      vTokenByUnderlying = await buildVTokenIndex(cfg);
    });

    for (const m of p.disables) {
      it(`${m.symbol}: handleDeviation reverts TokenMonitoringDisabled`, async () => {
        const vToken = vTokenByUnderlying.get(m.token.toLowerCase());
        if (!vToken) throw new Error(`${m.symbol}: vToken not found — fix comptroller config`);
        const keeper = await initMainnetUser(cfg.keeper as string, ethers.utils.parseEther("1"));
        await expect(deviationSentinel.connect(keeper).handleDeviation(vToken)).to.be.revertedWithCustomError(
          deviationSentinel,
          "TokenMonitoringDisabled",
        );
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Threshold boundary mechanics with a deliberately perturbed direct price remain
// covered by VIP-616 / VIP-624. This suite exercises every changed pool through the
// natural adapter -> SentinelOracle -> DeviationSentinel path at the fork timestamp,
// before the governance simulation advances time beyond external feed heartbeats.
// ──────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────
// callbackAfterExecution — event-count and permission-neutrality checks.
// ──────────────────────────────────────────────────────────────────────────

export const buildPostExecutionEventChecks = (ctx: ChainContext) => {
  const p = partition(ctx.markets);
  const poolWrites = poolWriteMarkets(p);

  const uniswapPoolWrites = poolWrites.filter(m => (m.oracleType ?? "uniswap") === "uniswap").length;
  const curvePoolWrites = poolWrites.filter(m => m.oracleType === "curve").length;
  const aerodromePoolWrites = poolWrites.filter(m => m.oracleType === "aerodrome").length;
  const sentinelOracleWrites = oracleRepointMarkets(p).length;
  const tokenConfigWrites = thresholdWriteMarkets(p).length;
  const monitoringToggles = p.disables.length;

  return async (txResponse: TransactionResponse) => {
    if (uniswapPoolWrites + aerodromePoolWrites > 0) {
      // UniswapOracle and AerodromeSlipstreamOracle share the same setPoolConfig signature
      // and emit the same PoolConfigUpdated event signature, so the count is summed.
      // (BSC's PancakeSwapOracle shares the UniswapOracle ABI as well.)
      await expectEvents(
        txResponse,
        [UNISWAP_ORACLE_ABI],
        ["PoolConfigUpdated"],
        [uniswapPoolWrites + aerodromePoolWrites],
      );
    }
    if (ctx.curveOracle && curvePoolWrites > 0) {
      await expectEvents(txResponse, [CURVE_ORACLE_ABI], ["PoolConfigUpdated"], [curvePoolWrites]);
    }
    if (sentinelOracleWrites > 0) {
      await expectEvents(txResponse, [SENTINEL_ORACLE_ABI], ["TokenOracleConfigUpdated"], [sentinelOracleWrites]);
    }
    if (tokenConfigWrites > 0) {
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenConfigUpdated"], [tokenConfigWrites]);
    }
    if (monitoringToggles > 0) {
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenMonitoringStatusChanged"], [monitoringToggles]);
    }

    // Permission-neutrality: no ACM mutations expected.
    await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [0]);
    await expectEvents(txResponse, [ACM_ABI], ["RoleRevoked"], [0]);
  };
};

// ──────────────────────────────────────────────────────────────────────────
// Total command count — guards against drift between commandsForMarket logic
// and the expected per-chain scope.
// ──────────────────────────────────────────────────────────────────────────

export const runCommandCountAssertion = (ctx: ChainContext, expected: number) => {
  describe(`VIP-658 [${ctx.name}] — Command count`, () => {
    it(`emits exactly ${expected} commands for this chain`, () => {
      // BSC commands carry no dstChainId; remote chains route by ctx.dstChainId.
      const actual = buildAllCommands().filter(c => c.dstChainId === ctx.dstChainId).length;
      expect(actual, `${ctx.name}: emitted command count`).to.equal(expected);
    });
  });
};
