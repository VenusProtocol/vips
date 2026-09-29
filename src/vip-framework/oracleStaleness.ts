// Fork-only helpers that keep oracle prices valid across the time the governance lifecycle skips.
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import ACCESS_CONTROL_MANAGER from "@venusprotocol/governance-contracts/artifacts/contracts/Governance/AccessControlManager.sol/AccessControlManager.json";
import RESILIENT_ORACLE from "@venusprotocol/oracle/artifacts/contracts/ResilientOracle.sol/ResilientOracle.json";
import CHAINLINK_ORACLE from "@venusprotocol/oracle/artifacts/contracts/oracles/ChainlinkOracle.sol/ChainlinkOracle.json";
import CORRELATED_ORACLE from "@venusprotocol/oracle/artifacts/contracts/oracles/OneJumpOracle.sol/OneJumpOracle.json";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { ORACLE_BNB } from "../networkAddresses";
import { TokenConfig } from "../types";
import { getForkedNetworkAddress, initMainnetUser } from "../utils";

const ONE_YEAR = 365 * 24 * 3600;
// A BSC Normal VIP warps ~4.2 days; a feed still fresh after 7 days is assumed to stay fresh for the whole sim.
const GOVERNANCE_WARP = 7 * 24 * 3600;

type OracleFeedHandler = (oracle: Contract, asset: string, feed: string) => Promise<void>;

// Calls as the Normal Timelock. If the ACM refuses (e.g. a new oracle), grants `signature` for this call only.
const callAsTimelock = async (
  target: string,
  signature: string,
  call: (timelock: SignerWithAddress) => Promise<unknown>,
) => {
  const timelock = await initMainnetUser(getForkedNetworkAddress("NORMAL_TIMELOCK"), ethers.utils.parseEther("1"));
  try {
    await call(timelock);
  } catch {
    const acmAddress = await new ethers.Contract(target, CHAINLINK_ORACLE.abi, ethers.provider).accessControlManager();
    const acm = new ethers.Contract(acmAddress, ACCESS_CONTROL_MANAGER.abi, timelock);
    await acm.giveCallPermission(target, signature, timelock.address);
    try {
      await call(timelock);
    } finally {
      await acm.revokeCallPermission(target, signature, timelock.address);
    }
  }
};

// Runs `fn`, then rolls the chain back.
const dryRun = async <T>(fn: () => Promise<T>): Promise<T> => {
  const snapshot = await ethers.provider.send("evm_snapshot", []);
  try {
    return await fn();
  } finally {
    await ethers.provider.send("evm_revert", [snapshot]);
  }
};

const canPrice = (oracle: Contract, asset: string): Promise<boolean> =>
  oracle.getPrice(asset).then(
    () => true,
    () => false,
  );

const canStillPriceDaysLater = (oracle: Contract, asset: string) =>
  dryRun(async () => {
    await time.increase(GOVERNANCE_WARP);
    return canPrice(oracle, asset);
  });

const tokenDecimals = async (asset: string): Promise<number> =>
  asset.toLowerCase() === ORACLE_BNB.toLowerCase()
    ? 18
    : new ethers.Contract(asset, ["function decimals() view returns (uint8)"], ethers.provider).decimals();

const setFeed = (oracle: Contract, asset: string, feed: string, maxStalePeriod: number) =>
  callAsTimelock(oracle.address, "setTokenConfig(TokenConfig)", timelock =>
    oracle.connect(timelock).setTokenConfig({ asset, feed, maxStalePeriod }),
  );

// Current price of an oracle feed that would go stale over the warp. Undefined if it survives or can't price now.
const livePriceIfStale = async (oracle: Contract, asset: string): Promise<BigNumber | undefined> =>
  (await canStillPriceDaysLater(oracle, asset)) ? undefined : oracle.getPrice(asset).catch(() => undefined);

// Sets `price` as the asset's direct price on the oracle, so it stops reading the feed.
const pinPrice = async (oracle: Contract, asset: string, price: BigNumber) => {
  const decimals = await tokenDecimals(asset);
  // getPrice returns the stored direct price × 10^(18 - decimals), so divide by that first.
  await callAsTimelock(oracle.address, "setDirectPrice(address,uint256)", timelock =>
    oracle.connect(timelock).setDirectPrice(asset, price.div(parseUnits("1", 18 - decimals))),
  );
  expect(await oracle.getPrice(asset)).to.equal(price);
};

const pinIfStale: OracleFeedHandler = async (oracle, asset) => {
  const price = await livePriceIfStale(oracle, asset);
  if (price) await pinPrice(oracle, asset, price);
};

// Raises the oracle's maxStalePeriod; if the feed is still too old, pins a direct price so getPrice skips the feed.
const raiseStalePeriodOrPin =
  (maxStalePeriod: number): OracleFeedHandler =>
  async (oracle, asset, feed) => {
    // Re-sets the asset's current feed; only its maxStalePeriod changes.
    await setFeed(oracle, asset, feed, maxStalePeriod);
    await pinIfStale(oracle, asset, feed);
  };

// Calls `onOracleFeed` once for every enabled Chainlink-interface oracle feed behind `asset`.
// Correlated oracles are followed into their underlying asset and intermediate oracle.
const forEachOracleFeed = (
  resilientOracle: Contract,
  asset: string,
  onOracleFeed: OracleFeedHandler,
): Promise<void> => {
  const visited = new Set<string>();

  const walkOracle = async (oracleAddress: string, asset: string): Promise<void> => {
    const chainlinkLike = new ethers.Contract(oracleAddress, CHAINLINK_ORACLE.abi, ethers.provider);
    const config = await chainlinkLike.tokenConfigs(asset).catch(() => undefined);
    if (config) {
      if (config.feed !== ethers.constants.AddressZero) await onOracleFeed(chainlinkLike, asset, config.feed);
      return;
    }
    const correlated = new ethers.Contract(oracleAddress, CORRELATED_ORACLE.abi, ethers.provider);
    const underlying = await correlated.UNDERLYING_TOKEN().catch(() => undefined);
    if (!underlying) {
      if (!(await canStillPriceDaysLater(chainlinkLike, asset))) {
        console.warn(`Unhandled oracle ${oracleAddress} can't price ${asset} after the warp; fix it explicitly`);
      }
      return;
    }
    await walkAsset(underlying);
    const intermediate = await correlated.INTERMEDIATE_ORACLE().catch(() => undefined);
    if (intermediate) await walkOracle(intermediate, await correlated.CORRELATED_TOKEN());
  };

  const walkAsset = async (asset: string): Promise<void> => {
    if (visited.has(asset.toLowerCase())) return;
    visited.add(asset.toLowerCase());
    const { oracles, enableFlagsForOracles }: TokenConfig = await resilientOracle.getTokenConfig(asset);
    for (const [i, oracle] of oracles.entries()) {
      if (enableFlagsForOracles[i] && oracle !== ethers.constants.AddressZero) await walkOracle(oracle, asset);
    }
  };

  return walkAsset(asset);
};

// Runs `fixOracleFeed` on every oracle feed behind `asset`, unless it can still be priced days later.
const ensurePriceableDaysLater = async (resilientOracle: Contract, asset: string, fixOracleFeed: OracleFeedHandler) => {
  if (await canStillPriceDaysLater(resilientOracle, asset)) return;
  await forEachOracleFeed(resilientOracle, asset, fixOracleFeed);
  if (!(await canStillPriceDaysLater(resilientOracle, asset))) {
    throw new Error(
      `${asset} can't be priced after the governance warp; for a feed the VIP adds, use pinOracleFeedPrice`,
    );
  }
};

// Call once in before() with every asset the sim prices, so none goes stale over the VIP's ~4-day warp.
// `assets` get a 1-year stale window; `pinOnly` assets keep theirs (for sims asserting it) and get a pinned price.
// Only covers oracles enabled now; for an oracle or feed the VIP adds or changes, use pinOracleFeedPrice.
export const bypassStalePrices = async (assets: string[], { pinOnly = [] }: { pinOnly?: string[] } = {}) => {
  const resilientOracle = new ethers.Contract(
    getForkedNetworkAddress("RESILIENT_ORACLE"),
    RESILIENT_ORACLE.abi,
    ethers.provider,
  );
  const pinned = new Set(pinOnly.map(asset => asset.toLowerCase()));

  for (const asset of assets) {
    if (!pinned.has(asset.toLowerCase()))
      await ensurePriceableDaysLater(resilientOracle, asset, raiseStalePeriodOrPin(ONE_YEAR));
  }
  for (const asset of pinOnly) await ensurePriceableDaysLater(resilientOracle, asset, pinIfStale);
};

// Call in before() for a feed the VIP makes an asset read: new feed or oracle, changed config, re-enabled oracle.
// Pass the VIP's `feed`/`maxStalePeriod`, or only `asset` to use the oracle's current config.
// Pins the feed's current price if it would go stale; the pin survives the VIP's setTokenConfig.
export const pinOracleFeedPrice = async (
  oracleAddress: string,
  vipConfig: { asset: string; feed?: string; maxStalePeriod?: number },
) => {
  const { asset } = vipConfig;
  const oracle = new ethers.Contract(oracleAddress, CHAINLINK_ORACLE.abi, ethers.provider);
  const current = await oracle.tokenConfigs(asset);
  const feed: string = vipConfig.feed ?? current.feed;
  const maxStalePeriod: number = vipConfig.maxStalePeriod ?? current.maxStalePeriod.toNumber();
  if (feed === ethers.constants.AddressZero) {
    throw new Error(`${oracleAddress} has no feed for ${asset}; pass \`feed\``);
  }
  const price = await dryRun(async () => {
    await setFeed(oracle, asset, feed, maxStalePeriod);
    if (!(await canPrice(oracle, asset))) {
      throw new Error(`${feed} can't price ${asset} within ${maxStalePeriod}s: the VIP's feed config is broken`);
    }
    return livePriceIfStale(oracle, asset);
  });
  if (price) await pinPrice(oracle, asset, price);
};
