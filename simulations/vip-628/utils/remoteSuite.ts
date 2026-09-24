import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip628, {
  AUXILIARY_AGGREGATOR,
  NEW_AGGREGATOR,
  NEW_AGGREGATOR_TIMELOCK_SIGS,
  REMOTE_BATCH_INDEX,
  RemoteChainKey,
  newAggregatorBatchers,
} from "../../../vips/vip-628/bscmainnet";
import { buildSeedBatch } from "../../../vips/vip-628/scripts/seed-aggregators";
import { encodeSeedCommands } from "../../../vips/vip-628/utils/auxiliary-aggregator";
import { AssetMigration } from "../../../vips/vip-628/utils/data";
import AGGREGATOR_ABI from "../abi/AuxiliaryCommandsAggregator.json";
import ACM_ABI from "../abi/accessControlManager.json";
import BOUND_VALIDATOR_ABI from "../abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "../abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";

const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const PRICE_TOLERANCE_BPS = 500; // 5%

const BOUND_VALIDATOR_PERM_SIG = "setValidateConfig(ValidateConfig)";
const ORACLE_TOKEN_CONFIG_PERM_SIG = "setTokenConfig(TokenConfig)";

export const runRemoteOracleSuite = (opts: {
  blockNumber: number;
  networkKey: RemoteChainKey;
  boundValidator: string;
  migrations: AssetMigration[];
}) => {
  const networkAddresses = NETWORK_ADDRESSES[opts.networkKey];
  const aggregatorAddress = AUXILIARY_AGGREGATOR[opts.networkKey];
  const newAggregator = NEW_AGGREGATOR[opts.networkKey];
  const batchers = newAggregatorBatchers(opts.networkKey);
  const seededBatch = buildSeedBatch(opts.networkKey);
  const batchIndex = REMOTE_BATCH_INDEX[opts.networkKey];

  forking(opts.blockNumber, async () => {
    let resilientOracle: Contract;
    let redstoneOracle: Contract;
    let boundValidator: Contract;
    const preVipPrice: Record<string, BigNumber> = {};
    const redstoneFeedPrice: Record<string, BigNumber> = {};

    before(async () => {
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, networkAddresses.RESILIENT_ORACLE);
      redstoneOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, networkAddresses.REDSTONE_ORACLE);
      boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, opts.boundValidator);
      const feedAbi = [
        "function latestRoundData() external view returns (uint80, int256 answer, uint256, uint256, uint80)",
        "function decimals() external view returns (uint8)",
      ];
      for (const migration of opts.migrations) {
        await setMaxStalePeriodInChainlinkOracle(
          networkAddresses.CHAINLINK_ORACLE,
          migration.asset,
          ethers.constants.AddressZero,
          networkAddresses.NORMAL_TIMELOCK,
          STALE_PERIOD_OVERRIDE,
        );
        preVipPrice[migration.asset] = await resilientOracle.getPrice(migration.asset);
        const feed = new ethers.Contract(migration.redstoneFeed!.feed, feedAbi, ethers.provider);
        const [, answer] = await feed.latestRoundData();
        const feedDecimals: number = await feed.decimals();
        redstoneFeedPrice[migration.asset] = BigNumber.from(answer).mul(BigNumber.from(10).pow(18 - feedDecimals));
      }
    });

    // =====================================================================================
    // PRE-VIP — MAIN-only layout, empty PIVOT, no RedStone feed, no bound config
    // =====================================================================================
    describe("Pre-VIP behavior", () => {
      for (const migration of opts.migrations) {
        it(`${migration.symbol}: MAIN-only, PIVOT empty, no RedStone feed, no bound config`, async () => {
          const config = await resilientOracle.getTokenConfig(migration.asset);
          expect(config.oracles.map((oracle: string) => oracle.toLowerCase())).to.deep.equal(
            migration.oldOracles.map(oracle => oracle.toLowerCase()),
          );
          expect(config.enableFlagsForOracles).to.deep.equal(migration.oldFlags);
          expect((await redstoneOracle.tokenConfigs(migration.asset)).feed).to.equal(ethers.constants.AddressZero);
          expect((await boundValidator.validateConfigs(migration.asset)).upperBoundRatio).to.equal(0);
        });
      }

      it("seeded batch matches the expected commands exactly", async () => {
        const aggregator = new ethers.Contract(aggregatorAddress, AGGREGATOR_ABI, ethers.provider);
        const onchain = await aggregator.getBatch(batchIndex);
        const expected = encodeSeedCommands(seededBatch);
        expect(onchain.length).to.equal(expected.length);
        for (let i = 0; i < expected.length; i++) {
          expect(onchain[i].target.toLowerCase()).to.equal(
            expected[i].target.toLowerCase(),
            `batch call ${i} target mismatch`,
          );
          expect(onchain[i].data.toLowerCase()).to.equal(
            expected[i].data.toLowerCase(),
            `batch call ${i} data mismatch`,
          );
        }
      });

      it("aggregator holds no admin role pre-VIP", async () => {
        const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        expect(await acm.hasRole(ethers.constants.HashZero, aggregatorAddress)).to.equal(false);
      });
    });

    // =====================================================================================
    // EXECUTION
    // =====================================================================================
    testForkedNetworkVipCommands("vip628", await vip628());

    // =====================================================================================
    // POST-VIP — assert the new on-chain layout (config)
    // =====================================================================================
    describe("Post-VIP config", () => {
      for (const migration of opts.migrations) {
        it(`${migration.symbol}: RedStone enabled as PIVOT with feed + bound config`, async () => {
          const config = await resilientOracle.getTokenConfig(migration.asset);
          expect(config.oracles.map((oracle: string) => oracle.toLowerCase())).to.deep.equal(
            migration.newOracles.map(oracle => oracle.toLowerCase()),
          );
          expect(config.enableFlagsForOracles).to.deep.equal(migration.newFlags);

          const redstoneConfig = await redstoneOracle.tokenConfigs(migration.asset);
          expect(redstoneConfig.feed.toLowerCase()).to.equal(migration.redstoneFeed!.feed.toLowerCase());
          expect(redstoneConfig.maxStalePeriod).to.equal(migration.redstoneFeed!.maxStalePeriod);

          const onChainBound = await boundValidator.validateConfigs(migration.asset);
          expect(onChainBound.upperBoundRatio).to.equal(migration.boundConfig!.upperBoundRatio);
          expect(onChainBound.lowerBoundRatio).to.equal(migration.boundConfig!.lowerBoundRatio);
        });
      }
    });

    describe("Post-VIP aggregator state", () => {
      it("aggregator admin role and transient oracle permissions are revoked", async () => {
        const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        expect(await acm.hasRole(ethers.constants.HashZero, aggregatorAddress)).to.equal(false);
        expect(await acm.hasPermission(aggregatorAddress, opts.boundValidator, BOUND_VALIDATOR_PERM_SIG)).to.equal(
          false,
        );
        expect(
          await acm.hasPermission(aggregatorAddress, networkAddresses.REDSTONE_ORACLE, ORACLE_TOKEN_CONFIG_PERM_SIG),
        ).to.equal(false);
        expect(
          await acm.hasPermission(aggregatorAddress, networkAddresses.RESILIENT_ORACLE, ORACLE_TOKEN_CONFIG_PERM_SIG),
        ).to.equal(false);
      });
    });

    describe("Post-VIP new aggregator wiring", () => {
      const timelocks = [
        networkAddresses.NORMAL_TIMELOCK,
        networkAddresses.FAST_TRACK_TIMELOCK,
        networkAddresses.CRITICAL_TIMELOCK,
      ];

      it("ownership accepted by the Normal Timelock", async () => {
        const aggregator = new ethers.Contract(newAggregator, AGGREGATOR_ABI, ethers.provider);
        expect((await aggregator.owner()).toLowerCase()).to.equal(networkAddresses.NORMAL_TIMELOCK.toLowerCase());
      });

      it("executeBatch / add / removeAuthorizedBatchers granted to all three timelocks", async () => {
        const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        for (const signature of NEW_AGGREGATOR_TIMELOCK_SIGS) {
          for (const timelock of timelocks) {
            expect(await acm.hasPermission(timelock, newAggregator, signature)).to.equal(
              true,
              `${signature} ${timelock}`,
            );
          }
        }
      });

      it("batcher allowlist seeded", async () => {
        const aggregator = new ethers.Contract(newAggregator, AGGREGATOR_ABI, ethers.provider);
        for (const batcher of batchers) {
          expect(await aggregator.authorizedBatchers(batcher)).to.equal(true);
        }
      });
    });

    describe("Post-VIP new aggregator is operational (e2e)", () => {
      // Replays the same grantRole -> executeBatch -> revokeRole flow the VIP uses on the old aggregator,
      // proving the freshly wired new aggregator is a working
      const PROBE_TARGET = ethers.utils.getAddress("0x000000000000000000000000000000000000dead");
      const PROBE_ACCOUNT = ethers.utils.getAddress("0x00000000000000000000000000000000deadbeef");
      const PROBE_SIG = "e2eProbe(uint256)";

      it("authorized batcher seeds a batch and a timelock executes it", async () => {
        const acmRead = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
        expect(await acmRead.hasPermission(PROBE_ACCOUNT, PROBE_TARGET, PROBE_SIG)).to.equal(false);

        // 1. An authorized batcher appends a probe batch (giveCallPermission, runs as the new aggregator).
        const batcher = await initMainnetUser(batchers[0], ethers.utils.parseEther("1"));
        const aggAsBatcher = new ethers.Contract(newAggregator, AGGREGATOR_ABI, batcher);
        const probeData = new ethers.utils.Interface(ACM_ABI).encodeFunctionData("giveCallPermission", [
          PROBE_TARGET,
          PROBE_SIG,
          PROBE_ACCOUNT,
        ]);
        const newIndex = (await aggAsBatcher.batchCount()).toNumber();
        await aggAsBatcher["addBatch((address,bytes)[])"]([
          { target: networkAddresses.ACCESS_CONTROL_MANAGER, data: probeData },
        ]);

        // 2. The Normal Timelock grants admin, executes the batch, then revokes — exactly as the VIP does.
        const timelock = await initMainnetUser(networkAddresses.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const acm = new ethers.Contract(networkAddresses.ACCESS_CONTROL_MANAGER, ACM_ABI, timelock);
        const aggAsTimelock = new ethers.Contract(newAggregator, AGGREGATOR_ABI, timelock);
        await acm.grantRole(ethers.constants.HashZero, newAggregator);
        await aggAsTimelock.executeBatch(newIndex);
        await acm.revokeRole(ethers.constants.HashZero, newAggregator);

        // 3. The probe permission landed and the new aggregator no longer holds admin.
        expect(await acmRead.hasPermission(PROBE_ACCOUNT, PROBE_TARGET, PROBE_SIG)).to.equal(true);
        expect(await acmRead.hasRole(ethers.constants.HashZero, newAggregator)).to.equal(false);
      });
    });

    describe("Post-VIP prices", () => {
      before(async () => {
        const timelock = await initMainnetUser(networkAddresses.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const redstone = new ethers.Contract(networkAddresses.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
        for (const migration of opts.migrations) {
          try {
            await resilientOracle.getPrice(migration.asset);
          } catch {
            // Set direct price to bypass the staleness check on the forked block
            await redstone.setDirectPrice(migration.asset, redstoneFeedPrice[migration.asset]);
          }
        }
      });

      for (const migration of opts.migrations) {
        it(`${migration.symbol}: price still resolves (pivot anchor passes) and stays within tolerance`, async () => {
          const price = await resilientOracle.getPrice(migration.asset);
          expect(price).to.be.gt(0);
          const before = preVipPrice[migration.asset];
          expect(price.sub(before).abs().mul(10000)).to.be.lte(before.mul(PRICE_TOLERANCE_BPS));
        });
      }
    });
  });
};
