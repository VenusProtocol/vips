import { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { CORE_MARKETS } from "../../vips/vip-547/bscmainnet";
import { EMODE_POOLS as EMODE_POOLS_PART1, vip800 } from "../../vips/vip-800/bscmainnet";
import { EMODE_POOLS, vip800 as vip800_2 } from "../../vips/vip-800/bscmainnet-2";
import LEVERAGE_STRATEGIES_MANAGER_ABI from "../vip-576/abi/LeverageStrategiesManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const provider = ethers.provider;

// Contract addresses
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDC_WHALE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

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
  // LINK (Part-1)
  "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f": {
    underlying: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", // LINK
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // link whale
    decimals: 18,
  },
  // UNI (Part-1)
  "0x27FF564707786720C71A2e5c1490A63266683612": {
    underlying: "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1", // UNI
    whale: "0x27FF564707786720C71A2e5c1490A63266683612", // uni whale
    decimals: 18,
  },
  // AAVE (Part-1)
  "0x26DA28954763B92139ED49283625ceCAf52C6f94": {
    underlying: "0xfb6115445Bff7b52FeB98650C87f44907E58f802", // AAVE
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // aave whale
    decimals: 18,
  },
  // DOGE (Part-1)
  "0xec3422Ef92B2fb59e84c8B02Ba73F1fE84Ed8D71": {
    underlying: "0xba2ae424d960c26247dd6c32edc70b295c744c43", // DOGE
    whale: "0x0000000000000000000000000000000000001004", // doge whale
    decimals: 8,
  },
  // BCH (Part-1)
  "0x5F0388EBc2B94FA8E123F404b79cCF5f40b29176": {
    underlying: "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf", // BCH
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // bch whale
    decimals: 18,
  },
  // TWT (Part-1)
  "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc": {
    underlying: "0x4B0F1812e5Df2A09796481Ff14017e6005508003", // TWT
    whale: "0x8808390062EBcA540ff10ee43DB60125bB061621", // twt whale
    decimals: 18,
  },
  // ADA (Part-1)
  "0x9A0AF7FDb2065Ce470D72664DE73cAE409dA28Ec": {
    underlying: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", // ADA
    whale: "0x835678a611B28684005a5e2233695fB6cbbB0007", // ada whale
    decimals: 18,
  },
  // LTC
  "0x57A5297F2cB2c0AaC9D554660acd6D385Ab50c6B": {
    underlying: "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94", // LTC
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // ltc whale
    decimals: 18,
  },
  // FIL
  "0xf91d58b5aE142DAcC749f58A49FCBac340Cb0343": {
    underlying: "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153", // FIL
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // fil whale
    decimals: 18,
  },
  // MATIC
  "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8": {
    underlying: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD", // MATIC
    whale: "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", // matic whale
    decimals: 18,
  },
  // TRX
  "0xC5D3466aA484B040eE977073fcF337f2c00071c1": {
    underlying: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", // TRX
    whale: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9", // trx whale
    decimals: 6,
  },
  // DOT
  "0x1610bc33319e9398de5f57B33a5b184c806aD217": {
    underlying: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", // DOT
    whale: "0xF977814e90dA44bFA03b6295A0616a897441aceC", // dot whale
    decimals: 18,
  },
  // THE
  "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f": {
    underlying: "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11", // THE
    whale: "0xfBBF371C9B0B994EebFcC977CEf603F7f31c070D", // the whale
    decimals: 18,
  },
};

// =============================================================================
// EIP-712 Swap Signer & Calldata Builder
// =============================================================================

let swapSignerWallet: Wallet;
let swapHelperContract: Contract;
let eip712Domain: { name: string; version: string; chainId: number; verifyingContract: string };

/**
 * Configures a deterministic EIP-712 signer for the SwapHelper contract on the forked chain.
 *
 * In production, the SwapHelper requires a backend signer to authorize multicall executions
 * via EIP-712 signatures. In tests, we:
 * 1. Create a deterministic Hardhat wallet (using Hardhat's default private key)
 * 2. Impersonate the SwapHelper owner to register this wallet as the authorized backendSigner
 * 3. Cache the EIP-712 domain parameters (name, version, chainId, verifyingContract) for later signing
 */
async function setupSwapSigner() {
  swapSignerWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethers.provider);

  swapHelperContract = new ethers.Contract(SWAP_HELPER, SWAP_HELPER_ABI, ethers.provider);

  const swapHelperOwner = await swapHelperContract.owner();
  const impersonatedOwner = await initMainnetUser(swapHelperOwner, ethers.utils.parseEther("1"));
  await swapHelperContract.connect(impersonatedOwner).setBackendSigner(swapSignerWallet.address);

  const domain = await swapHelperContract.eip712Domain();
  const network = await ethers.provider.getNetwork();
  eip712Domain = {
    name: domain.name,
    version: domain.version,
    chainId: network.chainId,
    verifyingContract: domain.verifyingContract,
  };
}

forking(76766086, async () => {
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

    const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
    const THE_REDSTONE_FEED = "0xFB1267A29C0aa19daae4a483ea895862A69e4AA5";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, THE, THE_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK);

    const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
    const TRX_REDSTONE_FEED = "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916";
    await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, TRX, TRX_REDSTONE_FEED, bscmainnet.NORMAL_TIMELOCK, 3153600000, {
      tokenDecimals: 6,
    });
  });

  describe("Pre-VIP behavior", () => {
    it("check new Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });
  });

  testVip("VIP-800 Part-1", await vip800(), {
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

  testVip("VIP-800 Part-2", await vip800_2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "NewCollateralFactor", // vMatic has 0 collateral factor, so no event for it
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
          "PoolFallbackStatusUpdated",
        ],
        [17, 18, 18, 18, 6, 18, 6],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });

    // Verify Part-1 pools remain correctly configured after Part-2
    for (const EMODE_POOL of EMODE_POOLS_PART1) {
      describe(`Part-1 Emode Pool ${EMODE_POOL.label}`, () => {
        it("should still be active with correct label and fallback", async () => {
          const pool = await comptroller.pools(EMODE_POOL.id);
          expect(pool.label).to.equals(EMODE_POOL.label);
          expect(pool.isActive).to.equals(true);
          expect(pool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
        });

        for (const [marketKey, config] of Object.entries(EMODE_POOL.marketsConfig)) {
          it(`should have correct risk parameters for ${marketKey}`, async () => {
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

    // Verify Part-2 pools
    for (const EMODE_POOL of EMODE_POOLS) {
      describe(`Part-2 Emode Pool ${EMODE_POOL.label}`, () => {
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

    // Part-1 mint/borrow/repay/redeem tests
    for (const pool of EMODE_POOLS_PART1) {
      describe(`EMode Pool (Part-1): ${pool.label}`, () => {
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

    // Part-2 mint/borrow/repay/redeem tests
    for (const pool of EMODE_POOLS) {
      describe(`EMode Pool (Part-2): ${pool.label}`, () => {
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

    // single-asset leverage tests
    for (const pool of EMODE_POOLS) {
      describe(`EMode Pool: ${pool.label}`, () => {
        let leverageStrategiesManager: Contract;
        let testUser: any;
        let leverageTestUser: any;
        let usdc: Contract;

        before(async () => {
          leverageStrategiesManager = new ethers.Contract(
            LEVERAGE_STRATEGIES_MANAGER,
            LEVERAGE_STRATEGIES_MANAGER_ABI,
            ethers.provider,
          );

          usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);

          // Use a unique/fresh signer for each pool to avoid EMode pool entry conflicts
          const signers = await ethers.getSigners();
          const poolIndex = EMODE_POOLS.findIndex(p => p.id === pool.id);
          testUser = signers[poolIndex % signers.length];
          leverageTestUser = signers[(poolIndex + 1) % signers.length];

          await comptroller.connect(testUser).enterPool(pool.id);

          // Approve leverage manager to act on behalf of user (updateDelegate)
          await comptroller.connect(testUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);

          // Setup the EIP-712 swap signer so we can build signed multicall calldata
          await setupSwapSigner();
        });

        for (const [marketKey, config] of Object.entries(pool.marketsConfig)) {
          const marketInfo = MARKET_INFO[config.address];
          if (!marketInfo) continue;
          if (marketKey === "vMATIC" || marketKey === "vTRX" || marketKey === "vTHE") continue; // supply cap reached

          const { address: vTokenAddr } = config;
          const { underlying, whale, decimals } = marketInfo;

          describe(`${marketKey} market`, () => {
            let vToken: any;
            let token: any;

            before(async () => {
              vToken = new ethers.Contract(vTokenAddr, VTOKEN_ABI, provider);
              token = new ethers.Contract(underlying, ERC20_ABI, provider);

              const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("10"));
              await usdc.connect(usdcWhale).transfer(await leverageTestUser.getAddress(), parseUnits("1000", 18));

              // Fund user
              const whaleSigner = await initMainnetUser(whale, ethers.utils.parseEther("10"));
              await token.connect(whaleSigner).transfer(await testUser.getAddress(), parseUnits("100", decimals));
            });

            it("Has flash loans enabled", async () => {
              const isFlashLoanEnabled = await vToken.isFlashLoanEnabled();
              expect(isFlashLoanEnabled).to.be.equal(true);
            });

            it("LeverageStrategiesManager: enterSingleAssetLeverage with value checks", async () => {
              const userAddress = await testUser.getAddress();
              const collateralAmountSeed = parseUnits("10", 18);
              const collateralAmountToFlashLoan = parseUnits("5", 18);

              // Approve underlying tokens to vtoken for minting collateral first
              await token.connect(testUser).approve(vTokenAddr, collateralAmountSeed);

              // Mint vtokens as collateral
              await vToken.connect(testUser).mint(collateralAmountSeed);

              // Enter market so vtokens can be used as collateral
              await comptroller.connect(testUser).enterMarkets([vTokenAddr]);

              // Get balances before
              const vTokenBalanceBefore = await vToken.balanceOf(userAddress);
              const borrowBalanceBefore = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              // Call enterSingleAssetLeverage
              const tx = await leverageStrategiesManager
                .connect(testUser)
                .enterSingleAssetLeverage(vTokenAddr, 0, collateralAmountToFlashLoan);
              const receipt = await tx.wait();

              // Parse and verify SingleAssetLeverageEntered event
              const iface = new ethers.utils.Interface(LEVERAGE_STRATEGIES_MANAGER_ABI);
              const leverageEvents = receipt.logs
                .map((log: { topics: string[]; data: string }) => {
                  try {
                    return iface.parseLog(log);
                  } catch {
                    return null;
                  }
                })
                .filter((e: { name: string } | null) => e && e.name === "SingleAssetLeverageEntered");

              expect(leverageEvents.length).to.equal(1);
              const event = leverageEvents[0];

              // Verify event parameters
              expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
              expect(event.args.collateralMarket.toLowerCase()).to.equal(vTokenAddr.toLowerCase());
              expect(event.args.collateralAmountSeed).to.equal(0);
              expect(event.args.collateralAmountToFlashLoan).to.equal(collateralAmountToFlashLoan);

              // Verify balance changes
              const vTokenBalanceAfter = await vToken.balanceOf(userAddress);
              const borrowBalanceAfter = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              // User should have more vtokens (from flash loan collateral added)
              expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
              // User should now have a borrow balance equal to or greater than flash loan amount
              expect(borrowBalanceAfter).to.be.gt(borrowBalanceBefore);
              expect(borrowBalanceAfter).to.be.gte(collateralAmountToFlashLoan);

              console.log(`SingleAssetLeverage entered:`);
              console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
              console.log(`  Borrow: ${borrowBalanceBefore.toString()} -> ${borrowBalanceAfter.toString()}`);
            });

            it("should exit single asset leverage position with value checks", async () => {
              const userAddress = await testUser.getAddress();

              // Get current borrow balance
              const borrowBalance = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              if (borrowBalance.eq(0)) {
                console.log("Skipping exitSingleAssetLeverage test - no position to exit");
                return;
              }

              // Get balances before
              const vTokenBalanceBefore = await vToken.balanceOf(userAddress);

              // Flash loan amount: borrow balance + 1% buffer
              const flashLoanAmount = borrowBalance.mul(101).div(100);

              // Call exitSingleAssetLeverage
              const tx = await leverageStrategiesManager
                .connect(testUser)
                .exitSingleAssetLeverage(vTokenAddr, flashLoanAmount);
              const receipt = await tx.wait();

              // Parse and verify SingleAssetLeverageExited event
              const iface = new ethers.utils.Interface(LEVERAGE_STRATEGIES_MANAGER_ABI);
              const exitEvents = receipt.logs
                .map((log: { topics: string[]; data: string }) => {
                  try {
                    return iface.parseLog(log);
                  } catch {
                    return null;
                  }
                })
                .filter((e: { name: string } | null) => e && e.name === "SingleAssetLeverageExited");

              expect(exitEvents.length).to.equal(1);
              const event = exitEvents[0];

              // Verify event parameters
              expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
              expect(event.args.collateralMarket.toLowerCase()).to.equal(vTokenAddr.toLowerCase());
              expect(event.args.collateralAmountToFlashLoan).to.equal(flashLoanAmount);

              // Get balances after
              const vTokenBalanceAfter = await vToken.balanceOf(userAddress);
              const borrowBalanceAfter = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              // Borrow balance should be zero
              expect(borrowBalanceAfter).to.equal(0);

              // User should have less vToken (used to repay flash loan)
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
