import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, getForkedNetworkAddress, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip666, {
  ChainConfig,
  GOVERNANCE_EBRAKE_PERMS_IL,
  MonitoredMarket,
  governanceAccounts,
} from "../../vips/vip-666/bscmainnet";
import vip667 from "../../vips/vip-667/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "../vip-666/abi/AccessControlManager.json";
import AERODROME_ORACLE_ABI from "../vip-666/abi/AerodromeSlipstreamOracle.json";
import CURVE_ORACLE_ABI from "../vip-666/abi/CurveOracle.json";
import DEVIATION_SENTINEL_ABI from "../vip-666/abi/DeviationSentinel.json";
import IL_COMPTROLLER_ABI from "../vip-666/abi/ILComptroller.json";
import RESILIENT_ORACLE_ABI from "../vip-666/abi/ResilientOracle.json";
import SENTINEL_ORACLE_ABI from "../vip-666/abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "../vip-666/abi/UniswapOracle.json";
import VTOKEN_ABI from "../vip-666/abi/VToken.json";

// RoleGranted events emitted by VIP-667 (Sub-B) per chain:
//   8 (governance ebrake action) × 4 = 32 (token wiring uses direct setter calls)
const PERMS_GRANTED_PER_CHAIN = 32;

// Resolve the DEX-oracle address used to price a market based on its oracleType.
// Mirrors `resolveDexOracle` in the VIP itself — kept inline (not imported) because
// the VIP module throws on misconfig and the simulation's expressed intent is checking
// post-state, not duplicating proposal-build validation.
const dexOracleFor = (cfg: ChainConfig, market: MonitoredMarket): string => {
  switch (market.oracleType ?? "uniswap") {
    case "uniswap":
      return cfg.uniswapOracle;
    case "curve":
      return cfg.curveOracle as string;
    case "aerodrome":
      return cfg.aerodromeOracle as string;
  }
};

const countMarketsByOracle = (markets: MonitoredMarket[], type: MonitoredMarket["oracleType"]) =>
  markets.filter(m => (m.oracleType ?? "uniswap") === (type ?? "uniswap")).length;

// Tokens whose `DeviationSentinel.checkPriceDeviation` end-to-end check is fragile at
// fork time only — typically wrapped/correlated oracles whose inner feeds expose
// staleness windows we can't override from the simulation side. Production behaviour
// is unaffected (verified at live timestamps).
//   - LBTC: main oracle is OneJumpOracle (RedStone LBTC/BTC ratio + Chainlink BTC/USD).
//   - eBTC: same OneJumpOracle pattern (eBTC/BTC ratio + BTC/USD), so matches LBTC's profile.
const SKIP_CHECK_PRICE_DEVIATION = new Set<string>(["LBTC", "eBTC"]);

const collectMissingPlaceholders = (cfg: ChainConfig): string[] => {
  const missing: string[] = [];
  if (cfg.deviationSentinel === ZERO_ADDRESS) missing.push("deviationSentinel");
  if (cfg.eBrake === ZERO_ADDRESS) missing.push("eBrake");
  if (cfg.sentinelOracle === ZERO_ADDRESS) missing.push("sentinelOracle");
  if (cfg.uniswapOracle === ZERO_ADDRESS) missing.push("uniswapOracle");
  if (cfg.multisigPauser === ZERO_ADDRESS) missing.push("multisigPauser");
  if (cfg.keeper === ZERO_ADDRESS) missing.push("keeper");
  return missing;
};

// testForkedNetworkVipCommands advances chain time past timelock delays. Past that
// window Chainlink/RedStone heartbeats expire and ResilientOracle._getPrice reverts
// with "invalid resilient oracle price". Bumping at the adapter level (rather than via
// ResilientOracle's main slot) covers main + pivot + fallback slots and any wrapper
// oracles (e.g. OneJumpOracle) that internally read from these adapters.
// setMaxStalePeriodInChainlinkOracle no-ops when an adapter has no feed for the asset.
const tryGetAddress = (key: string): string | undefined => {
  try {
    return getForkedNetworkAddress(key);
  } catch {
    return undefined;
  }
};

const bumpAdapterStaleness = async (cfg: ChainConfig) => {
  const adapters = [tryGetAddress("CHAINLINK_ORACLE"), tryGetAddress("REDSTONE_ORACLE")].filter(
    (a): a is string => !!a,
  );
  for (const market of cfg.monitoredMarkets) {
    for (const adapter of adapters) {
      await setMaxStalePeriodInChainlinkOracle(adapter, market.token, ZERO_ADDRESS, cfg.normalTimelock);
    }
  }
};

// Walk the IL Comptroller's markets and build an underlying-address → vToken-address
// lookup. Used by the post-VIP `checkPriceDeviation` test, which needs the vToken to
// hand to DeviationSentinel.checkPriceDeviation. Skips native-token vTokens that
// don't expose underlying() (the try/catch prevents the call from blowing up).
const buildVTokenIndex = async (comptrollerAddress: string): Promise<Map<string, string>> => {
  const comptroller = await ethers.getContractAt(IL_COMPTROLLER_ABI, comptrollerAddress);
  const vTokens: string[] = await comptroller.getAllMarkets();
  const vTokenByUnderlying = new Map<string, string>();
  for (const vToken of vTokens) {
    try {
      const v = await ethers.getContractAt(VTOKEN_ABI, vToken);
      const underlying: string = await v.underlying();
      vTokenByUnderlying.set(underlying.toLowerCase(), vToken);
    } catch {
      // native-token vTokens don't expose underlying() — skip
    }
  }
  return vTokenByUnderlying;
};

export const runVip667Suite = async (cfg: ChainConfig) => {
  const missing = collectMissingPlaceholders(cfg);
  if (missing.length > 0) {
    describe.skip(`VIP-667 [${cfg.name}] — placeholder addresses missing: ${missing.join(", ")}`, () => {
      it(`Fill ${missing.join(", ")} in vips/vip-666/addresses/${cfg.name
        .toLowerCase()
        .replace(/\s/g, "")}.ts to run this suite`, () => {
        // intentionally empty — skip stub
      });
    });
    return;
  }

  let acm: Contract;
  let deviationSentinel: Contract;
  let sentinelOracle: Contract;
  let uniswapOracle: Contract;
  let curveOracle: Contract | undefined;
  let aerodromeOracle: Contract | undefined;
  let resilientOracle: Contract;
  // underlying address (lowercased) → vToken address — built by walking IL Comptroller markets.
  let vTokenByUnderlying: Map<string, string>;

  const govAccounts = governanceAccounts(cfg);

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, cfg.acm);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.deviationSentinel);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.sentinelOracle);
    uniswapOracle = await ethers.getContractAt(UNISWAP_ORACLE_ABI, cfg.uniswapOracle);
    if (cfg.curveOracle) curveOracle = await ethers.getContractAt(CURVE_ORACLE_ABI, cfg.curveOracle);
    if (cfg.aerodromeOracle) aerodromeOracle = await ethers.getContractAt(AERODROME_ORACLE_ABI, cfg.aerodromeOracle);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, getForkedNetworkAddress("RESILIENT_ORACLE"));

    await bumpAdapterStaleness(cfg);
    vTokenByUnderlying = await buildVTokenIndex(cfg.comptroller);
  });

  describe(`VIP-667 [${cfg.name}] — Monitored markets config validity`, () => {
    // A zero-address token or pool, or an out-of-range deviation, would be silently
    // skipped or accepted-as-malformed by the wiring loop. Fail loud at simulation time.
    it("Every monitored market has non-zero token, non-zero pool, and 0 < deviation ≤ 100", () => {
      for (const market of cfg.monitoredMarkets) {
        expect(market.token, `${market.symbol}: token is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
        expect(market.pool, `${market.symbol}: pool is ZERO_ADDRESS`).to.not.equal(ZERO_ADDRESS);
        expect(market.token.length, `${market.symbol}: token not 20 bytes`).to.equal(42);
        expect(market.pool.length, `${market.symbol}: pool not 20 bytes`).to.equal(42);
        expect(market.deviationPercent, `${market.symbol}: deviation must be > 0`).to.be.greaterThan(0);
        expect(market.deviationPercent, `${market.symbol}: deviation must be ≤ 100`).to.be.lessThanOrEqual(100);
      }
    });

    // ResilientOracle is the reference price source for handleDeviation. If it has no
    // feed for a monitored token, oraclePrice = 0 makes hasDeviation always true and
    // every keeper call would pause the market.
    it("ResilientOracle returns a non-zero price for every monitored token", async () => {
      for (const market of cfg.monitoredMarkets) {
        const price = await resilientOracle.getPrice(market.token);
        expect(price, `${market.symbol}: ResilientOracle.getPrice returned 0`).to.be.gt(0);
      }
    });
  });

  // VIP-667 depends on VIP-666 having been executed — apply it first within the
  // same fork so post-A state is the pre-VIP state for B.
  testForkedNetworkVipCommands(`VIP-666 [${cfg.name}] (prerequisite for VIP-667)`, await vip666());

  describe(`VIP-667 [${cfg.name}] — Pre-VIP behaviour (post-VIP-666 state)`, () => {
    it("Guardian + Timelocks have no EBrake-specific action permissions yet", async () => {
      for (const account of govAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    for (const market of cfg.monitoredMarkets) {
      it(`${market.symbol} is not wired yet`, async () => {
        // Pre-VIP, the appropriate DEX oracle has no pool entry for this token.
        // Each oracle uses a different storage shape for its pool config:
        //   - UniswapOracle / AerodromeSlipstreamOracle: tokenPools(token) -> address
        //   - CurveOracle: poolConfigs(token) -> { pool, coinIndex, referenceToken }
        const oracleType = market.oracleType ?? "uniswap";
        if (oracleType === "curve") {
          const cfgEntry = await curveOracle!.poolConfigs(market.token);
          expect(cfgEntry.pool).to.equal(ZERO_ADDRESS);
        } else if (oracleType === "aerodrome") {
          expect(await aerodromeOracle!.tokenPools(market.token)).to.equal(ZERO_ADDRESS);
        } else {
          expect(await uniswapOracle.tokenPools(market.token)).to.equal(ZERO_ADDRESS);
        }
        const tcSentinel = await sentinelOracle.tokenConfigs(market.token);
        expect(tcSentinel.oracle ?? tcSentinel).to.equal(ZERO_ADDRESS);
        const tcDev = await deviationSentinel.tokenConfigs(market.token);
        expect(tcDev.deviation).to.equal(0);
        expect(tcDev.enabled).to.equal(false);
      });
    }
  });

  testForkedNetworkVipCommands(`VIP-667 [${cfg.name}] Governance Actions & Market Wiring`, await vip667(), {
    callbackAfterExecution: async txResponse => {
      // 32 RoleGranted events per chain (governance EBrake action perms)
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [PERMS_GRANTED_PER_CHAIN]);
      // PoolConfigUpdated counts. UniswapOracle and AerodromeSlipstreamOracle emit the
      // identical 2-arg `PoolConfigUpdated(address,address)` event (same topic hash),
      // so a UniswapOracle-ABI filter decodes both — assert against the combined count.
      // CurveOracle emits its own 4-arg variant (distinct topic), checked separately.
      const uniswapMarkets = countMarketsByOracle(cfg.monitoredMarkets, "uniswap");
      const curveMarkets = countMarketsByOracle(cfg.monitoredMarkets, "curve");
      const aerodromeMarkets = countMarketsByOracle(cfg.monitoredMarkets, "aerodrome");
      await expectEvents(txResponse, [UNISWAP_ORACLE_ABI], ["PoolConfigUpdated"], [uniswapMarkets + aerodromeMarkets]);
      if (cfg.curveOracle && curveMarkets > 0) {
        await expectEvents(txResponse, [CURVE_ORACLE_ABI], ["PoolConfigUpdated"], [curveMarkets]);
      }
      await expectEvents(
        txResponse,
        [SENTINEL_ORACLE_ABI],
        ["TokenOracleConfigUpdated"],
        [cfg.monitoredMarkets.length],
      );
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenConfigUpdated"], [cfg.monitoredMarkets.length]);
    },
  });

  describe(`VIP-667 [${cfg.name}] — Post-VIP behaviour`, () => {
    it("Guardian + Timelocks have all 8 IL-supported EBrake action permissions", async () => {
      for (const account of govAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    for (const market of cfg.monitoredMarkets) {
      const expectedDexOracle = dexOracleFor(cfg, market);

      it(`${market.symbol} pool is configured on the routed DEX oracle`, async () => {
        const oracleType = market.oracleType ?? "uniswap";
        if (oracleType === "curve") {
          const cfgEntry = await curveOracle!.poolConfigs(market.token);
          expect(ethers.utils.getAddress(cfgEntry.pool)).to.equal(ethers.utils.getAddress(market.pool));
          expect(cfgEntry.coinIndex).to.equal(market.coinIndex);
          expect(cfgEntry.refCoinIndex).to.equal(market.refCoinIndex);
          expect(ethers.utils.getAddress(cfgEntry.referenceToken)).to.equal(
            ethers.utils.getAddress(market.referenceToken as string),
          );
          expect(cfgEntry.assetDecimals).to.equal(market.assetDecimals);
        } else if (oracleType === "aerodrome") {
          const actual = await aerodromeOracle!.tokenPools(market.token);
          expect(ethers.utils.getAddress(actual)).to.equal(ethers.utils.getAddress(market.pool));
        } else {
          const actual = await uniswapOracle.tokenPools(market.token);
          expect(ethers.utils.getAddress(actual)).to.equal(ethers.utils.getAddress(market.pool));
        }
      });

      it(`${market.symbol} oracle is configured on SentinelOracle`, async () => {
        const tc = await sentinelOracle.tokenConfigs(market.token);
        const actual = tc.oracle ?? tc;
        expect(ethers.utils.getAddress(actual)).to.equal(ethers.utils.getAddress(expectedDexOracle));
      });

      it(`${market.symbol} deviation threshold is configured on DeviationSentinel`, async () => {
        const tc = await deviationSentinel.tokenConfigs(market.token);
        expect(tc.deviation).to.equal(market.deviationPercent);
        expect(tc.enabled).to.equal(true);
      });

      // End-to-end price-pipeline check: SentinelOracle → UniswapOracle → pool.token0/token1.
      // If the pool isn't a real Uniswap V3 / V3-compatible contract, token0() reverts and
      // handleDeviation would always revert for this market (silent monitoring outage).
      it(`${market.symbol} SentinelOracle.getPrice returns a non-zero price`, async () => {
        const price = await sentinelOracle.getPrice(market.token);
        expect(price, `${market.symbol}: SentinelOracle.getPrice returned 0`).to.be.gt(0);
      });

      // Full handleDeviation pre-flight: same path the keeper exercises, minus the
      // EBrake side-effect. Asserts oracle/sentinel agree at fork time and the
      // computed deviation is below the configured trigger threshold.
      // Skipped for fork-fragile tokens (see SKIP_CHECK_PRICE_DEVIATION at top).
      if (!SKIP_CHECK_PRICE_DEVIATION.has(market.symbol)) {
        it(`${market.symbol} DeviationSentinel.checkPriceDeviation returns hasDeviation=false at fork time`, async () => {
          const vToken = vTokenByUnderlying.get(market.token.toLowerCase());
          expect(vToken, `${market.symbol}: no vToken in Core Pool with underlying=${market.token}`).to.not.be
            .undefined;
          const [hasDeviation, oraclePrice, sentinelPrice, deviationPercent] =
            await deviationSentinel.checkPriceDeviation(vToken);
          expect(oraclePrice, `${market.symbol}: oraclePrice = 0`).to.be.gt(0);
          expect(sentinelPrice, `${market.symbol}: sentinelPrice = 0`).to.be.gt(0);
          expect(deviationPercent, `${market.symbol}: live deviation ≥ trigger threshold`).to.be.lt(
            market.deviationPercent,
          );
          expect(hasDeviation, `${market.symbol}: handleDeviation would trigger right now`).to.equal(false);
        });
      }
    }
  });
};
