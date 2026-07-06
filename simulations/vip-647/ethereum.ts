import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ETH_CURVE, ETH_LIQUID_STAKED_ETH } from "../../vips/vip-634/phase4Markets";
import { AGGREGATOR, SeedCommand, buildBatch } from "../../vips/vip-647/aggregatorBatches";
import vip647 from "../../vips/vip-647/bscmainnet";
import { ORACLE_UPDATE } from "../../vips/vip-647/oracleFeeds";
import { ETH_CORE_STEP2, marketsToZero } from "../../vips/vip-647/zeroCollateralParams";
import AGGREGATOR_ABI from "./abi/CommandsAggregator.json";

// Recent Ethereum block where the CommandsAggregator batchCount == 0 (batch lands at index 0, matching the VIP).
const FORK_BLOCK = 25470000;
const ETH_TIMELOCK = "0xd969E79406c35E80750aAae061D402Aab9325714";
const { aggregator } = AGGREGATOR.ethereum;

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

const ETH_POOLS = [ETH_CORE_STEP2, ETH_CURVE, ETH_LIQUID_STAKED_ETH];

forking(FORK_BLOCK, async () => {
  before(async () => {
    // Seed VIP-647's Ethereum batch in-fork, exactly as an authorized batcher would on mainnet before proposal.
    const timelock = await initMainnetUser(ETH_TIMELOCK, ethers.utils.parseEther("2"));
    const agg = new Contract(aggregator, AGGREGATOR_ABI, timelock);
    expect((await agg.batchCount()).toNumber(), "batchCount must be 0").to.equal(0);
    await agg["addBatch((address,bytes)[])"](buildBatch("ethereum").map(encode));
  });

  describe("Pre-VIP behavior", () => {
    it("oracle MAIN adapters still hold the old feeds", async () => {
      for (const f of ORACLE_UPDATE.ethereum) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        expect((await adapter.tokenConfigs(f.asset)).feed.toLowerCase(), f.symbol).to.not.equal(f.feed.toLowerCase());
      }
    });

    it("in-scope Ethereum markets still carry a non-zero liquidation threshold", async () => {
      for (const pool of ETH_POOLS) {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of marketsToZero(pool)) {
          expect((await comptroller.markets(m.vToken)).liquidationThresholdMantissa.gt(0), m.symbol).to.be.true;
        }
      }
    });
  });

  testForkedNetworkVipCommands("VIP-647 Ethereum", await vip647());

  describe("Post-VIP behavior", () => {
    it("oracle MAIN adapters repointed to the new feeds (maxStalePeriod preserved)", async () => {
      for (const f of ORACLE_UPDATE.ethereum) {
        const adapter = new Contract(f.mainAdapter, ADAPTER_ABI, ethers.provider);
        const cfg = await adapter.tokenConfigs(f.asset);
        expect(cfg.feed.toLowerCase(), `${f.symbol} feed`).to.equal(f.feed.toLowerCase());
        expect(cfg.maxStalePeriod.toString(), `${f.symbol} maxStale`).to.equal(f.maxStalePeriod.toString());
      }
    });

    it("in-scope Ethereum markets set to CF=0, LT=0", async () => {
      for (const pool of ETH_POOLS) {
        const comptroller = new Contract(pool.comptroller, COMPTROLLER_ABI, ethers.provider);
        for (const m of marketsToZero(pool)) {
          const d = await comptroller.markets(m.vToken);
          expect(d.collateralFactorMantissa.toString(), `${m.symbol} cf`).to.equal("0");
          expect(d.liquidationThresholdMantissa.toString(), `${m.symbol} lt`).to.equal("0");
        }
      }
    });
  });
});
