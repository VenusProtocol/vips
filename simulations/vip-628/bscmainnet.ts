import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip628, {
  NEW_AGGREGATOR,
  NEW_AGGREGATOR_TIMELOCK_SIGS,
  newAggregatorBatchers,
} from "../../vips/vip-628/bscmainnet";
import { ATLAS_ORACLE, BSC_MIGRATIONS } from "../../vips/vip-628/utils/data";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import ACM_ABI from "./abi/accessControlManager.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const NEW_AGGREGATOR_BSC = NEW_AGGREGATOR.bscmainnet;

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 101860000;
const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const PRICE_TOLERANCE_BPS = 500; // 5%

const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
const SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE = "0x4521589226ef07d9805936de42F1ACF394B2B221";

const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";

const atlasMigrations = BSC_MIGRATIONS.filter(migration => migration.atlasFeed);

forking(BLOCK_NUMBER, async () => {
  let resilientOracle: Contract;
  let atlasOracle: Contract;
  const preVipPrice: Record<string, BigNumber> = {};
  // THE/TWT pin a RedStone direct price post-warp; capture it from the RedStone oracle itself (not the
  // ResilientOracle, whose MAIN is Binance for TWT) so the pinned value is the actual RedStone price.
  const redstonePrice: Record<string, BigNumber> = {};
  // solvBTC's fundamental leaf returns a value on its own scale (not USD), captured fresh pre-warp.
  let solvBtcFundamentalPrice: BigNumber;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    atlasOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, ATLAS_ORACLE);
    for (const migration of BSC_MIGRATIONS) {
      preVipPrice[migration.asset] = await resilientOracle.getPrice(migration.asset);
    }
    const redstoneOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, bscmainnet.REDSTONE_ORACLE);
    redstonePrice[THE] = await redstoneOracle.getPrice(THE);
    redstonePrice[TWT] = await redstoneOracle.getPrice(TWT);
    const fundamentalOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE);
    solvBtcFundamentalPrice = await fundamentalOracle.getPrice(SOLVBTC);
  });

  // =====================================================================================
  // PRE-VIP — assert the live on-chain oracle layout before the proposal executes
  // =====================================================================================
  describe("Pre-VIP behavior", () => {
    for (const migration of BSC_MIGRATIONS) {
      it(`${migration.symbol}: ResilientOracle config matches the verified on-chain state`, async () => {
        const config = await resilientOracle.getTokenConfig(migration.asset);
        expect(config.oracles.map((oracle: string) => oracle.toLowerCase())).to.deep.equal(
          migration.oldOracles.map(oracle => oracle.toLowerCase()),
        );
        expect(config.enableFlagsForOracles).to.deep.equal(migration.oldFlags);
      });
    }

    it("Atlas feeds are not yet configured", async () => {
      for (const migration of atlasMigrations) {
        const config = await atlasOracle.tokenConfigs(migration.asset);
        expect(config.feed).to.equal(ethers.constants.AddressZero);
      }
    });
  });

  // =====================================================================================
  // EXECUTION — queue, vote, and execute the VIP; assert the emitted TokenConfigAdded events
  // =====================================================================================
  testVip("VIP-628 Oracle Migration (BNB Chain)", await vip628(), {
    callbackAfterExecution: async txResponse => {
      // One TokenConfigAdded per BNB Chain market on the ResilientOracle.
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [BSC_MIGRATIONS.length]);
      // One TokenConfigAdded per Atlas feed (Atlas is a Chainlink-style adapter; shares the event signature).
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [atlasMigrations.length]);
    },
  });

  // =====================================================================================
  // POST-VIP — assert the new on-chain layout (config)
  // =====================================================================================
  describe("Post-VIP config", () => {
    for (const migration of BSC_MIGRATIONS) {
      it(`${migration.symbol}: ResilientOracle config updated to the new layout`, async () => {
        const config = await resilientOracle.getTokenConfig(migration.asset);
        expect(config.oracles.map((oracle: string) => oracle.toLowerCase())).to.deep.equal(
          migration.newOracles.map(oracle => oracle.toLowerCase()),
        );
        expect(config.enableFlagsForOracles).to.deep.equal(migration.newFlags);
      });
    }

    it("Atlas feeds are configured with the expected feed + max stale period", async () => {
      for (const migration of atlasMigrations) {
        const config = await atlasOracle.tokenConfigs(migration.asset);
        expect(config.feed.toLowerCase()).to.equal(migration.atlasFeed!.feed.toLowerCase());
        expect(config.maxStalePeriod).to.equal(migration.atlasFeed!.maxStalePeriod);
      }
    });
  });

  describe("Post-VIP new aggregator wiring", () => {
    const timelocks = [bscmainnet.NORMAL_TIMELOCK, bscmainnet.FAST_TRACK_TIMELOCK, bscmainnet.CRITICAL_TIMELOCK];
    const batchers = newAggregatorBatchers("bscmainnet");

    it("ownership accepted by the Normal Timelock", async () => {
      const aggregator = new ethers.Contract(NEW_AGGREGATOR_BSC, AGGREGATOR_ABI, ethers.provider);
      expect((await aggregator.owner()).toLowerCase()).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
    });

    it("executeBatch / add / removeAuthorizedBatchers granted to all three timelocks", async () => {
      const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      for (const signature of NEW_AGGREGATOR_TIMELOCK_SIGS) {
        for (const timelock of timelocks) {
          expect(await acm.isAllowedToCall(timelock, signature, { from: NEW_AGGREGATOR_BSC })).to.equal(
            true,
            `${signature} ${timelock}`,
          );
        }
      }
    });

    it("batcher allowlist seeded", async () => {
      const aggregator = new ethers.Contract(NEW_AGGREGATOR_BSC, AGGREGATOR_ABI, ethers.provider);
      for (const batcher of batchers) {
        expect(await aggregator.authorizedBatchers(batcher)).to.equal(true);
      }
    });
  });

  describe("Post-VIP new aggregator is operational (e2e)", () => {
    const batchers = newAggregatorBatchers("bscmainnet");
    const PROBE_TARGET = ethers.utils.getAddress("0x000000000000000000000000000000000000dead");
    const PROBE_ACCOUNT = ethers.utils.getAddress("0x00000000000000000000000000000000deadbeef");
    const PROBE_SIG = "e2eProbe(uint256)";

    it("authorized batcher seeds a batch and a timelock executes it", async () => {
      const acmRead = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
      expect(await acmRead.isAllowedToCall(PROBE_ACCOUNT, PROBE_SIG, { from: PROBE_TARGET })).to.equal(false);

      const batcher = await initMainnetUser(batchers[0], ethers.utils.parseEther("1"));
      const aggAsBatcher = new ethers.Contract(NEW_AGGREGATOR_BSC, AGGREGATOR_ABI, batcher);
      const probeData = new ethers.utils.Interface(ACM_ABI).encodeFunctionData("giveCallPermission", [
        PROBE_TARGET,
        PROBE_SIG,
        PROBE_ACCOUNT,
      ]);
      const newIndex = (await aggAsBatcher.batchCount()).toNumber();
      await aggAsBatcher["addBatch((address,bytes)[])"]([
        { target: bscmainnet.ACCESS_CONTROL_MANAGER, data: probeData },
      ]);

      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, timelock);
      const aggAsTimelock = new ethers.Contract(NEW_AGGREGATOR_BSC, AGGREGATOR_ABI, timelock);
      await acm.grantRole(ethers.constants.HashZero, NEW_AGGREGATOR_BSC);
      await aggAsTimelock.executeBatch(newIndex);
      await acm.revokeRole(ethers.constants.HashZero, NEW_AGGREGATOR_BSC);

      expect(await acmRead.isAllowedToCall(PROBE_ACCOUNT, PROBE_SIG, { from: PROBE_TARGET })).to.equal(true);
      expect(await acm.hasRole(ethers.constants.HashZero, NEW_AGGREGATOR_BSC)).to.equal(false);
    });
  });

  describe("Post-VIP prices", () => {
    before(async () => {
      const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));

      for (const migration of BSC_MIGRATIONS) {
        for (const oracleAddr of [bscmainnet.CHAINLINK_ORACLE, bscmainnet.REDSTONE_ORACLE, ATLAS_ORACLE]) {
          await setMaxStalePeriodInChainlinkOracle(
            oracleAddr,
            migration.asset,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
            STALE_PERIOD_OVERRIDE,
          );
        }
      }

      const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
      await redstoneOracle.setDirectPrice(THE, redstonePrice[THE]);
      await redstoneOracle.setDirectPrice(TWT, redstonePrice[TWT]);
      const fundamentalOracle = new ethers.Contract(
        SOLVBTC_FUNDAMENTAL_CHAINLINK_ORACLE,
        CHAINLINK_ORACLE_ABI,
        timelock,
      );
      await fundamentalOracle.setDirectPrice(SOLVBTC, solvBtcFundamentalPrice);
    });

    for (const migration of BSC_MIGRATIONS) {
      it(`${migration.symbol}: price still resolves and stays within tolerance`, async () => {
        const price = await resilientOracle.getPrice(migration.asset);
        expect(price).to.be.gt(0);
        const before = preVipPrice[migration.asset];
        expect(price.sub(before).abs().mul(10000)).to.be.lte(before.mul(PRICE_TOLERANCE_BPS));
      });
    }
  });
});
