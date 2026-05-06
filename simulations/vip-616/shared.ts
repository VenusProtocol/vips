import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { ZERO_ADDRESS } from "src/networkAddresses";
import { expectEvents, getForkedNetworkAddress, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import vip616 from "../../vips/vip-616/bscmainnet";
import {
  AERODROME_ORACLE_ADMIN_PERMS,
  CURVE_ORACLE_ADMIN_PERMS,
  ChainConfig,
  DIAMOND_ONLY_EBRAKE_PERMS,
  EBRAKE_COMPTROLLER_PERMS_IL,
  GOVERNANCE_EBRAKE_PERMS_IL,
  MonitoredMarket,
  RESET_PERMS,
  SENTINEL_ADMIN_PERMS,
  SENTINEL_EBRAKE_PERMS,
  SENTINEL_ORACLE_ADMIN_PERMS,
  UNISWAP_ORACLE_ADMIN_PERMS,
  governanceAccounts,
} from "../../vips/vip-616/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import AERODROME_ORACLE_ABI from "./abi/AerodromeSlipstreamOracle.json";
import CURVE_ORACLE_ABI from "./abi/CurveOracle.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";
import UNISWAP_ORACLE_ABI from "./abi/UniswapOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

// The VIP grants the configurator DEFAULT_ADMIN_ROLE on the local ACM so that
// execute() can call giveCallPermission / revokeCallPermission (both wrap OZ
// grantRole / revokeRole which require DEFAULT_ADMIN_ROLE). The configurator
// renounces this role at the end of execute() via _selfRevokeACMPermissions().
const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// Tokens whose `DeviationSentinel.checkPriceDeviation` end-to-end check is
// fragile at fork time only — wrapped/correlated oracles whose inner feeds
// expose staleness windows we can't override from the simulation side.
//   - LBTC: OneJumpOracle (RedStone LBTC/BTC ratio + Chainlink BTC/USD).
//   - eBTC: same OneJumpOracle pattern (eBTC/BTC ratio + BTC/USD).
const SKIP_CHECK_PRICE_DEVIATION = new Set<string>(["LBTC", "eBTC"]);

// RoleGranted event count emitted by VIP-616 per chain:
//     1  DEFAULT_ADMIN_ROLE grant          (VIP-level grantRole(0x00, configurator))
//   + 51 base permission grants            (12 sentinel admin + 8 sentinelOracle admin
//                                           + 4 uniswapOracle admin + 4 ebrake→comptroller
//                                           + 12 reset + 3 sentinel→ebrake + 8 multisig)
//   + 4  if cfg.curveOracle present        (CurveOracle admin × 4 govAccounts)
//   + 4  if cfg.aerodromeOracle present    (AerodromeSlipstreamOracle admin × 4 govAccounts)
//   + 32 governance EBrake-action grants   (8 sigs × 4 govAccounts)
//   + 4  transient self-grants in execute() (_selfGrantBaseTransientPermissions:
//         DeviationSentinel×2, SentinelOracle×1, UniswapOracle×1)
//   + 1  if cfg.curveOracle / aerodromeOracle present (_selfGrantChainSpecificTransientPermissions)
const expectedRoleGranted = (cfg: ChainConfig): number => {
  let n = 1 + 51 + 32 + 4; // DEFAULT_ADMIN_ROLE + base grants + governance EBrake + base transient
  if (cfg.curveOracle) n += 4 + 1; // CurveOracle admin grants + transient self-grant
  if (cfg.aerodromeOracle) n += 4 + 1; // AerodromeOracle admin grants + transient self-grant
  return n;
};

// RoleRevoked event count emitted by VIP-616 per chain:
//     4  base transient self-revokes in execute() (_selfRevokeBaseTransientPermissions)
//   + 1  if cfg.curveOracle / aerodromeOracle present (_selfRevokeChainSpecificTransientPermissions)
//   + 1  configurator renounces DEFAULT_ADMIN_ROLE (_selfRevokeACMPermissions)
const expectedRoleRevoked = (cfg: ChainConfig): number => {
  let n = 4 + 1; // base transient revokes + DEFAULT_ADMIN_ROLE renounce
  if (cfg.curveOracle || cfg.aerodromeOracle) n += 1;
  return n;
};

// OwnershipTransferred count = 4 base contracts (DeviationSentinel, SentinelOracle,
// UniswapOracle, EBrake) + 1 each for CurveOracle / AerodromeSlipstreamOracle.
const expectedAcceptOwnership = (cfg: ChainConfig): number => {
  let n = 4;
  if (cfg.curveOracle) n += 1;
  if (cfg.aerodromeOracle) n += 1;
  return n;
};

const countMarketsByOracle = (markets: MonitoredMarket[], type: MonitoredMarket["oracleType"]) =>
  markets.filter(m => (m.oracleType ?? "uniswap") === (type ?? "uniswap")).length;

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

const tryGetAddress = (key: string): string | undefined => {
  try {
    return getForkedNetworkAddress(key);
  } catch {
    return undefined;
  }
};

// testForkedNetworkVipCommands advances chain time past timelock delays. Past
// that window Chainlink/RedStone heartbeats expire and ResilientOracle reverts
// with "invalid resilient oracle price". Bump at the adapter level so main +
// pivot + fallback slots and OneJumpOracle wrappers are all covered.
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

const collectMissingPlaceholders = (cfg: ChainConfig): string[] => {
  const missing: string[] = [];
  if (cfg.deviationSentinel === ZERO_ADDRESS) missing.push("deviationSentinel");
  if (cfg.eBrake === ZERO_ADDRESS) missing.push("eBrake");
  if (cfg.sentinelOracle === ZERO_ADDRESS) missing.push("sentinelOracle");
  if (cfg.uniswapOracle === ZERO_ADDRESS) missing.push("uniswapOracle");
  if (cfg.multisigPauser === ZERO_ADDRESS) missing.push("multisigPauser");
  if (cfg.keeper === ZERO_ADDRESS) missing.push("keeper");
  if (cfg.configurator === ZERO_ADDRESS) missing.push("configurator");
  return missing;
};

export const runVip616Suite = async (cfg: ChainConfig) => {
  const missing = collectMissingPlaceholders(cfg);
  if (missing.length > 0) {
    describe.skip(`VIP-616 [${cfg.name}] — placeholder addresses missing: ${missing.join(", ")}`, () => {
      it(`Fill ${missing.join(", ")} to run this suite`, () => {
        // intentionally empty — skip stub
      });
    });
    return;
  }

  // vip616() iterates all three chains and throws if any configurator is ZERO_ADDRESS.
  // Catch so one undeployed chain doesn't silently break another chain's sim file.
  let proposal: Awaited<ReturnType<typeof vip616>>;
  try {
    proposal = await vip616();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    describe.skip(`VIP-616 [${cfg.name}] — cannot build VIP (all configurators must be set): ${msg}`, () => {
      it("Deploy all three configurators and update addresses/<chain>.ts", () => {
        // intentionally empty — skip stub
      });
    });
    return;
  }

  let acm: Contract;
  let deviationSentinel: Contract;
  let eBrake: Contract;
  let sentinelOracle: Contract;
  let uniswapOracle: Contract;
  let curveOracle: Contract | undefined;
  let aerodromeOracle: Contract | undefined;
  let resilientOracle: Contract;
  // underlying address (lowercased) → vToken address — built by walking IL Comptroller markets.
  let vTokenByUnderlying: Map<string, string>;

  // ACM.isAllowedToCall(account, sig) checks msg.sender as the host contract.
  // Impersonate each host so the role lookup resolves correctly.
  let impersonatedDeviationSentinel: SignerWithAddress;
  let impersonatedSentinelOracle: SignerWithAddress;
  let impersonatedUniswapOracle: SignerWithAddress;
  let impersonatedCurveOracle: SignerWithAddress | undefined;
  let impersonatedAerodromeOracle: SignerWithAddress | undefined;
  let impersonatedComptroller: SignerWithAddress;

  const govAccounts = governanceAccounts(cfg);
  const trustedKeeperAccounts = [cfg.keeper, ...govAccounts];

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, cfg.acm);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, cfg.deviationSentinel);
    eBrake = await ethers.getContractAt(EBRAKE_ABI, cfg.eBrake);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, cfg.sentinelOracle);
    uniswapOracle = await ethers.getContractAt(UNISWAP_ORACLE_ABI, cfg.uniswapOracle);
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, getForkedNetworkAddress("RESILIENT_ORACLE"));

    impersonatedDeviationSentinel = await initMainnetUser(cfg.deviationSentinel, ethers.utils.parseEther("1"));
    impersonatedSentinelOracle = await initMainnetUser(cfg.sentinelOracle, ethers.utils.parseEther("1"));
    impersonatedUniswapOracle = await initMainnetUser(cfg.uniswapOracle, ethers.utils.parseEther("1"));
    impersonatedComptroller = await initMainnetUser(cfg.comptroller, ethers.utils.parseEther("1"));

    if (cfg.curveOracle) {
      curveOracle = await ethers.getContractAt(CURVE_ORACLE_ABI, cfg.curveOracle);
      impersonatedCurveOracle = await initMainnetUser(cfg.curveOracle, ethers.utils.parseEther("1"));
    }
    if (cfg.aerodromeOracle) {
      aerodromeOracle = await ethers.getContractAt(AERODROME_ORACLE_ABI, cfg.aerodromeOracle);
      impersonatedAerodromeOracle = await initMainnetUser(cfg.aerodromeOracle, ethers.utils.parseEther("1"));
    }

    await bumpAdapterStaleness(cfg);
    vTokenByUnderlying = await buildVTokenIndex(cfg.comptroller);
  });

  // -------------------- Monitored-market config validity --------------------
  describe(`VIP-616 [${cfg.name}] — Monitored markets config validity`, () => {
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

    // ResilientOracle is the reference price source for handleDeviation. If it has
    // no feed for a monitored token, oraclePrice = 0 makes hasDeviation always true
    // and every keeper call would pause the market.
    it("ResilientOracle returns a non-zero price for every monitored token", async () => {
      for (const market of cfg.monitoredMarkets) {
        const price = await resilientOracle.getPrice(market.token);
        expect(price, `${market.symbol}: ResilientOracle.getPrice returned 0`).to.be.gt(0);
      }
    });
  });

  // -------------------- Pre-VIP behaviour --------------------
  describe(`VIP-616 [${cfg.name}] — Pre-VIP behaviour`, () => {
    it("DeviationSentinel pendingOwner is Normal Timelock", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("SentinelOracle pendingOwner is Normal Timelock", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("UniswapOracle pendingOwner is Normal Timelock", async () => {
      expect(await uniswapOracle.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    it("EBrake pendingOwner is Normal Timelock", async () => {
      expect(await eBrake.pendingOwner()).to.equal(cfg.normalTimelock);
    });

    if (cfg.curveOracle) {
      it("CurveOracle pendingOwner is Normal Timelock", async () => {
        expect(await curveOracle!.pendingOwner()).to.equal(cfg.normalTimelock);
      });
    }

    if (cfg.aerodromeOracle) {
      it("AerodromeSlipstreamOracle pendingOwner is Normal Timelock", async () => {
        expect(await aerodromeOracle!.pendingOwner()).to.equal(cfg.normalTimelock);
      });
    }

    it("EBrake immutables are correctly set for IL", async () => {
      expect(await eBrake.COMPTROLLER()).to.equal(cfg.comptroller);
      expect(await eBrake.IS_ISOLATED_POOL()).to.equal(true);
    });

    it("DeviationSentinel immutables wire to local EBrake + SentinelOracle", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(cfg.eBrake);
      expect(await deviationSentinel.SENTINEL_ORACLE()).to.equal(cfg.sentinelOracle);
    });

    it("Configurator does not yet hold DEFAULT_ADMIN_ROLE on ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, cfg.configurator)).to.equal(false);
    });

    it("Guardian + Timelocks have no admin permissions on DeviationSentinel yet", async () => {
      const a = acm.connect(impersonatedDeviationSentinel);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on SentinelOracle yet", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have no admin permissions on UniswapOracle yet", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of govAccounts) {
        for (const sig of UNISWAP_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    if (cfg.curveOracle) {
      it("Guardian + Timelocks have no admin permissions on CurveOracle yet", async () => {
        const a = acm.connect(impersonatedCurveOracle!);
        for (const account of govAccounts) {
          for (const sig of CURVE_ORACLE_ADMIN_PERMS) {
            expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
          }
        }
      });
    }

    if (cfg.aerodromeOracle) {
      it("Guardian + Timelocks have no admin permissions on AerodromeSlipstreamOracle yet", async () => {
        const a = acm.connect(impersonatedAerodromeOracle!);
        for (const account of govAccounts) {
          for (const sig of AERODROME_ORACLE_ADMIN_PERMS) {
            expect(await a.isAllowedToCall(account, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
          }
        }
      });
    }

    // Use hasPermission (specific role lookup), not isAllowedToCall — the IL Comptroller is
    // a live contract that may already hold wildcard grants on these sigs (Risk Steward,
    // Guardian, etc.), and isAllowedToCall would return true off the wildcard, masking the
    // genuine pre-VIP state of EBrake's specific perm.
    it("EBrake has no specific permissions on the IL Comptroller yet", async () => {
      for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
        expect(await acm.hasPermission(cfg.eBrake, cfg.comptroller, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Guardian + Timelocks have no reset permissions on EBrake yet", async () => {
      for (const account of govAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has no action permissions on EBrake yet", async () => {
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Multisig Pauser has no EBrake action permissions yet", async () => {
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await acm.hasPermission(cfg.multisigPauser, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig}`);
      }
    });

    it("Guardian + Timelocks have no EBrake-specific action permissions yet", async () => {
      for (const account of govAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(false, `unexpected ${sig} for ${account}`);
        }
      }
    });

    it("No accounts are whitelisted as trusted keepers yet", async () => {
      for (const account of trustedKeeperAccounts) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(false);
      }
    });

    for (const market of cfg.monitoredMarkets) {
      it(`${market.symbol} is not wired yet`, async () => {
        // Each oracle uses a different storage shape for its pool config:
        //   - UniswapOracle / AerodromeSlipstreamOracle: tokenPools(token) -> address
        //   - CurveOracle: poolConfigs(token) -> { pool, coinIndex, referenceToken, ... }
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

  // -------------------- Apply VIP --------------------
  testForkedNetworkVipCommands(`VIP-616 [${cfg.name}] Bootstrap, Permissions, Wiring`, proposal, {
    callbackAfterExecution: async txResponse => {
      // 4 acceptOwnership() calls, +1 each for CurveOracle / AerodromeSlipstreamOracle.
      await expectEvents(
        txResponse,
        [DEVIATION_SENTINEL_ABI],
        ["OwnershipTransferred"],
        [expectedAcceptOwnership(cfg)],
      );

      // 5 trusted keepers per chain: cfg.keeper + 4 governance accounts.
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [5]);

      // Total RoleGranted per chain — see expectedRoleGranted comment for the breakdown.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [expectedRoleGranted(cfg)]);

      // Configurator revokes its transient periphery perms and renounces DEFAULT_ADMIN_ROLE
      // at the end of execute() — see expectedRoleRevoked comment for the breakdown.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleRevoked"], [expectedRoleRevoked(cfg)]);

      // Pool wiring counts. UniswapOracle and AerodromeSlipstreamOracle emit the same
      // 2-arg `PoolConfigUpdated(address,address)` event (identical topic hash), so
      // the UniswapOracle ABI filter decodes both. CurveOracle's 4-arg variant has its
      // own topic and is asserted separately.
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

  // -------------------- Post-VIP behaviour --------------------
  describe(`VIP-616 [${cfg.name}] — Post-VIP behaviour`, () => {
    it("All bootstrap contracts have Normal Timelock as owner", async () => {
      expect(await deviationSentinel.owner()).to.equal(cfg.normalTimelock);
      expect(await sentinelOracle.owner()).to.equal(cfg.normalTimelock);
      expect(await uniswapOracle.owner()).to.equal(cfg.normalTimelock);
      expect(await eBrake.owner()).to.equal(cfg.normalTimelock);
      if (cfg.curveOracle) expect(await curveOracle!.owner()).to.equal(cfg.normalTimelock);
      if (cfg.aerodromeOracle) expect(await aerodromeOracle!.owner()).to.equal(cfg.normalTimelock);
    });

    it("All bootstrap contracts have AddressZero as pendingOwner (acceptOwnership cleared it)", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await sentinelOracle.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await uniswapOracle.pendingOwner()).to.equal(ZERO_ADDRESS);
      expect(await eBrake.pendingOwner()).to.equal(ZERO_ADDRESS);
      if (cfg.curveOracle) expect(await curveOracle!.pendingOwner()).to.equal(ZERO_ADDRESS);
      if (cfg.aerodromeOracle) expect(await aerodromeOracle!.pendingOwner()).to.equal(ZERO_ADDRESS);
    });

    // The configurator renounces DEFAULT_ADMIN_ROLE at the end of execute() via
    // _selfRevokeACMPermissions(). Leaving it in place would be a standing
    // ACM-mutation foothold.
    it("Configurator no longer holds DEFAULT_ADMIN_ROLE on ACM (renounced in execute())", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, cfg.configurator)).to.equal(
        false,
        "configurator still holds DEFAULT_ADMIN_ROLE",
      );
    });

    it("Guardian + Timelocks have all admin permissions on DeviationSentinel", async () => {
      const a = acm.connect(impersonatedDeviationSentinel);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have all admin permissions on SentinelOracle", async () => {
      const a = acm.connect(impersonatedSentinelOracle);
      for (const account of govAccounts) {
        for (const sig of SENTINEL_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Guardian + Timelocks have setPoolConfig permission on UniswapOracle", async () => {
      const a = acm.connect(impersonatedUniswapOracle);
      for (const account of govAccounts) {
        for (const sig of UNISWAP_ORACLE_ADMIN_PERMS) {
          expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    if (cfg.curveOracle) {
      it("Guardian + Timelocks have setPoolConfig permission on CurveOracle", async () => {
        const a = acm.connect(impersonatedCurveOracle!);
        for (const account of govAccounts) {
          for (const sig of CURVE_ORACLE_ADMIN_PERMS) {
            expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
          }
        }
      });
    }

    if (cfg.aerodromeOracle) {
      it("Guardian + Timelocks have setPoolConfig permission on AerodromeSlipstreamOracle", async () => {
        const a = acm.connect(impersonatedAerodromeOracle!);
        for (const account of govAccounts) {
          for (const sig of AERODROME_ORACLE_ADMIN_PERMS) {
            expect(await a.isAllowedToCall(account, sig)).to.equal(true, `missing ${sig} for ${account}`);
          }
        }
      });
    }

    it("EBrake has all four IL-supported permissions on the local IL Comptroller", async () => {
      const a = acm.connect(impersonatedComptroller);
      for (const sig of EBRAKE_COMPTROLLER_PERMS_IL) {
        expect(await a.isAllowedToCall(cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Guardian + Timelocks have all reset permissions on EBrake", async () => {
      for (const account of govAccounts) {
        for (const sig of RESET_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("DeviationSentinel has the three handleDeviation permissions on EBrake", async () => {
      for (const sig of SENTINEL_EBRAKE_PERMS) {
        expect(await acm.hasPermission(cfg.deviationSentinel, cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Multisig Pauser has all 8 IL-supported EBrake action permissions", async () => {
      for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
        expect(await acm.hasPermission(cfg.multisigPauser, cfg.eBrake, sig)).to.equal(true, `missing ${sig}`);
      }
    });

    it("Guardian + Timelocks have all 8 IL-supported EBrake action permissions", async () => {
      for (const account of govAccounts) {
        for (const sig of GOVERNANCE_EBRAKE_PERMS_IL) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(true, `missing ${sig} for ${account}`);
        }
      }
    });

    it("Diamond-only EBrake permissions are intentionally NOT granted", async () => {
      for (const account of govAccounts) {
        for (const sig of DIAMOND_ONLY_EBRAKE_PERMS) {
          expect(await acm.hasPermission(account, cfg.eBrake, sig)).to.equal(
            false,
            `Diamond-only ${sig} unexpectedly granted to ${account}`,
          );
        }
      }
    });

    it("Keeper + Guardian + Timelocks are whitelisted as trusted keepers on DeviationSentinel", async () => {
      for (const account of trustedKeeperAccounts) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(true);
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

      // End-to-end price-pipeline check: SentinelOracle → routed DEX oracle → pool.
      // If the pool isn't a real Uniswap V3 / V3-compatible contract, slot0 reverts
      // and handleDeviation would always revert (silent monitoring outage).
      it(`${market.symbol} SentinelOracle.getPrice returns a non-zero price`, async () => {
        const price = await sentinelOracle.getPrice(market.token);
        expect(price, `${market.symbol}: SentinelOracle.getPrice returned 0`).to.be.gt(0);
      });

      // Full handleDeviation pre-flight: same path the keeper exercises, minus the
      // EBrake side-effect. Skipped for fork-fragile tokens (see SKIP_CHECK_PRICE_DEVIATION).
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
