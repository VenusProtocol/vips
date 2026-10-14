import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  ADAPTER_SPOKE_V1,
  ADAPTER_SWAPS,
  APRO_MAX_STALE_PERIOD,
  APRO_ORACLE,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  BOUND_LOWER_RATIO,
  BOUND_UPPER_RATIO,
  BOUND_VALIDATOR,
  BSTOCK_LIQUIDATOR,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS,
  CORE_COMPTROLLER,
  CRITICAL_GUARDIAN,
  CRITICAL_TIMELOCK,
  DEVIATION_BOUNDED_ORACLE,
  FAST_TRACK_TIMELOCK,
  LIQUIDITY_IRM,
  LIQUIDITY_MARKETS,
  NORMAL_TIMELOCK,
  OPERATOR,
  ORACLE_GUARDIAN,
  PAUSE_GUARDIAN,
  POOL_LIQUIDATION_INCENTIVE,
  PROTOCOL_SEIZE_SHARE,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SHORTFALL,
  SPOKE_COMPTROLLER,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  SpokeMarket,
  U,
  VTREASURY,
} from "../../vips/vip-671/addresses/bscmainnet";
import vip671Part3Bscmainnet, { pendingDeployments, pendingRiskValues } from "../../vips/vip-671/bscmainnet-part-3";
import {
  ADD_RESOURCE,
  PAUSE_ROLE,
  ROUTER_ROLES,
  SET_ALLOWED_SUPPLIER,
  SET_INNER_DEPOSIT_QUEUE,
  SET_INNER_WITHDRAW_QUEUE,
  SET_MARKET_LIQUIDATION_INCENTIVE,
  SET_SUPPLY_ALLOWLIST_ENABLED,
} from "../../vips/vip-671/permissions";
import { VIP_C_GRANTS, VIP_C_ROLES_CALLED } from "../../vips/vip-671/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterSpokeV1.json";
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

/// TODO(deploy): move past the blocks where VIP-A and VIP-B execute and VIP-C's contracts deploy, so the gated
/// assertions below run against the real state. Until then this block only checks what VIP-C relies on from the
/// live chain.
const FORK_BLOCK = 127552000;

const { CHAINLINK_ORACLE, REDSTONE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

/// EIP-1967 beacon slot, `bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)`.
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

/// A `msg.sender` that holds no grant of its own, so `isAllowedToCall` asked from here answers only for the
/// address(0) wildcard.
const UNRELATED = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 unrelated sender"), 12));

/// Fresh accounts. The default hardhat signer carries EIP-7702 code on BNB Chain.
const DEPOSITOR = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 hub depositor"), 12));
const SUPPLIER = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 collateral supplier"), 12));

const KNOWN_ACCOUNTS = [
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  CRITICAL_GUARDIAN,
  PAUSE_GUARDIAN,
  OPERATOR,
  ORACLE_GUARDIAN,
];

const MARKETS: SpokeMarket[] = [...LIQUIDITY_MARKETS, ...COLLATERAL_MARKETS];

/// Each liquidity asset's Core market, which holds the asset as cash. It funds the fork, and it is the flash source
/// `BStockLiquidator` repays spoke debt with.
const CORE_MARKET: Record<string, string> = Object.fromEntries(
  LIQUIDITY_MARKETS.map(({ underlying, stack }) => [
    underlying,
    ADAPTER_SWAPS.find(s => s.name.startsWith(`CoreSource_${stack.name.replace("Hub_", "")}:`))!.resource,
  ]),
);

/// QQQB and SPYB keep balances in OpenZeppelin v5's ERC-7201 `ERC20` namespace (probed on chain), and no Venus
/// market holds them, so the fork sets their balances directly.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";

const MANTISSA_ONE = ethers.utils.parseUnits("1", 18);
const ACTION_MINT = 0;
const ACTION_BORROW = 2;
const DEPOSIT = ethers.utils.parseUnits("1000", 18);
const COLLATERAL_SUPPLY = ethers.utils.parseUnits("1", 18);

/// 10 ** (18 + underlying decimals - 8), with 18-decimal underlyings. `028` initializes every market with it.
const INITIAL_EXCHANGE_RATE = ethers.utils.parseUnits("1", 28);

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (onBehalfOf: string, account: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACM, data, from: onBehalfOf });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};

const sameAddress = (a: string, b: string) => ethers.utils.getAddress(a) === ethers.utils.getAddress(b);
const normalize = (list: string[]) => list.map(a => ethers.utils.getAddress(a));

const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));

const readSlotAddress = async (proxy: string, slot: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, slot), 12));

/// APRO's feeds answer only authorized callers (`OnlyAuthorizedCallerAllowed`), so each feed is read as the oracle
/// that reads it on chain. Returns the answer scaled to 18 decimals, as `ChainlinkOracle` scales it.
const FEED_IFACE = new ethers.utils.Interface([
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
]);
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

forking(FORK_BLOCK, async () => {
  const missing = [...pendingDeployments(), ...pendingRiskValues()];

  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
  const atlas = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const apro = new ethers.Contract(APRO_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
  const comptroller = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, REGISTRY_ABI, ethers.provider);
  const gateway = new ethers.Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, ethers.provider);
  const vTokenOf = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
  const erc20Of = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
  const hubOf = (address: string) => new ethers.Contract(address, HUB_ABI, ethers.provider);
  const groupOf = (address: string) => new ethers.Contract(address, YIELD_GROUP_ABI, ethers.provider);

  // What VIP-C relies on, read from the live chain. Needs no new deployment, so it runs on every fork block.
  describe("Pre-VIP: what VIP-C relies on, on the live chain", () => {
    it("has QQQB and SPYB at 18 decimals, with no Venus oracle or DBO config yet", async () => {
      // The DBO's `setTokenConfig` reverts `MarketAlreadyInitialized` on a second call.
      for (const { symbol, underlying } of COLLATERAL_MARKETS) {
        expect(await erc20Of(underlying).decimals(), symbol).to.equal(18);
        expect((await atlas.tokenConfigs(underlying)).asset, `${symbol} Atlas`).to.equal(ethers.constants.AddressZero);
        expect((await apro.tokenConfigs(underlying)).asset, `${symbol} APRO`).to.equal(ethers.constants.AddressZero);
        expect((await boundValidator.validateConfigs(underlying)).asset, `${symbol} band`).to.equal(
          ethers.constants.AddressZero,
        );
        expect((await resilientOracle.getTokenConfig(underlying)).asset, `${symbol} ResilientOracle`).to.equal(
          ethers.constants.AddressZero,
        );
        expect((await dbo.assetProtectionConfig(underlying)).asset, `${symbol} DBO`).to.equal(
          ethers.constants.AddressZero,
        );
      }
    });

    it("has QQQB and SPYB accept a zero-value transfer", async () => {
      // Required of every listed underlying (shipment plan, Section 1.1): a token that rejects one can block
      // `healAccount` on dust collateral.
      const data = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [UNRELATED, 0]);
      for (const { symbol, underlying } of COLLATERAL_MARKETS) {
        const result = await ethers.provider.call({ to: underlying, data, from: SUPPLIER });
        expect(ethers.utils.defaultAbiCoder.decode(["bool"], result)[0], symbol).to.be.true;
      }
    });

    it("prices USDT, USDC and U as the risk sheet does, so VIP-C changes none of them", async () => {
      for (const { symbol, underlying } of LIQUIDITY_MARKETS) {
        const config = await resilientOracle.getTokenConfig(underlying);
        const hasFallback = !sameAddress(underlying, U);
        expect(normalize(config.oracles), symbol).to.deep.equal(
          normalize([CHAINLINK_ORACLE, ATLAS_ORACLE, hasFallback ? REDSTONE_ORACLE : ethers.constants.AddressZero]),
        );
        expect([...config.enableFlagsForOracles], symbol).to.deep.equal([true, true, hasFallback]);
      }
    });

    it("gives the Normal Timelock every oracle and Hub role VIP-C calls, as exact grants", async () => {
      for (const { contract, role } of VIP_C_ROLES_CALLED) {
        expect(await mayCall(contract, NORMAL_TIMELOCK, role), `${contract}: ${role}`).to.be.true;
        expect(await mayCall(UNRELATED, NORMAL_TIMELOCK, role), `${role} as a wildcard`).to.be.false;
      }
    });

    it("gives no account `enterMarketForAccount` as a wildcard", async () => {
      for (const role of ROUTER_ROLES) {
        for (const account of KNOWN_ACCOUNTS) {
          expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
        }
      }
    });

    it("lets the Normal Timelock pay the seeds out of the VTreasury", async () => {
      const treasury = new ethers.Contract(VTREASURY, ["function owner() view returns (address)"], ethers.provider);
      expectAddress(await treasury.owner(), NORMAL_TIMELOCK);
    });

    it("has the deposit queues VIP-C puts each Spoke source in front of", async () => {
      // The Operator holds `setOuterDepositQueue`, so this can move before execution.
      for (const { stack } of LIQUIDITY_MARKETS) {
        expect(normalize(await hubOf(stack.hub).outerDepositQueue()), stack.name).to.deep.equal(
          normalize(stack.depositQueue),
        );
      }
    });
  });

  if (missing.length > 0) {
    describe("VIP-671 [bscmainnet] VIP-C markets and Hub wiring", () => {
      // Mocha reports an `it` without a body as pending, so the run stays green and says what is missing.
      it(`is not simulated until these are set: ${missing.join(", ")}`);
    });
    return;
  }

  const treasuryBefore: Record<string, BigNumber> = {};

  describe("Pre-VIP: VIP-A and VIP-B executed", () => {
    it("has the pool registered, owned by the Normal Timelock and wired to both oracles", async () => {
      expectAddress((await registry.getPoolByComptroller(SPOKE_COMPTROLLER)).comptroller, SPOKE_COMPTROLLER);
      expectAddress(await comptroller.owner(), NORMAL_TIMELOCK);
      expectAddress(await comptroller.oracle(), RESILIENT_ORACLE);
      expectAddress(await comptroller.deviationBoundedOracle(), DEVIATION_BOUNDED_ORACLE);
      const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
      expect(normalize(await psr.getPoolRegistries())).to.include(ethers.utils.getAddress(SPOKE_POOL_REGISTRY));
    });

    it("lets the Normal Timelock call every comptroller, registry and Spoke source setter VIP-C uses", async () => {
      const comptrollerRoles = [
        SET_MARKET_LIQUIDATION_INCENTIVE,
        SET_SUPPLY_ALLOWLIST_ENABLED,
        SET_ALLOWED_SUPPLIER,
        PAUSE_ROLE,
      ];
      for (const role of comptrollerRoles) {
        expect(await mayCall(SPOKE_COMPTROLLER, NORMAL_TIMELOCK, role), role).to.be.true;
      }
      expect(await mayCall(SPOKE_POOL_REGISTRY, NORMAL_TIMELOCK, "addMarket(AddMarketInput)")).to.be.true;
      for (const { stack } of LIQUIDITY_MARKETS) {
        for (const role of [ADD_RESOURCE, SET_INNER_DEPOSIT_QUEUE, SET_INNER_WITHDRAW_QUEUE]) {
          expect(await mayCall(stack.spokeSource, NORMAL_TIMELOCK, role), `${stack.name}: ${role}`).to.be.true;
        }
      }
    });

    it("has each Spoke source registered on its Hub with its caps, last to withdraw and holding nothing", async () => {
      // The Operator can move the caps after VIP-B.
      for (const { stack } of LIQUIDITY_MARKETS) {
        const config = await hubOf(stack.hub).yieldGroupConfig(stack.spokeSource);
        expect(config.registered, stack.name).to.be.true;
        expect(config.absoluteCap, `${stack.name} absoluteCap`).to.equal(stack.spokeAbsoluteCap);
        expect(config.percentageCapBps, `${stack.name} percentageCapBps`).to.equal(stack.spokePercentageCapBps);
        expect(normalize(await hubOf(stack.hub).outerWithdrawQueue()), `${stack.name} withdraw queue`).to.deep.equal(
          normalize([...stack.withdrawQueueBefore, stack.spokeSource]),
        );
        expect(await groupOf(stack.spokeSource).resources(), `${stack.name} resources`).to.have.lengthOf(0);
      }
    });

    it("has BStockLiquidator pointed at the spoke registry, with each liquidity asset's Core flash source", async () => {
      // `onlyOwner` calls by the Operator after VIP-A, needed before the collateral markets open.
      const liquidator = new ethers.Contract(
        BSTOCK_LIQUIDATOR,
        ["function poolRegistry() view returns (address)", "function coreFlashSource(address) view returns (address)"],
        ethers.provider,
      );
      expectAddress(await liquidator.poolRegistry(), SPOKE_POOL_REGISTRY);
      for (const { symbol, underlying } of LIQUIDITY_MARKETS) {
        expectAddress(await liquidator.coreFlashSource(underlying), CORE_MARKET[underlying], symbol);
      }
    });
  });

  describe("Pre-VIP: VIP-C's deployments", () => {
    it("builds each market on SpokeVTokenBeacon against this comptroller, unlisted and owned by the Normal Timelock", async () => {
      for (const m of MARKETS) {
        const v = vTokenOf(m.vToken);
        expectAddress(await readSlotAddress(m.vToken, BEACON_SLOT), SPOKE_VTOKEN_BEACON, `${m.symbol} beacon`);
        expectAddress(await v.comptroller(), SPOKE_COMPTROLLER, `${m.symbol} comptroller`);
        expectAddress(await v.underlying(), m.underlying, `${m.symbol} underlying`);
        expectAddress(await v.interestRateModel(), m.interestRateModel, `${m.symbol} rate model`);
        expectAddress(await v.owner(), NORMAL_TIMELOCK, `${m.symbol} owner`);
        expectAddress(await v.shortfall(), SHORTFALL, `${m.symbol} shortfall`);
        expectAddress(await v.protocolShareReserve(), PROTOCOL_SHARE_RESERVE, `${m.symbol} PSR`);
        expect(await v.symbol(), m.symbol).to.equal(m.symbol);
        expect(await v.decimals(), `${m.symbol} decimals`).to.equal(8);
        expect(await v.totalSupply(), `${m.symbol} supply`).to.equal(0);
        expect(await v.exchangeRateStored(), `${m.symbol} exchange rate`).to.equal(INITIAL_EXCHANGE_RATE);
        // The VToken default. VIP-C does not call `setProtocolSeizeShare`.
        expect(await v.protocolSeizeShareMantissa(), `${m.symbol} seize share`).to.equal(PROTOCOL_SEIZE_SHARE);
        expect((await comptroller.markets(m.vToken)).isListed, `${m.symbol} listed`).to.be.false;
        expect(await registry.getVTokenForAsset(SPOKE_COMPTROLLER, m.underlying), m.symbol).to.equal(
          ethers.constants.AddressZero,
        );
      }
    });

    it("builds the liquidity markets on the risk sheet's rate model, and the collateral markets on one that charges 0", async () => {
      const IRM_ABI = [
        "function baseRatePerBlock() view returns (uint256)",
        "function multiplierPerBlock() view returns (uint256)",
        "function jumpMultiplierPerBlock() view returns (uint256)",
        "function kink() view returns (uint256)",
        "function blocksOrSecondsPerYear() view returns (uint256)",
        "function getBorrowRate(uint256,uint256,uint256,uint256) view returns (uint256)",
      ];
      for (const m of LIQUIDITY_MARKETS) {
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
      for (const m of COLLATERAL_MARKETS) {
        const irm = new ethers.Contract(m.interestRateModel, IRM_ABI, ethers.provider);
        for (const [cash, borrows] of utilizations) {
          expect(await irm.getBorrowRate(cash, borrows, 0, 0), m.symbol).to.equal(0);
        }
      }
    });

    it("lets the Normal Timelock set each market's reserve delta and reserve factor", async () => {
      // Existing wildcards (ASSUMED_WILDCARDS.vToken), so a revocation fails here instead of at execution.
      for (const m of MARKETS) {
        for (const role of ["setReduceReservesBlockDelta(uint256)", "setReserveFactor(uint256)"]) {
          expect(await mayCall(m.vToken, NORMAL_TIMELOCK, role), `${m.symbol}: ${role}`).to.be.true;
        }
      }
    });

    it("deploys AdapterSpokeV1, which reads each liquidity market's underlying", async () => {
      const adapter = new ethers.Contract(ADAPTER_SPOKE_V1, ADAPTER_ABI, ethers.provider);
      for (const { symbol, vToken, underlying } of LIQUIDITY_MARKETS) {
        expectAddress(await adapter.asset(vToken), underlying, symbol);
      }
    });

    it("builds CollateralGateway on the Core comptroller and the spoke registry, owned by the Normal Timelock", async () => {
      expectAddress(await gateway.COMPTROLLER(), CORE_COMPTROLLER);
      expectAddress(await gateway.POOL_REGISTRY(), SPOKE_POOL_REGISTRY);
      expectAddress(await gateway.owner(), NORMAL_TIMELOCK);
      for (const role of ROUTER_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, COLLATERAL_GATEWAY, role), role).to.be.false;
      }
    });

    it("has the QQQB and SPYB feeds answering Atlas and APRO", async () => {
      for (const m of COLLATERAL_MARKETS) {
        expect(await readFeed(ATLAS_ORACLE, m.atlasFeed), `${m.symbol} Atlas feed`).to.be.gt(0);
        expect(await readFeed(APRO_ORACLE, m.aproFeed), `${m.symbol} APRO feed`).to.be.gt(0);
      }
    });
  });

  let fundedOnFork = false;

  describe("Pre-VIP: the VTreasury holds every seed", () => {
    before(async () => {
      // TODO(ops): delete this fallback once the VTreasury is funded on mainnet and FORK_BLOCK is past it.
      for (const m of MARKETS) {
        const seed = m.initialSupply!;
        const balance: BigNumber = await erc20Of(m.underlying).balanceOf(VTREASURY);
        if (balance.lt(seed)) {
          await fund(m.underlying, VTREASURY, seed.sub(balance));
          fundedOnFork = true;
        }
        treasuryBefore[m.underlying] = await erc20Of(m.underlying).balanceOf(VTREASURY);
      }
      if (fundedOnFork) {
        console.warn("[vip-671] VTreasury funded on the fork");
      }
    });

    it("is funded on mainnet, not by this simulation", function () {
      if (fundedOnFork) {
        this.skip();
      }
    });

    it("holds at least each market's seed", async () => {
      for (const m of MARKETS) {
        expect(treasuryBefore[m.underlying], m.symbol).to.be.gte(m.initialSupply!);
      }
    });
  });

  describe("Pre-VIP: QQQB and SPYB prices", () => {
    before(async () => {
      // The feeds go stale over the simulated voting and timelock delay. Pin each feed's current answer as a direct
      // price, which `getPrice` returns without a staleness check, as VIP-654's simulation does. At execution the
      // feeds themselves have to be fresh and within the band of each other.
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      for (const m of COLLATERAL_MARKETS) {
        await atlas.connect(timelock).setDirectPrice(m.underlying, await readFeed(ATLAS_ORACLE, m.atlasFeed));
        await apro.connect(timelock).setDirectPrice(m.underlying, await readFeed(APRO_ORACLE, m.aproFeed));
      }
    });

    it("pins a nonzero QQQB and SPYB price on Atlas and APRO", async () => {
      for (const { symbol, underlying } of COLLATERAL_MARKETS) {
        expect(await atlas.getPrice(underlying), `${symbol} Atlas`).to.be.gt(0);
        expect(await apro.getPrice(underlying), `${symbol} APRO`).to.be.gt(0);
      }
    });
  });

  testVip("VIP-671 [bscmainnet] VIP-C markets and Hub wiring", await vip671Part3Bscmainnet(), {
    callbackAfterExecution: async txResponse => {
      const collateral = COLLATERAL_MARKETS.length;
      const liquidity = LIQUIDITY_MARKETS.length;
      // Atlas and APRO share the `ChainlinkOracle` event; `ResilientOracle`'s has a different signature.
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [2 * collateral]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [collateral]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [collateral]);
      await expectEvents(txResponse, [DBO_ABI], ["ProtectionInitialized"], [collateral]);
      await expectEvents(txResponse, [REGISTRY_ABI], ["MarketAdded"], [MARKETS.length]);
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewReduceReservesBlockDelta", "NewReserveFactor", "NewShortfallContract"],
        [MARKETS.length, MARKETS.length, MARKETS.length],
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
        [MARKETS.length, collateral, collateral, liquidity, liquidity],
      );
      // The mainnet ACM emits no PermissionGranted, so RoleGranted is the count.
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [VIP_C_GRANTS.length]);
      await expectEvents(
        txResponse,
        [YIELD_GROUP_ABI],
        ["ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [liquidity, liquidity, liquidity],
      );
      await expectEvents(txResponse, [HUB_ABI], ["YieldGroupCapRaised", "OuterDepositQueueSet"], [0, liquidity]);
    },
  });

  describe("Post-VIP", () => {
    it("prices QQQB and SPYB through Atlas, APRO and the band, with a DBO window", async () => {
      for (const m of COLLATERAL_MARKETS) {
        const atlasConfig = await atlas.tokenConfigs(m.underlying);
        expectAddress(atlasConfig.feed, m.atlasFeed, `${m.symbol} Atlas feed`);
        expect(atlasConfig.maxStalePeriod, `${m.symbol} Atlas`).to.equal(ATLAS_MAX_STALE_PERIOD);
        const aproConfig = await apro.tokenConfigs(m.underlying);
        expectAddress(aproConfig.feed, m.aproFeed, `${m.symbol} APRO feed`);
        expect(aproConfig.maxStalePeriod, `${m.symbol} APRO`).to.equal(APRO_MAX_STALE_PERIOD);

        const band = await boundValidator.validateConfigs(m.underlying);
        expect(band.upperBoundRatio, `${m.symbol} upper`).to.equal(BOUND_UPPER_RATIO);
        expect(band.lowerBoundRatio, `${m.symbol} lower`).to.equal(BOUND_LOWER_RATIO);

        const config = await resilientOracle.getTokenConfig(m.underlying);
        expect(normalize(config.oracles), m.symbol).to.deep.equal(
          normalize([ATLAS_ORACLE, APRO_ORACLE, ethers.constants.AddressZero]),
        );
        expect([...config.enableFlagsForOracles], m.symbol).to.deep.equal([true, true, false]);
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
    });

    it("lists every market with its risk values, and points its shortfall at the Normal Timelock", async () => {
      for (const m of MARKETS) {
        const v = vTokenOf(m.vToken);
        const market = await comptroller.markets(m.vToken);
        expect(market.isListed, m.symbol).to.be.true;
        expect(market.collateralFactorMantissa, `${m.symbol} CF`).to.equal(m.collateralFactor);
        expect(market.liquidationThresholdMantissa, `${m.symbol} LT`).to.equal(m.liquidationThreshold);
        expect(await comptroller.supplyCaps(m.vToken), `${m.symbol} supply cap`).to.equal(m.supplyCap);
        expect(await comptroller.borrowCaps(m.vToken), `${m.symbol} borrow cap`).to.equal(m.borrowCap);
        expect(await v.reserveFactorMantissa(), `${m.symbol} RF`).to.equal(m.reserveFactor);
        expect(await v.reduceReservesBlockDelta(), `${m.symbol} delta`).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
        expect(await v.protocolSeizeShareMantissa(), `${m.symbol} seize share`).to.equal(PROTOCOL_SEIZE_SHARE);
        expectAddress(await v.shortfall(), NORMAL_TIMELOCK, `${m.symbol} shortfall`);
        expectAddress(await registry.getVTokenForAsset(SPOKE_COMPTROLLER, m.underlying), m.vToken, m.symbol);
      }
    });

    it("mints every seed to the seed receiver and leaves the Normal Timelock no tokens and no allowance", async () => {
      for (const m of MARKETS) {
        const v = vTokenOf(m.vToken);
        const token = erc20Of(m.underlying);
        const seed = m.initialSupply!;
        const supply: BigNumber = await v.totalSupply();
        expect(supply, `${m.symbol} supply`).to.equal(seed.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE));
        expect(await v.balanceOf(SEED_RECEIVER), `${m.symbol} receiver`).to.equal(supply);
        expect(await token.balanceOf(VTREASURY), `${m.symbol} treasury`).to.equal(
          treasuryBefore[m.underlying].sub(seed),
        );
        expect(await token.allowance(NORMAL_TIMELOCK, SPOKE_POOL_REGISTRY), `${m.symbol} allowance`).to.equal(0);
      }
    });

    it("keeps LT times the effective incentive below 1, and the pool-wide incentive above every seize share", async () => {
      for (const m of COLLATERAL_MARKETS) {
        const incentive: BigNumber = await comptroller.effectiveLiquidationIncentive(m.vToken);
        expect(incentive, m.symbol).to.equal(m.liquidationIncentive);
        expect(m.liquidationThreshold.mul(incentive), m.symbol).to.be.lt(MANTISSA_ONE.mul(MANTISSA_ONE));
      }
      // The liquidity markets fall back to the pool-wide value, which the chain does not recheck against them.
      const poolWide: BigNumber = await comptroller.liquidationIncentiveMantissa();
      for (const m of LIQUIDITY_MARKETS) {
        expect(await comptroller.effectiveLiquidationIncentive(m.vToken), m.symbol).to.equal(
          POOL_LIQUIDATION_INCENTIVE,
        );
        expect(poolWide, m.symbol).to.be.gte(MANTISSA_ONE.add(await vTokenOf(m.vToken).protocolSeizeShareMantissa()));
      }
    });

    it("pauses borrowing on the collateral markets only", async () => {
      for (const m of COLLATERAL_MARKETS) {
        expect(await comptroller.actionPaused(m.vToken, ACTION_BORROW), m.symbol).to.be.true;
        expect(await comptroller.actionPaused(m.vToken, ACTION_MINT), m.symbol).to.be.false;
      }
      for (const m of LIQUIDITY_MARKETS) {
        expect(await comptroller.actionPaused(m.vToken, ACTION_BORROW), m.symbol).to.be.false;
        expect(await comptroller.actionPaused(m.vToken, ACTION_MINT), m.symbol).to.be.false;
      }
      const borrower = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      for (const m of COLLATERAL_MARKETS) {
        await expect(vTokenOf(m.vToken).connect(borrower).borrow(1)).to.be.revertedWithCustomError(
          comptroller,
          "ActionPaused",
        );
      }
    });

    it("restricts supply on each liquidity market to its Spoke source, and leaves the liquidation allowlist off", async () => {
      const stranger = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      for (const m of LIQUIDITY_MARKETS) {
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), m.symbol).to.be.true;
        expect(await comptroller.isAllowedSupplier(m.vToken, m.stack.spokeSource), m.symbol).to.be.true;
        await fund(m.underlying, SUPPLIER, DEPOSIT);
        await erc20Of(m.underlying).connect(stranger).approve(m.vToken, DEPOSIT);
        await expect(vTokenOf(m.vToken).connect(stranger).mint(DEPOSIT)).to.be.revertedWithCustomError(
          comptroller,
          "SupplyNotAllowed",
        );
      }
      for (const m of COLLATERAL_MARKETS) {
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), m.symbol).to.be.false;
      }
      expect(await comptroller.isLiquidationAllowlistEnabled()).to.be.false;
    });

    it("grants `enterMarketForAccount` to CollateralGateway against this comptroller only, and to no one else", async () => {
      for (const role of ROUTER_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, COLLATERAL_GATEWAY, role), role).to.be.true;
        expect(await mayCall(UNRELATED, COLLATERAL_GATEWAY, role), `${role} as a wildcard`).to.be.false;
        for (const account of KNOWN_ACCOUNTS) {
          expect(await mayCall(SPOKE_COMPTROLLER, account, role), `${account} may ${role}`).to.be.false;
        }
      }
    });

    it("supplies a collateral market and enters it in one CollateralGateway call", async () => {
      const supplier = await initMainnetUser(SUPPLIER, ethers.utils.parseEther("1"));
      for (const m of COLLATERAL_MARKETS) {
        await fund(m.underlying, SUPPLIER, COLLATERAL_SUPPLY);
        await erc20Of(m.underlying).connect(supplier).approve(COLLATERAL_GATEWAY, COLLATERAL_SUPPLY);
        await gateway.connect(supplier).supplyAndEnterSpokeMarkets([m.vToken], [COLLATERAL_SUPPLY]);
        expect(await vTokenOf(m.vToken).balanceOf(SUPPLIER), m.symbol).to.equal(
          COLLATERAL_SUPPLY.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE),
        );
        expect(await comptroller.checkMembership(SUPPLIER, m.vToken), m.symbol).to.be.true;
      }
    });

    it("registers each liquidity market in its Spoke source, behind AdapterSpokeV1, in both inner queues", async () => {
      for (const { symbol, vToken, stack } of LIQUIDITY_MARKETS) {
        const source = groupOf(stack.spokeSource);
        expect(normalize(await source.resources()), symbol).to.deep.equal(normalize([vToken]));
        const [registered, paused, adapter] = await source.resourceConfig(vToken);
        expect(registered, symbol).to.be.true;
        expect(paused, symbol).to.be.false;
        expectAddress(adapter, ADAPTER_SPOKE_V1, symbol);
        expect(normalize(await source.innerDepositQueue()), `${symbol} deposit`).to.deep.equal(normalize([vToken]));
        expect(normalize(await source.innerWithdrawQueue()), `${symbol} withdraw`).to.deep.equal(normalize([vToken]));
      }
    });

    it("puts each Spoke source first to deposit, and keeps its caps and its place last to withdraw", async () => {
      for (const m of LIQUIDITY_MARKETS) {
        const hub = hubOf(m.stack.hub);
        const config = await hub.yieldGroupConfig(m.stack.spokeSource);
        expect(config.absoluteCap, `${m.stack.name} absoluteCap`).to.equal(m.stack.spokeAbsoluteCap);
        expect(config.percentageCapBps, `${m.stack.name} percentageCapBps`).to.equal(m.stack.spokePercentageCapBps);
        expect(normalize(await hub.outerDepositQueue()), `${m.stack.name} deposit queue`).to.deep.equal(
          normalize([m.stack.spokeSource, ...m.stack.depositQueue]),
        );
        expect(normalize(await hub.outerWithdrawQueue()), `${m.stack.name} withdraw queue`).to.deep.equal(
          normalize([...m.stack.withdrawQueueBefore, m.stack.spokeSource]),
        );
      }
    });

    it("routes a Hub deposit into its Spoke market, minted to the Spoke source, which can still redeem", async () => {
      const depositor = await initMainnetUser(DEPOSITOR, ethers.utils.parseEther("1"));
      for (const m of LIQUIDITY_MARKETS) {
        const hub = hubOf(m.stack.hub).connect(depositor);
        const v = vTokenOf(m.vToken);
        const seedVTokens: BigNumber = await v.balanceOf(SEED_RECEIVER);
        await fund(m.underlying, DEPOSITOR, DEPOSIT);
        await erc20Of(m.underlying).connect(depositor).approve(m.stack.hub, DEPOSIT);
        await hub.deposit(DEPOSIT, DEPOSITOR);
        const held: BigNumber = await v.balanceOf(m.stack.spokeSource);
        expect(held, m.symbol).to.be.gt(0);
        expect(await v.balanceOf(SEED_RECEIVER), `${m.symbol} receiver`).to.equal(seedVTokens);
        expect(await v.totalSupply(), `${m.symbol} supply`).to.equal(seedVTokens.add(held));
        expect(await groupOf(m.stack.spokeSource).totalAssets(), m.symbol).to.be.lte(
          await hub.yieldGroupEffectiveCap(m.stack.spokeSource),
        );

        // The supply allowlist gates mint only.
        const source = await initMainnetUser(m.stack.spokeSource, ethers.utils.parseEther("1"));
        await v.connect(source).redeem(1);
        expect(await v.balanceOf(m.stack.spokeSource), `${m.symbol} redeem`).to.equal(held.sub(1));
      }
    });
  });
});
