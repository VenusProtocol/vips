import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { CORE_MARKETS } from "../../vips/vip-547/bscmainnet";
import { EMODE_POOLS, vip800 } from "../../vips/vip-800/bscmainnet";
import LEVERAGE_STRATEGIES_MANAGER_ABI from "../vip-576/abi/LeverageStrategiesManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const provider = ethers.provider;

// Contract addresses
const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";

// Map vToken address to underlying and whale (update as needed)
const MARKET_INFO: Record<string, { underlying: string; whale: string; decimals: number }> = {
  // USDT
  "0xfD5840Cd36d94D7229439859C0112a4185BC0255": {
    underlying: "0x55d398326f99059fF775485246999027B3197955", // USDT
    whale: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", // usdt whale
    decimals: 18,
  },
  // USDC
  "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8": {
    underlying: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
    whale: "0x98ADeF6F2ac8572ec48965509d69A8Dd5E8BbA9D", // usdc whale
    decimals: 18,
  },
  // LINK
  "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f": {
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // link whale
    decimals: 18,
  },
  // UNI
  "0x27FF564707786720C71A2e5c1490A63266683612": {
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", // UNI
    whale: "0x27FF564707786720C71A2e5c1490A63266683612", // uni whale
    decimals: 18,
  },
  // AAVE
  "0x26DA28954763B92139ED49283625ceCAf52C6f94": {
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802", // AAVE
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // aave whale
    decimals: 18,
  },
  // DOGE
  "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71": {
    underlying: "0xba2ae424d960c26247dd6c32edc70b295c744c43", // DOGE
    whale: "0x0000000000000000000000000000000000001004", // doge whale
    decimals: 8,
  },
  // BCH
  "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176": {
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", // BCH
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // bch whale
    decimals: 18,
  },
  // TWT
  "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc": {
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003", // TWT
    whale: "0x8808390062EBcA540ff10ee43DB60125bB061621", // twt whale
    decimals: 18,
  },
  // ADA
  "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec": {
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", // ADA
    whale: "0x835678a611B28684005a5e2233695fB6cbbB0007", // ada whale
    decimals: 18,
  },
};

/**
 * Parse transaction logs and find events matching a given name.
 */
function findEvents(logs: { topics: string[]; data: string }[], abi: any[], eventName: string) {
  const iface = new ethers.utils.Interface(abi);
  return logs
    .map(log => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter((e): e is NonNullable<typeof e> => e !== null && e.name === eventName);
}

const FORK_BLOCK = 77663527;
forking(FORK_BLOCK, async () => {
  let comptroller: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);

    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        3153600000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        market.underlying,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        3153600000,
      );

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, market.symbol.slice(1), 315360000);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("check new Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });
  });

  testVip("VIP-800", await vip800(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
          "PoolFallbackStatusUpdated",
        ],
        [21, 21, 21, 21, 7, 21, 7],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });

    for (const EMODE_POOL of EMODE_POOLS) {
      describe(`Emode Pool ${EMODE_POOL.label}`, () => {
        it("should set the newly created pool as active with correct label", async () => {
          const newPool = await comptroller.pools(EMODE_POOL.id);
          expect(newPool.label).to.equals(EMODE_POOL.label);
          expect(newPool.isActive).to.equals(true);
          expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
        });

        for (const [marketKey, config] of Object.entries(EMODE_POOL.marketsConfig)) {
          it(`should set the correct risk parameters for ${marketKey}`, async () => {
            const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
            expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
            expect(marketData.isListed).to.be.equal(true);
            expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
            expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
            expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
            expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
          });
        }
      });
    }

    for (const pool of EMODE_POOLS) {
      describe(`EMode Pool: ${pool.label}`, () => {
        let user: any;
        let userAddress: string;

        before(async () => {
          [user] = await ethers.getSigners();
          userAddress = await user.getAddress();

          // Enter E-Mode once per pool
          await comptroller.connect(user).enterPool(pool.id);
        });

        for (const [marketKey, config] of Object.entries(pool.marketsConfig)) {
          const marketInfo = MARKET_INFO[config.address];
          if (!marketInfo) continue;

          const { address: vTokenAddr } = config;
          const { underlying, whale, decimals } = marketInfo;

          describe(`${marketKey} market`, () => {
            let vToken: any;
            let token: any;

            const mintAmount = parseUnits("10", decimals);
            const borrowAmount = parseUnits("0.1", decimals);
            const redeemAmount = parseUnits("0.5", decimals);

            before(async () => {
              vToken = new ethers.Contract(vTokenAddr, VTOKEN_ABI, provider);
              token = new ethers.Contract(underlying, ERC20_ABI, provider);

              // Fund user
              const whaleSigner = await initMainnetUser(whale, ethers.utils.parseEther("10"));
              await token.connect(whaleSigner).transfer(userAddress, mintAmount);

              // Approve + enter market
              await token.connect(user).approve(vTokenAddr, mintAmount);
              await comptroller.connect(user).enterMarkets([vTokenAddr]);
            });

            /* ----------------------------- Helpers ----------------------------- */

            const isPaused = async (action: number) => comptroller.actionPaused(vTokenAddr, action);

            const supplyCapAllowsMint = async () => {
              const supplyCap = await comptroller.supplyCaps(vTokenAddr);
              if (supplyCap.eq(0)) return false;

              const [totalSupply, exchangeRate] = await Promise.all([
                vToken.totalSupply(),
                vToken.exchangeRateStored(),
              ]);

              const nextTotalSupply = exchangeRate.mul(totalSupply).div(ethers.constants.WeiPerEther).add(mintAmount);

              return nextTotalSupply.lte(supplyCap);
            };

            /* ------------------------------ Tests ------------------------------ */

            it("User can mint", async function () {
              if (await isPaused(0)) {
                console.log(`Mint paused for ${marketKey}, skipping`);
                return;
              }

              if (!(await supplyCapAllowsMint())) {
                console.log(`Supply cap reached for ${marketKey}, skipping mint`);
                return;
              }

              const balanceBefore = await vToken.balanceOf(userAddress);
              await vToken.connect(user).mint(mintAmount);

              expect(await vToken.balanceOf(userAddress)).to.be.gt(balanceBefore);
            });

            if (config.borrowAllowed) {
              it("User can borrow", async function () {
                if (await isPaused(2)) {
                  console.log(`Borrow paused for ${marketKey}, skipping`);
                  return;
                }

                const [borrowCap, totalBorrows] = await Promise.all([
                  comptroller.borrowCaps(vTokenAddr),
                  vToken.totalBorrows(),
                ]);

                if (borrowCap.gt(0) && totalBorrows.add(borrowAmount).gt(borrowCap)) {
                  console.log(`Borrow cap reached for ${marketKey}, skipping borrow`);
                  return;
                }

                const balanceBefore = await token.balanceOf(userAddress);
                await vToken.connect(user).borrow(borrowAmount);

                expect(await token.balanceOf(userAddress)).to.be.gt(balanceBefore);
              });

              it("User can repay borrow", async () => {
                const borrowBalance = await vToken.callStatic.borrowBalanceCurrent(userAddress);

                if (borrowBalance.eq(0)) return;

                const repayAmount = borrowBalance.mul(101).div(100); // +1% buffer
                const userBalance = await token.balanceOf(userAddress);

                if (userBalance.lt(repayAmount)) {
                  const whaleSigner = await initMainnetUser(whale, ethers.utils.parseEther("10"));
                  await token.connect(whaleSigner).transfer(userAddress, repayAmount.sub(userBalance));
                }

                await token.connect(user).approve(vTokenAddr, repayAmount);
                await vToken.connect(user).repayBorrow(ethers.constants.MaxUint256);

                expect(await vToken.callStatic.borrowBalanceCurrent(userAddress)).to.eq(0);
              });
            }

            it("User can redeem", async function () {
              if (!(await supplyCapAllowsMint())) {
                console.log(`Supply cap reached for ${marketKey}, skipping redeem`);
                return;
              }

              const balanceBefore = await token.balanceOf(userAddress);
              await vToken.connect(user).redeemUnderlying(redeemAmount);

              expect(await token.balanceOf(userAddress)).to.be.gt(balanceBefore);
            });
          });
        }
      });
    }

    for (const pool of EMODE_POOLS) {
      describe(`Single-Asset Leverage: ${pool.label}`, () => {
        let leverageStrategiesManager: Contract;
        let testUser: any;

        before(async () => {
          leverageStrategiesManager = new ethers.Contract(
            LEVERAGE_STRATEGIES_MANAGER,
            LEVERAGE_STRATEGIES_MANAGER_ABI,
            ethers.provider,
          );

          // Use higher signer indices to avoid collision with signers[0] used by mint/borrow tests
          const signers = await ethers.getSigners();
          const poolIndex = EMODE_POOLS.findIndex(p => p.id === pool.id);
          testUser = signers[2 + poolIndex];

          await comptroller.connect(testUser).enterPool(pool.id);
          await comptroller.connect(testUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);
        });

        for (const [marketKey, config] of Object.entries(pool.marketsConfig)) {
          const marketInfo = MARKET_INFO[config.address];
          if (!marketInfo) continue;

          const { address: vTokenAddr } = config;
          const { underlying, whale, decimals } = marketInfo;

          describe(`${marketKey} market`, () => {
            let vToken: any;
            let token: any;

            const collateralAmountSeed = parseUnits("10", decimals);
            const collateralAmountToFlashLoan = parseUnits("5", decimals);

            const supplyCapAllowsLeverage = async () => {
              const supplyCap = await comptroller.supplyCaps(vTokenAddr);
              if (supplyCap.eq(0)) return false;

              const [totalSupply, exchangeRate] = await Promise.all([
                vToken.totalSupply(),
                vToken.exchangeRateStored(),
              ]);

              const currentSupply = exchangeRate.mul(totalSupply).div(ethers.constants.WeiPerEther);
              const needed = collateralAmountSeed.add(collateralAmountToFlashLoan);
              return currentSupply.add(needed).lte(supplyCap);
            };

            before(async () => {
              vToken = new ethers.Contract(vTokenAddr, VTOKEN_ABI, provider);
              token = new ethers.Contract(underlying, ERC20_ABI, provider);

              // Fund user
              const whaleSigner = await initMainnetUser(whale, ethers.utils.parseEther("10"));
              await token.connect(whaleSigner).transfer(await testUser.getAddress(), parseUnits("100", decimals));
            });

            it("Has flash loans enabled", async () => {
              const isFlashLoanEnabled = await vToken.isFlashLoanEnabled();
              expect(isFlashLoanEnabled).to.be.equal(true);
            });

            it("enterSingleAssetLeverage with value checks", async () => {
              if (!(await supplyCapAllowsLeverage())) {
                console.log(`Supply cap would be exceeded for ${marketKey}, skipping enter leverage`);
                return;
              }

              const userAddress = await testUser.getAddress();

              await token.connect(testUser).approve(vTokenAddr, collateralAmountSeed);
              await vToken.connect(testUser).mint(collateralAmountSeed);
              await comptroller.connect(testUser).enterMarkets([vTokenAddr]);

              const vTokenBalanceBefore = await vToken.balanceOf(userAddress);
              const borrowBalanceBefore = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              const tx = await leverageStrategiesManager
                .connect(testUser)
                .enterSingleAssetLeverage(vTokenAddr, 0, collateralAmountToFlashLoan);
              const receipt = await tx.wait();

              const leverageEvents = findEvents(
                receipt.logs,
                LEVERAGE_STRATEGIES_MANAGER_ABI,
                "SingleAssetLeverageEntered",
              );
              expect(leverageEvents.length).to.equal(1);
              const event = leverageEvents[0];

              expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
              expect(event.args.collateralMarket.toLowerCase()).to.equal(vTokenAddr.toLowerCase());
              expect(event.args.collateralAmountSeed).to.equal(0);
              expect(event.args.collateralAmountToFlashLoan).to.equal(collateralAmountToFlashLoan);

              const vTokenBalanceAfter = await vToken.balanceOf(userAddress);
              const borrowBalanceAfter = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
              expect(borrowBalanceAfter).to.be.gt(borrowBalanceBefore);
              expect(borrowBalanceAfter).to.be.gte(collateralAmountToFlashLoan);

              console.log(`SingleAssetLeverage entered:`);
              console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
              console.log(`  Borrow: ${borrowBalanceBefore.toString()} -> ${borrowBalanceAfter.toString()}`);
            });

            it("exitSingleAssetLeverage with value checks", async () => {
              const userAddress = await testUser.getAddress();
              const borrowBalance = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              if (borrowBalance.eq(0)) {
                console.log("Skipping exitSingleAssetLeverage test - no position to exit");
                return;
              }

              const vTokenBalanceBefore = await vToken.balanceOf(userAddress);
              const flashLoanAmount = borrowBalance.mul(101).div(100);

              const tx = await leverageStrategiesManager
                .connect(testUser)
                .exitSingleAssetLeverage(vTokenAddr, flashLoanAmount);
              const receipt = await tx.wait();

              const exitEvents = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "SingleAssetLeverageExited");
              expect(exitEvents.length).to.equal(1);
              const event = exitEvents[0];

              expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
              expect(event.args.collateralMarket.toLowerCase()).to.equal(vTokenAddr.toLowerCase());
              expect(event.args.collateralAmountToFlashLoan).to.equal(flashLoanAmount);

              const vTokenBalanceAfter = await vToken.balanceOf(userAddress);
              const borrowBalanceAfter = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              expect(borrowBalanceAfter).to.equal(0);
              expect(vTokenBalanceAfter).to.be.lt(vTokenBalanceBefore);

              console.log(`Single asset leverage exited:`);
              console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
              console.log(`  Token borrow: ${borrowBalance.toString()} -> ${borrowBalanceAfter.toString()}`);
            });
          });
        }
      });
    }
  });
});
