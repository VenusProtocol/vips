import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, seedProposalBatchesOnFork, testVip } from "src/vip-framework";

import { ROUTER_ROLES } from "../../vips/vip-668/permissions";
import vip673 from "../../vips/vip-673/bscmainnet";
import {
  ACM,
  ADAPTER_SPOKE_V1,
  ADAPTER_SWAPS,
  APRO_MAX_STALE_PERIOD,
  APRO_ORACLE,
  ATLAS_FEED_CANDIDATES,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  BOUND_LOWER_RATIO,
  BOUND_UPPER_RATIO,
  BOUND_VALIDATOR,
  CLOSE_FACTOR,
  COLLATERAL_GATEWAY,
  CORE_COMPTROLLER,
  CRITICAL_GUARDIAN,
  CRITICAL_TIMELOCK,
  DEVIATION_BOUNDED_ORACLE,
  FAST_TRACK_TIMELOCK,
  LIQUIDITY_IRM,
  MAINSTREAM_POOL_NAME,
  MAX_LOOPS_LIMIT,
  MIN_LIQUIDATABLE_COLLATERAL,
  MainstreamCollateralMarket,
  MainstreamLiquidityMarket,
  NORMAL_TIMELOCK,
  OPERATOR,
  ORACLE_GUARDIAN,
  PAUSE_GUARDIAN,
  PENDING,
  POOL_LIQUIDATION_INCENTIVE,
  PROTOCOL_SEIZE_SHARE,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  SpokeMarket,
  U,
  VTREASURY,
} from "../../vips/vip-675/addresses/bscmainnet";
import vip675, { PART_1 } from "../../vips/vip-675/bscmainnet";
import vip676, { PART_2 } from "../../vips/vip-675/bscmainnet-part-2";
import vip677, { PART_3 } from "../../vips/vip-675/bscmainnet-part-3";
import { Vip675Part, pendingDeployments, pendingRiskValues } from "../../vips/vip-675/commands";
import {
  VIP_675_GRANTS,
  VIP_675_ORACLE_ROLES,
  VIP_675_REGISTRY_ROLES,
} from "../../vips/vip-675/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import BOUND_VALIDATOR_ABI from "./abi/BoundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import GATEWAY_ABI from "./abi/CollateralGateway.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import REGISTRY_ABI from "./abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "./abi/VToken.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

/// After isolated-pools#575 deploys the comptroller and the 23 markets.
/// TODO: move past the VTreasury funding and Atlas's authorizations.
const FORK_BLOCK = 130250000;

const { CHAINLINK_ORACLE, REDSTONE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

const KNOWN_ACCOUNTS = [
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  CRITICAL_GUARDIAN,
  PAUSE_GUARDIAN,
  OPERATOR,
  ORACLE_GUARDIAN,
];

const account = (name: string) =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id(`vip-675 ${name}`), 12));

/// Fresh accounts. The default hardhat signer carries EIP-7702 code on BNB Chain.
const SUPPLIER = account("collateral supplier");
const STRANGER = account("stranger");
/// A `msg.sender` that holds no grant of its own, so `isAllowedToCall` asked from here answers only for the
/// address(0) wildcard.
const UNRELATED = account("unrelated sender");

/// USDT, USDC and U's Core markets, which hold each asset as cash and fund the fork.
const CORE_MARKET: Record<string, string> = Object.fromEntries(
  PART_1.liquidity.map(({ underlying, stack }) => [
    underlying,
    ADAPTER_SWAPS.find(s => s.name.startsWith(`CoreSource_${stack.name.replace("Hub_", "")}:`))!.resource,
  ]),
);

/// bStocks keep balances in OpenZeppelin v5's ERC-7201 `ERC20` namespace, so the fork sets them directly.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";

const MANTISSA_ONE = ethers.utils.parseUnits("1", 18);
const ACTION_MINT = 0;
const ACTION_BORROW = 2;
/// What `028` initializes every spoke market with.
const INITIAL_EXCHANGE_RATE = ethers.utils.parseUnits("1", 28);

const sameAddress = (a: string, b: string) => ethers.utils.getAddress(a) === ethers.utils.getAddress(b);
const normalize = (list: string[]) => list.map(a => ethers.utils.getAddress(a));
const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));
/// EIP-1967 beacon slot, `bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)`.
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";
const beaconOf = async (proxy: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, BEACON_SLOT), 12));

const ticker = (m: SpokeMarket) => m.symbol.replace(/^v/, "").replace(/_.*$/, "");

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (onBehalfOf: string, who: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [who, signature]);
  const [allowed] = ACM_IFACE.decodeFunctionResult(
    "isAllowedToCall",
    await ethers.provider.call({ to: ACM, from: onBehalfOf, data }),
  );
  return allowed;
};

const FEED_IFACE = new ethers.utils.Interface([
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
]);
/// Reads a feed with `from` set to the oracle that reads it, scaled to 18 decimals. An `eth_call` from that address
/// passes a feed's caller gate even when the oracle contract itself is not authorized, so this proves only that the
/// feed answers, not that it answers the oracle.
const readFeed = async (oracle: string, feed: string): Promise<BigNumber> => {
  const call = async (fn: string) =>
    FEED_IFACE.decodeFunctionResult(
      fn,
      await ethers.provider.call({ to: feed, from: oracle, data: FEED_IFACE.encodeFunctionData(fn) }),
    );
  const [decimals] = await call("decimals");
  const [, answer] = await call("latestRoundData");
  return BigNumber.from(answer).mul(BigNumber.from(10).pow(18 - decimals));
};

/// Seconds from the feed's last update to FORK_BLOCK. Not to the latest block: the fork's clock follows the wall clock
/// from FORK_BLOCK on, so a slow setup would age the feed.
const feedAge = async (oracle: string, feed: string): Promise<number> => {
  const data = FEED_IFACE.encodeFunctionData("latestRoundData");
  const [, , , updatedAt] = FEED_IFACE.decodeFunctionResult(
    "latestRoundData",
    await ethers.provider.call({ to: feed, from: oracle, data }),
  );
  const { timestamp } = await ethers.provider.getBlock(FORK_BLOCK);
  return timestamp - BigNumber.from(updatedAt).toNumber();
};

const ACM_EVENTS = new ethers.utils.Interface(ACM_ABI);
/// How many `name` events the ACM emitted in the transaction.
const acmEvents = async (txResponse: TransactionResponse, name: string): Promise<number> => {
  const { logs } = await txResponse.wait();
  const topic = ACM_EVENTS.getEventTopic(name);
  return logs.filter(log => sameAddress(log.address, ACM) && log.topics[0] === topic).length;
};

const fund = async (token: string, to: string, amount: BigNumber) => {
  const erc20 = new ethers.Contract(token, ERC20_ABI, ethers.provider);
  if (CORE_MARKET[token]) {
    const holder = await initMainnetUser(CORE_MARKET[token], ethers.utils.parseEther("1"));
    await erc20.connect(holder).transfer(to, amount);
    return;
  }
  const slot = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [to, OZ5_ERC20_STORAGE]),
  );
  const balance = (await erc20.balanceOf(to)).add(amount);
  await ethers.provider.send("hardhat_setStorageAt", [token, slot, ethers.utils.hexZeroPad(balance.toHexString(), 32)]);
};

/// Stands in on the fork for the canonical Atlas feed of each asset Atlas has not named one for yet, with its first
/// live feed. Every value that is set on mainnet is kept.
const standInOnFork = (part: Vip675Part): Vip675Part => ({
  ...part,
  collateral: part.collateral.map(m => ({
    ...m,
    atlasFeed: m.atlasFeed === PENDING ? ATLAS_FEED_CANDIDATES[ticker(m)][0] : m.atlasFeed,
  })),
});

const GOVERNOR_ABI = ["function state(uint256) view returns (uint8)"];
const VIP_673 = 673;
/// `ProposalState.Executed` in GovernorBravo.
const EXECUTED_STATE = 7;

/// VIP-673 is queued at FORK_BLOCK and is expected to execute before VIP-675 on mainnet, so until the fork moves past
/// its execution, apply its commands as the Normal Timelock.
const applyVip673 = async () => {
  const governor = new ethers.Contract(NETWORK_ADDRESSES.bscmainnet.GOVERNOR_PROXY, GOVERNOR_ABI, ethers.provider);
  const state: number = await governor.state(VIP_673);
  if (state === EXECUTED_STATE) return;
  await pretendExecutingVip(await vip673(), NORMAL_TIMELOCK);
  console.warn(`[vip-675] VIP-673 (state ${state}) applied on the fork`);
};

forking(FORK_BLOCK, async () => {
  await applyVip673();

  const standIns = [...new Set([PART_1, PART_2, PART_3].flatMap(pendingDeployments))];
  const [part1, part2, part3] = [PART_1, PART_2, PART_3].map(standInOnFork);
  if (standIns.length > 0) {
    console.warn(`[vip-675] stood in on the fork for: ${standIns.join(", ")}`);
  }

  const COMPTROLLER = part1.comptroller;
  const LIQUIDITY = part1.liquidity;
  const COLLATERAL_1 = part1.collateral;
  const COLLATERAL_2 = part2.collateral;
  const COLLATERAL_3 = part3.collateral;
  const COLLATERAL = [...COLLATERAL_1, ...COLLATERAL_2, ...COLLATERAL_3];
  const MARKETS_1: SpokeMarket[] = [...LIQUIDITY, ...COLLATERAL_1];
  const MARKETS: SpokeMarket[] = [...MARKETS_1, ...COLLATERAL_2, ...COLLATERAL_3];
  const newlyPriced = (markets: MainstreamCollateralMarket[]) => markets.filter(m => !m.pricedOnCore);
  const onCore = COLLATERAL.filter(m => m.pricedOnCore);

  const atlas = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const apro = new ethers.Contract(APRO_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const chainlink = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, REGISTRY_ABI, ethers.provider);
  const gateway = new ethers.Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, ethers.provider);
  const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
  const vTokenOf = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
  const erc20Of = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
  const hubOf = (address: string) => new ethers.Contract(address, HUB_ABI, ethers.provider);
  const groupOf = (address: string) => new ethers.Contract(address, YIELD_GROUP_ABI, ethers.provider);

  // The Core assets' live configs, read before anything changes, so the simulation can show VIP-675 leaves them alone.
  const coreConfigs: Record<string, unknown> = {};
  for (const m of onCore) {
    coreConfigs[m.underlying] = {
      resilient: await resilientOracle.getTokenConfig(m.underlying),
      atlas: await atlas.tokenConfigs(m.underlying),
      apro: await apro.tokenConfigs(m.underlying),
      band: await boundValidator.validateConfigs(m.underlying),
      window: await dbo.assetProtectionConfig(m.underlying),
    };
  }

  // The VTreasury pays every seed. At FORK_BLOCK it holds none of them, so the fork tops it up.
  const treasuryBefore: Record<string, BigNumber> = {};
  const timelockBefore: Record<string, BigNumber> = {};
  const fundedOnFork: string[] = [];
  for (const m of MARKETS) {
    const balance: BigNumber = await erc20Of(m.underlying).balanceOf(VTREASURY);
    if (balance.lt(m.initialSupply!)) {
      await fund(m.underlying, VTREASURY, m.initialSupply!.sub(balance));
      fundedOnFork.push(ticker(m));
    }
    treasuryBefore[m.underlying] = await erc20Of(m.underlying).balanceOf(VTREASURY);
    timelockBefore[m.underlying] = await erc20Of(m.underlying).balanceOf(NORMAL_TIMELOCK);
  }
  if (fundedOnFork.length > 0) {
    console.warn(`[vip-675] funded the VTreasury on the fork with the seed of: ${fundedOnFork.join(", ")}`);
  }

  // The feeds go stale over the simulated voting and timelock delay, so pin each feed's current answer as a direct
  // price, which `getPrice` returns without a staleness check. The oracles then never call the feeds, so the
  // simulation does not cover Atlas's caller gate.
  const prices: Record<string, BigNumber> = {};
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  for (const m of COLLATERAL) {
    prices[m.underlying] = await readFeed(ATLAS_ORACLE, m.atlasFeed);
    await atlas.connect(timelock).setDirectPrice(m.underlying, prices[m.underlying]);
    if (m.aproFeed !== null) {
      await apro.connect(timelock).setDirectPrice(m.underlying, await readFeed(APRO_ORACLE, m.aproFeed));
    }
  }
  for (const { underlying } of LIQUIDITY) {
    await chainlink.connect(timelock).setDirectPrice(underlying, MANTISSA_ONE);
    await atlas.connect(timelock).setDirectPrice(underlying, MANTISSA_ONE);
  }

  // Unpinned batches take the next free index, so each part is seeded before the next one is built. `testVip` seeds
  // part 3's.
  const proposal1 = await vip675(part1);
  await seedProposalBatchesOnFork(proposal1);
  const proposal2 = await vip676(part2);
  await seedProposalBatchesOnFork(proposal2);
  const proposal3 = await vip677(part3);

  const expectListed = async (markets: SpokeMarket[]) => {
    for (const m of markets) {
      const v = vTokenOf(m.vToken);
      const market = await comptroller.markets(m.vToken);
      expect(market.isListed, m.symbol).to.be.true;
      expect(market.collateralFactorMantissa, `${m.symbol} CF`).to.equal(m.collateralFactor);
      expect(market.liquidationThresholdMantissa, `${m.symbol} LT`).to.equal(m.liquidationThreshold);
      expect(await comptroller.supplyCaps(m.vToken), `${m.symbol} supply cap`).to.equal(m.supplyCap);
      expect(await comptroller.borrowCaps(m.vToken), `${m.symbol} borrow cap`).to.equal(m.borrowCap);
      expect(await v.reserveFactorMantissa(), `${m.symbol} RF`).to.equal(m.reserveFactor);
      expect(await v.reduceReservesBlockDelta(), `${m.symbol} delta`).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
      expect(await v.protocolSeizeShareMantissa(), `${m.symbol} seize share`).to.equal(
        "protocolSeizeShare" in m ? (m as MainstreamCollateralMarket).protocolSeizeShare : PROTOCOL_SEIZE_SHARE,
      );
      expectAddress(await v.shortfall(), NORMAL_TIMELOCK, `${m.symbol} shortfall`);
      expectAddress(await registry.getVTokenForAsset(COMPTROLLER, m.underlying), m.vToken, m.symbol);

      const supply: BigNumber = await v.totalSupply();
      expect(supply, `${m.symbol} supply`).to.equal(m.initialSupply!.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE));
      expect(await v.balanceOf(SEED_RECEIVER), `${m.symbol} receiver`).to.equal(supply);
      expect(await erc20Of(m.underlying).balanceOf(VTREASURY), `${m.symbol} treasury`).to.equal(
        treasuryBefore[m.underlying].sub(m.initialSupply!),
      );
      // `withdrawTreasuryBEP20` caps at the treasury's balance, so a short seed would come out of this balance.
      expect(await erc20Of(m.underlying).balanceOf(NORMAL_TIMELOCK), `${m.symbol} timelock`).to.equal(
        timelockBefore[m.underlying],
      );
      // `addMarket` pulls exactly the approved seed, so no approve back to 0 is needed.
      expect(await erc20Of(m.underlying).allowance(NORMAL_TIMELOCK, SPOKE_POOL_REGISTRY), m.symbol).to.equal(0);
    }
  };

  const expectCollateralSetup = async (markets: MainstreamCollateralMarket[]) => {
    for (const m of markets) {
      const incentive: BigNumber = await comptroller.effectiveLiquidationIncentive(m.vToken);
      expect(incentive, m.symbol).to.equal(m.liquidationIncentive);
      expect(incentive, `${m.symbol} incentive over seize share`).to.be.gte(MANTISSA_ONE.add(m.protocolSeizeShare));
      expect(m.liquidationThreshold.mul(incentive), m.symbol).to.be.lt(MANTISSA_ONE.mul(MANTISSA_ONE));
      expect(await comptroller.actionPaused(m.vToken, ACTION_BORROW), `${m.symbol} borrow`).to.be.true;
      expect(await comptroller.actionPaused(m.vToken, ACTION_MINT), `${m.symbol} mint`).to.be.false;
      expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), `${m.symbol} allowlist`).to.be.false;
    }
  };

  const expectPriced = async (markets: MainstreamCollateralMarket[]) => {
    for (const m of newlyPriced(markets)) {
      const pivoted = m.aproFeed !== null;
      const atlasConfig = await atlas.tokenConfigs(m.underlying);
      expectAddress(atlasConfig.feed, m.atlasFeed, `${m.symbol} Atlas feed`);
      expect(atlasConfig.maxStalePeriod, `${m.symbol} Atlas`).to.equal(ATLAS_MAX_STALE_PERIOD);
      const aproConfig = await apro.tokenConfigs(m.underlying);
      const band = await boundValidator.validateConfigs(m.underlying);
      if (pivoted) {
        expectAddress(aproConfig.feed, m.aproFeed!, `${m.symbol} APRO feed`);
        expect(aproConfig.maxStalePeriod, `${m.symbol} APRO`).to.equal(APRO_MAX_STALE_PERIOD);
        expect(band.upperBoundRatio, `${m.symbol} upper`).to.equal(BOUND_UPPER_RATIO);
        expect(band.lowerBoundRatio, `${m.symbol} lower`).to.equal(BOUND_LOWER_RATIO);
      } else {
        expect(aproConfig.asset, `${m.symbol} APRO`).to.equal(ethers.constants.AddressZero);
        expect(band.asset, `${m.symbol} band`).to.equal(ethers.constants.AddressZero);
      }

      const config = await resilientOracle.getTokenConfig(m.underlying);
      expect(normalize(config.oracles), m.symbol).to.deep.equal(
        normalize([ATLAS_ORACLE, pivoted ? APRO_ORACLE : ethers.constants.AddressZero, ethers.constants.AddressZero]),
      );
      expect([...config.enableFlagsForOracles], m.symbol).to.deep.equal([true, pivoted, false]);
      expect(config.cachingEnabled, m.symbol).to.be.false;
      expect(await resilientOracle.getPrice(m.underlying), `${m.symbol} price`).to.be.gt(0);

      const window = await dbo.assetProtectionConfig(m.underlying);
      expectAddress(window.asset, m.underlying, `${m.symbol} DBO`);
      expect(window.cooldownPeriod, `${m.symbol} cooldown`).to.equal(m.dbo!.cooldownPeriod);
      expect(window.triggerThreshold, `${m.symbol} trigger`).to.equal(m.dbo!.triggerThreshold);
      expect(window.resetThreshold, `${m.symbol} reset`).to.equal(m.dbo!.resetThreshold);
      expect(window.isBoundedPricingEnabled, `${m.symbol} bounded`).to.equal(m.dbo!.enableBoundedPricing);
      expect(window.cachingEnabled, `${m.symbol} caching`).to.equal(m.dbo!.enableCaching);
    }
  };

  const expectEventsOf = async (txResponse: TransactionResponse, part: Vip675Part) => {
    const markets = [...part.liquidity, ...part.collateral].length;
    const priced = newlyPriced(part.collateral);
    const pivoted = priced.filter(m => m.aproFeed !== null).length;
    // Atlas and APRO share the `ChainlinkOracle` event; `ResilientOracle`'s has a different signature.
    await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [priced.length + pivoted]);
    await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [priced.length]);
    await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [pivoted]);
    await expectEvents(txResponse, [DBO_ABI], ["ProtectionInitialized"], [priced.length]);
    await expectEvents(
      txResponse,
      [REGISTRY_ABI],
      ["PoolRegistered", "MarketAdded"],
      [part.createsPool ? 1 : 0, markets],
    );
    await expectEvents(
      txResponse,
      [VTOKEN_ABI],
      ["NewReduceReservesBlockDelta", "NewProtocolSeizeShare", "NewReserveFactor", "NewShortfallContract"],
      [markets, part.collateral.filter(m => !m.protocolSeizeShare.eq(PROTOCOL_SEIZE_SHARE)).length, 0, 0],
    );
    await expectEvents(
      txResponse,
      [COMPTROLLER_ABI],
      [
        "MarketSupported",
        "NewMarketLiquidationIncentive",
        "ActionPausedMarket",
        "SupplyAllowlistEnabledUpdated",
        "AllowedSupplierUpdated",
      ],
      [markets, part.collateral.length, part.collateral.length, part.liquidity.length, part.liquidity.length],
    );
    await expectEvents(
      txResponse,
      [YIELD_GROUP_ABI],
      ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
      [part.liquidity.length, part.liquidity.length, part.liquidity.length],
    );
    await expectEvents(txResponse, [HUB_ABI], ["YieldGroupCapRaised", "OuterDepositQueueSet"], [0, 0]);
    // The aggregator revokes every role it grants itself, so only part 1's 20 comptroller grants are left. The mainnet
    // ACM emits no PermissionGranted, so RoleGranted and RoleRevoked are the count.
    const granted = await acmEvents(txResponse, "RoleGranted");
    const revoked = await acmEvents(txResponse, "RoleRevoked");
    expect(granted - revoked, "grants left after execution").to.equal(part.createsPool ? VIP_675_GRANTS.length : 0);
  };

  describe("VIP-675 inputs", () => {
    it("stands in on the fork only for the Atlas feeds Atlas has not named yet, with every risk value set", async () => {
      // Fails once Atlas names a feed: put it in vips/vip-675/addresses/bscmainnet.ts and drop it from
      // ATLAS_FEED_CANDIDATES.
      expect(standIns).to.have.members(
        Object.keys(ATLAS_FEED_CANDIDATES).map(asset => `v${asset}_bStockMainstream Atlas feed`),
      );
      for (const part of [PART_1, PART_2, PART_3]) {
        expect(pendingRiskValues(part), `VIP-${part.vipNumber}`).to.deep.equal([]);
      }
    });

    it("has every Atlas feed and every new asset's APRO feed answering a price", async () => {
      for (const m of COLLATERAL) {
        expect(await readFeed(ATLAS_ORACLE, m.atlasFeed), `${m.symbol} Atlas`).to.be.gt(0);
        if (m.aproFeed !== null) {
          expect(await readFeed(APRO_ORACLE, m.aproFeed), `${m.symbol} APRO`).to.be.gt(0);
        }
      }
    });

    it("has live feeds each part could execute on: fresh, and each APRO pivot within the band of its Atlas", async () => {
      // The DBO config reads the live price, so a stale feed or a pivot outside the band reverts the whole part.
      // Checked at FORK_BLOCK, before any time travel; at execution it has to hold again.
      for (const m of newlyPriced(COLLATERAL)) {
        expect(await feedAge(ATLAS_ORACLE, m.atlasFeed), `${m.symbol} Atlas age`).to.be.lte(ATLAS_MAX_STALE_PERIOD);
        if (m.aproFeed === null) continue;
        expect(await feedAge(APRO_ORACLE, m.aproFeed), `${m.symbol} APRO age`).to.be.lte(APRO_MAX_STALE_PERIOD);
        // `BoundValidator`: pivot * 1e18 / main, inside [lower, upper].
        const ratio = (await readFeed(APRO_ORACLE, m.aproFeed))
          .mul(MANTISSA_ONE)
          .div(await readFeed(ATLAS_ORACLE, m.atlasFeed));
        expect(ratio, `${m.symbol} APRO/Atlas`).to.be.gte(BOUND_LOWER_RATIO).and.lte(BOUND_UPPER_RATIO);
      }
    });
  });

  describe("Pre-VIP: what VIP-675 relies on", () => {
    it("has no Venus oracle or DBO config for any new asset", async () => {
      const initialized = normalize(await dbo.getInitializedAssets());
      for (const m of newlyPriced(COLLATERAL)) {
        expect((await resilientOracle.getTokenConfig(m.underlying)).asset, m.symbol).to.equal(
          ethers.constants.AddressZero,
        );
        expect((await atlas.tokenConfigs(m.underlying)).feed, m.symbol).to.equal(ethers.constants.AddressZero);
        expect(initialized, m.symbol).to.not.include(ethers.utils.getAddress(m.underlying));
      }
    });

    it("prices NVDAB, TSLAB, SPCXB and SKHYB for Core with the listed feeds and a DBO window", async () => {
      for (const m of onCore) {
        const config = await resilientOracle.getTokenConfig(m.underlying);
        expect(normalize(config.oracles), m.symbol).to.deep.equal(
          normalize([ATLAS_ORACLE, APRO_ORACLE, ethers.constants.AddressZero]),
        );
        expectAddress((await atlas.tokenConfigs(m.underlying)).feed, m.atlasFeed, `${m.symbol} Atlas feed`);
        expectAddress((await apro.tokenConfigs(m.underlying)).feed, m.aproFeed!, `${m.symbol} APRO feed`);
        expectAddress((await dbo.assetProtectionConfig(m.underlying)).asset, m.underlying, `${m.symbol} DBO`);
      }
    });

    it("has the comptroller on SpokeComptrollerBeacon, nominated to the Normal Timelock and not registered", async () => {
      expectAddress(await beaconOf(COMPTROLLER), SPOKE_COMPTROLLER_BEACON);
      expectAddress(await comptroller.poolRegistry(), SPOKE_POOL_REGISTRY);
      expectAddress(await comptroller.accessControlManager(), ACM);
      expect(await comptroller.maxLoopsLimit()).to.equal(MAX_LOOPS_LIMIT);
      expectAddress(await comptroller.pendingOwner(), NORMAL_TIMELOCK);
      expect(await comptroller.oracle()).to.equal(ethers.constants.AddressZero);
      expect(await comptroller.getAllMarkets()).to.deep.equal([]);
      expect((await registry.getPoolByComptroller(COMPTROLLER)).comptroller).to.equal(ethers.constants.AddressZero);
    });

    it("builds each market on this comptroller, owned by the Normal Timelock, with the Timelock as shortfall", async () => {
      for (const m of MARKETS) {
        const v = vTokenOf(m.vToken);
        expectAddress(await beaconOf(m.vToken), SPOKE_VTOKEN_BEACON, m.symbol);
        expect(await v.symbol(), m.symbol).to.equal(m.symbol);
        expect(await v.decimals(), m.symbol).to.equal(8);
        expect(await v.totalSupply(), m.symbol).to.equal(0);
        expect(await v.exchangeRateStored(), m.symbol).to.equal(INITIAL_EXCHANGE_RATE);
        expect(await v.reserveFactorMantissa(), m.symbol).to.equal(m.reserveFactor);
        expect(await v.pendingOwner(), m.symbol).to.equal(ethers.constants.AddressZero);
        expectAddress(await v.comptroller(), COMPTROLLER, m.symbol);
        expectAddress(await v.underlying(), m.underlying, m.symbol);
        expectAddress(await v.owner(), NORMAL_TIMELOCK, m.symbol);
        expectAddress(await v.shortfall(), NORMAL_TIMELOCK, m.symbol);
        expectAddress(await v.interestRateModel(), m.interestRateModel, m.symbol);
        expect((await comptroller.markets(m.vToken)).isListed, m.symbol).to.be.false;
      }
    });

    it("has each Spoke source holding only its bStock index market", async () => {
      for (const m of LIQUIDITY) {
        const source = groupOf(m.stack.spokeSource);
        expect(normalize(await source.resources()), m.symbol).to.deep.equal(normalize([m.indexMarket]));
        expect(normalize(await source.innerDepositQueue()), m.symbol).to.deep.equal(normalize([m.indexMarket]));
        expect(normalize(await source.innerWithdrawQueue()), m.symbol).to.deep.equal(normalize([m.indexMarket]));
      }
    });

    it("gives no account a VIP-675 comptroller role as a wildcard, and no one `enterMarketForAccount` on this pool", async () => {
      for (const { role, account: holder } of VIP_675_GRANTS) {
        expect(await mayCall(UNRELATED, holder, role), `${role} as a wildcard`).to.be.false;
      }
      for (const role of ROUTER_ROLES) {
        for (const holder of [...KNOWN_ACCOUNTS, COLLATERAL_GATEWAY]) {
          expect(await mayCall(UNRELATED, holder, role), `${holder} holds ${role} as a wildcard`).to.be.false;
          expect(await mayCall(COMPTROLLER, holder, role), `${holder} holds ${role}`).to.be.false;
        }
      }
    });

    it("has every underlying at 18 decimals, accepting a zero-value transfer", async () => {
      // Every amount in vips/vip-675/addresses/bscmainnet.ts is 18-decimal. A token that rejects a zero-value
      // transfer can block `healAccount` on dust collateral.
      const data = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [UNRELATED, 0]);
      for (const m of MARKETS) {
        expect(await erc20Of(m.underlying).decimals(), m.symbol).to.equal(18);
        const result = await ethers.provider.call({ to: m.underlying, data, from: SUPPLIER });
        expect(ethers.utils.defaultAbiCoder.decode(["bool"], result)[0], m.symbol).to.be.true;
      }
    });

    it("prices USDT, USDC and U as the listing sheet does, with no DBO window, so VIP-675 changes none of them", async () => {
      const initialized = normalize(await dbo.getInitializedAssets());
      for (const { symbol, underlying } of LIQUIDITY) {
        const config = await resilientOracle.getTokenConfig(underlying);
        const hasFallback = !sameAddress(underlying, U);
        expect(normalize(config.oracles), symbol).to.deep.equal(
          normalize([CHAINLINK_ORACLE, ATLAS_ORACLE, hasFallback ? REDSTONE_ORACLE : ethers.constants.AddressZero]),
        );
        expect([...config.enableFlagsForOracles], symbol).to.deep.equal([true, true, hasFallback]);
        expect(initialized, symbol).to.not.include(ethers.utils.getAddress(underlying));
      }
    });

    it("builds the liquidity markets on the listing sheet's rate model, and the bStock markets on one that charges 0", async () => {
      const IRM_ABI = [
        "function baseRatePerBlock() view returns (uint256)",
        "function multiplierPerBlock() view returns (uint256)",
        "function jumpMultiplierPerBlock() view returns (uint256)",
        "function kink() view returns (uint256)",
        "function blocksOrSecondsPerYear() view returns (uint256)",
        "function getBorrowRate(uint256,uint256,uint256,uint256) view returns (uint256)",
      ];
      for (const m of LIQUIDITY) {
        const irm = new ethers.Contract(m.interestRateModel, IRM_ABI, ethers.provider);
        const perYear: BigNumber = await irm.blocksOrSecondsPerYear();
        expect(perYear, `${m.symbol} slots per year`).to.equal(await vTokenOf(m.vToken).blocksOrSecondsPerYear());
        expect(await irm.baseRatePerBlock(), `${m.symbol} base`).to.equal(LIQUIDITY_IRM.baseRatePerYear.div(perYear));
        expect(await irm.multiplierPerBlock(), `${m.symbol} multiplier`).to.equal(
          LIQUIDITY_IRM.multiplierPerYear.div(perYear),
        );
        expect(await irm.jumpMultiplierPerBlock(), `${m.symbol} jump`).to.equal(
          LIQUIDITY_IRM.jumpMultiplierPerYear.div(perYear),
        );
        expect(await irm.kink(), `${m.symbol} kink`).to.equal(LIQUIDITY_IRM.kink);
      }
      // Unused, half used and fully used.
      const utilizations = [
        [MANTISSA_ONE, 0],
        [MANTISSA_ONE, MANTISSA_ONE],
        [0, MANTISSA_ONE],
      ];
      for (const m of COLLATERAL) {
        const irm = new ethers.Contract(m.interestRateModel, IRM_ABI, ethers.provider);
        for (const [cash, borrows] of utilizations) {
          expect(await irm.getBorrowRate(cash, borrows, 0, 0), m.symbol).to.equal(0);
        }
      }
    });

    it("lets the Normal Timelock price the new assets, list the markets and pay the seeds", async () => {
      for (const { contract, role } of VIP_675_ORACLE_ROLES) {
        expect(await mayCall(contract, NORMAL_TIMELOCK, role), `${contract}: ${role}`).to.be.true;
      }
      for (const role of VIP_675_REGISTRY_ROLES) {
        expect(await mayCall(SPOKE_POOL_REGISTRY, NORMAL_TIMELOCK, role), role).to.be.true;
      }
      const treasury = new ethers.Contract(VTREASURY, ["function owner() view returns (address)"], ethers.provider);
      expectAddress(await treasury.owner(), NORMAL_TIMELOCK);
    });

    it("has the ProtocolShareReserve resolving pools through the spoke registry", async () => {
      // Without it every liquidation in the pool reverts, and so does every accrual that sweeps reserves.
      expect(normalize(await psr.getPoolRegistries())).to.include(ethers.utils.getAddress(SPOKE_POOL_REGISTRY));
      for (const m of MARKETS) {
        expectAddress(await vTokenOf(m.vToken).protocolShareReserve(), PROTOCOL_SHARE_RESERVE, m.symbol);
      }
    });

    it("has CollateralGateway built on the Core comptroller and the spoke registry, owned by the Normal Timelock", async () => {
      expectAddress(await gateway.COMPTROLLER(), CORE_COMPTROLLER);
      expectAddress(await gateway.POOL_REGISTRY(), SPOKE_POOL_REGISTRY);
      expectAddress(await gateway.owner(), NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-675 [bscmainnet] bStock mainstream Spoke pool, part 1", proposal1, {
    seedProposalBatches: false,
    callbackAfterExecution: async txResponse => {
      await expectEventsOf(txResponse, part1);
    },
  });

  describe("Post-VIP-675", () => {
    it("registers the pool, owned by the Normal Timelock and wired to both oracles", async () => {
      const pool = await registry.getPoolByComptroller(COMPTROLLER);
      expect(pool.name).to.equal(MAINSTREAM_POOL_NAME);
      expectAddress(pool.comptroller, COMPTROLLER);
      expectAddress(await comptroller.owner(), NORMAL_TIMELOCK);
      expectAddress(await comptroller.oracle(), RESILIENT_ORACLE);
      expectAddress(await comptroller.deviationBoundedOracle(), DEVIATION_BOUNDED_ORACLE);
      expect(await comptroller.closeFactorMantissa()).to.equal(CLOSE_FACTOR);
      expect(await comptroller.liquidationIncentiveMantissa()).to.equal(POOL_LIQUIDATION_INCENTIVE);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(MIN_LIQUIDATABLE_COLLATERAL);
      expect(await comptroller.isLiquidationAllowlistEnabled()).to.be.false;
      expectAddress((await registry.getPoolByComptroller(SPOKE_COMPTROLLER)).comptroller, SPOKE_COMPTROLLER);
    });

    it("prices part 1's new assets, and leaves the Core assets' configs as they were", async () => {
      await expectPriced(COLLATERAL_1);
      for (const m of onCore) {
        expect(
          {
            resilient: await resilientOracle.getTokenConfig(m.underlying),
            atlas: await atlas.tokenConfigs(m.underlying),
            apro: await apro.tokenConfigs(m.underlying),
            band: await boundValidator.validateConfigs(m.underlying),
            window: await dbo.assetProtectionConfig(m.underlying),
          },
          m.symbol,
        ).to.deep.equal(coreConfigs[m.underlying]);
      }
    });

    it("lists part 1's markets with their risk values and seeds, paid by the VTreasury", async () => {
      await expectListed(MARKETS_1);
      for (const m of [...COLLATERAL_2, ...COLLATERAL_3]) {
        expect((await comptroller.markets(m.vToken)).isListed, m.symbol).to.be.false;
      }
    });

    it("gives each collateral market its own incentive and seize share, and pauses its borrowing", async () => {
      await expectCollateralSetup(COLLATERAL_1);
    });

    it("restricts supply on each liquidity market to its Spoke source", async () => {
      const stranger = await initMainnetUser(STRANGER, ethers.utils.parseEther("1"));
      for (const m of LIQUIDITY) {
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), m.symbol).to.be.true;
        expect(await comptroller.isAllowedSupplier(m.vToken, m.stack.spokeSource), m.symbol).to.be.true;
        expect(await comptroller.actionPaused(m.vToken, ACTION_BORROW), m.symbol).to.be.false;
        await fund(m.underlying, STRANGER, MANTISSA_ONE);
        await erc20Of(m.underlying).connect(stranger).approve(m.vToken, MANTISSA_ONE);
        await expect(vTokenOf(m.vToken).connect(stranger).mint(MANTISSA_ONE)).to.be.revertedWithCustomError(
          comptroller,
          "SupplyNotAllowed",
        );
      }
    });

    it("grants every comptroller role to its holder against this comptroller only", async () => {
      for (const { role, account: holder } of VIP_675_GRANTS) {
        expect(await mayCall(COMPTROLLER, holder, role), `${holder} may ${role}`).to.be.true;
        expect(await mayCall(UNRELATED, holder, role), `${role} as a wildcard`).to.be.false;
      }
      // Its holder can make any account's supply seizable collateral, so none of the protocol's own accounts holds it.
      for (const role of ROUTER_ROLES) {
        for (const holder of KNOWN_ACCOUNTS) {
          expect(await mayCall(COMPTROLLER, holder, role), `${holder} may ${role}`).to.be.false;
        }
      }
    });

    it("keeps the pool-wide incentive, which the liquidity markets fall back to, above their seize share", async () => {
      const poolWide: BigNumber = await comptroller.liquidationIncentiveMantissa();
      for (const m of LIQUIDITY) {
        expect(await comptroller.effectiveLiquidationIncentive(m.vToken), m.symbol).to.equal(
          POOL_LIQUIDATION_INCENTIVE,
        );
        expect(poolWide, m.symbol).to.be.gte(MANTISSA_ONE.add(await vTokenOf(m.vToken).protocolSeizeShareMantissa()));
      }
    });

    it("adds each liquidity market to its Spoke source, after the bStock index market to deposit, first to withdraw", async () => {
      for (const m of LIQUIDITY) {
        const source = groupOf(m.stack.spokeSource);
        expect(normalize(await source.resources()), m.symbol).to.deep.equal(normalize([m.indexMarket, m.vToken]));
        const [registered, paused, adapter] = await source.resourceConfig(m.vToken);
        expect(registered, m.symbol).to.be.true;
        expect(paused, m.symbol).to.be.false;
        expectAddress(adapter, ADAPTER_SPOKE_V1, m.symbol);
        expect(normalize(await source.innerDepositQueue()), `${m.symbol} deposit`).to.deep.equal(
          normalize([m.indexMarket, m.vToken]),
        );
        expect(normalize(await source.innerWithdrawQueue()), `${m.symbol} withdraw`).to.deep.equal(
          normalize([m.vToken, m.indexMarket]),
        );
      }
    });

    it("lets the Operator move Hub liquidity into each bStock mainstream market, at no cost to the Hub", async () => {
      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      const amount = ethers.utils.parseUnits("1000", 18);
      for (const m of LIQUIDITY) {
        const hub = hubOf(m.stack.hub).connect(operator);
        const into = { yieldGroup: m.stack.spokeSource, resource: m.vToken, amount };
        let from: typeof into | undefined;
        for (const yieldGroup of m.stack.depositQueue) {
          for (const resource of (await groupOf(yieldGroup).resources()) as string[]) {
            const leg = { yieldGroup, resource, amount };
            if (
              !from &&
              (await hub.callStatic.reallocate([leg], [into]).then(
                () => true,
                () => false,
              ))
            ) {
              from = leg;
            }
          }
        }
        expect(from, `${m.stack.name} has no group that can fund the move`).to.not.equal(undefined);
        const cashBefore: BigNumber = await vTokenOf(m.vToken).getCash();
        const hubBefore: BigNumber = await hubOf(m.stack.hub).totalAssets();
        await hub.reallocate([from], [into]);
        expect((await vTokenOf(m.vToken).getCash()).sub(cashBefore), m.symbol).to.equal(amount);
        expect(await vTokenOf(m.vToken).balanceOf(m.stack.spokeSource), m.symbol).to.be.gt(0);
        expect(await hubOf(m.stack.hub).totalAssets(), `${m.stack.name} value`).to.be.gte(hubBefore.sub(MANTISSA_ONE));
      }
    });

    it("takes a collateral market through CollateralGateway and lends USDT against it", async () => {
      const [collateral] = COLLATERAL_1;
      const [usdt] = LIQUIDITY;
      const supplier = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      const supply = MANTISSA_ONE;
      await fund(collateral.underlying, SUPPLIER, supply);
      await erc20Of(collateral.underlying).connect(supplier).approve(COLLATERAL_GATEWAY, supply);
      await gateway.connect(supplier).supplyAndEnterSpokeMarkets([collateral.vToken], [supply]);
      expect(await comptroller.checkMembership(SUPPLIER, collateral.vToken)).to.be.true;

      // A third of the collateral's value, under every collateral factor.
      const borrow = supply.mul(prices[collateral.underlying]).div(MANTISSA_ONE).div(3);
      const balance: BigNumber = await erc20Of(usdt.underlying).balanceOf(SUPPLIER);
      await vTokenOf(usdt.vToken).connect(supplier).borrow(borrow);
      expect((await erc20Of(usdt.underlying).balanceOf(SUPPLIER)).sub(balance)).to.equal(borrow);
      const [, , shortfall] = await comptroller.getAccountLiquidity(SUPPLIER);
      expect(shortfall).to.equal(0);
      await expect(vTokenOf(collateral.vToken).connect(supplier).borrow(1)).to.be.revertedWithCustomError(
        comptroller,
        "ActionPaused",
      );
    });
  });

  testVip("VIP-676 [bscmainnet] bStock mainstream Spoke pool, part 2", proposal2, {
    seedProposalBatches: false,
    callbackAfterExecution: async txResponse => {
      await expectEventsOf(txResponse, part2);
    },
  });

  describe("Post-VIP-676", () => {
    it("prices part 2's assets", async () => {
      await expectPriced(COLLATERAL_2);
    });

    it("lists part 2's markets with their risk values and seeds, paid by the VTreasury", async () => {
      await expectListed(COLLATERAL_2);
    });

    it("gives each part 2 market its own incentive and seize share, and pauses its borrowing", async () => {
      await expectCollateralSetup(COLLATERAL_2);
    });

    it("lends USDC against a part 2 collateral market", async () => {
      const collateral = COLLATERAL_2[COLLATERAL_2.length - 1];
      const usdc = LIQUIDITY[1];
      const supplier = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      const supply = MANTISSA_ONE;
      await fund(collateral.underlying, SUPPLIER, supply);
      await erc20Of(collateral.underlying).connect(supplier).approve(COLLATERAL_GATEWAY, supply);
      await gateway.connect(supplier).supplyAndEnterSpokeMarkets([collateral.vToken], [supply]);

      const borrow = supply.mul(prices[collateral.underlying]).div(MANTISSA_ONE).div(3);
      const balance: BigNumber = await erc20Of(usdc.underlying).balanceOf(SUPPLIER);
      await vTokenOf(usdc.vToken).connect(supplier).borrow(borrow);
      expect((await erc20Of(usdc.underlying).balanceOf(SUPPLIER)).sub(balance)).to.equal(borrow);
      const [, , shortfall] = await comptroller.getAccountLiquidity(SUPPLIER);
      expect(shortfall).to.equal(0);
    });
  });

  testVip("VIP-677 [bscmainnet] bStock mainstream Spoke pool, part 3", proposal3, {
    callbackAfterExecution: async txResponse => {
      await expectEventsOf(txResponse, part3);
    },
  });

  describe("Post-VIP-677", () => {
    it("prices part 3's assets", async () => {
      await expectPriced(COLLATERAL_3);
    });

    it("lists part 3's markets with their risk values and seeds, paid by the VTreasury", async () => {
      await expectListed(COLLATERAL_3);
    });

    it("gives each part 3 market its own incentive and seize share, and pauses its borrowing", async () => {
      await expectCollateralSetup(COLLATERAL_3);
    });

    it("holds every market in the pool, and none of them in the bStock index pool", async () => {
      expect(normalize(await comptroller.getAllMarkets())).to.deep.equal(normalize(MARKETS.map(m => m.vToken)));
      const index = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
      for (const m of MARKETS) {
        expect((await index.markets(m.vToken)).isListed, m.symbol).to.be.false;
      }
    });

    it("lends U against a part 3 collateral market", async () => {
      const collateral = COLLATERAL_3[COLLATERAL_3.length - 1];
      const u = LIQUIDITY[2];
      const supplier = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      const supply = MANTISSA_ONE;
      await fund(collateral.underlying, SUPPLIER, supply);
      await erc20Of(collateral.underlying).connect(supplier).approve(COLLATERAL_GATEWAY, supply);
      await gateway.connect(supplier).supplyAndEnterSpokeMarkets([collateral.vToken], [supply]);

      const borrow = supply.mul(prices[collateral.underlying]).div(MANTISSA_ONE).div(3);
      const balance: BigNumber = await erc20Of(u.underlying).balanceOf(SUPPLIER);
      await vTokenOf(u.vToken).connect(supplier).borrow(borrow);
      expect((await erc20Of(u.underlying).balanceOf(SUPPLIER)).sub(balance)).to.equal(borrow);
      const [, , shortfall] = await comptroller.getAccountLiquidity(SUPPLIER);
      expect(shortfall).to.equal(0);
    });
  });

  // The paths the pool exists for, across all three parts: every bStock taken as collateral in one call, a loan of
  // each liquidity asset and its liquidation after a price drop, a day of interest reaching the Hubs and the
  // ProtocolShareReserve, full repayment, and each Hub drawing its liquidity back out of the bStock mainstream market
  // first.
  // Runs last: it halves prices and moves the clock.
  describe("Post-VIP-677: end to end, across the whole pool", () => {
    const HOLDER = account("e2e holder");
    const LIQUIDATOR = account("e2e liquidator");
    const borrowerOf = (c: MainstreamCollateralMarket) => account(`e2e borrower ${c.symbol}`);
    /// Each loan's collateral is worth $1,000. Half of it is still above the $100 minimum liquidatable collateral.
    const COLLATERAL_VALUE = ethers.utils.parseUnits("1000", 18);
    /// 45% of the collateral's value: under every collateral factor (50% at the lowest), and above what any liquidation
    /// threshold (80% at the highest) covers once the price halves. Underlyings and prices are all 18-decimal.
    const LOAN = COLLATERAL_VALUE.mul(45).div(100);
    const market = (asset: string) => COLLATERAL.find(m => ticker(m) === asset)!;
    /// One bStock from each part, each against a different liquidity asset: one priced for Core, a new one with an APRO
    /// pivot and a new one priced by Atlas alone.
    const POSITIONS = [
      { collateral: market("NVDAB"), debt: LIQUIDITY[0] },
      { collateral: market("METAB"), debt: LIQUIDITY[1] },
      { collateral: market("INTCB"), debt: LIQUIDITY[2] },
    ];
    const supplied: Record<string, BigNumber> = {};
    let timelock: Awaited<ReturnType<typeof initMainnetUser>>;

    /// Atlas and APRO move together, so the band between them holds.
    const pinPrice = async (c: MainstreamCollateralMarket, value: BigNumber) => {
      await atlas.connect(timelock).setDirectPrice(c.underlying, value);
      if (c.aproFeed !== null) {
        await apro.connect(timelock).setDirectPrice(c.underlying, value);
      }
    };

    before(async () => {
      timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
    });

    it("takes all 20 bStocks as collateral in one CollateralGateway call, and lends none of them", async () => {
      const holder = await initMainnetUser(HOLDER, ethers.utils.parseEther("1"));
      for (const m of COLLATERAL) {
        await fund(m.underlying, HOLDER, m.initialSupply!);
        await erc20Of(m.underlying).connect(holder).approve(COLLATERAL_GATEWAY, m.initialSupply!);
      }
      await gateway.connect(holder).supplyAndEnterSpokeMarkets(
        COLLATERAL.map(m => m.vToken),
        COLLATERAL.map(m => m.initialSupply!),
      );
      for (const m of COLLATERAL) {
        expect(await vTokenOf(m.vToken).balanceOf(HOLDER), m.symbol).to.equal(
          m.initialSupply!.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE),
        );
        expect(await comptroller.checkMembership(HOLDER, m.vToken), m.symbol).to.be.true;
        await expect(vTokenOf(m.vToken).connect(holder).borrow(1), m.symbol).to.be.revertedWithCustomError(
          comptroller,
          "ActionPaused",
        );
      }
      const [, liquidity, shortfall] = await comptroller.getAccountLiquidity(HOLDER);
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
    });

    for (const { collateral: c, debt } of POSITIONS) {
      it(`lends ${ticker(debt)} against ${ticker(c)}, and liquidates the loan after ${ticker(c)} halves`, async () => {
        const borrower = await initMainnetUser(borrowerOf(c), ethers.utils.parseEther("1"));
        supplied[c.underlying] = COLLATERAL_VALUE.mul(MANTISSA_ONE).div(prices[c.underlying]);
        await fund(c.underlying, borrower.address, supplied[c.underlying]);
        await erc20Of(c.underlying).connect(borrower).approve(COLLATERAL_GATEWAY, supplied[c.underlying]);
        await gateway.connect(borrower).supplyAndEnterSpokeMarkets([c.vToken], [supplied[c.underlying]]);
        await vTokenOf(debt.vToken).connect(borrower).borrow(LOAN);
        expect(await erc20Of(debt.underlying).balanceOf(borrower.address), debt.symbol).to.equal(LOAN);

        // At half the price, the largest LT (80%) covers $400 of the $450 debt.
        await pinPrice(c, prices[c.underlying].div(2));
        const [, , shortfall] = await comptroller.getAccountLiquidity(borrower.address);
        expect(shortfall, "shortfall").to.be.gt(0);

        // Half of the 50% close factor.
        const repay = LOAN.div(4);
        const liquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
        await fund(debt.underlying, LIQUIDATOR, repay);
        await erc20Of(debt.underlying).connect(liquidator).approve(debt.vToken, repay);
        const seizedBefore: BigNumber = await vTokenOf(c.vToken).balanceOf(LIQUIDATOR);
        const reserveBefore: BigNumber = await erc20Of(c.underlying).balanceOf(PROTOCOL_SHARE_RESERVE);
        await vTokenOf(debt.vToken).connect(liquidator).liquidateBorrow(borrower.address, repay, c.vToken);
        expect(await vTokenOf(debt.vToken).borrowBalanceStored(borrower.address), "debt").to.be.lt(LOAN);
        expect(await vTokenOf(c.vToken).balanceOf(LIQUIDATOR), "seized").to.be.gt(seizedBefore);
        expect(await erc20Of(c.underlying).balanceOf(PROTOCOL_SHARE_RESERVE), "PSR").to.be.gt(reserveBefore);

        await pinPrice(c, prices[c.underlying]);
      });
    }

    it("passes a day of interest through each Spoke source to its Hub, and sweeps the reserves to the PSR", async () => {
      const state = async (m: MainstreamLiquidityMarket) => ({
        borrows: (await vTokenOf(m.vToken).totalBorrows()) as BigNumber,
        source: (await groupOf(m.stack.spokeSource).totalAssets()) as BigNumber,
        hub: (await hubOf(m.stack.hub).totalAssets()) as BigNumber,
        psr: (await erc20Of(m.underlying).balanceOf(PROTOCOL_SHARE_RESERVE)) as BigNumber,
      });
      const before: Record<string, Awaited<ReturnType<typeof state>>> = {};
      for (const m of LIQUIDITY) {
        await vTokenOf(m.vToken).connect(timelock).accrueInterest();
        before[m.underlying] = await state(m);
      }
      // 192,000 blocks, a day at 0.45s, and well past the reserve delta.
      await ethers.provider.send("hardhat_mine", ["0x2EE00", "0x1"]);
      for (const m of LIQUIDITY) {
        await vTokenOf(m.vToken).connect(timelock).accrueInterest();
        const after = await state(m);
        expect(after.borrows, `${m.symbol} borrows`).to.be.gt(before[m.underlying].borrows);
        expect(after.source, `${m.stack.name} Spoke source`).to.be.gt(before[m.underlying].source);
        expect(after.hub, m.stack.name).to.be.gt(before[m.underlying].hub);
        expect(after.psr, `${m.symbol} reserves`).to.be.gt(before[m.underlying].psr);
        expect(await vTokenOf(m.vToken).totalReserves(), `${m.symbol} reserves left`).to.equal(0);
      }
    });

    it("lets each borrower repay in full and take the rest of the collateral back", async () => {
      for (const { collateral: c, debt } of POSITIONS) {
        const borrower = await initMainnetUser(borrowerOf(c), ethers.utils.parseEther("1"));
        const v = vTokenOf(debt.vToken).connect(borrower);
        await v.accrueInterest();
        // Headroom for interest. The loan the borrower still holds already covers the debt the liquidation left.
        await fund(debt.underlying, borrower.address, (await v.borrowBalanceStored(borrower.address)).div(100));
        await erc20Of(debt.underlying).connect(borrower).approve(debt.vToken, ethers.constants.MaxUint256);
        await v.repayBorrow(ethers.constants.MaxUint256);
        expect(await v.borrowBalanceStored(borrower.address), debt.symbol).to.equal(0);

        const vCollateral = vTokenOf(c.vToken).connect(borrower);
        await vCollateral.redeem(await vCollateral.balanceOf(borrower.address));
        await comptroller.connect(borrower).exitMarket(c.vToken);
        expect(await vCollateral.balanceOf(borrower.address), c.symbol).to.equal(0);
        expect(await comptroller.checkMembership(borrower.address, c.vToken), c.symbol).to.be.false;
        // What the liquidation did not seize. The liquidator took less than half.
        const left: BigNumber = await erc20Of(c.underlying).balanceOf(borrower.address);
        expect(left, c.symbol).to.be.gt(supplied[c.underlying].div(2)).and.lt(supplied[c.underlying]);
      }
    });

    it("draws each Hub's withdrawal from its bStock mainstream market first, leaving the bStock index market alone", async () => {
      // A Hub withdrawal reaches its Spoke source last, after every other group, so it is called here as the Hub
      // calls it.
      const amount = ethers.utils.parseUnits("100", 18);
      for (const m of LIQUIDITY) {
        const hub = await initMainnetUser(m.stack.hub, ethers.utils.parseEther("1"));
        const held: BigNumber = await vTokenOf(m.vToken).balanceOf(m.stack.spokeSource);
        const heldInIndex: BigNumber = await vTokenOf(m.indexMarket).balanceOf(m.stack.spokeSource);
        const hubBalance: BigNumber = await erc20Of(m.underlying).balanceOf(m.stack.hub);
        await groupOf(m.stack.spokeSource).connect(hub).withdraw(amount, m.stack.hub);
        expect(await erc20Of(m.underlying).balanceOf(m.stack.hub), m.symbol).to.equal(hubBalance.add(amount));
        expect(await vTokenOf(m.vToken).balanceOf(m.stack.spokeSource), m.symbol).to.be.lt(held);
        expect(await vTokenOf(m.indexMarket).balanceOf(m.stack.spokeSource), `${m.symbol} index`).to.equal(heldInIndex);
      }
    });
  });
});
