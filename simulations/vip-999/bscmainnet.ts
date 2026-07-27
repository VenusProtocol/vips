import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  APRO_ASSETS,
  APRO_ORACLE,
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  LOWER_BOUND,
  MAX_STALE_PERIOD,
  UPPER_BOUND,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/accessControlManager.json";
import APRO_ACCESS_CONTROL_ABI from "./abi/aproAccessControl.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 112419380;
const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const ADDRESS_ZERO = ethers.constants.AddressZero;

forking(BLOCK_NUMBER, async () => {
  let resilientOracle: Contract;
  let aproOracle: Contract;
  let boundValidator: Contract;
  const preVipPrice: Record<string, BigNumber> = {};

  before(async () => {
    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    aproOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, APRO_ORACLE);
    boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, BOUND_VALIDATOR);
    for (const { asset } of APRO_ASSETS) {
      preVipPrice[asset] = await resilientOracle.getPrice(asset);
    }
  });

  // =====================================================================================
  // PRE-VIP — the four markets price from Atlas (MAIN) only, no PIVOT/FALLBACK/bound
  // =====================================================================================
  describe("Pre-VIP behavior", () => {
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
  });

  // =====================================================================================
  // EXECUTION — one APRO feed config, one ResilientOracle config and one BoundValidator
  // config per asset.
  // =====================================================================================
  testVip("VIP-999 Add APRO pivot for BStocks", await vip999(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: [
      "0x5176671de05380379399b669ed276feec99d59cb",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      // APRO oracle feed configs (ChainlinkOracle.TokenConfigAdded).
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [APRO_ASSETS.length]);
      // ResilientOracle token configs (distinct TokenConfigAdded signature).
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [APRO_ASSETS.length]);
      // BoundValidator anchor bands.
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [APRO_ASSETS.length]);
    },
  });

  // =====================================================================================
  // POST-VIP — assert the new configuration
  // =====================================================================================
  describe("Post-VIP config", () => {
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

    for (const { symbol, asset, feed } of APRO_ASSETS) {
      it(`${symbol}: APRO feed configured with the expected feed + max stale period`, async () => {
        const cfg = await aproOracle.tokenConfigs(asset);
        expect(cfg.feed.toLowerCase()).to.equal(feed.toLowerCase());
        expect(cfg.maxStalePeriod).to.equal(MAX_STALE_PERIOD);
      });

      it(`${symbol}: ResilientOracle has Atlas MAIN + APRO PIVOT (no FALLBACK)`, async () => {
        const config = await resilientOracle.getTokenConfig(asset);
        expect(config.oracles[0].toLowerCase()).to.equal(ATLAS_ORACLE.toLowerCase());
        expect(config.oracles[1].toLowerCase()).to.equal(APRO_ORACLE.toLowerCase());
        expect(config.oracles[2]).to.equal(ADDRESS_ZERO);
        expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
      });

      it(`${symbol}: BoundValidator anchor band set to ±1%`, async () => {
        const c = await boundValidator.validateConfigs(asset);
        expect(c.upperBoundRatio).to.equal(UPPER_BOUND);
        expect(c.lowerBoundRatio).to.equal(LOWER_BOUND);
      });
    }
  });

  // =====================================================================================
  // POST-VIP behavioral proof — the APRO pivot is live and mandatory: pricing reverts until
  // the APRO oracle is whitelisted on each feed, then resolves through the validated pivot.
  // =====================================================================================
  describe("Post-VIP behavior: APRO pivot requires feed whitelisting", () => {
    before(async () => {
      // The governance delay warped past the feeds' stale windows; bump the MAIN (Atlas) and PIVOT
      // (APRO) stale periods so the only remaining failure mode isolated below is the feed whitelist.
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

    it("pricing reverts while the APRO oracle is not whitelisted on the feeds", async () => {
      for (const { asset } of APRO_ASSETS) {
        // The pivot read (contract call into the feed) fails; with no FALLBACK, getPrice reverts.
        await expect(resilientOracle.getPrice(asset)).to.be.reverted;
      }
    });

    it("after APRO whitelists our oracle, the pivot resolves and validates the MAIN price", async () => {
      for (const { accessController } of APRO_ASSETS) {
        const controller = new ethers.Contract(accessController, APRO_ACCESS_CONTROL_ABI, ethers.provider);
        const owner = await initMainnetUser(await controller.owner(), ethers.utils.parseEther("1"));
        expect(await controller.hasAccess(APRO_ORACLE, "0x")).to.equal(false);
        await controller.connect(owner).addAccess(APRO_ORACLE);
        expect(await controller.hasAccess(APRO_ORACLE, "0x")).to.equal(true);
      }

      for (const { asset } of APRO_ASSETS) {
        // MAIN (Atlas) price is unchanged; it now resolves only because it passes the APRO pivot band.
        const price = await resilientOracle.getPrice(asset);
        expect(price).to.equal(preVipPrice[asset]);
      }
    });
  });
});
