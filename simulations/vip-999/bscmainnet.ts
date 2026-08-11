import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  APRO_ASSETS,
  APRO_MAX_STALE_PERIOD,
  APRO_ORACLE,
  AS_BNB,
  AS_BNB_ATLAS_FEED,
  AS_BNB_BINANCE_ORACLE,
  AS_BNB_MAIN_ORACLE,
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  FIVE_PCT_LOWER_BOUND,
  FIVE_PCT_UPPER_BOUND,
  SLIS_BNB,
  SLIS_BNB_ATLAS_FEED,
  SLIS_BNB_MAIN_ORACLE,
  SOLV_BTC,
  SOLV_BTC_ER_MAX_STALE_PERIOD,
  SOLV_BTC_FALLBACK_ORACLE,
  SOLV_BTC_MAIN_ORACLE,
  SOLV_BTC_NEW_ER_FEED,
  SOLV_BTC_PIVOT_ORACLE,
  TWO_PCT_LOWER_BOUND,
  TWO_PCT_UPPER_BOUND,
  X_SOLV_BTC,
  X_SOLV_BTC_OLD_MAIN_ORACLE,
  X_SOLV_BTC_ONE_JUMP_ORACLE,
  X_SOLV_BTC_SVR_FEED,
  X_SOLV_BTC_SVR_MAX_STALE_PERIOD,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/accessControlManager.json";
import APRO_ACCESS_CONTROL_ABI from "./abi/aproAccessControl.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 115259425;
const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const ADDRESS_ZERO = ethers.constants.AddressZero;

const expectCloseTo = (actual: BigNumber, expected: BigNumber, toleranceBps: number) => {
  const diff = actual.sub(expected).abs();
  const tolerance = expected.mul(toleranceBps).div(10000);
  expect(diff.lte(tolerance), `expected ${actual} to be within ${toleranceBps} bps of ${expected}`).to.be.true;
};

// Every exchange-rate leg under SolvBTC/xSolvBTC goes stale over the simulated governance delay, and the
// two PIVOT legs carry internal staleness checks setMaxStalePeriodInChainlinkOracle can't reach. So read
// each leg's live rate and pin it with setDirectPrice, which getPrice returns without any staleness
// check. The two MAIN legs are the feeds this VIP configures, so they're read behind an evm_snapshot —
// the VIP itself still executes against untouched pre-VIP config.
const pinSolvBtcFamilyLegs = async () => {
  // Intermediate oracles behind the PIVOTs: SolvBTC/BTC Fundamental, and RedStone for xSolvBTC.
  const SOLVBTC_FUNDAMENTAL_ORACLE = "0x4521589226ef07d9805936de42F1ACF394B2B221";
  const chainlinkOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, bscmainnet.CHAINLINK_ORACLE);
  const legs: [Contract, string][] = [
    [chainlinkOracle, SOLV_BTC],
    [chainlinkOracle, X_SOLV_BTC],
    [await ethers.getContractAt(CHAINLINK_ORACLE_ABI, SOLVBTC_FUNDAMENTAL_ORACLE), SOLV_BTC],
    [await ethers.getContractAt(CHAINLINK_ORACLE_ABI, bscmainnet.REDSTONE_ORACLE), X_SOLV_BTC],
  ];

  const snapshotId = await ethers.provider.send("evm_snapshot", []);
  let timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  await chainlinkOracle.connect(timelock).setTokenConfigs([
    [SOLV_BTC, SOLV_BTC_NEW_ER_FEED, SOLV_BTC_ER_MAX_STALE_PERIOD],
    [X_SOLV_BTC, X_SOLV_BTC_SVR_FEED, X_SOLV_BTC_SVR_MAX_STALE_PERIOD],
  ]);
  const rates = await Promise.all(legs.map(([oracle, asset]) => oracle.getPrice(asset)));
  await ethers.provider.send("evm_revert", [snapshotId]);

  // Re-fund: the revert rolled back the impersonated timelock's balance along with everything else.
  timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  for (const [i, [oracle, asset]] of legs.entries()) {
    await oracle.connect(timelock).setDirectPrice(asset, rates[i]);
  }
};

forking(BLOCK_NUMBER, async () => {
  let resilientOracle: Contract;
  let aproOracle: Contract;
  let boundValidator: Contract;
  let sharedChainlinkOracle: Contract;
  let atlasOracle: Contract;
  const preVipPrice: Record<string, BigNumber> = {};

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    aproOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, APRO_ORACLE);
    boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, BOUND_VALIDATOR);
    sharedChainlinkOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, bscmainnet.CHAINLINK_ORACLE);
    atlasOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, ATLAS_ORACLE);
    for (const asset of [...APRO_ASSETS.map(a => a.asset), AS_BNB, SLIS_BNB, SOLV_BTC, X_SOLV_BTC]) {
      preVipPrice[asset] = await resilientOracle.getPrice(asset);
    }
    await pinSolvBtcFamilyLegs();
  });

  // =====================================================================================
  // PRE-VIP
  // =====================================================================================
  describe("Pre-VIP behavior", () => {
    describe("BStocks", () => {
      it("APRO oracle is not yet owned by the Normal Timelock (pendingOwner set)", async () => {
        expect((await aproOracle.owner()).toLowerCase()).to.not.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
        expect((await aproOracle.pendingOwner()).toLowerCase()).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
      });

      for (const { symbol, asset } of APRO_ASSETS) {
        it(`${symbol}: ResilientOracle has Atlas as MAIN with no PIVOT/FALLBACK`, async () => {
          const config = await resilientOracle.getTokenConfig(asset);
          expect(config.oracles[0].toLowerCase()).to.equal(ATLAS_ORACLE.toLowerCase());
          expect(config.oracles[1]).to.equal(ADDRESS_ZERO);
          expect(config.oracles[2]).to.equal(ADDRESS_ZERO);
          expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
        });

        it(`${symbol}: APRO oracle feed is not configured`, async () => {
          expect((await aproOracle.tokenConfigs(asset)).feed).to.equal(ADDRESS_ZERO);
        });

        it(`${symbol}: BoundValidator has no anchor config`, async () => {
          expect((await boundValidator.validateConfigs(asset)).asset).to.equal(ADDRESS_ZERO);
        });
      }

      for (const { symbol, accessController } of APRO_ASSETS) {
        it(`${symbol}: APRO has whitelisted the APRO oracle on the feed's access controller`, async () => {
          const controller = new ethers.Contract(accessController, APRO_ACCESS_CONTROL_ABI, ethers.provider);
          expect(await controller.hasAccess(APRO_ORACLE, "0x")).to.equal(true);
        });
      }
    });

    describe("asBNB/slisBNB/SolvBTC/xSolvBTC", () => {
      it("asBNB: PIVOT is Binance, MAIN unchanged", async () => {
        const config = await resilientOracle.getTokenConfig(AS_BNB);
        expect(config.oracles[0].toLowerCase()).to.equal(AS_BNB_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(AS_BNB_BINANCE_ORACLE.toLowerCase());
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
      });

      it("slisBNB: no PIVOT/FALLBACK, no BoundValidator config", async () => {
        const config = await resilientOracle.getTokenConfig(SLIS_BNB);
        expect(config.oracles[0].toLowerCase()).to.equal(SLIS_BNB_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1]).to.equal(ADDRESS_ZERO);
        expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
        expect((await boundValidator.validateConfigs(SLIS_BNB)).asset).to.equal(ADDRESS_ZERO);
      });

      it("SolvBTC: MAIN/PIVOT/FALLBACK all set, bound at ±5%", async () => {
        const config = await resilientOracle.getTokenConfig(SOLV_BTC);
        expect(config.oracles[0].toLowerCase()).to.equal(SOLV_BTC_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(SOLV_BTC_PIVOT_ORACLE.toLowerCase());
        expect(config.oracles[2].toLowerCase()).to.equal(SOLV_BTC_FALLBACK_ORACLE.toLowerCase());
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, true]);
        const bound = await boundValidator.validateConfigs(SOLV_BTC);
        expect(bound.upperBoundRatio).to.equal(FIVE_PCT_UPPER_BOUND);
        expect(bound.lowerBoundRatio).to.equal(FIVE_PCT_LOWER_BOUND);
      });

      it("xSolvBTC: MAIN is the old wrapper, no PIVOT/FALLBACK, no BoundValidator config", async () => {
        const config = await resilientOracle.getTokenConfig(X_SOLV_BTC);
        expect(config.oracles[0].toLowerCase()).to.equal(X_SOLV_BTC_OLD_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1]).to.equal(ADDRESS_ZERO);
        expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
        expect((await boundValidator.validateConfigs(X_SOLV_BTC)).asset).to.equal(ADDRESS_ZERO);
      });

      it("xSolvBTC: the new OneJumpOracle's SVR feed is not configured yet", async () => {
        expect((await sharedChainlinkOracle.tokenConfigs(X_SOLV_BTC)).feed).to.equal(ADDRESS_ZERO);
      });
    });
  });

  // =====================================================================================
  // EXECUTION
  // =====================================================================================
  testVip("VIP-999 BNB Chain oracle updates", await vip999(), {
    callbackAfterExecution: async txResponse => {
      // APRO (4) + Atlas (2: asBNB, slisBNB) + shared ChainlinkOracle (2: SolvBTC, xSolvBTC) feed configs.
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [8]);
      // ResilientOracle configs for all 8 markets.
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [8]);
      // BoundValidator bands: 4 B-stocks + slisBNB + SolvBTC + xSolvBTC.
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [7]);
    },
  });

  // =====================================================================================
  // POST-VIP — config
  // =====================================================================================
  describe("Post-VIP config", () => {
    describe("BStocks", () => {
      it("APRO oracle ownership accepted by the Normal Timelock", async () => {
        expect((await aproOracle.owner()).toLowerCase()).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
      });

      it("Normal Timelock granted setTokenConfig + setDirectPrice on the APRO oracle", async () => {
        const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        for (const signature of ["setTokenConfig(TokenConfig)", "setDirectPrice(address,uint256)"]) {
          expect(await acm.isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, signature, { from: APRO_ORACLE })).to.equal(
            true,
            signature,
          );
        }
      });

      it("Guardian granted setDirectPrice on the APRO oracle", async () => {
        const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        expect(
          await acm.isAllowedToCall(bscmainnet.GUARDIAN, "setDirectPrice(address,uint256)", { from: APRO_ORACLE }),
        ).to.equal(true);
      });

      for (const { symbol, asset, feed } of APRO_ASSETS) {
        it(`${symbol}: APRO feed configured with the expected feed + max stale period`, async () => {
          const cfg = await aproOracle.tokenConfigs(asset);
          expect(cfg.feed.toLowerCase()).to.equal(feed.toLowerCase());
          expect(cfg.maxStalePeriod).to.equal(APRO_MAX_STALE_PERIOD);
        });

        it(`${symbol}: ResilientOracle has Atlas MAIN + APRO PIVOT (no FALLBACK)`, async () => {
          const config = await resilientOracle.getTokenConfig(asset);
          expect(config.oracles[0].toLowerCase()).to.equal(ATLAS_ORACLE.toLowerCase());
          expect(config.oracles[1].toLowerCase()).to.equal(APRO_ORACLE.toLowerCase());
          expect(config.oracles[2]).to.equal(ADDRESS_ZERO);
          expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        });

        it(`${symbol}: BoundValidator anchor band set to ±5%`, async () => {
          const c = await boundValidator.validateConfigs(asset);
          expect(c.upperBoundRatio).to.equal(FIVE_PCT_UPPER_BOUND);
          expect(c.lowerBoundRatio).to.equal(FIVE_PCT_LOWER_BOUND);
        });
      }
    });

    describe("asBNB/slisBNB/SolvBTC/xSolvBTC", () => {
      it("asBNB: PIVOT switched to Atlas, MAIN unchanged", async () => {
        const config = await resilientOracle.getTokenConfig(AS_BNB);
        expect(config.oracles[0].toLowerCase()).to.equal(AS_BNB_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(ATLAS_ORACLE.toLowerCase());
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        const cfg = await atlasOracle.tokenConfigs(AS_BNB);
        expect(cfg.feed.toLowerCase()).to.equal(AS_BNB_ATLAS_FEED.toLowerCase());
      });

      it("slisBNB: PIVOT set to Atlas, MAIN unchanged, bound set to ±5%", async () => {
        const config = await resilientOracle.getTokenConfig(SLIS_BNB);
        expect(config.oracles[0].toLowerCase()).to.equal(SLIS_BNB_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(ATLAS_ORACLE.toLowerCase());
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        const cfg = await atlasOracle.tokenConfigs(SLIS_BNB);
        expect(cfg.feed.toLowerCase()).to.equal(SLIS_BNB_ATLAS_FEED.toLowerCase());
        const bound = await boundValidator.validateConfigs(SLIS_BNB);
        expect(bound.upperBoundRatio).to.equal(FIVE_PCT_UPPER_BOUND);
        expect(bound.lowerBoundRatio).to.equal(FIVE_PCT_LOWER_BOUND);
      });

      it("SolvBTC: MAIN feed switched to Exchange Rate, FALLBACK dropped, bound tightened to ±2%", async () => {
        const cfg = await sharedChainlinkOracle.tokenConfigs(SOLV_BTC);
        expect(cfg.feed.toLowerCase()).to.equal("0xC2453C637BbBC53Ca6aBd1F139D1352CCeb55eB1".toLowerCase());
        const config = await resilientOracle.getTokenConfig(SOLV_BTC);
        expect(config.oracles[0].toLowerCase()).to.equal(SOLV_BTC_MAIN_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(SOLV_BTC_PIVOT_ORACLE.toLowerCase());
        expect(config.oracles[2]).to.equal(ADDRESS_ZERO);
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        const bound = await boundValidator.validateConfigs(SOLV_BTC);
        expect(bound.upperBoundRatio).to.equal(TWO_PCT_UPPER_BOUND);
        expect(bound.lowerBoundRatio).to.equal(TWO_PCT_LOWER_BOUND);
      });

      it("xSolvBTC: new OneJumpOracle promoted to MAIN, old MAIN demoted to PIVOT, bound set to ±2%", async () => {
        const config = await resilientOracle.getTokenConfig(X_SOLV_BTC);
        expect(config.oracles[0].toLowerCase()).to.equal(X_SOLV_BTC_ONE_JUMP_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(X_SOLV_BTC_OLD_MAIN_ORACLE.toLowerCase());
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
        const bound = await boundValidator.validateConfigs(X_SOLV_BTC);
        expect(bound.upperBoundRatio).to.equal(TWO_PCT_UPPER_BOUND);
        expect(bound.lowerBoundRatio).to.equal(TWO_PCT_LOWER_BOUND);
      });
    });

    describe("price check against pre-VIP price", () => {
      describe("Post-VIP behavior: BStocks pivot gates pricing", () => {
        before(async () => {
          for (const { asset } of APRO_ASSETS) {
            for (const oracleAddr of [ATLAS_ORACLE, APRO_ORACLE]) {
              await setMaxStalePeriodInChainlinkOracle(
                oracleAddr,
                asset,
                ADDRESS_ZERO,
                bscmainnet.NORMAL_TIMELOCK,
                STALE_PERIOD_OVERRIDE,
              );
            }
          }
        });

        for (const { symbol, asset } of APRO_ASSETS) {
          it(`${symbol}: getPrice resolves through the pivot and returns the unchanged MAIN price`, async () => {
            expect(await resilientOracle.getPrice(asset)).to.equal(preVipPrice[asset]);
          });

          // Atlas (18 dec) and APRO (8 dec) feed independently; both normalise through the adapter's
          // own decimals(), so a mismatched normalisation would show up as an outsized spread here.
          it(`${symbol}: Atlas (MAIN) and APRO (PIVOT) price within 2% of each other`, async () => {
            expectCloseTo(await aproOracle.getPrice(asset), await atlasOracle.getPrice(asset), 200);
          });
        }

        for (const { symbol, asset } of APRO_ASSETS) {
          it(`${symbol}: a pivot outside the ±5% band blocks pricing`, async () => {
            const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
            const main = preVipPrice[asset];
            // Inside the band (-3%) -> still prices.
            await aproOracle.connect(timelock).setDirectPrice(asset, main.mul(97).div(100));
            expect(await resilientOracle.getPrice(asset)).to.equal(main);
            // Below the band (-6%) -> no FALLBACK, so getPrice reverts.
            await aproOracle.connect(timelock).setDirectPrice(asset, main.mul(94).div(100));
            await expect(resilientOracle.getPrice(asset)).to.be.revertedWith("invalid resilient oracle price");
            // Above the band (+6%) -> reverts too.
            await aproOracle.connect(timelock).setDirectPrice(asset, main.mul(106).div(100));
            await expect(resilientOracle.getPrice(asset)).to.be.revertedWith("invalid resilient oracle price");
            // Clearing the direct price restores the live feed.
            await aproOracle.connect(timelock).setDirectPrice(asset, 0);
            expect(await resilientOracle.getPrice(asset)).to.equal(main);
          });
        }
      });

      describe("Atlas (asBNB/slisBNB)", () => {
        before(async () => {
          const NATIVE_TOKEN = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
          // slisBNB's MAIN (and, through it, asBNB's MAIN) needs BNB/USD from the shared ResilientOracle.
          // BNB's own PIVOT is backed by the same external RedStone feed noted in the SolvBTC family
          // block below — its staleness can't be overridden — so BNB's MAIN + FALLBACK are bumped to
          // let the MAIN-vs-FALLBACK comparison carry it once the PIVOT read is caught and ignored.
          for (const [oracleAddr, asset] of [
            [bscmainnet.CHAINLINK_ORACLE, NATIVE_TOKEN],
            [bscmainnet.REDSTONE_ORACLE, NATIVE_TOKEN],
            [ATLAS_ORACLE, NATIVE_TOKEN],
          ]) {
            await setMaxStalePeriodInChainlinkOracle(
              oracleAddr,
              asset,
              ADDRESS_ZERO,
              bscmainnet.NORMAL_TIMELOCK,
              STALE_PERIOD_OVERRIDE,
            );
          }
          for (const asset of [AS_BNB, SLIS_BNB]) {
            await setMaxStalePeriodInChainlinkOracle(
              ATLAS_ORACLE,
              asset,
              ADDRESS_ZERO,
              bscmainnet.NORMAL_TIMELOCK,
              STALE_PERIOD_OVERRIDE,
            );
          }
        });

        // asBNB/slisBNB's MAIN is a live correlated-token computation (Lista exchange rate x BNB/USD),
        // not a frozen Chainlink round — it drifts by a few bps over the simulated governance delay from
        // ordinary staking-yield accrual, so an exact match isn't the right bar; within 10 bps is.
        it("slisBNB: getPrice stays within 10 bps of the unchanged MAIN price with Atlas as PIVOT", async () => {
          expectCloseTo(await resilientOracle.getPrice(SLIS_BNB), preVipPrice[SLIS_BNB], 10);
        });

        it("asBNB: getPrice stays within 10 bps of the unchanged MAIN price with Atlas as PIVOT", async () => {
          expectCloseTo(await resilientOracle.getPrice(AS_BNB), preVipPrice[AS_BNB], 10);
        });
      });

      // Prices resolve for real here — every exchange-rate leg was pinned pre-warp by
      // pinSolvBtcFamilyLegs() to the rate it had under this VIP's own config, and a
      // direct price is returned without any staleness check. Both MAINs change (SolvBTC: market-price
      // feed -> Exchange Rate feed; xSolvBTC: RedStone-fundamental wrapper -> SVR OneJumpOracle), so an
      // exact match against the pre-VIP price isn't the right bar — 2% is.
      describe("SolvBTC family", () => {
        before(async () => {
          const BTC_B = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
          // BTCB is the UNDERLYING_TOKEN of every wrapper in this family, priced through the shared
          // ResilientOracle — its own three legs still need bumping.
          for (const oracleAddr of [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, ATLAS_ORACLE]) {
            await setMaxStalePeriodInChainlinkOracle(
              oracleAddr,
              BTC_B,
              ADDRESS_ZERO,
              bscmainnet.NORMAL_TIMELOCK,
              STALE_PERIOD_OVERRIDE,
            );
          }
        });

        it("SolvBTC: getPrice resolves through the full stack, within 2% of the pre-VIP price", async () => {
          expectCloseTo(await resilientOracle.getPrice(SOLV_BTC), preVipPrice[SOLV_BTC], 200);
        });

        it("xSolvBTC: getPrice resolves through the full stack, within 2% of the pre-VIP price", async () => {
          expectCloseTo(await resilientOracle.getPrice(X_SOLV_BTC), preVipPrice[X_SOLV_BTC], 200);
        });
      });
    });
  });
});
