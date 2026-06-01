import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip999 from "../../../vips/vip-999/bscmainnet";
import { AssetMigration } from "../../../vips/vip-999/utils/data";
import BOUND_VALIDATOR_ABI from "../abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "../abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";

const STALE_PERIOD_OVERRIDE = 315360000; // 10 years
const PRICE_TOLERANCE_BPS = 500; // 5%
const ERC20_ABI = ["function decimals() view returns (uint8)"];

type RemoteNetwork = "ethereum" | "arbitrumone" | "basemainnet";

export const runRemoteOracleSuite = (opts: {
  blockNumber: number;
  networkKey: RemoteNetwork;
  boundValidator: string;
  migrations: AssetMigration[];
  assertPrices: boolean;
}) => {
  const net = NETWORK_ADDRESSES[opts.networkKey];

  forking(opts.blockNumber, async () => {
    let resilientOracle: Contract;
    let redstoneOracle: Contract;
    let boundValidator: Contract;
    const preVipPrice: Record<string, BigNumber> = {};

    before(async () => {
      resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, net.RESILIENT_ORACLE);
      redstoneOracle = await ethers.getContractAt(CHAINLINK_ORACLE_ABI, net.REDSTONE_ORACLE);
      boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, opts.boundValidator);
      if (opts.assertPrices) {
        for (const m of opts.migrations) {
          preVipPrice[m.asset] = await resilientOracle.getPrice(m.asset);
        }
      }
    });

    // =====================================================================================
    // PRE-VIP — MAIN-only layout, empty PIVOT, no RedStone feed, no bound config
    // =====================================================================================
    describe("Pre-VIP behavior", () => {
      for (const m of opts.migrations) {
        it(`${m.symbol}: MAIN-only, PIVOT empty, no RedStone feed, no bound config`, async () => {
          const config = await resilientOracle.getTokenConfig(m.asset);
          expect(config.oracles.map((o: string) => o.toLowerCase())).to.deep.equal(
            m.oldOracles.map(o => o.toLowerCase()),
          );
          expect(config.enableFlagsForOracles).to.deep.equal(m.oldFlags);
          expect((await redstoneOracle.tokenConfigs(m.asset)).feed).to.equal(ethers.constants.AddressZero);
          expect((await boundValidator.validateConfigs(m.asset)).upperBoundRatio).to.equal(0);
        });
      }
    });

    // =====================================================================================
    // EXECUTION
    // =====================================================================================
    testForkedNetworkVipCommands("vip999", await vip999());

    // =====================================================================================
    // POST-VIP — assert the new on-chain layout (config)
    // =====================================================================================
    describe("Post-VIP config", () => {
      for (const m of opts.migrations) {
        it(`${m.symbol}: RedStone enabled as PIVOT with feed + bound config`, async () => {
          const config = await resilientOracle.getTokenConfig(m.asset);
          expect(config.oracles.map((o: string) => o.toLowerCase())).to.deep.equal(
            m.newOracles.map(o => o.toLowerCase()),
          );
          expect(config.enableFlagsForOracles).to.deep.equal(m.newFlags);

          const rs = await redstoneOracle.tokenConfigs(m.asset);
          expect(rs.feed.toLowerCase()).to.equal(m.redstoneFeed!.feed.toLowerCase());
          expect(rs.maxStalePeriod).to.equal(m.redstoneFeed!.maxStalePeriod);

          const bv = await boundValidator.validateConfigs(m.asset);
          expect(bv.upperBoundRatio).to.equal(m.boundConfig!.upperBoundRatio);
          expect(bv.lowerBoundRatio).to.equal(m.boundConfig!.lowerBoundRatio);
        });
      }
    });

    (opts.assertPrices ? describe : describe.skip)("Post-VIP prices", () => {
      before(async () => {
        const timelock = await initMainnetUser(net.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const redstone = new ethers.Contract(net.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, timelock);
        for (const m of opts.migrations) {
          await setMaxStalePeriodInChainlinkOracle(
            net.CHAINLINK_ORACLE,
            m.asset,
            ethers.constants.AddressZero,
            net.NORMAL_TIMELOCK,
            STALE_PERIOD_OVERRIDE,
          );
          const token = new ethers.Contract(m.asset, ERC20_ABI, ethers.provider);
          const decimals: number = await token.decimals();
          const directPrice = preVipPrice[m.asset].div(BigNumber.from(10).pow(18 - decimals));
          await redstone.setDirectPrice(m.asset, directPrice);
        }
      });

      for (const m of opts.migrations) {
        it(`${m.symbol}: price still resolves (pivot anchor passes) and stays within tolerance`, async () => {
          const price = await resilientOracle.getPrice(m.asset);
          expect(price).to.be.gt(0);
          const before = preVipPrice[m.asset];
          expect(price.sub(before).abs().mul(10000)).to.be.lte(before.mul(PRICE_TOLERANCE_BPS));
        });
      }
    });
  });
};
