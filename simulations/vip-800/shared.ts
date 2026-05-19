import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents } from "src/utils";

import type { ChainContext } from "../../vips/vip-800/bscmainnet";
import type { MarketEntry } from "../../vips/vip-800/config";
import ACM_ABI from "./abi/AccessControlManager.json";
import AERODROME_ORACLE_ABI from "./abi/AerodromeSlipstreamOracle.json";
import CURVE_ORACLE_ABI from "./abi/CurveOracle.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import PANCAKESWAP_ORACLE_ABI from "./abi/PancakeSwapOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";

// VIP-800 doesn't deploy or upgrade anything and doesn't change ACM permissions.
// Every setter it calls was permissioned to Normal Timelock by VIP-590 / VIP-616.
// The post-VIP event-count check asserts zero RoleGranted / RoleRevoked.

const dexOracleAddress = (ctx: ChainContext, m: MarketEntry): string => {
  switch (m.oracleType ?? "uniswap") {
    case "uniswap":
      return ctx.uniswapOracle;
    case "curve":
      return ctx.curveOracle as string;
    case "aerodrome":
      return ctx.aerodromeOracle as string;
  }
};

const dexOracleAbi = (ctx: ChainContext, m: MarketEntry) => {
  switch (m.oracleType ?? "uniswap") {
    case "uniswap":
      return ctx.name === "BSC" ? PANCAKESWAP_ORACLE_ABI : UNISWAP_ORACLE_ABI;
    case "curve":
      return CURVE_ORACLE_ABI;
    case "aerodrome":
      return AERODROME_ORACLE_ABI;
  }
};

const readTokenPool = async (oracle: Contract, token: string, oracleType: string): Promise<string> => {
  if (oracleType === "curve") {
    const cfg = await oracle.poolConfigs(token);
    return cfg.pool;
  }
  return await oracle.tokenPools(token);
};

interface Partitioned {
  retunes: MarketEntry[];
  disables: MarketEntry[];
  promotes: MarketEntry[];
  poolSwaps: MarketEntry[];
}

const partition = (markets: MarketEntry[]): Partitioned => ({
  retunes: markets.filter(m => m.action === "retune"),
  disables: markets.filter(m => m.action === "disable"),
  promotes: markets.filter(m => m.action === "promote"),
  poolSwaps: markets.filter(m => m.action === "poolSwap"),
});

const buildContracts = async (ctx: ChainContext) => {
  const uniswapLikeAbi = ctx.name === "BSC" ? PANCAKESWAP_ORACLE_ABI : UNISWAP_ORACLE_ABI;
  const deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, ctx.deviationSentinel);
  const sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, ctx.sentinelOracle);
  const uniswapOracle = await ethers.getContractAt(uniswapLikeAbi, ctx.uniswapOracle);
  const curveOracle = ctx.curveOracle ? await ethers.getContractAt(CURVE_ORACLE_ABI, ctx.curveOracle) : undefined;
  const aerodromeOracle = ctx.aerodromeOracle
    ? await ethers.getContractAt(AERODROME_ORACLE_ABI, ctx.aerodromeOracle)
    : undefined;
  return { deviationSentinel, sentinelOracle, uniswapOracle, curveOracle, aerodromeOracle };
};

// ──────────────────────────────────────────────────────────────────────────
// Pre-VIP assertions: snapshot the on-chain baseline before the proposal runs.
// ──────────────────────────────────────────────────────────────────────────

export const runPreVipAssertions = (ctx: ChainContext) => {
  const p = partition(ctx.markets);

  describe(`VIP-800 [${ctx.name}] — Pre-VIP state`, () => {
    let deviationSentinel: Contract;
    let sentinelOracle: Contract;

    before(async () => {
      ({ deviationSentinel, sentinelOracle } = await buildContracts(ctx));
    });

    for (const m of p.retunes) {
      it(`${m.symbol}: configured at ${m.currentPct}%, enabled`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.currentPct);
        expect(tc.enabled).to.equal(true);
      });
    }

    for (const m of p.disables) {
      it(`${m.symbol}: configured at ${m.currentPct}%, enabled (will disable)`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.currentPct);
        expect(tc.enabled).to.equal(true);
      });
    }

    for (const m of p.promotes) {
      it(`${m.symbol}: not yet wired (will promote)`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(0);
        expect(tc.enabled).to.equal(false);
        const sentinelEntry = await sentinelOracle.tokenConfigs(m.token);
        const sentinelOracleAddr = sentinelEntry.oracle ?? sentinelEntry;
        expect(sentinelOracleAddr).to.equal(ZERO_ADDRESS);
      });
    }

    for (const m of p.poolSwaps) {
      it(`${m.symbol}: currently wired at ${m.currentPct}% (will pool-swap)`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.currentPct);
        expect(tc.enabled).to.equal(true);
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// Post-VIP assertions: final state per market.
// ──────────────────────────────────────────────────────────────────────────

export const runPostVipAssertions = (ctx: ChainContext) => {
  const p = partition(ctx.markets);

  describe(`VIP-800 [${ctx.name}] — Post-VIP state`, () => {
    let deviationSentinel: Contract;
    let sentinelOracle: Contract;

    before(async () => {
      ({ deviationSentinel, sentinelOracle } = await buildContracts(ctx));
    });

    for (const m of p.retunes) {
      it(`${m.symbol}: threshold now ${m.targetPct}%, still enabled`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.targetPct);
        expect(tc.enabled).to.equal(true);
      });
    }

    for (const m of p.disables) {
      // Contract reverts setTokenConfig with deviation=0 (ZeroDeviation), so we use
      // setTokenMonitoringEnabled(token, false). The stored threshold stays at currentPct.
      it(`${m.symbol}: monitoring disabled, threshold persists at ${m.currentPct}%`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.currentPct);
        expect(tc.enabled).to.equal(false);
      });
    }

    for (const m of [...p.promotes, ...p.poolSwaps]) {
      const oracleType = m.oracleType ?? "uniswap";

      it(`${m.symbol}: pool registered on routed DEX oracle (${oracleType})`, async () => {
        const oracle = await ethers.getContractAt(dexOracleAbi(ctx, m), dexOracleAddress(ctx, m));
        const actualPool = await readTokenPool(oracle, m.token, oracleType);
        expect(ethers.utils.getAddress(actualPool)).to.equal(ethers.utils.getAddress(m.pool));
      });

      it(`${m.symbol}: SentinelOracle routes to the new DEX oracle`, async () => {
        const tc = await sentinelOracle.tokenConfigs(m.token);
        const actual = tc.oracle ?? tc;
        expect(ethers.utils.getAddress(actual)).to.equal(ethers.utils.getAddress(dexOracleAddress(ctx, m)));
      });

      it(`${m.symbol}: DeviationSentinel threshold ${m.targetPct}%, enabled`, async () => {
        const tc = await deviationSentinel.tokenConfigs(m.token);
        expect(tc.deviation).to.equal(m.targetPct);
        expect(tc.enabled).to.equal(true);
      });
    }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// callbackAfterExecution helper — verifies the proposal emits exactly the
// expected event counts and is permission-neutral.
// ──────────────────────────────────────────────────────────────────────────

export const buildPostExecutionEventChecks = (ctx: ChainContext) => {
  const p = partition(ctx.markets);
  const uniswapPoolWrites = [...p.promotes, ...p.poolSwaps].filter(
    m => (m.oracleType ?? "uniswap") === "uniswap",
  ).length;
  const curvePoolWrites = [...p.promotes, ...p.poolSwaps].filter(m => m.oracleType === "curve").length;
  const aerodromePoolWrites = [...p.promotes, ...p.poolSwaps].filter(m => m.oracleType === "aerodrome").length;
  const sentinelOracleWrites = p.promotes.length + p.poolSwaps.length;
  // setTokenConfig fires TokenConfigUpdated; setTokenMonitoringEnabled fires
  // TokenMonitoringStatusChanged. Disables go through the latter; everything else
  // (retune / promote / poolSwap) goes through the former.
  const tokenConfigWrites = p.retunes.length + p.promotes.length + p.poolSwaps.length;
  const monitoringStatusWrites = p.disables.length;

  return async (txResponse: Awaited<ReturnType<Contract["functions"]["dummy"]>> | unknown) => {
    if (uniswapPoolWrites + aerodromePoolWrites > 0) {
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
    if (monitoringStatusWrites > 0) {
      await expectEvents(
        txResponse as never,
        [DEVIATION_SENTINEL_ABI],
        ["TokenMonitoringStatusChanged"],
        [monitoringStatusWrites],
      );
    }

    // Permission-neutrality: no ACM mutations expected.
    await expectEvents(txResponse as never, [ACM_ABI], ["RoleGranted"], [0]);
    await expectEvents(txResponse as never, [ACM_ABI], ["RoleRevoked"], [0]);
  };
};
