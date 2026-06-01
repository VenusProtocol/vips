import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import { ATLAS_ORACLE, BSC_MIGRATIONS } from "../../vips/vip-999/utils/data";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 101640486;
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
  // solvBTC's fundamental leaf returns a value on its own scale (not USD), captured fresh pre-warp.
  let solvBtcFundamentalPrice: BigNumber;

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    atlasOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, ATLAS_ORACLE);
    for (const migration of BSC_MIGRATIONS) {
      preVipPrice[migration.asset] = await resilientOracle.getPrice(migration.asset);
    }
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
  testVip("VIP-999 Oracle Migration (BNB Chain)", await vip999(), {
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
      await redstoneOracle.setDirectPrice(THE, preVipPrice[THE]);
      await redstoneOracle.setDirectPrice(TWT, preVipPrice[TWT]);
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
