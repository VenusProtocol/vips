import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip999, {
  AUXILIARY_AGGREGATOR,
  NEW_AGGREGATOR,
  NEW_AGGREGATOR_BATCHERS,
  NEW_AGGREGATOR_TIMELOCK_SIGS,
  REMOTE_BATCH_INDEX,
  RemoteChainKey,
} from "../../../vips/vip-999/bscmainnet";
import { buildSeedBatch } from "../../../vips/vip-999/scripts/seed-aggregators";
import { encodeSeedCommands } from "../../../vips/vip-999/utils/auxiliary-aggregator";
import { AssetMigration } from "../../../vips/vip-999/utils/data";
import BOUND_VALIDATOR_ABI from "../abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "../abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";

const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const PRICE_TOLERANCE_BPS = 500; // 5%
const ERC20_ABI = ["function decimals() view returns (uint8)"];

const BOUND_VALIDATOR_PERM_SIG = "setValidateConfig(ValidateConfig)";
const ORACLE_TOKEN_CONFIG_PERM_SIG = "setTokenConfig(TokenConfig)";

const ACM_ABI = [
  "function hasPermission(address account, address contractAddress, string functionSig) view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
];
const AGGREGATOR_ABI = [
  "function batchCount() view returns (uint256)",
  "function getBatch(uint256 index) view returns ((address target, bytes data)[])",
  "function authorizedBatchers(address account) view returns (bool)",
  "function owner() view returns (address)",
];

export const runRemoteOracleSuite = (opts: {
  blockNumber: number;
  networkKey: RemoteChainKey;
  boundValidator: string;
  migrations: AssetMigration[];
  assertPrices: boolean;
}) => {
  const networkAddresses = NETWORK_ADDRESSES[opts.networkKey];
  const aggregatorAddress = AUXILIARY_AGGREGATOR[opts.networkKey];
  const newAggregator = NEW_AGGREGATOR[opts.networkKey];
  const batchers = NEW_AGGREGATOR_BATCHERS;
  const seededBatch = buildSeedBatch(opts.networkKey);
  const batchIndex = REMOTE_BATCH_INDEX;

  forking(opts.blockNumber, async () => {
    let resilientOracle: Contract;
    let redstoneOracle: Contract;
    let boundValidator: Contract;
    const preVipPrice: Record<string, BigNumber> = {};

    before(async () => {
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, networkAddresses.RESILIENT_ORACLE);
      redstoneOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, networkAddresses.REDSTONE_ORACLE);
      boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, opts.boundValidator);
      if (opts.assertPrices) {
        for (const migration of opts.migrations) {
          preVipPrice[migration.asset] = await resilientOracle.getPrice(migration.asset);
        }
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
    testForkedNetworkVipCommands("vip999", await vip999());

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

    (opts.assertPrices ? describe : describe.skip)("Post-VIP prices", () => {
      before(async () => {
        const timelock = await initMainnetUser(networkAddresses.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const redstone = new ethers.Contract(networkAddresses.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
        for (const migration of opts.migrations) {
          await setMaxStalePeriodInChainlinkOracle(
            networkAddresses.CHAINLINK_ORACLE,
            migration.asset,
            ethers.constants.AddressZero,
            networkAddresses.NORMAL_TIMELOCK,
            STALE_PERIOD_OVERRIDE,
          );
          const token = new ethers.Contract(migration.asset, ERC20_ABI, ethers.provider);
          const decimals: number = await token.decimals();
          const directPrice = preVipPrice[migration.asset].div(BigNumber.from(10).pow(18 - decimals));
          await redstone.setDirectPrice(migration.asset, directPrice);
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
