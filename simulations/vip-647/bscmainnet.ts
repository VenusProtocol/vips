import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BNB_BTC,
  BNB_CORE,
  BNB_DEFI,
  BNB_GAMEFI,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
} from "../../vips/vip-634/phase4Markets";
import { AGGREGATOR, SeedCommand, buildBatch } from "../../vips/vip-647/aggregatorBatches";
import vip647 from "../../vips/vip-647/bscmainnet";
import { ORACLE_UPDATE, THE_MAIN_REPOINT } from "../../vips/vip-647/oracleFeeds";
import { CORE_EMODE, PT_SUSDE, marketsToZero } from "../../vips/vip-647/zeroCollateralParams";
import AGGREGATOR_ABI from "./abi/CommandsAggregator.json";
import { checkVipEffectsPostVip, checkVipEffectsPreVip } from "./utils/checkVipEffects";

// Every BNB isolated pool in the batch (BNB_BTC's only market is already at LT 0, so it is filtered out).
const BNB_ISOLATED = [
  BNB_BTC,
  BNB_DEFI,
  BNB_GAMEFI,
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
].filter(p => marketsToZero(p).length > 0);

// Recent BSC block where the CommandsAggregator batchCount == 1 (so our seeded batch lands at index 1,
// matching BATCH_INDEX.bscmainnet in the VIP).
const FORK_BLOCK = 108400000;

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const { aggregator } = AGGREGATOR.bscmainnet;

const ADAPTER_ABI = [
  "function tokenConfigs(address) view returns (address asset, address feed, uint256 maxStalePeriod)",
];
const COMPTROLLER_ABI = [
  "function markets(address) view returns (bool, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
  "function poolMarkets(uint96, address) view returns (bool, uint256 collateralFactorMantissa, uint256, uint256 liquidationThresholdMantissa, bool)",
  "function supplyCaps(address) view returns (uint256)",
];
const VTOKEN_ABI = [
  "function reserveFactorMantissa() view returns (uint256)",
  "function interestRateModel() view returns (address)",
];
const RESILIENT_ORACLE_ABI = [
  "function getTokenConfig(address) view returns (address asset, address[3] oracles, bool[3] enableFlagsForOracles)",
  "function getPrice(address) view returns (uint256)",
];
const RF_FULL = ethers.utils.parseUnits("1", 18);

const encode = (cmd: SeedCommand) => ({
  target: cmd.target,
  data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
});

forking(FORK_BLOCK, async () => {
  before(async () => {
    // Seed VIP-647's BNB Chain batch in-fork, exactly as an authorized batcher would on mainnet before proposal.
    const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    const agg = new Contract(aggregator, AGGREGATOR_ABI, timelock);
    const nextIndex = (await agg.batchCount()).toNumber();
    expect(nextIndex, "batchCount must be 1 so the batch lands at the VIP's index").to.equal(1);
    await agg["addBatch((address,bytes)[])"](buildBatch("bscmainnet").map(encode));
  });

  describe("Pre-VIP behavior", () => {
    it("oracle MAIN adapters still hold the old feeds", async () => {
      for (const f of ORACLE_UPDATE.bscmainnet) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        const cfg = await adapter.tokenConfigs(f.asset);
        expect(cfg.feed.toLowerCase(), f.symbol).to.not.equal(f.feed.toLowerCase());
      }
    });

    it("in-scope BNB isolated markets still carry a non-zero liquidation threshold", async () => {
      for (const pool of BNB_ISOLATED) {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of marketsToZero(pool)) {
          const d = await comptroller.markets(m.vToken);
          expect(d.liquidationThresholdMantissa.gt(0), `${pool.label} ${m.symbol}`).to.be.true;
        }
      }
    });

    it("THE MAIN oracle still points to the RedStoneOracle adapter, no fallback configured", async () => {
      const ro = new Contract(THE_MAIN_REPOINT.resilientOracle, RESILIENT_ORACLE_ABI, ethers.provider);
      const cfg = await ro.getTokenConfig(THE_MAIN_REPOINT.asset);
      expect(cfg.oracles[0].toLowerCase(), "THE main pre").to.not.equal(THE_MAIN_REPOINT.chainlinkOracle.toLowerCase());
      expect(cfg.oracles[2], "THE fallback pre").to.equal(ethers.constants.AddressZero);
      expect(cfg.enableFlagsForOracles[2], "THE fallback flag pre").to.be.false;
    });

    it("PT-sUSDE is still fully active (CF/LT non-zero, RF 0, non-zero supply cap)", async () => {
      const comptroller = new Contract(PT_SUSDE.comptroller, COMPTROLLER_ABI, ethers.provider);
      const vToken = new Contract(PT_SUSDE.vToken, VTOKEN_ABI, ethers.provider);
      const d = await comptroller.poolMarkets(PT_SUSDE.poolId, PT_SUSDE.vToken);
      expect(d.collateralFactorMantissa.gt(0), "PT-sUSDE cf").to.be.true;
      expect(d.liquidationThresholdMantissa.gt(0), "PT-sUSDE lt").to.be.true;
      expect((await vToken.reserveFactorMantissa()).toString(), "PT-sUSDE rf").to.equal("0");
      expect((await comptroller.supplyCaps(PT_SUSDE.vToken)).gt(0), "PT-sUSDE cap").to.be.true;
      expect((await vToken.interestRateModel()).toLowerCase(), "PT-sUSDE irm").to.not.equal(PT_SUSDE.irm.toLowerCase());
    });
  });

  checkVipEffectsPreVip("bscmainnet");

  testVip("VIP-647 Deprecation Step 2 + Oracle Feed Update — BNB Chain", await vip647());

  describe("Post-VIP behavior", () => {
    it("oracle MAIN adapters repointed to the new feeds (heartbeat-based maxStalePeriod)", async () => {
      for (const f of ORACLE_UPDATE.bscmainnet) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        const cfg = await adapter.tokenConfigs(f.asset);
        expect(cfg.feed.toLowerCase(), `${f.symbol} feed`).to.equal(f.feed.toLowerCase());
        expect(cfg.maxStalePeriod.toString(), `${f.symbol} maxStale`).to.equal(f.maxStalePeriod.toString());
      }
    });

    it("in-scope BNB isolated markets set to CF=0, LT=0", async () => {
      for (const pool of BNB_ISOLATED) {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of marketsToZero(pool)) {
          const d = await comptroller.markets(m.vToken);
          expect(d.collateralFactorMantissa.toString(), `${pool.label} ${m.symbol} cf`).to.equal("0");
          expect(d.liquidationThresholdMantissa.toString(), `${pool.label} ${m.symbol} lt`).to.equal("0");
        }
      }
    });

    it("BNB Core base pool + e-mode pools set to CF=0, LT=0", async () => {
      const comptroller = new Contract(BNB_CORE.comptroller, COMPTROLLER_ABI, ethers.provider);
      for (const m of marketsToZero(BNB_CORE)) {
        const d = await comptroller.poolMarkets(0, m.vToken);
        expect(d.collateralFactorMantissa.toString(), `${m.symbol} base cf`).to.equal("0");
        expect(d.liquidationThresholdMantissa.toString(), `${m.symbol} base lt`).to.equal("0");
      }
      for (const e of CORE_EMODE) {
        const d = await comptroller.poolMarkets(e.poolId, e.vToken);
        expect(d.collateralFactorMantissa.toString(), `${e.symbol} pool ${e.poolId} cf`).to.equal("0");
        expect(d.liquidationThresholdMantissa.toString(), `${e.symbol} pool ${e.poolId} lt`).to.equal("0");
      }
    });

    it("THE MAIN oracle repointed to the ChainlinkOracle adapter, RedStone enabled as FALLBACK", async () => {
      const ro = new Contract(THE_MAIN_REPOINT.resilientOracle, RESILIENT_ORACLE_ABI, ethers.provider);
      const cfg = await ro.getTokenConfig(THE_MAIN_REPOINT.asset);
      expect(cfg.oracles[0].toLowerCase(), "THE main post").to.equal(THE_MAIN_REPOINT.chainlinkOracle.toLowerCase());
      expect(cfg.oracles[2].toLowerCase(), "THE fallback post").to.equal(THE_MAIN_REPOINT.redStoneOracle.toLowerCase());
      expect(cfg.enableFlagsForOracles[2], "THE fallback flag post").to.be.true;
    });

    it("PT-sUSDE fully deprecated: CF/LT=0, RF=100%, push-out IRM, supply cap=0", async () => {
      const comptroller = new Contract(PT_SUSDE.comptroller, COMPTROLLER_ABI, ethers.provider);
      const vToken = new Contract(PT_SUSDE.vToken, VTOKEN_ABI, ethers.provider);
      const d = await comptroller.poolMarkets(PT_SUSDE.poolId, PT_SUSDE.vToken);
      expect(d.collateralFactorMantissa.toString(), "PT-sUSDE cf").to.equal("0");
      expect(d.liquidationThresholdMantissa.toString(), "PT-sUSDE lt").to.equal("0");
      expect((await vToken.reserveFactorMantissa()).toString(), "PT-sUSDE rf").to.equal(RF_FULL.toString());
      expect((await vToken.interestRateModel()).toLowerCase(), "PT-sUSDE irm").to.equal(PT_SUSDE.irm.toLowerCase());
      expect((await comptroller.supplyCaps(PT_SUSDE.vToken)).toString(), "PT-sUSDE cap").to.equal("0");
    });
  });

  checkVipEffectsPostVip("bscmainnet", NORMAL_TIMELOCK);
});
