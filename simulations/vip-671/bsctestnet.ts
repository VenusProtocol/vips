import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  DEVIATION_BOUNDED_ORACLE,
  ISOLATED_POOL_REGISTRY,
  NORMAL_TIMELOCK,
  PROTOCOL_SHARE_RESERVE,
  RESILIENT_ORACLE,
  RISK_FUND_BUYBACK,
  RISK_FUND_CONVERTER,
  SPOKE_COMPTROLLER,
  SPOKE_COMPTROLLER_BEACON,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  VTREASURY,
} from "../../vips/vip-671/addresses/bsctestnet";
import {
  CLOSE_FACTOR,
  COLLATERAL_MARKET,
  DBO_COOLDOWN_PERIOD,
  DBO_RESET_THRESHOLD,
  DBO_TRIGGER_THRESHOLD,
  LIQUIDITY_MARKET,
  MARKETS,
  MIN_LIQUIDATABLE_COLLATERAL,
  POOL_LIQUIDATION_INCENTIVE,
  POOL_NAME,
  REDUCE_RESERVES_BLOCK_DELTA,
  RISK_FUND_SHARE_BPS,
  SCHEMA_LIQUIDATION,
  SCHEMA_SPREAD,
} from "../../vips/vip-671/config";
import { REGISTRY_DRIVEN_ROLES, SPOKE_COMPTROLLER_ROLES } from "../../vips/vip-671/permissions";
import vip671 from "../../vips/vip-671/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import COMPTROLLER_ABI from "./abi/SpokeComptroller.json";
import POOL_REGISTRY_ABI from "./abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

/// A market of a LIVE isolated pool, used to prove the ProtocolShareReserve upgrade is not a
/// regression. Repointing PSR with `setPoolRegistry` instead of `addPoolRegistry` would stop this pool
/// from reporting income and revert its liquidations, which is the whole reason protocol-reserve#168
/// exists. Comptroller_StableCoins and the underlying of its first market, on bsctestnet.
const LIVE_ISOLATED_COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
const LIVE_ISOLATED_UNDERLYING = "0xe73774DfCD551BF75650772dC2cC56a2B6323453";

/// After the spoke stack landed on this chain (vUSDC_HubSpoke was deployed at 129,845,780) and before
/// this VIP runs, so the pre-VIP assertions below describe a real, untouched deployment.
const FORK_BLOCK = 129848000;

/// `AccessControlManager.isAllowedToCall` keys the role on `msg.sender`, so the only honest way to ask
/// "may X configure THIS contract" is to ask it from that contract's own address. `hasPermission` is
/// the view that takes the target explicitly, but it does NOT consult the address(0) wildcards, so it
/// answers false for roles this chain really does grant. Both matter here, and they answer different
/// questions, so the helpers are kept separate.
const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (onBehalfOf: string, account: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACM, data, from: onBehalfOf });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};

/// `PoolRegistry.addMarket` mints the seed at the market's initial exchange rate, so the receiver's
/// balance is the underlying amount scaled by it rather than the amount itself.
const seedVTokens = (amount: BigNumber, exchangeRate: BigNumber) =>
  amount.mul(BigNumber.from(10).pow(18)).div(exchangeRate);

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(SPOKE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
  const psr = new ethers.Contract(PROTOCOL_SHARE_RESERVE, PSR_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);

  describe("Pre-VIP state", () => {
    it("leaves both Ownable2Step contracts with the deployer, timelock only nominated", async () => {
      for (const c of [comptroller, registry]) {
        expect(await c.owner()).to.not.equal(NORMAL_TIMELOCK);
        expect(await c.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      }
    });

    it("has both beacons already owned by the timelock, so the VIP needs no command for them", async () => {
      const beaconAbi = ["function owner() view returns (address)"];
      for (const beacon of [SPOKE_COMPTROLLER_BEACON, SPOKE_VTOKEN_BEACON]) {
        const c = new ethers.Contract(beacon, beaconAbi, ethers.provider);
        expect(await c.owner()).to.equal(NORMAL_TIMELOCK);
      }
    });

    it("wires the comptroller to the spoke registry, not the isolated-pools one", async () => {
      // A constructor immutable with no setter, and `supportMarket` checks it. Nothing in the VIP can
      // fix a mismatch, so this is the assertion that has to hold before anything else runs.
      expect(await comptroller.poolRegistry()).to.equal(SPOKE_POOL_REGISTRY);
      expect(await comptroller.poolRegistry()).to.not.equal(ISOLATED_POOL_REGISTRY);
      expect(await comptroller.accessControlManager()).to.equal(ACM);
    });

    it("has an empty registry and no pool", async () => {
      expect(await registry.getAllPools()).to.have.lengthOf(0);
      const pool = await registry.getPoolByComptroller(SPOKE_COMPTROLLER);
      expect(pool.comptroller).to.equal(ethers.constants.AddressZero);
    });

    it("has both oracles unset, so the pool cannot be registered or serve a borrow", async () => {
      expect(await comptroller.oracle()).to.equal(ethers.constants.AddressZero);
      expect(await comptroller.deviationBoundedOracle()).to.equal(ethers.constants.AddressZero);
    });

    it("lists no market", async () => {
      expect(await comptroller.getAllMarkets()).to.have.lengthOf(0);
      for (const m of MARKETS) {
        const market = await comptroller.markets(m.vToken);
        expect(market.isListed, `${m.symbol} listed`).to.be.false;
      }
    });

    it("gives the spoke registry none of the setters addPool drives", async () => {
      // The identical wildcards exist, but they name the isolated-pools registry as the account, so
      // this registry inherits nothing and addPool would revert.
      for (const signature of REGISTRY_DRIVEN_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, SPOKE_POOL_REGISTRY, signature), `spoke registry may ${signature}`).to.be
          .false;
        expect(await mayCall(SPOKE_COMPTROLLER, ISOLATED_POOL_REGISTRY, signature), `isolated registry may ${signature}`)
          .to.be.true;
      }
    });

    it("gives the timelock none of the spoke-only roles", async () => {
      for (const signature of SPOKE_COMPTROLLER_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, NORMAL_TIMELOCK, signature), `timelock may ${signature}`).to.be.false;
      }
    });

    it("points ProtocolShareReserve at the isolated-pools registry only", async () => {
      expect(await psr.poolRegistry()).to.equal(ISOLATED_POOL_REGISTRY);
    });

    it("still routes the risk fund share through the retired converter", async () => {
      const rows = await Promise.all(
        [...Array((await psr.totalDistributions()).toNumber())].map((_, i) => psr.distributionTargets(i)),
      );
      const converterRows = rows.filter((r: any) => r.destination === RISK_FUND_CONVERTER);
      expect(converterRows).to.have.lengthOf(2);
      for (const row of converterRows) {
        expect(row.percentage).to.equal(RISK_FUND_SHARE_BPS);
      }
      expect(rows.filter((r: any) => r.destination === RISK_FUND_BUYBACK)).to.have.lengthOf(0);
    });

    it("prices both underlyings already, so the VIP needs no ResilientOracle command", async () => {
      for (const m of MARKETS) {
        expect(await resilientOracle.getPrice(m.underlying), `${m.symbol} price`).to.be.gt(0);
      }
    });

    it("bounds the liquidity underlying but not the collateral one", async () => {
      expect(await dbo.isBoundedPricingEnabled(LIQUIDITY_MARKET.underlying)).to.be.true;
      expect(await dbo.isBoundedPricingEnabled(COLLATERAL_MARKET.underlying)).to.be.false;
    });
  });

  testVip("VIP-671 Hub-Funded Spoke pool", await vip671(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [12]);
      await expectEvents(txResponse, [POOL_REGISTRY_ABI], ["PoolRegistered", "MarketAdded"], [1, MARKETS.length]);
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewPriceOracle", "NewDeviationBoundedOracle", "NewMarketLiquidationIncentive", "SupplyAllowlistEnabledUpdated"],
        [1, 1, MARKETS.length, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("hands both Ownable2Step contracts to the timelock", async () => {
      for (const c of [comptroller, registry]) {
        expect(await c.owner()).to.equal(NORMAL_TIMELOCK);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      }
    });

    it("sets both oracles", async () => {
      expect(await comptroller.oracle()).to.equal(RESILIENT_ORACLE);
      expect(await comptroller.deviationBoundedOracle()).to.equal(DEVIATION_BOUNDED_ORACLE);
    });

    it("gives the collateral underlying the same price window as the liquidity one", async () => {
      const liquidity = await dbo.assetProtectionConfig(LIQUIDITY_MARKET.underlying);
      const collateral = await dbo.assetProtectionConfig(COLLATERAL_MARKET.underlying);

      expect(await dbo.isBoundedPricingEnabled(COLLATERAL_MARKET.underlying)).to.be.true;
      expect(collateral.asset).to.equal(COLLATERAL_MARKET.underlying);
      expect(collateral.cooldownPeriod).to.equal(DBO_COOLDOWN_PERIOD);
      expect(collateral.triggerThreshold).to.equal(DBO_TRIGGER_THRESHOLD);
      expect(collateral.resetThreshold).to.equal(DBO_RESET_THRESHOLD);

      // The point of the command: the two sides of one pool are priced the same way.
      expect(collateral.cooldownPeriod).to.equal(liquidity.cooldownPeriod);
      expect(collateral.triggerThreshold).to.equal(liquidity.triggerThreshold);
      expect(collateral.resetThreshold).to.equal(liquidity.resetThreshold);
      expect(collateral.cachingEnabled).to.equal(liquidity.cachingEnabled);

      // The oracle seeds the window from spot, so it opens closed and starts unprotected.
      const spot = await resilientOracle.getPrice(COLLATERAL_MARKET.underlying);
      expect(collateral.minPrice).to.equal(spot);
      expect(collateral.maxPrice).to.equal(spot);
      expect(collateral.currentlyUsingProtectedPrice).to.be.false;
    });

    it("leaves the liquidity underlying's window untouched", async () => {
      // setTokenConfig reverts MarketAlreadyInitialized for an initialised asset, so USDT must not be
      // in the payload at all.
      const liquidity = await dbo.assetProtectionConfig(LIQUIDITY_MARKET.underlying);
      expect(liquidity.asset).to.equal(LIQUIDITY_MARKET.underlying);
      expect(await dbo.isBoundedPricingEnabled(LIQUIDITY_MARKET.underlying)).to.be.true;
    });

    it("registers the pool with the parameters it was deployed for", async () => {
      const pools = await registry.getAllPools();
      expect(pools).to.have.lengthOf(1);
      expect(pools[0].name).to.equal(POOL_NAME);
      expect(pools[0].comptroller).to.equal(SPOKE_COMPTROLLER);

      // addPool pushes these three into the comptroller itself, under the grants this VIP gives the
      // registry, so asserting them here proves those grants landed and were used.
      expect(await comptroller.closeFactorMantissa()).to.equal(CLOSE_FACTOR);
      expect(await comptroller.minLiquidatableCollateral()).to.equal(MIN_LIQUIDATABLE_COLLATERAL);
      expect(await comptroller.effectiveLiquidationIncentive(ethers.constants.AddressZero)).to.equal(
        POOL_LIQUIDATION_INCENTIVE,
      );
    });

    it("leaves the pool out of the isolated-pools registry", async () => {
      const isolated = new ethers.Contract(ISOLATED_POOL_REGISTRY, POOL_REGISTRY_ABI, ethers.provider);
      const listed = await isolated.getAllPools();
      expect(listed.map((p: any) => p.comptroller)).to.not.include(SPOKE_COMPTROLLER);
    });

    it("lists both markets with their risk parameters and caps", async () => {
      expect(await comptroller.getAllMarkets()).to.have.lengthOf(MARKETS.length);

      for (const m of MARKETS) {
        const market = await comptroller.markets(m.vToken);
        expect(market.isListed, `${m.symbol} listed`).to.be.true;
        expect(market.collateralFactorMantissa, `${m.symbol} CF`).to.equal(m.collateralFactor);
        expect(market.liquidationThresholdMantissa, `${m.symbol} LT`).to.equal(m.liquidationThreshold);
        expect(await comptroller.supplyCaps(m.vToken), `${m.symbol} supply cap`).to.equal(m.supplyCap);
        expect(await comptroller.borrowCaps(m.vToken), `${m.symbol} borrow cap`).to.equal(m.borrowCap);
      }
    });

    it("configures each vToken and seeds it to the treasury", async () => {
      for (const m of MARKETS) {
        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, ethers.provider);
        expect(await vToken.comptroller(), `${m.symbol} comptroller`).to.equal(SPOKE_COMPTROLLER);
        expect(await vToken.underlying(), `${m.symbol} underlying`).to.equal(m.underlying);
        expect(await vToken.interestRateModel(), `${m.symbol} irm`).to.equal(m.interestRateModel);
        expect(await vToken.reserveFactorMantissa(), `${m.symbol} reserve factor`).to.equal(m.reserveFactor);
        expect(await vToken.reduceReservesBlockDelta(), `${m.symbol} block delta`).to.equal(REDUCE_RESERVES_BLOCK_DELTA);

        // The seed is minted to the treasury, so it is the treasury that must hold it, not the timelock.
        const expected = seedVTokens(m.initialSupply, await vToken.exchangeRateStored());
        expect(await vToken.balanceOf(VTREASURY), `${m.symbol} seed`).to.be.closeTo(expected, expected.div(1000));
        expect(await vToken.totalSupply(), `${m.symbol} total supply`).to.be.gt(0);
      }
    });

    it("leaves no underlying approval behind on the registry", async () => {
      for (const m of MARKETS) {
        const underlying = new ethers.Contract(m.underlying, ERC20_ABI, ethers.provider);
        expect(await underlying.allowance(NORMAL_TIMELOCK, SPOKE_POOL_REGISTRY), `${m.symbol} allowance`).to.equal(0);
      }
    });

    it("pins the per-market liquidation discount on every market", async () => {
      for (const m of MARKETS) {
        expect(await comptroller.effectiveLiquidationIncentive(m.vToken), `${m.symbol} incentive`).to.equal(
          m.liquidationIncentive,
        );
      }
    });

    it("restricts supply on the liquidity market and nothing else", async () => {
      expect(await comptroller.isSupplyAllowlistEnabled(LIQUIDITY_MARKET.vToken)).to.be.true;
      for (const m of MARKETS.filter(m => m.vToken !== LIQUIDITY_MARKET.vToken)) {
        expect(await comptroller.isSupplyAllowlistEnabled(m.vToken), `${m.symbol} allowlist`).to.be.false;
      }
    });

    it("arms that allowlist with no members, so the market is closed until Phase 2", async () => {
      for (const account of [NORMAL_TIMELOCK, VTREASURY, SPOKE_POOL_REGISTRY]) {
        expect(await comptroller.isAllowedSupplier(LIQUIDITY_MARKET.vToken, account)).to.be.false;
      }
    });

    it("leaves the liquidation allowlist disabled, so liquidation stays permissionless", async () => {
      expect(await comptroller.isLiquidationAllowlistEnabled()).to.be.false;
    });

    it("grants the spoke registry exactly the setters addPool drives", async () => {
      for (const signature of REGISTRY_DRIVEN_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, SPOKE_POOL_REGISTRY, signature), `spoke registry may ${signature}`).to.be
          .true;
      }
    });

    it("grants the spoke-only roles to the Normal Timelock alone", async () => {
      for (const signature of SPOKE_COMPTROLLER_ROLES) {
        expect(await mayCall(SPOKE_COMPTROLLER, NORMAL_TIMELOCK, signature), `timelock may ${signature}`).to.be.true;
        for (const other of [bsctestnet.FAST_TRACK_TIMELOCK, bsctestnet.CRITICAL_TIMELOCK, bsctestnet.GUARDIAN]) {
          expect(await mayCall(SPOKE_COMPTROLLER, other, signature), `${other} may ${signature}`).to.be.false;
        }
      }
    });

    it("keeps the isolated-pools registry primary on ProtocolShareReserve and adds the spoke one", async () => {
      expect(await psr.poolRegistry()).to.equal(ISOLATED_POOL_REGISTRY);
      expect(await psr.getPoolRegistries()).to.include(SPOKE_POOL_REGISTRY);
    });

    it("still resolves the live isolated pools, so the upgrade is not a regression", async () => {
      // The failure mode this replaces: `setPoolRegistry` would have swapped the single registry, and
      // every existing isolated pool would have stopped taking income and started reverting on the
      // seize path the block it landed.
      expect(await psr.isMarketRegistered(LIVE_ISOLATED_COMPTROLLER, LIVE_ISOLATED_UNDERLYING)).to.be.true;
    });

    it("lets ProtocolShareReserve resolve this pool's markets", async () => {
      // The whole point of the upgrade: without it every liquidation in this pool reverts, because
      // VToken calls updateAssetsState unconditionally on the seize path.
      for (const m of MARKETS) {
        expect(await psr.isMarketRegistered(SPOKE_COMPTROLLER, m.underlying), `${m.symbol} known to PSR`).to.be.true;
      }
    });

    it("moves the risk fund share to the buyback and drops the converter rows", async () => {
      const rows = await Promise.all(
        [...Array((await psr.totalDistributions()).toNumber())].map((_, i) => psr.distributionTargets(i)),
      );
      expect(rows.filter((r: any) => r.destination === RISK_FUND_CONVERTER), "converter rows").to.have.lengthOf(0);

      const buyback = rows.filter((r: any) => r.destination === RISK_FUND_BUYBACK);
      expect(buyback.map((r: any) => r.schema).sort()).to.deep.equal([SCHEMA_SPREAD, SCHEMA_LIQUIDATION]);
      for (const row of buyback) {
        expect(row.percentage).to.equal(RISK_FUND_SHARE_BPS);
      }
    });

    it("keeps every schema summing to 100%, which ProtocolShareReserve enforces", async () => {
      const rows = await Promise.all(
        [...Array((await psr.totalDistributions()).toNumber())].map((_, i) => psr.distributionTargets(i)),
      );
      for (const schema of [SCHEMA_SPREAD, SCHEMA_LIQUIDATION]) {
        const total = rows
          .filter((r: any) => r.schema === schema)
          .reduce((sum: number, r: any) => sum + r.percentage, 0);
        expect(total, `schema ${schema} total`).to.equal(10_000);
      }
    });
  });
});
