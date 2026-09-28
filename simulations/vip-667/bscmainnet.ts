import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import ERC20_ABI from "../../src/vip-framework/abi/erc20.json";
import RESILIENT_ORACLE_ABI from "../../src/vip-framework/abi/resilientOracle.json";
import { EMODE_POOL, U_FRV_PERCENTAGE_CAP_BPS, vETH, vWBETH, vip667 } from "../../vips/vip-667/bscmainnet";
import { MIGRATOR, TREASURY_MIGRATIONS, TREASURY_SNAPSHOT_BLOCK } from "../../vips/vip-667/treasury";
import HUB_ABI from "../vip-657/abi/Hub.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const WBETH = "0xa2E3356610840701BDf5611a53974510Ae27E2e1";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// sentinel EOAs with no prior Venus state
const EMODE_USER = "0x000000000000000000000000000000000000E667";
const NON_POOL_USER = "0x000000000000000000000000000000000000E668";

forking(TREASURY_SNAPSHOT_BLOCK, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  const token = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
  const hubContract = (address: string) => new ethers.Contract(address, HUB_ABI, ethers.provider);
  const balancesBefore: Record<string, BigNumber> = {};
  const queuesBefore: Record<string, string[]> = {};
  const capsBefore: Record<
    string,
    { absoluteCap: BigNumber; percentageCapBps: number; paused: boolean; registered: boolean }
  > = {};
  const deposits: Record<string, { assets: BigNumber; shares: BigNumber }[]> = {};
  const migrationInterface = new ethers.utils.Interface([
    "event Migrated(address indexed user,address indexed vToken,address indexed hub,uint256 vTokenAmount,uint256 underlying,uint256 shares)",
  ]);
  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    // WBETH is priced off ETH; keep feeds fresh past the voting + timelock warp
    for (const asset of [ETH, WBETH, USDT]) {
      await setMaxStalePeriod(resilientOracle, new ethers.Contract(asset, ERC20_ABI, ethers.provider));
    }
  });

  before(async () => {
    for (const m of TREASURY_MIGRATIONS) {
      const hub = hubContract(m.hub);
      queuesBefore[m.key] = await hub.outerDepositQueue();
      capsBefore[m.key] = await hub.yieldGroupConfig(m.frv);
      for (const address of [m.asset, m.vToken, m.hub]) {
        for (const holder of [bscmainnet.VTREASURY, bscmainnet.NORMAL_TIMELOCK, MIGRATOR]) {
          balancesBefore[`${address}:${holder}`] = await token(address).balanceOf(holder);
        }
      }
    }
  });

  describe("Pre-VIP behavior", async () => {
    it("new ETH emode pool gets the expected id", async () => {
      expect(await comptroller.lastPoolId()).to.equal(EMODE_POOL.id - 1);
    });
  });

  describe("Treasury migration preconditions", () => {
    for (const m of TREASURY_MIGRATIONS) {
      it(`${m.key}: snapshots the complete Treasury position and matches the Hub asset`, async () => {
        expect(await token(m.asset).balanceOf(bscmainnet.VTREASURY)).to.equal(m.assetAmount);
        expect(await token(m.vToken).balanceOf(bscmainnet.VTREASURY)).to.equal(m.vTokenAmount);
        expect(await hubContract(m.hub).asset()).to.equal(m.asset);
        const vToken = new ethers.Contract(m.vToken, VTOKEN_ABI, ethers.provider);
        expect(await vToken.underlying()).to.equal(m.asset);
        const underlying = BigNumber.from(m.vTokenAmount)
          .mul(await vToken.exchangeRateStored({ blockTag: TREASURY_SNAPSHOT_BLOCK }))
          .div(parseUnits("1", 18));
        expect(await vToken.getCash()).to.be.gte(underlying);
        const expectedShares = await hubContract(m.hub).convertToShares(underlying, {
          blockTag: TREASURY_SNAPSHOT_BLOCK,
        });
        expect(BigNumber.from(m.minShares)).to.equal(expectedShares.mul(995).div(1000));
      });
    }
    it("starts with the U FRV cap at 50% and 5,000,000 U", () => {
      expect(capsBefore.U.percentageCapBps).to.equal(5000);
      expect(capsBefore.U.absoluteCap).to.equal(parseUnits("5000000", 18));
    });
  });

  // Explicit proposer and supporters known to satisfy the governance thresholds.
  testVip("VIP-667", await vip667(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: ["0x5176671de05380379399b669ed276feec99d59cb"],
    callbackAfterExecution: async txResponse => {
      const receipt = await txResponse.wait();
      for (const m of TREASURY_MIGRATIONS) {
        const hub = hubContract(m.hub);
        deposits[m.key] = receipt.logs
          .filter(
            log =>
              log.address.toLowerCase() === m.hub.toLowerCase() &&
              log.topics[0] === hub.interface.getEventTopic("Deposit"),
          )
          .map(log => hub.interface.parseLog(log).args as unknown as { assets: BigNumber; shares: BigNumber });
        expect(deposits[m.key]).to.have.length(2);
        const migrated = receipt.logs
          .filter(
            log =>
              log.address.toLowerCase() === MIGRATOR.toLowerCase() &&
              log.topics[0] === migrationInterface.getEventTopic("Migrated"),
          )
          .map(log => migrationInterface.parseLog(log).args)
          .find(event => event.vToken.toLowerCase() === m.vToken.toLowerCase());
        if (!migrated) throw new Error(`Missing ${m.key} migration event`);
        expect(migrated.user).to.equal(bscmainnet.NORMAL_TIMELOCK);
        expect(migrated.hub).to.equal(m.hub);
        expect(migrated.vTokenAmount).to.equal(m.vTokenAmount);
        expect(deposits[m.key][0].assets).to.equal(m.assetAmount);
        expect(deposits[m.key][1].assets).to.equal(migrated.underlying);
        expect(deposits[m.key][1].shares).to.equal(migrated.shares);
        expect(migrated.shares).to.be.gte(m.minShares);
      }
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "PoolCreated",
          "PoolMarketInitialized",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolFallbackStatusUpdated",
        ],
        [1, 2, 1, 1, 2, 1, 1],
      );
    },
  });

  describe("Treasury migration and FRV cap results", () => {
    for (const m of TREASURY_MIGRATIONS) {
      it(`${m.key}: deposits the complete snapshot position and returns all shares to Treasury`, async () => {
        expect(await token(m.asset).balanceOf(bscmainnet.VTREASURY)).to.equal(0);
        expect(await token(m.vToken).balanceOf(bscmainnet.VTREASURY)).to.equal(0);
        const newShares = deposits[m.key].reduce((sum, deposit) => sum.add(deposit.shares), BigNumber.from(0));
        expect(await token(m.hub).balanceOf(bscmainnet.VTREASURY)).to.equal(
          balancesBefore[`${m.hub}:${bscmainnet.VTREASURY}`].add(newShares),
        );
        expect(await hubContract(m.hub).convertToAssets(newShares)).to.be.gte(m.assetAmount);
      });

      it(`${m.key}: leaves no migration funds or approvals on the Timelock or Migrator`, async () => {
        for (const holder of [bscmainnet.NORMAL_TIMELOCK, MIGRATOR]) {
          for (const address of [m.asset, m.vToken, m.hub]) {
            expect(await token(address).balanceOf(holder)).to.equal(balancesBefore[`${address}:${holder}`]);
          }
        }
        expect(await token(m.asset).allowance(bscmainnet.NORMAL_TIMELOCK, m.hub)).to.equal(0);
        expect(await token(m.vToken).allowance(bscmainnet.NORMAL_TIMELOCK, MIGRATOR)).to.equal(0);
        expect(await token(m.asset).allowance(MIGRATOR, m.hub)).to.equal(0);
      });

      it(`${m.key}: preserves deposit queues and changes only U's FRV percentage cap`, async () => {
        const hub = hubContract(m.hub);
        const config = await hub.yieldGroupConfig(m.frv);
        expect(config.absoluteCap).to.equal(capsBefore[m.key].absoluteCap);
        expect(config.percentageCapBps).to.equal(
          m.key === "U" ? U_FRV_PERCENTAGE_CAP_BPS : capsBefore[m.key].percentageCapBps,
        );
        expect(config.paused).to.equal(capsBefore[m.key].paused);
        expect(config.registered).to.equal(capsBefore[m.key].registered);
        expect(await hub.outerDepositQueue()).to.deep.equal(queuesBefore[m.key]);
      });
    }
  });

  describe("Post-VIP behavior", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
    });

    it("should set the newly created pool as active with correct config", async () => {
      const newPool = await comptroller.pools(EMODE_POOL.id);
      expect(newPool.label).to.equals(EMODE_POOL.label);
      expect(newPool.isActive).to.equals(true);
      expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const config of Object.values(EMODE_POOL.marketsConfig)) {
        const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
        expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
      }
    });

    describe("E-mode user behavior", () => {
      const vToken = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
      const erc20 = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);

      // vToken contracts hold the underlying cash, so they double as whales
      const supply = async (user: Signer, vTokenAddress: string, underlying: string, amount: string) => {
        const whale = await initMainnetUser(vTokenAddress, parseUnits("1", 18));
        const userAddress = await user.getAddress();
        await erc20(underlying).connect(whale).transfer(userAddress, parseUnits(amount, 18));
        await erc20(underlying).connect(user).approve(vTokenAddress, parseUnits(amount, 18));
        await vToken(vTokenAddress).connect(user).mint(parseUnits(amount, 18));
      };

      let emodeUser: Signer;
      before(async () => {
        emodeUser = await initMainnetUser(EMODE_USER, parseUnits("1", 18));
        await supply(emodeUser, vWBETH, WBETH, "10");
        await comptroller.connect(emodeUser).enterMarkets([vWBETH]);
        await comptroller.connect(emodeUser).enterPool(EMODE_POOL.id);
      });

      it("prices WBETH collateral at the e-mode CF, not the core one", async () => {
        const supplied = await vToken(vWBETH).callStatic.balanceOfUnderlying(EMODE_USER);
        const price = await resilientOracle.getUnderlyingPrice(vWBETH);
        const expected = supplied
          .mul(price)
          .div(parseUnits("1", 18))
          .mul(EMODE_POOL.marketsConfig.vWBETH.collateralFactor)
          .div(parseUnits("1", 18));
        const [, liquidity, shortfall] = await comptroller.getBorrowingPower(EMODE_USER);
        expect(shortfall).to.equal(0);
        expect(liquidity).to.be.closeTo(expected, expected.div(1_000_000));
      });

      it("can borrow ETH against WBETH", async () => {
        const before = await erc20(ETH).balanceOf(EMODE_USER);
        await vToken(vETH).connect(emodeUser).borrow(parseUnits("5", 18));
        expect(await erc20(ETH).balanceOf(EMODE_USER)).to.equal(before.add(parseUnits("5", 18)));
      });

      it("cannot borrow WBETH", async () => {
        await expect(vToken(vWBETH).connect(emodeUser).borrow(parseUnits("0.1", 18))).to.be.revertedWithCustomError(
          comptroller,
          "BorrowNotAllowedInPool",
        );
      });

      it("cannot borrow a market outside the pool", async () => {
        await expect(vToken(vUSDT).connect(emodeUser).borrow(parseUnits("10", 18))).to.be.revertedWithCustomError(
          comptroller,
          "BorrowNotAllowedInPool",
        );
      });

      it("values non-pool collateral at its core CF and ETH at 0 (fallback on)", async () => {
        const user = await initMainnetUser(NON_POOL_USER, parseUnits("1", 18));
        await supply(user, vETH, ETH, "1");
        await supply(user, vUSDT, USDT, "1000");
        await comptroller.connect(user).enterMarkets([vETH, vUSDT]);
        await comptroller.connect(user).enterPool(EMODE_POOL.id);

        const supplied = await vToken(vUSDT).callStatic.balanceOfUnderlying(NON_POOL_USER);
        const price = await resilientOracle.getUnderlyingPrice(vUSDT);
        const { collateralFactorMantissa } = await comptroller.markets(vUSDT);
        const expected = supplied
          .mul(price)
          .div(parseUnits("1", 18))
          .mul(collateralFactorMantissa)
          .div(parseUnits("1", 18));
        const [, liquidity] = await comptroller.getBorrowingPower(NON_POOL_USER);
        expect(expected).to.be.gt(0);
        expect(liquidity).to.be.closeTo(expected, expected.div(1_000_000));
      });
    });
  });
});
