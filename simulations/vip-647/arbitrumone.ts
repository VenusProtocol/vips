import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUM_LIQUID_STAKED_ETH } from "../../vips/vip-634/phase4Markets";
import { AGGREGATOR, SeedCommand, buildBatch } from "../../vips/vip-647/aggregatorBatches";
import vip647 from "../../vips/vip-647/bscmainnet";
import { ORACLE_UPDATE } from "../../vips/vip-647/oracleFeeds";
import { marketsToZero } from "../../vips/vip-647/zeroCollateralParams";
import AGGREGATOR_ABI from "./abi/CommandsAggregator.json";
import { checkVipEffectsPostVip, checkVipEffectsPreVip } from "./utils/checkVipEffects";

// Recent Arbitrum block where the CommandsAggregator batchCount == 0 (batch lands at index 0, matching the VIP).
const FORK_BLOCK = 474085204;
const ARB_TIMELOCK = "0x4b94589Cc23F618687790036726f744D602c4017";
const { aggregator } = AGGREGATOR.arbitrumone;

const ADAPTER_ABI = [
  "function tokenConfigs(address) view returns (address asset, address feed, uint256 maxStalePeriod)",
];
const COMPTROLLER_ABI = [
  "function markets(address) view returns (bool, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
];

const encode = (cmd: SeedCommand) => ({
  target: cmd.target,
  data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
});

forking(FORK_BLOCK, async () => {
  before(async () => {
    // Seed VIP-647's Arbitrum batch in-fork, exactly as an authorized batcher would on mainnet before proposal.
    const timelock = await initMainnetUser(ARB_TIMELOCK, ethers.utils.parseEther("2"));
    const agg = new Contract(aggregator, AGGREGATOR_ABI, timelock);
    expect((await agg.batchCount()).toNumber(), "batchCount must be 0").to.equal(0);
    await agg["addBatch((address,bytes)[])"](buildBatch("arbitrumone").map(encode));
  });

  describe("Pre-VIP behavior", () => {
    it("oracle MAIN adapters still hold the old feeds", async () => {
      for (const f of ORACLE_UPDATE.arbitrumone) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        expect((await adapter.tokenConfigs(f.asset)).feed.toLowerCase(), f.symbol).to.not.equal(f.feed.toLowerCase());
      }
    });

    it("in-scope Arbitrum markets still carry a non-zero liquidation threshold", async () => {
      const comptroller = new Contract(ARBITRUM_LIQUID_STAKED_ETH.comptroller, COMPTROLLER_ABI, ethers.provider);
      for (const m of marketsToZero(ARBITRUM_LIQUID_STAKED_ETH)) {
        expect((await comptroller.markets(m.vToken)).liquidationThresholdMantissa.gt(0), m.symbol).to.be.true;
      }
    });
  });

  checkVipEffectsPreVip("arbitrumone");

  testForkedNetworkVipCommands("VIP-647 Arbitrum", await vip647());

  describe("Post-VIP behavior", () => {
    it("oracle MAIN adapters repointed to the new feeds (heartbeat-based maxStalePeriod)", async () => {
      for (const f of ORACLE_UPDATE.arbitrumone) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        const cfg = await adapter.tokenConfigs(f.asset);
        expect(cfg.feed.toLowerCase(), `${f.symbol} feed`).to.equal(f.feed.toLowerCase());
        expect(cfg.maxStalePeriod.toString(), `${f.symbol} maxStale`).to.equal(f.maxStalePeriod.toString());
      }
    });

    it("in-scope Arbitrum markets set to CF=0, LT=0", async () => {
      const comptroller = new Contract(ARBITRUM_LIQUID_STAKED_ETH.comptroller, COMPTROLLER_ABI, ethers.provider);
      for (const m of marketsToZero(ARBITRUM_LIQUID_STAKED_ETH)) {
        const d = await comptroller.markets(m.vToken);
        expect(d.collateralFactorMantissa.toString(), `${m.symbol} cf`).to.equal("0");
        expect(d.liquidationThresholdMantissa.toString(), `${m.symbol} lt`).to.equal("0");
      }
    });
  });

  checkVipEffectsPostVip("arbitrumone", ARB_TIMELOCK);
});
