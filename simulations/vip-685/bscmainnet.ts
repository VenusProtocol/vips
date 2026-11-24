import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BSTOCK_PAUSE_SENTINEL, KEEPER } from "../../vips/vip-680/bscmainnet";
import {
  ACM,
  ANTB,
  ANTB_MARKET,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS_MAINSTREAM,
  DEVIATION_BOUNDED_ORACLE,
  NORMAL_TIMELOCK,
  POOL,
  PROTOCOL_SEIZE_SHARE,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  USDT,
  VTREASURY,
  VUSDT_MAINSTREAM,
} from "../../vips/vip-685/addresses/bscmainnet";
import vip685 from "../../vips/vip-685/bscmainnet";
import ACM_ABI from "../vip-675/abi/AccessControlManager.json";
import CHAINLINK_ORACLE_ABI from "../vip-675/abi/ChainlinkOracle.json";
import GATEWAY_ABI from "../vip-675/abi/CollateralGateway.json";
import DBO_ABI from "../vip-675/abi/DeviationBoundedOracle.json";
import ERC20_ABI from "../vip-675/abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "../vip-675/abi/ResilientOracle.json";
import COMPTROLLER_ABI from "../vip-675/abi/SpokeComptroller.json";
import REGISTRY_ABI from "../vip-675/abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "../vip-675/abi/VToken.json";
import SENTINEL_ABI from "../vip-680/abi/BStockPauseSentinel.json";
import PAUSE_MANAGER_ABI from "../vip-680/abi/PauseManager.json";

/// After isolated-pools#590 deployed vANTB_bStockMainstream (block 135,438,083).
const FORK_BLOCK = 135439000;

const { CHAINLINK_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

/// USDT's Core market, which holds USDT as cash and funds the fork.
const CORE_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

/// The bStock issuer's PauseManager, which every bStock the sentinel monitors reports.
const PAUSE_MANAGER = "0x9fc74Be63f3589485B2423984a7a0557e0CF700a";

const account = (name: string) =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id(`vip-685 ${name}`), 12));

/// Fresh accounts. The default hardhat signer carries EIP-7702 code on BNB Chain.
const BORROWER = account("borrower");
const LIQUIDATOR = account("liquidator");

/// bStocks keep balances in OpenZeppelin v5's ERC-7201 `ERC20` namespace, so the fork sets them directly.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";
/// EIP-1967 beacon slot, `bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)`.
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

const MANTISSA_ONE = ethers.utils.parseUnits("1", 18);
const ACTION_MINT = 0;
const ACTION_BORROW = 2;
/// What `028` initializes every spoke market with: 10 ** (18 + 18 - 8).
const INITIAL_EXCHANGE_RATE = ethers.utils.parseUnits("1", 28);
/// The pool's markets before this VIP: USDT, USDC, U and 20 bStocks.
const MARKETS_BEFORE = 23;
/// Rounding in the comptroller's own valuation.
const DUST = ethers.utils.parseUnits("1", 12);

const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));
const beaconOf = async (proxy: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, BEACON_SLOT), 12));

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
/// `isAllowedToCall` asked as `onBehalfOf`, the contract that checks the role.
const mayCall = async (onBehalfOf: string, who: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [who, signature]);
  const [allowed] = ACM_IFACE.decodeFunctionResult(
    "isAllowedToCall",
    await ethers.provider.call({ to: ACM, from: onBehalfOf, data }),
  );
  return allowed;
};

const FEED_IFACE = new ethers.utils.Interface([
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
  "function isAuthorizedCaller(address) view returns (bool)",
]);
const feed = new ethers.Contract(ANTB_MARKET.atlasFeed, FEED_IFACE, ethers.provider);
/// The feed's answer as ATLAS_ORACLE reads it, scaled to 18 decimals, and its age at FORK_BLOCK.
const readFeed = async (): Promise<{ price: BigNumber; age: number }> => {
  const [decimals, [, answer, , updatedAt]] = await Promise.all([
    feed.decimals({ from: ATLAS_ORACLE }),
    feed.latestRoundData({ from: ATLAS_ORACLE }),
  ]);
  const { timestamp } = await ethers.provider.getBlock(FORK_BLOCK);
  return {
    price: BigNumber.from(answer).mul(BigNumber.from(10).pow(18 - decimals)),
    age: timestamp - BigNumber.from(updatedAt).toNumber(),
  };
};

const erc20Of = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
const vTokenOf = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);

const fundAntb = async (to: string, amount: BigNumber) => {
  const slot = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [to, OZ5_ERC20_STORAGE]),
  );
  const balance = (await erc20Of(ANTB).balanceOf(to)).add(amount);
  await ethers.provider.send("hardhat_setStorageAt", [ANTB, slot, ethers.utils.hexZeroPad(balance.toHexString(), 32)]);
};

const fundUsdt = async (to: string, amount: BigNumber) => {
  const holder = await initMainnetUser(CORE_VUSDT, ethers.utils.parseEther("1"));
  await erc20Of(USDT).connect(holder).transfer(to, amount);
};

forking(FORK_BLOCK, async () => {
  const m = ANTB_MARKET;
  const V_ANTB = m.vToken;

  const atlas = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
  const comptroller = new ethers.Contract(POOL, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, REGISTRY_ABI, ethers.provider);
  const gateway = new ethers.Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, ethers.provider);
  const vAntb = vTokenOf(V_ANTB);
  const sentinel = new ethers.Contract(BSTOCK_PAUSE_SENTINEL, SENTINEL_ABI, ethers.provider);
  const monitoredBefore: string[] = await sentinel.getMonitoredMarkets();
  // The pool's tier 4 COINB market, which `028` built the same way.
  const reference = vTokenOf(COLLATERAL_MARKETS_MAINSTREAM.find(c => c.symbol === "vCOINB_bStockMainstream")!.vToken);

  const { price, age } = await readFeed();
  const treasuryHeld: BigNumber = await erc20Of(ANTB).balanceOf(VTREASURY);
  const timelockHeld: BigNumber = await erc20Of(ANTB).balanceOf(NORMAL_TIMELOCK);

  // The VTreasury held no ANTB at FORK_BLOCK. Top it up to the seed, as has to happen on chain before execution.
  if (treasuryHeld.lt(m.initialSupply)) await fundAntb(VTREASURY, m.initialSupply.sub(treasuryHeld));
  const treasuryBefore: BigNumber = await erc20Of(ANTB).balanceOf(VTREASURY);

  // The feed goes stale over the simulated voting and timelock delay, so pin its current answer as a direct price,
  // which `getPrice` returns without a staleness check. Atlas's caller gate is checked with `isAuthorizedCaller`.
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  await atlas.connect(timelock).setDirectPrice(ANTB, price);
  // USDT, the loan in the end-to-end test, is priced by Chainlink with Atlas as pivot. Pinned at $1 for the same reason.
  const chainlink = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  await chainlink.connect(timelock).setDirectPrice(USDT, MANTISSA_ONE);
  await atlas.connect(timelock).setDirectPrice(USDT, MANTISSA_ONE);

  const proposal = await vip685();

  describe("VIP-685 inputs", () => {
    // Pending, not failed, while the VTreasury lacks the seed: the rest runs on the fork's top-up.
    if (treasuryHeld.gte(m.initialSupply)) {
      it("has the VTreasury hold the seed", async () => {
        expect(treasuryHeld).to.be.gte(m.initialSupply);
      });
    } else {
      it(`has the VTreasury hold the seed (held ${ethers.utils.formatUnits(treasuryHeld, 18)} ANTB at the fork)`);
    }

    it("has the Atlas feed authorize ATLAS_ORACLE, as SingleFeed ANTB/USD", async () => {
      expect(await feed.isAuthorizedCaller(ATLAS_ORACLE)).to.be.true;
      expect(await feed.description()).to.equal("SingleFeed ANTB/USD");
    });

    it("has a fresh Atlas price the DBO config could read at execution", async () => {
      expect(price).to.be.gt(0);
      expect(age).to.be.lte(ATLAS_MAX_STALE_PERIOD);
    });

    it("sizes the supply cap and seed at about $100k and $10 of the feed price", async () => {
      const usd = (amount: BigNumber) => Number(ethers.utils.formatUnits(amount.mul(price).div(MANTISSA_ONE), 18));
      expect(usd(m.supplyCap)).to.be.within(90_000, 110_000);
      expect(usd(m.initialSupply)).to.be.within(9, 11);
    });
  });

  describe("Pre-VIP: what VIP-685 relies on", () => {
    it("has ANTB at 18 decimals, on the same beacon as the pool's other bStocks", async () => {
      expect(await erc20Of(ANTB).decimals()).to.equal(18);
      expect(await erc20Of(ANTB).symbol()).to.equal("ANTB");
      const nvdab = COLLATERAL_MARKETS_MAINSTREAM.find(c => c.symbol === "vNVDAB_bStockMainstream")!.underlying;
      expectAddress(await beaconOf(ANTB), await beaconOf(nvdab));
    });

    it("has no Venus oracle or DBO config for ANTB", async () => {
      expect((await atlas.tokenConfigs(ANTB)).asset).to.equal(ethers.constants.AddressZero);
      expect((await resilientOracle.getTokenConfig(ANTB)).asset).to.equal(ethers.constants.AddressZero);
      expect((await dbo.assetProtectionConfig(ANTB)).asset).to.equal(ethers.constants.AddressZero);
    });

    it("has the pool list 23 markets and none of ANTB", async () => {
      expect(await comptroller.getAllMarkets()).to.have.length(MARKETS_BEFORE);
      expect(await registry.getVTokenForAsset(POOL, ANTB)).to.equal(ethers.constants.AddressZero);
      expect((await comptroller.markets(V_ANTB)).isListed).to.be.false;
    });

    it("builds the market as 028 built vCOINB_bStockMainstream: same beacon, pool, rate model, owner and reserves", async () => {
      expectAddress(await beaconOf(V_ANTB), SPOKE_VTOKEN_BEACON);
      expectAddress(await beaconOf(V_ANTB), await beaconOf(reference.address));
      expect(await vAntb.name()).to.equal(m.name);
      expect(await vAntb.symbol()).to.equal(m.symbol);
      expect(await vAntb.decimals()).to.equal(8);
      expect(await vAntb.totalSupply()).to.equal(0);
      expect(await vAntb.exchangeRateStored()).to.equal(INITIAL_EXCHANGE_RATE);
      expectAddress(await vAntb.underlying(), ANTB);
      expectAddress(await vAntb.comptroller(), POOL);
      expectAddress(await vAntb.comptroller(), await reference.comptroller());
      expectAddress(await vAntb.interestRateModel(), await reference.interestRateModel());
      expectAddress(await vAntb.owner(), NORMAL_TIMELOCK);
      expect(await vAntb.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expectAddress(await vAntb.shortfall(), NORMAL_TIMELOCK);
      expectAddress(await vAntb.protocolShareReserve(), PROTOCOL_SHARE_RESERVE);
      expect(await vAntb.reserveFactorMantissa()).to.equal(await reference.reserveFactorMantissa());
      expect(await vAntb.protocolSeizeShareMantissa()).to.equal(PROTOCOL_SEIZE_SHARE);
    });

    it("has the BStockPauseSentinel monitor the pool's other bStocks but not vANTB, and ANTB on the same PauseManager", async () => {
      expect(await sentinel.isMarketMonitored(reference.address)).to.be.true;
      expect(await sentinel.isMarketMonitored(V_ANTB)).to.be.false;
      const bStockToken = ["function pauseManager() view returns (address)"];
      expectAddress(await new ethers.Contract(ANTB, bStockToken, ethers.provider).pauseManager(), PAUSE_MANAGER);
      expectAddress(
        await new ethers.Contract(await reference.underlying(), bStockToken, ethers.provider).pauseManager(),
        PAUSE_MANAGER,
      );
    });

    it("lets the Normal Timelock make every call inline, with no aggregator", async () => {
      const roles: [string, string][] = [
        [ATLAS_ORACLE, "setTokenConfig(TokenConfig)"],
        [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)"],
        [DEVIATION_BOUNDED_ORACLE, "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])"],
        [SPOKE_POOL_REGISTRY, "addMarket(AddMarketInput)"],
        [POOL, "setMarketLiquidationIncentive(address,uint256)"],
        // The comptroller checks the `uint256[]` form, because `Action` is an enum.
        [POOL, "setActionsPaused(address[],uint256[],bool)"],
        [V_ANTB, "setReduceReservesBlockDelta(uint256)"],
        [V_ANTB, "setProtocolSeizeShare(uint256)"],
        [BSTOCK_PAUSE_SENTINEL, "setMarketMonitored(address,bool)"],
      ];
      for (const [contract, role] of roles) {
        expect(await mayCall(contract, NORMAL_TIMELOCK, role), `${contract}: ${role}`).to.be.true;
      }
      const treasury = new ethers.Contract(VTREASURY, ["function owner() view returns (address)"], ethers.provider);
      expectAddress(await treasury.owner(), NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-685 [bscmainnet] List ANTB in the bStock mainstream Spoke pool", proposal, {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [DBO_ABI], ["ProtectionInitialized"], [1]);
      await expectEvents(txResponse, [REGISTRY_ABI], ["PoolRegistered", "MarketAdded"], [0, 1]);
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewReduceReservesBlockDelta", "NewProtocolSeizeShare", "NewReserveFactor"],
        [1, 1, 0],
      );
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["MarketSupported", "NewMarketLiquidationIncentive", "ActionPausedMarket"],
        [1, 1, 1],
      );
      await expectEvents(txResponse, [SENTINEL_ABI], ["MarketMonitoringUpdated"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [0, 0]);
    },
  });

  describe("Post-VIP-685", () => {
    it("prices ANTB with Atlas alone and a DBO window", async () => {
      const atlasConfig = await atlas.tokenConfigs(ANTB);
      expectAddress(atlasConfig.feed, m.atlasFeed);
      expect(atlasConfig.maxStalePeriod).to.equal(ATLAS_MAX_STALE_PERIOD);

      const config = await resilientOracle.getTokenConfig(ANTB);
      expect(config.oracles.map((o: string) => ethers.utils.getAddress(o))).to.deep.equal([
        ethers.utils.getAddress(ATLAS_ORACLE),
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect([...config.enableFlagsForOracles]).to.deep.equal([true, false, false]);
      expect(config.cachingEnabled).to.be.false;
      expect(await resilientOracle.getPrice(ANTB)).to.equal(price);

      const window = await dbo.assetProtectionConfig(ANTB);
      expectAddress(window.asset, ANTB);
      expect(window.cooldownPeriod).to.equal(m.dbo.cooldownPeriod);
      expect(window.triggerThreshold).to.equal(m.dbo.triggerThreshold);
      expect(window.resetThreshold).to.equal(m.dbo.resetThreshold);
      expect(window.isBoundedPricingEnabled).to.equal(m.dbo.enableBoundedPricing);
      expect(window.cachingEnabled).to.equal(m.dbo.enableCaching);
    });

    it("lists the market with its risk values and seed, paid by the VTreasury", async () => {
      const market = await comptroller.markets(V_ANTB);
      expect(market.isListed).to.be.true;
      expect(market.collateralFactorMantissa).to.equal(m.collateralFactor);
      expect(market.liquidationThresholdMantissa).to.equal(m.liquidationThreshold);
      expect(await comptroller.supplyCaps(V_ANTB)).to.equal(m.supplyCap);
      expect(await comptroller.borrowCaps(V_ANTB)).to.equal(0);
      expect(await comptroller.getAllMarkets()).to.have.length(MARKETS_BEFORE + 1);
      expectAddress(await registry.getVTokenForAsset(POOL, ANTB), V_ANTB);

      const supply: BigNumber = await vAntb.totalSupply();
      expect(supply).to.equal(m.initialSupply.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE));
      expect(await vAntb.balanceOf(SEED_RECEIVER)).to.equal(supply);
      expect(await erc20Of(ANTB).balanceOf(VTREASURY)).to.equal(treasuryBefore.sub(m.initialSupply));
      // `withdrawTreasuryBEP20` caps at the treasury's balance, so a short seed would come out of this balance.
      expect(await erc20Of(ANTB).balanceOf(NORMAL_TIMELOCK)).to.equal(timelockHeld);
      expect(await erc20Of(ANTB).allowance(NORMAL_TIMELOCK, SPOKE_POOL_REGISTRY)).to.equal(0);
    });

    it("gives the market its own incentive and seize share, the pool's reserve delta, and pauses borrowing", async () => {
      const incentive: BigNumber = await comptroller.effectiveLiquidationIncentive(V_ANTB);
      expect(incentive).to.equal(m.liquidationIncentive);
      expect(await vAntb.protocolSeizeShareMantissa()).to.equal(m.protocolSeizeShare);
      expect(incentive).to.be.gte(MANTISSA_ONE.add(m.protocolSeizeShare));
      // LT x incentive stays under 1, so a liquidation never seizes more than the collateral backing the loan.
      expect(m.liquidationThreshold.mul(incentive)).to.be.lt(MANTISSA_ONE.mul(MANTISSA_ONE));
      expect(await vAntb.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
      // 28,800 blocks, as on the pool's other markets.
      expect(await vAntb.reduceReservesBlockDelta()).to.equal(await reference.reduceReservesBlockDelta());
      expect(await comptroller.actionPaused(V_ANTB, ACTION_BORROW)).to.be.true;
      expect(await comptroller.actionPaused(V_ANTB, ACTION_MINT)).to.be.false;
      expect(await comptroller.isSupplyAllowlistEnabled(V_ANTB)).to.be.false;
    });

    it("has the BStockPauseSentinel monitor the market, which ANTB's issuer has neither paused nor blocked", async () => {
      expect(await sentinel.isMarketMonitored(V_ANTB)).to.be.true;
      expect(await sentinel.getMonitoredMarkets()).to.have.length(monitoredBefore.length + 1);
      const [isPaused, underlying, pauseManager] = await sentinel.checkBStockPause(V_ANTB);
      expect(isPaused).to.be.false;
      expectAddress(underlying, ANTB);
      expectAddress(pauseManager, PAUSE_MANAGER);
    });

    // The CF and LT as the comptroller applies them: a USDT loan up to the borrowing power and not a wei more, and a
    // liquidation that turns on where the LT stops covering the loan.
    it("lends USDT against ANTB up to its CF, and lets it be liquidated past its LT", async () => {
      const borrower = await initMainnetUser(BORROWER, ethers.utils.parseEther("1"));
      // $200: above the $100 minimum liquidatable collateral after the price drops to the LT edge.
      const supplied = ethers.utils.parseUnits("200", 18).mul(MANTISSA_ONE).div(price);
      await fundAntb(BORROWER, supplied);
      await erc20Of(ANTB).connect(borrower).approve(COLLATERAL_GATEWAY, supplied);
      await gateway.connect(borrower).supplyAndEnterSpokeMarkets([V_ANTB], [supplied]);
      expect(await comptroller.checkMembership(BORROWER, V_ANTB)).to.be.true;

      const held: BigNumber = (await vAntb.balanceOf(BORROWER)).mul(await vAntb.exchangeRateStored()).div(MANTISSA_ONE);
      const value = held.mul(price).div(MANTISSA_ONE);
      const [, power] = await comptroller.getBorrowingPower(BORROWER);
      expect(power).to.be.closeTo(value.mul(m.collateralFactor).div(MANTISSA_ONE), DUST);
      const [, cover] = await comptroller.getAccountLiquidity(BORROWER);
      expect(cover).to.be.closeTo(value.mul(m.liquidationThreshold).div(MANTISSA_ONE), DUST);

      const vUsdt = vTokenOf(VUSDT_MAINSTREAM).connect(borrower);
      await vUsdt.borrow(power);
      expect(await erc20Of(USDT).balanceOf(BORROWER)).to.equal(power);
      await expect(vUsdt.borrow(1)).to.be.revertedWithCustomError(comptroller, "InsufficientLiquidity");
      await expect(vAntb.connect(borrower).borrow(1)).to.be.revertedWithCustomError(comptroller, "ActionPaused");

      // The price at which LT x collateral value equals the loan: CF / LT of today's price.
      const loan: BigNumber = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
      const edge = loan.mul(MANTISSA_ONE).mul(MANTISSA_ONE).div(held.mul(m.liquidationThreshold));
      expect(edge).to.be.closeTo(price.mul(m.collateralFactor).div(m.liquidationThreshold), price.div(10000));

      const liquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
      const repay = loan.div(10);
      await fundUsdt(LIQUIDATOR, repay);
      await erc20Of(USDT).connect(liquidator).approve(VUSDT_MAINSTREAM, repay);

      await atlas.connect(timelock).setDirectPrice(ANTB, edge.mul(10001).div(10000));
      expect((await comptroller.getAccountLiquidity(BORROWER))[2]).to.equal(0);
      await expect(
        vTokenOf(VUSDT_MAINSTREAM).connect(liquidator).liquidateBorrow(BORROWER, repay, V_ANTB),
      ).to.be.revertedWithCustomError(comptroller, "InsufficientShortfall");

      await atlas.connect(timelock).setDirectPrice(ANTB, edge.mul(9999).div(10000));
      expect((await comptroller.getAccountLiquidity(BORROWER))[2]).to.be.gt(0);
      await vTokenOf(VUSDT_MAINSTREAM).connect(liquidator).liquidateBorrow(BORROWER, repay, V_ANTB);
      expect(await vAntb.balanceOf(LIQUIDATOR)).to.be.gt(0);

      await atlas.connect(timelock).setDirectPrice(ANTB, price);
      await fundUsdt(BORROWER, loan.div(100));
      await erc20Of(USDT).connect(borrower).approve(VUSDT_MAINSTREAM, ethers.constants.MaxUint256);
      await vUsdt.repayBorrow(ethers.constants.MaxUint256);
      expect(await vUsdt.borrowBalanceStored(BORROWER)).to.equal(0);
    });

    // Last: it leaves the market's CF at 0.
    it("lets the keeper zero the market's CF through the sentinel when the issuer pauses ANTB, keeping its LT", async () => {
      let pauseManager = new ethers.Contract(PAUSE_MANAGER, PAUSE_MANAGER_ABI, ethers.provider);
      const pauser = await pauseManager.getRoleMember(await pauseManager.OPS_ROLE(), 0);
      pauseManager = pauseManager.connect(await initMainnetUser(pauser, ethers.utils.parseEther("1")));
      await pauseManager.pauseToken(ANTB);

      const keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      await expect(sentinel.connect(keeper).handleBStockPause(V_ANTB))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(V_ANTB, ANTB, PAUSE_MANAGER);
      const market = await comptroller.markets(V_ANTB);
      expect(market.collateralFactorMantissa).to.equal(0);
      expect(market.liquidationThresholdMantissa).to.equal(m.liquidationThreshold);
    });
  });
});
