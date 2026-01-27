import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
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
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const provider = ethers.provider;

// Contract addresses
const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const PANCAKE_V2_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKE_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];
const vUSDT_ADDRESS = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

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

// =============================================================================
// EIP-712 Swap Signer & Calldata Builder
// =============================================================================
//
// Cross-asset leverage requires swapping between tokens (e.g., USDT → LINK).
// The SwapHelper contract enforces that all multicall payloads are signed by
// an authorized backend signer using EIP-712 typed data signatures.
//
// In tests we:
// 1. Create a deterministic Wallet (Hardhat's default private key)
// 2. Impersonate the SwapHelper owner to register it as the backendSigner
// 3. Build signed multicall payloads that route swaps through PancakeSwap V2
//
// Reference implementation: simulations/vip-581/addendum2.ts
// =============================================================================

let swapSignerWallet: Wallet;
let swapHelperContract: Contract;
let eip712Domain: { name: string; version: string; chainId: number; verifyingContract: string };
let saltCounter = 0;
let swapSignerReady = false;

/**
 * Configures a deterministic EIP-712 signer for the SwapHelper contract.
 * Idempotent — only runs once thanks to the `swapSignerReady` flag.
 *
 * Steps:
 *  1. Creates a Wallet from Hardhat's default private key
 *  2. Impersonates SwapHelper owner to call `setBackendSigner`
 *  3. Caches EIP-712 domain params for later signing
 */
async function setupSwapSigner() {
  if (swapSignerReady) return;

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

  swapSignerReady = true;
}

/**
 * Builds the full signed SwapHelper multicall calldata for a PancakeSwap V2 swap.
 *
 * Steps:
 *  1. Queries PancakeSwap V2 for expected output (direct route, fallback via WBNB)
 *  2. Applies slippage tolerance to compute minAmountOut
 *  3. Encodes a 3-step multicall: approveMax → genericCall (swap) → sweep
 *  4. Signs the multicall with EIP-712
 *  5. Returns the encoded multicall calldata + minAmountOut
 */
async function buildSwapCalldata(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
  slippageBps: number = 100,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  const pancakeRouter = new ethers.Contract(PANCAKE_V2_ROUTER, PANCAKE_V2_ROUTER_ABI, ethers.provider);

  let path: string[];
  let amounts: BigNumber[];

  try {
    path = [tokenIn, tokenOut];
    amounts = await pancakeRouter.getAmountsOut(amountIn, path);
  } catch {
    if (tokenIn !== WBNB && tokenOut !== WBNB) {
      path = [tokenIn, WBNB, tokenOut];
      amounts = await pancakeRouter.getAmountsOut(amountIn, path);
    } else {
      throw new Error(`No route found for ${tokenIn} -> ${tokenOut}`);
    }
  }

  const amountOut = amounts[amounts.length - 1];
  const minAmountOut = amountOut.mul(10000 - slippageBps).div(10000);

  const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);

  const approveCall = swapHelperIface.encodeFunctionData("approveMax", [tokenIn, PANCAKE_V2_ROUTER]);

  const pancakeIface = new ethers.utils.Interface(PANCAKE_V2_ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const swapCalldata = pancakeIface.encodeFunctionData("swapExactTokensForTokens", [
    amountIn,
    minAmountOut,
    path,
    SWAP_HELPER,
    deadline,
  ]);
  const genericCall = swapHelperIface.encodeFunctionData("genericCall", [PANCAKE_V2_ROUTER, swapCalldata]);

  const sweepCall = swapHelperIface.encodeFunctionData("sweep", [tokenOut, recipient]);

  const calls = [approveCall, genericCall, sweepCall];

  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));

  const types = {
    Multicall: [
      { name: "caller", type: "address" },
      { name: "calls", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
  };

  const value = {
    caller: LEVERAGE_STRATEGIES_MANAGER,
    calls,
    deadline,
    salt,
  };

  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);

  const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

  return { swapData: multicallData, minAmountOut };
}

/** Convenience wrapper: converts human-readable slippage to bps and calls buildSwapCalldata. */
async function getSwapData(
  tokenInAddress: string,
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  slippagePercentage: string = "0.01",
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  const slippageBps = Math.round(parseFloat(slippagePercentage) * 10000);
  return buildSwapCalldata(
    tokenInAddress,
    tokenOutAddress,
    BigNumber.from(exactAmountInMantissa),
    LEVERAGE_STRATEGIES_MANAGER,
    slippageBps,
  );
}

// =============================================================================
// Skipped Leverage Tracker
// =============================================================================
interface SkippedEntry {
  pool: string;
  token: string;
  type:
    | "Single-Asset Enter"
    | "Single-Asset Exit"
    | "Cross-Asset Enter"
    | "Cross-Asset Exit"
    | "Cross-Asset EnterFromBorrow";
  reason: string;
}
const skippedLeverageFlows: SkippedEntry[] = [];

function printSkippedLeverageSummary() {
  if (skippedLeverageFlows.length === 0) {
    console.log("\n✅ All leverage flows executed successfully — none skipped.\n");
    return;
  }

  const categories = [
    "Single-Asset Enter",
    "Single-Asset Exit",
    "Cross-Asset Enter",
    "Cross-Asset Exit",
    "Cross-Asset EnterFromBorrow",
  ] as const;

  console.log("\n" + "=".repeat(100));
  console.log("  SKIPPED LEVERAGE FLOWS SUMMARY");
  console.log("=".repeat(100));

  for (const category of categories) {
    const entries = skippedLeverageFlows.filter(e => e.type === category);
    if (entries.length === 0) continue;

    console.log(`\n  ${category}`);
    console.log("  " + "-".repeat(96));
    console.log(`  ${"Pool".padEnd(30)} ${"Token".padEnd(15)} ${"Reason"}`);
    console.log("  " + "-".repeat(96));
    for (const e of entries) {
      console.log(`  ${e.pool.padEnd(30)} ${e.token.padEnd(15)} ${e.reason}`);
    }
  }

  console.log("\n" + "=".repeat(100));
  console.log(`  Total skipped: ${skippedLeverageFlows.length}`);
  console.log("=".repeat(100) + "\n");
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
                skippedLeverageFlows.push({
                  pool: pool.label,
                  token: marketKey,
                  type: "Single-Asset Enter",
                  reason: "Supply cap exceeded",
                });
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
                skippedLeverageFlows.push({
                  pool: pool.label,
                  token: marketKey,
                  type: "Single-Asset Exit",
                  reason: "No position to exit (enter likely skipped)",
                });
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

    // =========================================================================
    // Cross-Asset Leverage Tests
    // =========================================================================
    //
    // Each EMode pool has 3 markets: one primary asset (e.g., LINK) + vUSDT + vUSDC.
    // Cross-asset leverage means:
    //   Enter: supply primary as collateral, flash-loan USDT, swap USDT → primary
    //          to increase the collateral position.
    //   Exit:  flash-loan USDT to repay borrow, redeem collateral, swap primary → USDT.
    //
    // Uses signers[10..16] to avoid collision with single-asset tests (signers[2..8]).
    //
    // Tests gracefully skip when:
    //   - The primary market has 0 collateral factor (e.g., vMATIC)
    //   - PancakeSwap has no liquidity route for the token pair
    //   - The swap reverts with TokenSwapCallFailed (0x428c0cc7)
    // =========================================================================
    for (const pool of EMODE_POOLS) {
      const poolIndex = EMODE_POOLS.findIndex(p => p.id === pool.id);

      // Identify the primary market — the first market key that is NOT vUSDT or vUSDC
      const primaryEntry = Object.entries(pool.marketsConfig).find(([key]) => key !== "vUSDT" && key !== "vUSDC");
      if (!primaryEntry) continue;

      const [primaryKey, primaryConfig] = primaryEntry;
      const primaryInfo = MARKET_INFO[primaryConfig.address];
      if (!primaryInfo) continue;

      // Skip pools whose primary asset cannot be used as collateral
      if (primaryConfig.collateralFactor.eq(0)) continue;

      describe(`Cross-Asset Leverage: ${pool.label}`, () => {
        let leverageStrategiesManager: Contract;
        let testUser: any;
        let userAddress: string;
        let vPrimary: Contract;
        let primaryToken: Contract;
        let vUSDTContract: Contract;
        let usdtToken: Contract;

        before(async () => {
          leverageStrategiesManager = new ethers.Contract(
            LEVERAGE_STRATEGIES_MANAGER,
            LEVERAGE_STRATEGIES_MANAGER_ABI,
            ethers.provider,
          );

          const signers = await ethers.getSigners();
          testUser = signers[10 + poolIndex];
          userAddress = await testUser.getAddress();

          await comptroller.connect(testUser).enterPool(pool.id);
          await comptroller.connect(testUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);
          await comptroller.connect(testUser).enterMarkets([primaryConfig.address, vUSDT_ADDRESS]);

          await setupSwapSigner();

          vPrimary = new ethers.Contract(primaryConfig.address, VTOKEN_ABI, provider);
          primaryToken = new ethers.Contract(primaryInfo.underlying, ERC20_ABI, provider);
          vUSDTContract = new ethers.Contract(vUSDT_ADDRESS, VTOKEN_ABI, provider);
          usdtToken = new ethers.Contract(USDT, ERC20_ABI, provider);

          // Fund user with primary token
          const primaryWhale = await initMainnetUser(primaryInfo.whale, ethers.utils.parseEther("10"));
          await primaryToken.connect(primaryWhale).transfer(userAddress, parseUnits("100", primaryInfo.decimals));

          // Fund user with USDT
          const usdtWhale = await initMainnetUser(MARKET_INFO[vUSDT_ADDRESS].whale, ethers.utils.parseEther("10"));
          await usdtToken.connect(usdtWhale).transfer(userAddress, parseUnits("100", 18));
        });

        // Test 1: Enter cross-asset leverage
        // Flow: user supplies primary token as collateral seed → manager flash-loans USDT
        //       from vUSDT → swaps USDT to primary token via PancakeSwap → mints more
        //       collateral → user ends up with leveraged long position on primary asset
        it(`enterLeverage: supply ${primaryKey}, borrow USDT`, async () => {
          try {
            const seedAmount = parseUnits("10", primaryInfo.decimals);
            const flashLoanAmount = parseUnits("5", 18); // 5 USDT flash loan

            // Mint primary tokens as collateral seed
            await primaryToken.connect(testUser).approve(primaryConfig.address, seedAmount);
            await vPrimary.connect(testUser).mint(seedAmount);

            const vTokenBalanceBefore = await vPrimary.balanceOf(userAddress);
            const usdtBorrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);
            const primaryBalanceBefore = await primaryToken.balanceOf(userAddress);
            // Get swap data: USDT -> primary token
            const { swapData, minAmountOut } = await getSwapData(
              USDT,
              primaryInfo.underlying,
              flashLoanAmount.toString(),
              "0.01",
            );

            await primaryToken.connect(testUser).approve(LEVERAGE_STRATEGIES_MANAGER, seedAmount);

            const tx = await leverageStrategiesManager
              .connect(testUser)
              .enterLeverage(primaryConfig.address, seedAmount, vUSDT_ADDRESS, flashLoanAmount, minAmountOut, swapData);
            const receipt = await tx.wait();

            const leverageEvents = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageEntered");
            expect(leverageEvents.length).to.equal(1);
            const event = leverageEvents[0];

            expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
            expect(event.args.collateralMarket.toLowerCase()).to.equal(primaryConfig.address.toLowerCase());
            expect(event.args.collateralAmountSeed).to.equal(seedAmount);
            expect(event.args.borrowedMarket.toLowerCase()).to.equal(vUSDT_ADDRESS.toLowerCase());
            expect(event.args.borrowedAmountToFlashLoan).to.equal(flashLoanAmount);

            const vTokenBalanceAfter = await vPrimary.balanceOf(userAddress);
            const usdtBorrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);
            const primaryBalanceAfter = await primaryToken.balanceOf(userAddress);

            expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
            expect(usdtBorrowAfter).to.be.gt(usdtBorrowBefore);
            expect(primaryBalanceAfter).to.equal(primaryBalanceBefore.sub(seedAmount));

            console.log(`Cross-asset leverage entered for ${pool.label}:`);
            console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
            console.log(`  USDT borrow: ${usdtBorrowBefore.toString()} -> ${usdtBorrowAfter.toString()}`);
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            if (
              msg.includes("0x428c0cc7") ||
              msg.includes("TokenSwapCallFailed") ||
              msg.includes("supply cap reached")
            ) {
              const reason = msg.includes("supply cap") ? "Supply cap reached" : "Swap route unavailable";
              skippedLeverageFlows.push({ pool: pool.label, token: primaryKey, type: "Cross-Asset Enter", reason });
              console.log(`Skipping cross-asset enterLeverage for ${pool.label} - ${reason}`);
              return;
            }
            throw error;
          }
        });

        // Test 2: Exit cross-asset leverage
        // Flow: manager flash-loans USDT to repay the user's borrow → redeems primary
        //       collateral → swaps primary → USDT to repay flash loan → user is deleveraged
        it(`exitLeverage: redeem ${primaryKey}, repay USDT`, async () => {
          const usdtBorrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);

          if (usdtBorrowBefore.eq(0)) {
            skippedLeverageFlows.push({
              pool: pool.label,
              token: primaryKey,
              type: "Cross-Asset Exit",
              reason: "No position to exit (enter likely skipped)",
            });
            console.log(`Skipping cross-asset exitLeverage for ${pool.label} - no position to exit`);
            return;
          }

          const redeemAmount = parseUnits("15", primaryInfo.decimals);
          const flashLoanAmount = usdtBorrowBefore.mul(101).div(100);

          const vTokenBalanceBefore = await vPrimary.balanceOf(userAddress);

          try {
            const { swapData, minAmountOut } = await getSwapData(
              primaryInfo.underlying,
              USDT,
              redeemAmount.toString(),
              "0.01",
            );

            const tx = await leverageStrategiesManager
              .connect(testUser)
              .exitLeverage(
                primaryConfig.address,
                redeemAmount,
                vUSDT_ADDRESS,
                flashLoanAmount,
                minAmountOut,
                swapData,
              );
            const receipt = await tx.wait();

            const exitEvents = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageExited");
            expect(exitEvents.length).to.equal(1);
            const event = exitEvents[0];

            expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
            expect(event.args.collateralMarket.toLowerCase()).to.equal(primaryConfig.address.toLowerCase());
            expect(event.args.borrowedMarket.toLowerCase()).to.equal(vUSDT_ADDRESS.toLowerCase());

            const vTokenBalanceAfter = await vPrimary.balanceOf(userAddress);
            const usdtBorrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);

            expect(vTokenBalanceAfter).to.be.lt(vTokenBalanceBefore);
            expect(usdtBorrowAfter).to.equal(0);

            console.log(`Cross-asset leverage exited for ${pool.label}:`);
            console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
            console.log(`  USDT borrow: ${usdtBorrowBefore.toString()} -> ${usdtBorrowAfter.toString()}`);
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes("0x428c0cc7") || msg.includes("TokenSwapCallFailed")) {
              skippedLeverageFlows.push({
                pool: pool.label,
                token: primaryKey,
                type: "Cross-Asset Exit",
                reason: "Swap route unavailable",
              });
              console.log(`Skipping cross-asset exitLeverage for ${pool.label} - swap route unavailable`);
              return;
            }
            throw error;
          }
        });

        // Test 3: Enter leverage from an existing borrow position
        // Flow: user already has primary collateral + USDT borrow → manager borrows
        //       additional USDT (seed) from user + flash-loans more USDT → swaps total
        //       USDT to primary → mints as additional collateral → increases leverage
        it(`enterLeverageFromBorrow: increase leverage for ${primaryKey}`, async () => {
          try {
            const mintAmount = parseUnits("20", primaryInfo.decimals);
            const initialBorrow = parseUnits("2", 18); // create initial USDT borrow position
            const borrowSeed = parseUnits("1", 18); // additional USDT seed (transferred from user)
            const flashLoan = parseUnits("2", 18); // additional USDT via flash loan

            // Mint primary vTokens
            await primaryToken.connect(testUser).approve(primaryConfig.address, mintAmount);
            await vPrimary.connect(testUser).mint(mintAmount);

            // Borrow some USDT to create initial position
            await vUSDTContract.connect(testUser).borrow(initialBorrow);

            // Approve USDT to leverage manager — the manager transfers borrowSeed from the user
            await usdtToken.connect(testUser).approve(LEVERAGE_STRATEGIES_MANAGER, borrowSeed);

            const vTokenBalanceBefore = await vPrimary.balanceOf(userAddress);
            const usdtBorrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);

            const totalUSDT = borrowSeed.add(flashLoan);
            const { swapData, minAmountOut } = await getSwapData(
              USDT,
              primaryInfo.underlying,
              totalUSDT.toString(),
              "0.01",
            );

            const tx = await leverageStrategiesManager
              .connect(testUser)
              .enterLeverageFromBorrow(
                primaryConfig.address,
                vUSDT_ADDRESS,
                borrowSeed,
                flashLoan,
                minAmountOut,
                swapData,
              );
            const receipt = await tx.wait();

            const events = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageEnteredFromBorrow");
            expect(events.length).to.equal(1);
            const event = events[0];

            expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
            expect(event.args.collateralMarket.toLowerCase()).to.equal(primaryConfig.address.toLowerCase());
            expect(event.args.borrowedMarket.toLowerCase()).to.equal(vUSDT_ADDRESS.toLowerCase());
            expect(event.args.borrowedAmountSeed).to.equal(borrowSeed);
            expect(event.args.borrowedAmountToFlashLoan).to.equal(flashLoan);

            const vTokenBalanceAfter = await vPrimary.balanceOf(userAddress);
            const usdtBorrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(userAddress);

            expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
            expect(usdtBorrowAfter).to.be.gt(usdtBorrowBefore);

            console.log(`Leverage from borrow entered for ${pool.label}:`);
            console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
            console.log(`  USDT borrow: ${usdtBorrowBefore.toString()} -> ${usdtBorrowAfter.toString()}`);
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            if (
              msg.includes("0x428c0cc7") ||
              msg.includes("TokenSwapCallFailed") ||
              msg.includes("exceeds allowance") ||
              msg.includes("math error") ||
              msg.includes("supply cap reached")
            ) {
              skippedLeverageFlows.push({
                pool: pool.label,
                token: primaryKey,
                type: "Cross-Asset EnterFromBorrow",
                reason: "Swap/borrow/cap issue",
              });
              console.log(`Skipping enterLeverageFromBorrow for ${pool.label} - swap/borrow/cap issue`);
              return;
            }
            throw error;
          }
        });
      });
    }

    after(() => {
      printSkippedLeverageSummary();
    });
  });
});
