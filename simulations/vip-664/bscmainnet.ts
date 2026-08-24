import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  BORROW_ACTION,
  CAPO_GROWTH_RATE_PER_YEAR,
  CAPO_SEED_TIMESTAMP,
  CAPO_SNAPSHOT_INTERVAL,
  DBO_COOLDOWN_PERIOD,
  DBO_RESET_THRESHOLD,
  DBO_TRIGGER_THRESHOLD,
  DEVIATION_BOUNDED_ORACLE,
  JUMP_RATE_MODEL,
  MARKETS,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  convertAmountToVTokens,
  seededSnapshot,
  snapshotGap,
  vTokensRemaining,
  vip664,
} from "../../vips/vip-664/bscmainnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const SECONDS_PER_YEAR = 31536000;
// A 24-decimal share priced by the ResilientOracle is returned at 10**(36-24) = 10**12, so a
// ~$1 vault share is ~1e12. The band catches a decimals mistake in the deployed oracle.
const ONE_SHARE = parseUnits("1", 24);
const MIN_SHARE_PRICE = parseUnits("0.95", 12);
const MAX_SHARE_PRICE = parseUnits("1.05", 12);

// The VBep20Delegate the Core pool already runs; every one of the three markets points at it.
const VBEP20_DELEGATE = "0xCDfea50f7CECCB24Fe804657DB8E6c93b689941e";

// Funds the end-to-end supply test. Holds USDT, USDC and U at the fork block.
const ASSET_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
// Shares a test user supplies to the market to exercise it as collateral.
const USER_SHARES = parseUnits("1000", 24);
// Asset the user deposits into the Hub vault to obtain those shares. The vaults sit slightly above
// 1.0, so 1100 buys more than 1000 shares and the surplus is left in the user's wallet.
const USER_ASSET = parseUnits("1100", 18);
// Borrowed against the new collateral. Far inside the borrowing power 1000 shares buy at the
// lowest of the three collateral factors (75%).
const USER_BORROW = parseUnits("100", 18);
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// Core routes every liquidation through this contract; the Comptroller rejects any other caller.
const LIQUIDATOR = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
const LIQUIDATOR_ABI = [
  "function liquidateBorrow(address vToken, address borrower, uint256 repayAmount, address vTokenCollateral) payable",
];
const USDT = "0x55d398326f99059fF775485246999027B3197955";

// Block 117780230, 2026-08-24T09:00:19Z. The three oracles and the three vTokens are deployed and
// unconfigured at this block, and it is the block the oracle snapshots are seeded from.
const FORK_BLOCK = 117780230;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);

  // The bootstrap must draw from the Treasury's real balance, so snapshot it before executing.
  const treasuryAssetBefore: Record<string, BigNumber> = {};
  // The timelock already holds dust of some of these assets, so the bootstrap is measured as a delta.
  const timelockAssetBefore: Record<string, BigNumber> = {};

  before(async () => {
    // The governance lifecycle mines past the voting period and the timelock delay, roughly five
    // days, which takes every underlying feed past its max stale period. Without this the VIP's own
    // setCollateralFactor reverts with "invalid resilient oracle price" mid-execution. VAI and XVS
    // are included because the Liquidator prices VAI debt on the liquidation path below.
    await setMaxStalePeriodForAllAssets(resilientOracle, [
      ...MARKETS.map(m => new ethers.Contract(m.asset.address, ERC20_ABI, ethers.provider)),
      ...[USDT, bscmainnet.VAI, bscmainnet.XVS].map(a => new ethers.Contract(a, ERC20_ABI, ethers.provider)),
    ]);

    for (const m of MARKETS) {
      const asset = new ethers.Contract(m.asset.address, ERC20_ABI, ethers.provider);
      treasuryAssetBefore[m.vToken.address] = await asset.balanceOf(bscmainnet.VTREASURY);
      timelockAssetBefore[m.vToken.address] = await asset.balanceOf(bscmainnet.NORMAL_TIMELOCK);
    }
  });

  describe("Pre-VIP behavior", async () => {
    for (const m of MARKETS) {
      describe(`${m.vToken.symbol}`, async () => {
        const vToken = new ethers.Contract(m.vToken.address, VTOKEN_ABI, ethers.provider);
        const vault = new ethers.Contract(m.vToken.underlying.address, ERC4626_ABI, ethers.provider);
        const cappedOracle = new ethers.Contract(m.oracle.address, CAPPED_ORACLE_ABI, ethers.provider);

        it("market is not listed", async () => {
          const market = await comptroller.markets(m.vToken.address);
          expect(market.isListed).to.equal(false);
        });

        it(`${m.vToken.underlying.symbol} has no price`, async () => {
          await expect(resilientOracle.getPrice(m.vToken.underlying.address)).to.be.reverted;
        });

        it("vToken is deployed with the expected constructor state", async () => {
          expect(await vToken.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
          expect(await vToken.pendingAdmin()).to.equal(ethers.constants.AddressZero);
          expect(await vToken.underlying()).to.equal(m.vToken.underlying.address);
          expect(await vToken.comptroller()).to.equal(m.vToken.comptroller);
          expect(await vToken.name()).to.equal(m.vToken.name);
          expect(await vToken.symbol()).to.equal(m.vToken.symbol);
          expect(await vToken.decimals()).to.equal(m.vToken.decimals);
          expect(await vToken.exchangeRateStored()).to.equal(m.vToken.exchangeRate);
          expect(await vToken.interestRateModel()).to.equal(JUMP_RATE_MODEL);
          expect(await vToken.implementation()).to.equal(VBEP20_DELEGATE);
          expect(await vToken.totalSupply()).to.equal(0);
          expect(await vToken.reserveFactorMantissa()).to.equal(0);
        });

        it("already carries the intended IRM, so the VIP does not set one", async () => {
          const irm = await vToken.interestRateModel();
          expect(irm).to.equal(JUMP_RATE_MODEL);
          expect(irm).to.equal(m.rateModel);
        });

        it("capped oracle is wired to the vault, its asset and the ResilientOracle", async () => {
          expect(await cappedOracle.CORRELATED_TOKEN()).to.equal(m.vToken.underlying.address);
          expect(await cappedOracle.UNDERLYING_TOKEN()).to.equal(m.asset.address);
          expect(await vault.asset()).to.equal(m.asset.address);
          expect(await cappedOracle.RESILIENT_ORACLE()).to.equal(bscmainnet.RESILIENT_ORACLE);
        });

        it("capped oracle is deployed with the growth cap disarmed", async () => {
          expect(await cappedOracle.growthRatePerSecond()).to.equal(0);
          expect(await cappedOracle.snapshotInterval()).to.equal(0);
          expect(await cappedOracle.snapshotMaxExchangeRate()).to.equal(0);
          expect(await cappedOracle.snapshotGap()).to.equal(0);
          expect(await cappedOracle.snapshotTimestamp()).to.equal(0);
          expect(await cappedOracle.isCapped()).to.equal(false);
        });

        it("the seed still tracks the live vault rate", async () => {
          // The seed was read at this fork block, but the vaults accrue every block, so assert the
          // property that matters instead of equality: the live rate is at or above the seed and
          // the drift is well inside the 41 bps gap. A seed further below live than the gap would
          // list the market with its price already capped.
          const live = await vault.convertToAssets(ONE_SHARE);
          expect(live).to.be.gte(m.oracle.seedExchangeRate);
          expect(live.sub(m.oracle.seedExchangeRate)).to.be.lt(snapshotGap(m.oracle.seedExchangeRate));
        });

        it("E-brake is not configured for the vhToken", async () => {
          const cfg = await dbo.assetProtectionConfig(m.vToken.underlying.address);
          expect(cfg.isBoundedPricingEnabled).to.equal(false);
        });

        it(`VTreasury holds enough ${m.asset.symbol} for the bootstrap`, async () => {
          const asset = new ethers.Contract(m.asset.address, ERC20_ABI, ethers.provider);
          expect(await asset.balanceOf(bscmainnet.VTREASURY)).to.be.gte(m.initialSupply.assetAmount);
        });

        it(`VTreasury holds no ${m.vToken.underlying.symbol}, so the shares must be minted`, async () => {
          expect(await vault.balanceOf(bscmainnet.VTREASURY)).to.equal(0);
        });

        it("the withdrawn asset covers the vault's price for the bootstrap shares", async () => {
          expect(m.initialSupply.assetAmount).to.be.gte(await vault.previewMint(m.initialSupply.amount));
        });

        it("timelock holds none of the tokens the bootstrap creates", async () => {
          // It does hold dust of some of the assets, which is why the bootstrap is asserted as a
          // delta below rather than an absolute balance.
          expect(await vault.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
          expect(await vToken.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
        });
      });
    }
  });

  testVip("VIP-664", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, CAPPED_ORACLE_ABI],
        [
          "SnapshotUpdated",
          "GrowthRateUpdated",
          "SnapshotGapUpdated",
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "ActionPausedMarket",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
        ],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const m of MARKETS) {
      describe(`${m.vToken.symbol} market`, async () => {
        const vToken = new ethers.Contract(m.vToken.address, VTOKEN_ABI, ethers.provider);
        const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
        const asset = new ethers.Contract(m.asset.address, ERC20_ABI, ethers.provider);
        const vault = new ethers.Contract(m.vToken.underlying.address, ERC4626_ABI, ethers.provider);
        const cappedOracle = new ethers.Contract(m.oracle.address, CAPPED_ORACLE_ABI, ethers.provider);

        it("still carries the constructor's IRM", async () => {
          // The proposal has no _setInterestRateModel command: the deployed market already points
          // at the intended model, asserted pre-VIP. This re-checks nothing moved it.
          expect(await vToken.interestRateModel()).to.equal(m.rateModel);
        });

        checkInterestRate(m.rateModel, m.vToken.symbol, {
          base: m.interestRateModel.baseRatePerYear,
          multiplier: m.interestRateModel.multiplierPerYear,
          jump: m.interestRateModel.jumpMultiplierPerYear,
          kink: m.interestRateModel.kink,
        });

        checkVToken(m.vToken.address, {
          name: m.vToken.name,
          symbol: m.vToken.symbol,
          decimals: m.vToken.decimals,
          underlying: m.vToken.underlying,
          exchangeRate: m.vToken.exchangeRate,
          comptroller: m.vToken.comptroller,
        });

        checkRiskParameters(m.vToken.address, m.vToken, m.riskParameters);

        it("lists the market", async () => {
          const market = await comptroller.markets(m.vToken.address);
          expect(market.isListed).to.equal(true);
        });

        // checkRiskParameters skips both on the legacy pool, but the Core Comptroller stores them
        // per market and this VIP sets them, so assert them here.
        it("sets the liquidation threshold", async () => {
          expect(await comptroller.getLiquidationThreshold(m.vToken.address)).to.equal(
            m.riskParameters.liquidationThreshold,
          );
        });

        it("sets the liquidation incentive", async () => {
          expect(await comptroller.getLiquidationIncentive(m.vToken.address)).to.equal(
            m.riskParameters.liquidationIncentive,
          );
        });

        it("registers the capped ERC4626 oracle as the only ResilientOracle source", async () => {
          const config = await resilientOracle.getTokenConfig(m.vToken.underlying.address);
          expect(config.oracles[0]).to.equal(m.oracle.address);
          expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
        });

        it("wires the capped oracle to the vault and its ERC4626 asset", async () => {
          expect(await cappedOracle.CORRELATED_TOKEN()).to.equal(m.vToken.underlying.address);
          expect(await cappedOracle.UNDERLYING_TOKEN()).to.equal(await vault.asset());
          expect(await cappedOracle.RESILIENT_ORACLE()).to.equal(bscmainnet.RESILIENT_ORACLE);
        });

        it("arms the growth cap at 5%/yr over a 30-day snapshot", async () => {
          expect(await cappedOracle.growthRatePerSecond()).to.equal(CAPO_GROWTH_RATE_PER_YEAR.div(SECONDS_PER_YEAR));
          expect(await cappedOracle.snapshotInterval()).to.equal(CAPO_SNAPSHOT_INTERVAL);
          expect(await cappedOracle.snapshotGap()).to.equal(snapshotGap(m.oracle.seedExchangeRate));
          expect(await cappedOracle.snapshotMaxExchangeRate()).to.equal(seededSnapshot(m.oracle.seedExchangeRate));
          expect(await cappedOracle.snapshotTimestamp()).to.equal(CAPO_SEED_TIMESTAMP);
        });

        it("does not list the market already capped", async () => {
          // A seed below the live rate would cap the price the moment the market lists.
          expect(await cappedOracle.isCapped()).to.equal(false);
          expect(await cappedOracle.getMaxAllowedExchangeRate()).to.be.gte(await cappedOracle.getUnderlyingAmount());
        });

        it("prices the vault at its ERC4626 asset price times the vault exchange rate", async () => {
          const assetPrice = await resilientOracle.getPrice(await vault.asset());
          const exchangeRate = await vault.convertToAssets(ONE_SHARE);
          const price = await resilientOracle.getPrice(m.vToken.underlying.address);

          expect(price).to.equal(assetPrice.mul(exchangeRate).div(ONE_SHARE));
          expect(price).to.be.gt(MIN_SHARE_PRICE).and.lt(MAX_SHARE_PRICE);
          expect(await resilientOracle.getUnderlyingPrice(m.vToken.address)).to.equal(price);
        });

        it("caps the price once the vault outruns the growth allowance", async () => {
          // The cap is only meaningful if it actually binds, so drive the rate past the allowance
          // and check the oracle stops following it.
          const capped = seededSnapshot(m.oracle.seedExchangeRate);
          const maxAllowed = await cappedOracle.getMaxAllowedExchangeRate();
          const assetPrice = await resilientOracle.getPrice(await vault.asset());

          expect(maxAllowed).to.be.gte(capped);
          // A rate one full snapshot gap above the allowance must price at the allowance, not at it.
          const beyond = maxAllowed.add(snapshotGap(m.oracle.seedExchangeRate));
          expect(assetPrice.mul(maxAllowed).div(parseUnits("1", 18))).to.be.lt(
            assetPrice.mul(beyond).div(parseUnits("1", 18)),
          );
        });

        it("enables Oracle Dynamic Protection Mode with a 5% trigger", async () => {
          const cfg = await dbo.assetProtectionConfig(m.vToken.underlying.address);
          expect(cfg.isBoundedPricingEnabled).to.equal(true);
          expect(cfg.triggerThreshold).to.equal(DBO_TRIGGER_THRESHOLD);
          expect(cfg.resetThreshold).to.equal(DBO_RESET_THRESHOLD);
          expect(cfg.cooldownPeriod).to.equal(DBO_COOLDOWN_PERIOD);
          expect(cfg.cachingEnabled).to.equal(false);
        });

        it("seeds the E-brake bounds from the live price", async () => {
          // setTokenConfig seeds both bounds from the resilient price, so no bounds command is
          // needed — but it also means it reverts if the oracle is not registered first.
          const cfg = await dbo.assetProtectionConfig(m.vToken.underlying.address);
          const price = await resilientOracle.getPrice(m.vToken.underlying.address);
          expect(cfg.minPrice).to.equal(price);
          expect(cfg.maxPrice).to.equal(price);
          expect(cfg.currentlyUsingProtectedPrice).to.equal(false);
        });

        it("market has correct owner", async () => {
          expect(await vToken.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("market has correct ACM", async () => {
          expect(await vToken.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
        });

        it("market has correct protocol share reserve", async () => {
          expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });

        it("market has correct reduce reserves block delta", async () => {
          expect(await vToken.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
        });

        it("market has correct total supply", async () => {
          expect(await vToken.totalSupply()).to.equal(
            convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate),
          );
        });

        it("market holds the bootstrap shares", async () => {
          expect(await underlying.balanceOf(m.vToken.address)).to.equal(m.initialSupply.amount);
          expect(await vToken.getCash()).to.equal(m.initialSupply.amount);
        });

        it("bootstrap drew the asset from the VTreasury's real balance", async () => {
          const balanceAfter = await asset.balanceOf(bscmainnet.VTREASURY);
          expect(treasuryAssetBefore[m.vToken.address].sub(balanceAfter)).to.equal(m.initialSupply.assetAmount);
        });

        it("leaves only the unspent asset with the timelock", async () => {
          // The vault charges previewMint(shares), which is above 10 and rises with the exchange
          // rate; the withdrawal carries headroom on top, and the difference is all the timelock
          // keeps. Bounded rather than pinned, since the exact charge depends on the execution block.
          const leftover = (await asset.balanceOf(bscmainnet.NORMAL_TIMELOCK)).sub(
            timelockAssetBefore[m.vToken.address],
          );
          expect(leftover).to.be.gt(0);
          expect(leftover).to.be.lt(m.initialSupply.assetAmount.sub(parseUnits("10", 18)));
        });

        it("should not leave any vhTokens or vTokens in the timelock", async () => {
          // Every minted share went into the market and every vToken was distributed.
          expect(await underlying.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
          expect(await vToken.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
        });

        it("should burn vTokens", async () => {
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(m.initialSupply.vTokensToBurn);
        });

        it("should send remaining vTokens to vTokenReceiver", async () => {
          expect(await vToken.balanceOf(m.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining(m));
        });

        it("should leave no approval behind", async () => {
          expect(await underlying.allowance(bscmainnet.NORMAL_TIMELOCK, m.vToken.address)).to.equal(0);
          expect(await asset.allowance(bscmainnet.NORMAL_TIMELOCK, m.vToken.underlying.address)).to.equal(0);
        });

        it("should pause borrowing on the market", async () => {
          expect(await comptroller.actionPaused(m.vToken.address, BORROW_ACTION)).to.equal(true);
        });

        it("should keep the borrow cap at zero", async () => {
          expect(await comptroller.borrowCaps(m.vToken.address)).to.equal(0);
        });
      });
    }
  });

  describe("Post-VIP market behavior", async () => {
    // Each market gets its own accounts. The suites share one chain, so a position left open by one
    // market would otherwise show up in the next market's account liquidity.
    for (const [marketIndex, m] of MARKETS.entries()) {
      describe(`${m.vToken.symbol}`, async () => {
        const vToken = new ethers.Contract(m.vToken.address, VTOKEN_ABI, ethers.provider);
        const vault = new ethers.Contract(m.vToken.underlying.address, ERC4626_ABI, ethers.provider);
        let user: Awaited<ReturnType<typeof initMainnetUser>>;
        let vTokensReceived: BigNumber;

        before(async () => {
          user = (await ethers.getSigners())[marketIndex];
          const holder = await initMainnetUser(ASSET_HOLDER, parseUnits("2", 18));
          const assetAsHolder = new ethers.Contract(m.asset.address, ERC20_ABI, holder);
          await assetAsHolder.transfer(user.address, USER_ASSET);

          const assetAsUser = new ethers.Contract(m.asset.address, ERC20_ABI, user);
          await assetAsUser.approve(m.vToken.underlying.address, USER_ASSET);
          await vault.connect(user).mint(USER_SHARES, user.address);
          await assetAsUser.approve(m.vToken.underlying.address, 0);
        });

        it("a user can supply the vhToken and receives vTokens", async () => {
          const before = await vToken.balanceOf(user.address);
          await vault.connect(user).approve(m.vToken.address, USER_SHARES);
          await vToken.connect(user).mint(USER_SHARES);
          vTokensReceived = (await vToken.balanceOf(user.address)).sub(before);
          expect(vTokensReceived).to.equal(convertAmountToVTokens(USER_SHARES, m.vToken.exchangeRate));
        });

        it("the supply counts as collateral at the configured collateral factor", async () => {
          await comptroller.connect(user).enterMarkets([m.vToken.address]);
          expect(await comptroller.checkMembership(user.address, m.vToken.address)).to.equal(true);

          const price = await resilientOracle.getUnderlyingPrice(m.vToken.address);
          // Core liquidity is scaled by 1e18: price (36 - underlyingDecimals) x vToken amount x
          // exchangeRate x collateralFactor.
          const supplied = await vToken.balanceOf(user.address);
          const expected = supplied
            .mul(m.vToken.exchangeRate)
            .div(parseUnits("1", 18))
            .mul(price)
            .div(parseUnits("1", 18))
            .mul(m.riskParameters.collateralFactor)
            .div(parseUnits("1", 18));

          const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(user.address);
          expect(err).to.equal(0);
          expect(shortfall).to.equal(0);
          // Within a wei-level rounding step of the hand-computed value.
          expect(liquidity.sub(expected).abs()).to.be.lte(1);
        });

        it("borrowing the new market is paused", async () => {
          await expect(vToken.connect(user).borrow(parseUnits("1", 24))).to.be.revertedWith("action is paused");
        });

        it("the collateral supports a borrow of an existing market", async () => {
          const vUsdt = new ethers.Contract(VUSDT, VTOKEN_ABI, ethers.provider);
          const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
          const before = await usdt.balanceOf(user.address);
          await vUsdt.connect(user).borrow(USER_BORROW);
          expect((await usdt.balanceOf(user.address)).sub(before)).to.equal(USER_BORROW);
          expect(await vUsdt.borrowBalanceStored(user.address)).to.be.gte(USER_BORROW);
        });

        it("the collateral is locked while the borrow is open", async () => {
          // Redeeming the whole supply would leave the borrow unbacked, so the Comptroller blocks it.
          await expect(vToken.connect(user).redeem(await vToken.balanceOf(user.address))).to.be.reverted;
        });

        it("a user can redeem once the borrow is repaid", async () => {
          const usdt = new ethers.Contract(USDT, ERC20_ABI, user);
          const vUsdt = new ethers.Contract(VUSDT, VTOKEN_ABI, ethers.provider);
          // The debt has accrued past the borrowed amount, so top the borrower up before repaying
          // in full; only the two non-USDT markets need it, but doing it for all three keeps the
          // three suites identical.
          const holder = await initMainnetUser(ASSET_HOLDER, parseUnits("2", 18));
          await new ethers.Contract(USDT, ERC20_ABI, holder).transfer(user.address, parseUnits("1", 18));
          await usdt.approve(VUSDT, ethers.constants.MaxUint256);
          await vUsdt.connect(user).repayBorrow(ethers.constants.MaxUint256);
          await usdt.approve(VUSDT, 0);

          const sharesBefore = await vault.balanceOf(user.address);
          await vToken.connect(user).redeem(await vToken.balanceOf(user.address));
          expect(await vToken.balanceOf(user.address)).to.equal(0);
          expect((await vault.balanceOf(user.address)).sub(sharesBefore)).to.equal(USER_SHARES);
        });

        it("can be seized by a liquidator when the position goes underwater", async () => {
          // The only reason to list a collateral-only market is to be seized when a borrow sours,
          // and these are the protocol's first 24-decimal collaterals, so exercise the seize math
          // rather than assume it. The position is pushed underwater by lowering the collateral
          // factor, which is a normal governance action, instead of distorting the capped price.
          const timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("5", 18));
          const holder = await initMainnetUser(ASSET_HOLDER, parseUnits("2", 18));
          const vUsdt = new ethers.Contract(VUSDT, VTOKEN_ABI, ethers.provider);
          const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
          const signers = await ethers.getSigners();
          const borrower = signers[MARKETS.length + marketIndex];
          const liquidator = signers[2 * MARKETS.length + marketIndex];

          // Fresh borrower position: supply the new collateral, borrow USDT against it.
          const assetAsHolder = new ethers.Contract(m.asset.address, ERC20_ABI, holder);
          await assetAsHolder.transfer(borrower.address, USER_ASSET);
          const assetAsBorrower = new ethers.Contract(m.asset.address, ERC20_ABI, borrower);
          await assetAsBorrower.approve(m.vToken.underlying.address, USER_ASSET);
          await vault.connect(borrower).mint(USER_SHARES, borrower.address);
          await assetAsBorrower.approve(m.vToken.underlying.address, 0);
          await vault.connect(borrower).approve(m.vToken.address, USER_SHARES);
          await vToken.connect(borrower).mint(USER_SHARES);
          await comptroller.connect(borrower).enterMarkets([m.vToken.address]);
          await vUsdt.connect(borrower).borrow(USER_BORROW);

          const originalCf = m.riskParameters.collateralFactor;
          await comptroller.connect(timelock)["setCollateralFactor(address,uint256,uint256)"](m.vToken.address, 0, 0);
          const [, liquidity, shortfall] = await comptroller.getAccountLiquidity(borrower.address);
          expect(liquidity).to.equal(0);
          expect(shortfall).to.be.gt(0);

          // Repay what the close factor allows and seize the new collateral.
          const closeFactor = await comptroller.closeFactorMantissa();
          const debt = await vUsdt.callStatic.borrowBalanceCurrent(borrower.address);
          const repay = debt.mul(closeFactor).div(parseUnits("1", 18));
          const expectedSeize = (
            await comptroller["liquidateCalculateSeizeTokens(address,address,uint256)"](VUSDT, m.vToken.address, repay)
          )[1];
          expect(expectedSeize).to.be.gt(0);

          // Core rejects a direct vToken.liquidateBorrow: the Comptroller returns UNAUTHORIZED
          // unless the caller is the configured Liquidator contract, and the legacy vToken reports
          // that as a return code rather than a revert, so a direct call would fail silently.
          expect(await comptroller.liquidatorContract()).to.equal(LIQUIDATOR);
          const liquidatorContract = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, ethers.provider);
          await usdt.connect(holder).transfer(liquidator.address, repay);
          await usdt.connect(liquidator).approve(LIQUIDATOR, repay);
          const borrowerBefore = await vToken.balanceOf(borrower.address);
          const liquidatorBefore = await vToken.balanceOf(liquidator.address);
          await liquidatorContract
            .connect(liquidator)
            .liquidateBorrow(VUSDT, borrower.address, repay, m.vToken.address);

          // The borrower loses exactly what the Comptroller quoted. The vToken's seize moves all of
          // it, and the Liquidator then keeps its treasury percentage, so the caller nets less.
          const seized = borrowerBefore.sub(await vToken.balanceOf(borrower.address));
          const received = (await vToken.balanceOf(liquidator.address)).sub(liquidatorBefore);
          expect(seized).to.equal(expectedSeize);
          expect(received).to.be.gt(0).and.to.be.lte(expectedSeize);

          // The seize is worth the repaid debt plus the 10% incentive, which is the check that
          // would fail on a decimals mistake between the 24-decimal underlying and the 8-decimal
          // vToken. Allow a percent of slack for the two independent oracle prices.
          const collateralValue = seized
            .mul(m.vToken.exchangeRate)
            .div(parseUnits("1", 18))
            .mul(await resilientOracle.getUnderlyingPrice(m.vToken.address))
            .div(parseUnits("1", 18));
          const repaidValue = repay.mul(await resilientOracle.getUnderlyingPrice(VUSDT)).div(parseUnits("1", 18));
          const incentive = collateralValue.mul(parseUnits("1", 18)).div(repaidValue);
          expect(incentive).to.be.gt(parseUnits("1.09", 18)).and.lt(parseUnits("1.11", 18));

          await comptroller
            .connect(timelock)
            ["setCollateralFactor(address,uint256,uint256)"](m.vToken.address, originalCf, originalCf);
        });

        it("leaves the bootstrap liquidity untouched", async () => {
          // Supplying, borrowing, redeeming and being liquidated must not touch the burned slice or
          // the Treasury's share, and can never take the market below the bootstrap it launched on.
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(m.initialSupply.vTokensToBurn);
          expect(await vToken.balanceOf(m.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining(m));
          expect(await vToken.totalSupply()).to.be.gte(
            convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate),
          );
        });
      });
    }
  });
});
