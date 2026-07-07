import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
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
import { AGGREGATOR, SeedCommand, XVS_RESTORE, buildBatch } from "../../vips/vip-647/aggregatorBatches";
import vip647 from "../../vips/vip-647/bscmainnet";
import { ORACLE_UPDATE } from "../../vips/vip-647/oracleFeeds";
import { CORE_EMODE, marketsToZero } from "../../vips/vip-647/zeroCollateralParams";
import AGGREGATOR_ABI from "./abi/CommandsAggregator.json";

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
];

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

    // Restoring a NON-zero XVS collateral factor requires a valid oracle price. testVip's governance time-travel
    // makes XVS's feeds stale, so ResilientOracle reverts ("invalid resilient oracle price") and the setter fails.
    // Fork-only workaround (VIP-647 does not touch XVS's oracle config): keep XVS's Chainlink MAIN feed fresh, and
    // pin a direct price on the RedStone PIVOT oracle (its underlying feed is dead in the fork), so ResilientOracle's
    // MAIN-vs-PIVOT bound validation passes post-warp. On mainnet the feeds are fresh at execution.
    const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
    const XVS_CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
    const XVS_REDSTONE = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
    await setMaxStalePeriodInChainlinkOracle(XVS_CHAINLINK, XVS, ethers.constants.AddressZero, NORMAL_TIMELOCK);
    const ro = new Contract(
      "0x6592b5DE802159F3E74B2486b091D11a8256ab8A",
      ["function getPrice(address) view returns (uint256)"],
      ethers.provider,
    );
    const xvsPrice = await ro.getPrice(XVS);
    const redstone = new Contract(XVS_REDSTONE, ["function setDirectPrice(address,uint256)"], timelock);
    await redstone.setDirectPrice(XVS, xvsPrice);
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
  });

  testVip("VIP-647 Deprecation Step 2 + Oracle Feed Update — BNB Chain", await vip647());

  describe("Post-VIP behavior", () => {
    it("oracle MAIN adapters repointed to the new feeds (maxStalePeriod preserved)", async () => {
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

    it("XVS collateral factor restored to 55% (liquidation threshold 60%)", async () => {
      const comptroller = new Contract(BNB_CORE.comptroller, COMPTROLLER_ABI, ethers.provider);
      const d = await comptroller.poolMarkets(0, XVS_RESTORE.vToken);
      expect(d.collateralFactorMantissa.toString(), "XVS cf").to.equal(XVS_RESTORE.collateralFactor.toString());
      expect(d.liquidationThresholdMantissa.toString(), "XVS lt").to.equal(XVS_RESTORE.liquidationThreshold.toString());
    });
  });
});
