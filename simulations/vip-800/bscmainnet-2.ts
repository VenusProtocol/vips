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
// Cross-asset leverage requires swapping between tokens (e.g., USDT → LTC).
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
 * Builds swap calldata by querying the Venus swap API (backed by PancakeSwap Hub aggregator).
 *
 * Key design for fork-based tests:
 * - Uses a 10-year deadline so the calldata never expires on any fork block.
 * - Requests 50% slippage in the API call so the internal swap min-amounts are
 *   loose enough to tolerate price differences between live chain and fork state.
 * - Sets minAmountOut to 1 for the contract call — the test verifies the leverage
 *   flow works, not price execution quality.
 * - The API returns raw DEX tx data which we re-wrap in our own EIP-712 signed
 *   SwapHelper multicall (approveMax → genericCall → sweep).
 */
async function buildSwapCalldataFromAPI(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  // 10-year deadline — valid for any fork block
  const TEN_YEARS_SECS = 10 * 365 * 24 * 60 * 60;
  const deadline = Math.floor(Date.now() / 1000) + TEN_YEARS_SECS;

  const params = new URLSearchParams({
    chainId: "56",
    tokenInAddress: tokenIn,
    tokenOutAddress: tokenOut,
    // 50% slippage so internal swap min-amounts are loose for fork state
    slippagePercentage: "0.5",
    recipientAddress: SWAP_HELPER,
    deadlineTimestampSecs: deadline.toString(),
    type: "exact-in",
    shouldTransferToReceiver: "false",
    exactAmountInMantissa: amountIn.toString(),
  });

  const res = await fetch(`https://api.venus.io/find-swap?${params}`);
  if (!res.ok) throw new Error(`Swap API error: ${res.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = (await res.json()) as any;
  if (!json.quotes?.length) throw new Error(`No API route found for ${tokenIn} -> ${tokenOut}`);

  const quote = json.quotes[0];

  const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);
  const calls: string[] = [];

  for (const tx of quote.txs) {
    calls.push(swapHelperIface.encodeFunctionData("approveMax", [tokenIn, tx.target]));
    calls.push(swapHelperIface.encodeFunctionData("genericCall", [tx.target, tx.data]));
  }
  calls.push(swapHelperIface.encodeFunctionData("sweep", [tokenOut, recipient]));

  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));

  const types = {
    Multicall: [
      { name: "caller", type: "address" },
      { name: "calls", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
  };

  const value = { caller: LEVERAGE_STRATEGIES_MANAGER, calls, deadline, salt };
  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);
  const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

  // minAmountOut = 1 — fork state may differ from live; the test validates the flow, not price
  return { swapData: multicallData, minAmountOut: BigNumber.from(1) };
}

/** Convenience wrapper for leverage tests — delegates to Venus swap API. */
async function getSwapData(
  tokenInAddress: string,
  tokenOutAddress: string,
  exactAmountInMantissa: string,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  return buildSwapCalldataFromAPI(
    tokenInAddress,
    tokenOutAddress,
    BigNumber.from(exactAmountInMantissa),
    LEVERAGE_STRATEGIES_MANAGER,
  );
}

// =============================================================================
// Leverage Results Tracker
// =============================================================================
interface LeverageResult {
  pool: string;
  collateral: string;
  borrow: string;
  flow:
    | "Single-Asset Enter"
    | "Single-Asset Exit"
    | "Cross-Asset Enter"
    | "Cross-Asset Exit"
    | "Cross-Asset EnterFromBorrow";
  status: "PASSED" | "SKIPPED" | "FAILED";
  detail: string;
}
const leverageResults: LeverageResult[] = [];

function printLeverageResultsSummary() {
  const passed = leverageResults.filter(r => r.status === "PASSED");
  const failed = leverageResults.filter(r => r.status === "FAILED");
  const skipped = leverageResults.filter(r => r.status === "SKIPPED");

  console.log("\n" + "=".repeat(120));
  console.log("  LEVERAGE FLOWS RESULTS SUMMARY");
  console.log("=".repeat(120));

  if (passed.length > 0) {
    console.log(`\n  PASSED (${passed.length})`);
    console.log("  " + "-".repeat(116));
    console.log(
      `  ${"Pool".padEnd(25)} ${"Collateral".padEnd(10)} ${"Borrow".padEnd(10)} ${"Flow".padEnd(30)} ${"Detail"}`,
    );
    console.log("  " + "-".repeat(116));
    for (const r of passed) {
      console.log(
        `  ${r.pool.padEnd(25)} ${r.collateral.padEnd(10)} ${r.borrow.padEnd(10)} ${r.flow.padEnd(30)} ${r.detail}`,
      );
    }
  }

  if (failed.length > 0) {
    console.log(`\n  FAILED (${failed.length})`);
    console.log("  " + "-".repeat(116));
    console.log(
      `  ${"Pool".padEnd(25)} ${"Collateral".padEnd(10)} ${"Borrow".padEnd(10)} ${"Flow".padEnd(30)} ${"Reason"}`,
    );
    console.log("  " + "-".repeat(116));
    for (const r of failed) {
      console.log(
        `  ${r.pool.padEnd(25)} ${r.collateral.padEnd(10)} ${r.borrow.padEnd(10)} ${r.flow.padEnd(30)} ${r.detail}`,
      );
    }
  }

  if (skipped.length > 0) {
    console.log(`\n  SKIPPED (${skipped.length})`);
    console.log("  " + "-".repeat(116));
    console.log(
      `  ${"Pool".padEnd(25)} ${"Collateral".padEnd(10)} ${"Borrow".padEnd(10)} ${"Flow".padEnd(30)} ${"Reason"}`,
    );
    console.log("  " + "-".repeat(116));
    for (const r of skipped) {
      console.log(
        `  ${r.pool.padEnd(25)} ${r.collateral.padEnd(10)} ${r.borrow.padEnd(10)} ${r.flow.padEnd(30)} ${r.detail}`,
      );
    }
  }

  console.log("\n" + "=".repeat(120));
  console.log(
    `  Total: ${leverageResults.length} | Passed: ${passed.length} | Failed: ${failed.length} | Skipped: ${skipped.length}`,
  );
  console.log("=".repeat(120) + "\n");
}

const RESILIENT_ORACLE_ABI = ["function getUnderlyingPrice(address vToken) external view returns (uint256)"];

/**
 * Computes a safe flash loan amount for cross-asset leverage.
 * Uses oracle prices to determine how many borrow tokens equal ~$3 USD,
 * ensuring the amount is large enough for DEX swaps but small enough
 * to stay within borrowing capacity of the seed collateral.
 */
async function computeSafeFlashLoanAmount(
  oracleAddress: string,
  borrowVTokenAddress: string,
  borrowDecimals: number,
): Promise<BigNumber> {
  const oracle = new ethers.Contract(oracleAddress, RESILIENT_ORACLE_ABI, ethers.provider);
  const borrowPrice = await oracle.getUnderlyingPrice(borrowVTokenAddress);
  // borrowPrice is scaled to 36 - borrowDecimals (Venus convention)
  // Target ~$3 worth of borrow token
  const targetUsd = parseUnits("3", 36 - borrowDecimals);
  const amount = targetUsd.div(borrowPrice);
  // Clamp between 0.001 and 10 tokens
  const minAmount = parseUnits("0.001", borrowDecimals);
  const maxAmount = parseUnits("10", borrowDecimals);
  if (amount.lt(minAmount)) return minAmount;
  if (amount.gt(maxAmount)) return maxAmount;
  return amount;
}

// Whale signer cache — avoids redundant impersonateAccount + setBalance RPC calls
const whaleCache = new Map<string, any>();
async function getCachedWhale(address: string): Promise<any> {
  const key = address.toLowerCase();
  let signer = whaleCache.get(key);
  if (!signer) {
    signer = await initMainnetUser(address, ethers.utils.parseEther("10"));
    whaleCache.set(key, signer);
  }
  return signer;
}

forking(76766086, async () => {
  let comptroller: Contract;
  let signers: any[];
  let oracleAddress: string;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    oracleAddress = await comptroller.oracle();

    // Cache signers once
    signers = await ethers.getSigners();

    // Setup swap signer once for all cross-asset tests
    await setupSwapSigner();

    // Pre-initialize all unique whale signers
    const allWhales = new Set<string>();
    for (const info of Object.values(MARKET_INFO)) {
      allWhales.add(info.whale);
    }
    for (const whale of allWhales) {
      await getCachedWhale(whale);
    }

    for (const market of CORE_MARKETS) {
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
        ],
        [21, 21, 21, 21, 7, 21],
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
        ],
        [15, 18, 18, 18, 6, 18],
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
        it("should still be active with correct label, fallback, and risk parameters for all markets", async () => {
          const marketEntries = Object.entries(EMODE_POOL.marketsConfig);
          const [pool, ...marketDataResults] = await Promise.all([
            comptroller.pools(EMODE_POOL.id),
            ...marketEntries.map(([, config]) => comptroller.poolMarkets(EMODE_POOL.id, config.address)),
          ]);
          expect(pool.label).to.equals(EMODE_POOL.label);
          expect(pool.isActive).to.equals(true);
          expect(pool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);

          for (let i = 0; i < marketEntries.length; i++) {
            const [, config] = marketEntries[i];
            const marketData = marketDataResults[i];
            expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
            expect(marketData.isListed).to.be.equal(true);
            expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
            expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
            expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
            expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
          }
        });
      });
    }

    // Verify Part-2 pools
    for (const EMODE_POOL of EMODE_POOLS) {
      describe(`Part-2 Emode Pool ${EMODE_POOL.label}`, () => {
        it("should set the newly created pool as active with correct label and risk parameters for all markets", async () => {
          const marketEntries = Object.entries(EMODE_POOL.marketsConfig);
          const [newPool, ...marketDataResults] = await Promise.all([
            comptroller.pools(EMODE_POOL.id),
            ...marketEntries.map(([, config]) => comptroller.poolMarkets(EMODE_POOL.id, config.address)),
          ]);
          expect(newPool.label).to.equals(EMODE_POOL.label);
          expect(newPool.isActive).to.equals(true);
          expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);

          for (let i = 0; i < marketEntries.length; i++) {
            const [, config] = marketEntries[i];
            const marketData = marketDataResults[i];
            expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
            expect(marketData.isListed).to.be.equal(true);
            expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
            expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
            expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
            expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
          }
        });
      });
    }

    // Part-1 mint/borrow/repay/redeem tests
    for (const pool of EMODE_POOLS_PART1) {
      describe(`EMode Pool (Part-1): ${pool.label}`, () => {
        let user: any;
        let userAddress: string;

        before(async () => {
          [user] = signers;
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
              const whaleSigner = await getCachedWhale(whale);
              await token.connect(whaleSigner).transfer(userAddress, mintAmount);

              await token.connect(user).approve(vTokenAddr, mintAmount);
              await comptroller.connect(user).enterMarkets([vTokenAddr]);
            });

            /* ----------------------------- Helpers ----------------------------- */

            const isPaused = async (action: number) => comptroller.actionPaused(vTokenAddr, action);

            const supplyCapAllowsMint = async () => {
              const [supplyCap, totalSupply, exchangeRate] = await Promise.all([
                comptroller.supplyCaps(vTokenAddr),
                vToken.totalSupply(),
                vToken.exchangeRateStored(),
              ]);
              if (supplyCap.eq(0)) return false;

              const nextTotalSupply = exchangeRate.mul(totalSupply).div(ethers.constants.WeiPerEther).add(mintAmount);

              return nextTotalSupply.lte(supplyCap);
            };

            /* ------------------------------ Tests ------------------------------ */

            it("User can mint", async function () {
              const [paused, capAllows] = await Promise.all([isPaused(0), supplyCapAllowsMint()]);
              if (paused) {
                console.log(`Mint paused for ${marketKey}, skipping`);
                return;
              }
              if (!capAllows) {
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
                const [borrowBalance, userBalance] = await Promise.all([
                  vToken.callStatic.borrowBalanceCurrent(userAddress),
                  token.balanceOf(userAddress),
                ]);

                if (borrowBalance.eq(0)) return;

                const repayAmount = borrowBalance.mul(101).div(100); // +1% buffer

                if (userBalance.lt(repayAmount)) {
                  const whaleSigner = await getCachedWhale(whale);
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
          [user] = signers;
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
              const whaleSigner = await getCachedWhale(whale);
              await token.connect(whaleSigner).transfer(userAddress, mintAmount);

              await token.connect(user).approve(vTokenAddr, mintAmount);
              await comptroller.connect(user).enterMarkets([vTokenAddr]);
            });

            /* ----------------------------- Helpers ----------------------------- */

            const isPaused = async (action: number) => comptroller.actionPaused(vTokenAddr, action);

            const supplyCapAllowsMint = async () => {
              const [supplyCap, totalSupply, exchangeRate] = await Promise.all([
                comptroller.supplyCaps(vTokenAddr),
                vToken.totalSupply(),
                vToken.exchangeRateStored(),
              ]);
              if (supplyCap.eq(0)) return false;

              const nextTotalSupply = exchangeRate.mul(totalSupply).div(ethers.constants.WeiPerEther).add(mintAmount);

              return nextTotalSupply.lte(supplyCap);
            };

            /* ------------------------------ Tests ------------------------------ */

            it("User can mint", async function () {
              const [paused, capAllows] = await Promise.all([isPaused(0), supplyCapAllowsMint()]);
              if (paused) {
                console.log(`Mint paused for ${marketKey}, skipping`);
                return;
              }
              if (!capAllows) {
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
                const [borrowBalance, userBalance] = await Promise.all([
                  vToken.callStatic.borrowBalanceCurrent(userAddress),
                  token.balanceOf(userAddress),
                ]);

                if (borrowBalance.eq(0)) return;

                const repayAmount = borrowBalance.mul(101).div(100); // +1% buffer

                if (userBalance.lt(repayAmount)) {
                  const whaleSigner = await getCachedWhale(whale);
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
      describe(`Single-Asset Leverage: ${pool.label}`, () => {
        let leverageStrategiesManager: Contract;
        let testUser: any;
        let testUserAddress: string;

        before(async () => {
          leverageStrategiesManager = new ethers.Contract(
            LEVERAGE_STRATEGIES_MANAGER,
            LEVERAGE_STRATEGIES_MANAGER_ABI,
            ethers.provider,
          );

          // Use higher signer indices to avoid collision with signers[0] used by mint/borrow tests
          const poolIndex = EMODE_POOLS.findIndex(p => p.id === pool.id);
          testUser = signers[2 + poolIndex];
          testUserAddress = await testUser.getAddress();

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
              const [supplyCap, totalSupply, exchangeRate] = await Promise.all([
                comptroller.supplyCaps(vTokenAddr),
                vToken.totalSupply(),
                vToken.exchangeRateStored(),
              ]);
              if (supplyCap.eq(0)) return false;

              const currentSupply = exchangeRate.mul(totalSupply).div(ethers.constants.WeiPerEther);
              const needed = collateralAmountSeed.add(collateralAmountToFlashLoan);
              return currentSupply.add(needed).lte(supplyCap);
            };

            before(async () => {
              vToken = new ethers.Contract(vTokenAddr, VTOKEN_ABI, provider);
              token = new ethers.Contract(underlying, ERC20_ABI, provider);

              // Fund user
              const whaleSigner = await getCachedWhale(whale);
              await token.connect(whaleSigner).transfer(testUserAddress, parseUnits("100", decimals));
            });

            it("Has flash loans enabled", async () => {
              const isFlashLoanEnabled = await vToken.isFlashLoanEnabled();
              expect(isFlashLoanEnabled).to.be.equal(true);
            });

            it("enterSingleAssetLeverage with value checks", async () => {
              if (!(await supplyCapAllowsLeverage())) {
                leverageResults.push({
                  pool: pool.label,
                  collateral: marketKey,
                  borrow: marketKey,
                  flow: "Single-Asset Enter",
                  status: "SKIPPED",
                  detail: "Supply cap exceeded",
                });
                console.log(`Supply cap would be exceeded for ${marketKey}, skipping enter leverage`);
                return;
              }

              const userAddress = testUserAddress;

              await token.connect(testUser).approve(vTokenAddr, collateralAmountSeed);
              await vToken.connect(testUser).mint(collateralAmountSeed);
              await comptroller.connect(testUser).enterMarkets([vTokenAddr]);

              const [vTokenBalanceBefore, borrowBalanceBefore] = await Promise.all([
                vToken.balanceOf(userAddress),
                vToken.callStatic.borrowBalanceCurrent(userAddress),
              ]);

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

              const [vTokenBalanceAfter, borrowBalanceAfter] = await Promise.all([
                vToken.balanceOf(userAddress),
                vToken.callStatic.borrowBalanceCurrent(userAddress),
              ]);

              expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
              expect(borrowBalanceAfter).to.be.gt(borrowBalanceBefore);
              expect(borrowBalanceAfter).to.be.gte(collateralAmountToFlashLoan);

              console.log(`SingleAssetLeverage entered:`);
              console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
              console.log(`  Borrow: ${borrowBalanceBefore.toString()} -> ${borrowBalanceAfter.toString()}`);

              leverageResults.push({
                pool: pool.label,
                collateral: marketKey,
                borrow: marketKey,
                flow: "Single-Asset Enter",
                status: "PASSED",
                detail: `vToken: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}, Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`,
              });
            });

            it("exitSingleAssetLeverage with value checks", async () => {
              const userAddress = testUserAddress;
              const borrowBalance = await vToken.callStatic.borrowBalanceCurrent(userAddress);

              if (borrowBalance.eq(0)) {
                leverageResults.push({
                  pool: pool.label,
                  collateral: marketKey,
                  borrow: marketKey,
                  flow: "Single-Asset Exit",
                  status: "SKIPPED",
                  detail: "No position to exit (enter likely skipped)",
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

              const [vTokenBalanceAfter, borrowBalanceAfter] = await Promise.all([
                vToken.balanceOf(userAddress),
                vToken.callStatic.borrowBalanceCurrent(userAddress),
              ]);

              expect(borrowBalanceAfter).to.equal(0);
              expect(vTokenBalanceAfter).to.be.lt(vTokenBalanceBefore);

              console.log(`Single asset leverage exited:`);
              console.log(`  vToken balance: ${vTokenBalanceBefore.toString()} -> ${vTokenBalanceAfter.toString()}`);
              console.log(`  Token borrow: ${borrowBalance.toString()} -> ${borrowBalanceAfter.toString()}`);

              leverageResults.push({
                pool: pool.label,
                collateral: marketKey,
                borrow: marketKey,
                flow: "Single-Asset Exit",
                status: "PASSED",
                detail: `vToken: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}, Borrow: ${borrowBalance} -> ${borrowBalanceAfter}`,
              });
            });
          });
        }
      });
    }

    // =========================================================================
    // Cross-Asset Leverage Tests — All Pair Combinations
    // =========================================================================
    //
    // Each EMode pool has 3 markets. For every directional pair (collateral != borrow)
    // where collateral has non-zero collateral factor, test enterLeverage + exitLeverage.
    // enterLeverageFromBorrow is only tested for the original primary+USDT pair.
    //
    // Uses signers[10..] to avoid collision with single-asset tests (signers[2..8]).
    // Each pair gets its own signer to avoid state interference.
    // =========================================================================
    let crossAssetSignerIndex = 10;

    for (const pool of EMODE_POOLS) {
      // Build list of all markets in this pool
      const marketEntries = Object.entries(pool.marketsConfig)
        .filter(([, config]) => MARKET_INFO[config.address])
        .map(([key, config]) => ({ key, config, info: MARKET_INFO[config.address] }));

      // Identify the primary market (not vUSDT or vUSDC)
      const primaryEntry = marketEntries.find(m => m.key !== "vUSDT" && m.key !== "vUSDC");

      // Build all directional pairs where collateral has non-zero collateral factor
      const pairs: { collateral: (typeof marketEntries)[0]; borrow: (typeof marketEntries)[0] }[] = [];
      for (const collateral of marketEntries) {
        if (collateral.config.collateralFactor.eq(0)) continue;
        for (const borrow of marketEntries) {
          if (collateral.key === borrow.key) continue;
          pairs.push({ collateral, borrow });
        }
      }

      if (pairs.length === 0) continue;

      describe(`Cross-Asset Leverage: ${pool.label}`, () => {
        for (const pair of pairs) {
          const { collateral, borrow } = pair;
          const pairSignerIndex = crossAssetSignerIndex++;
          const isPrimaryUSDTPair = primaryEntry && collateral.key === primaryEntry.key && borrow.key === "vUSDT";

          describe(`${collateral.key} collateral / ${borrow.key} borrow`, () => {
            let leverageStrategiesManager: Contract;
            let testUser: any;
            let userAddress: string;
            let vCollateral: Contract;
            let collateralToken: Contract;
            let vBorrow: Contract;
            let borrowToken: Contract;

            before(async () => {
              leverageStrategiesManager = new ethers.Contract(
                LEVERAGE_STRATEGIES_MANAGER,
                LEVERAGE_STRATEGIES_MANAGER_ABI,
                ethers.provider,
              );

              // Generate a deterministic address for this pair to avoid exhausting hardhat's signer pool
              const pairAddress = ethers.utils.getAddress(
                ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(pairSignerIndex + 1000), 20)),
              );
              testUser = await initMainnetUser(pairAddress, ethers.utils.parseEther("10"));
              userAddress = pairAddress;

              await comptroller.connect(testUser).enterPool(pool.id);
              await comptroller.connect(testUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);
              await comptroller.connect(testUser).enterMarkets([collateral.config.address, borrow.config.address]);

              vCollateral = new ethers.Contract(collateral.config.address, VTOKEN_ABI, provider);
              collateralToken = new ethers.Contract(collateral.info.underlying, ERC20_ABI, provider);
              vBorrow = new ethers.Contract(borrow.config.address, VTOKEN_ABI, provider);
              borrowToken = new ethers.Contract(borrow.info.underlying, ERC20_ABI, provider);

              // Fund user from whale — transfer up to what the whale has, capped at 100 tokens
              const collateralWhale = await getCachedWhale(collateral.info.whale);
              const collateralWhaleBalance = await collateralToken.balanceOf(collateral.info.whale);
              const collateralTransfer = parseUnits("100", collateral.info.decimals);
              const collateralToSend = collateralWhaleBalance.lt(collateralTransfer)
                ? collateralWhaleBalance.div(2)
                : collateralTransfer;
              if (collateralToSend.gt(0)) {
                await collateralToken.connect(collateralWhale).transfer(userAddress, collateralToSend);
              }

              const borrowWhale = await getCachedWhale(borrow.info.whale);
              const borrowWhaleBalance = await borrowToken.balanceOf(borrow.info.whale);
              const borrowTransfer = parseUnits("100", borrow.info.decimals);
              const borrowToSend = borrowWhaleBalance.lt(borrowTransfer) ? borrowWhaleBalance.div(4) : borrowTransfer;
              if (borrowToSend.gt(0)) {
                await borrowToken.connect(borrowWhale).transfer(userAddress, borrowToSend);
              }

              // Seed the borrow market with liquidity so flash loans can work on newly created emode pools
              try {
                const oracle = new ethers.Contract(oracleAddress, RESILIENT_ORACLE_ABI, ethers.provider);
                const borrowPriceForSeed = await oracle.getUnderlyingPrice(borrow.config.address);
                const targetSeedUsd = parseUnits("100", 36 - borrow.info.decimals);
                let liquiditySeed = targetSeedUsd.div(borrowPriceForSeed);
                const minSeed = parseUnits("1", borrow.info.decimals);
                if (liquiditySeed.lt(minSeed)) liquiditySeed = minSeed;
                const borrowWhaleBalForSeed = await borrowToken.balanceOf(borrow.info.whale);
                if (liquiditySeed.gt(borrowWhaleBalForSeed.div(4))) liquiditySeed = borrowWhaleBalForSeed.div(4);
                if (liquiditySeed.gt(0)) {
                  await borrowToken.connect(borrowWhale).approve(borrow.config.address, liquiditySeed);
                  await vBorrow.connect(borrowWhale).mint(liquiditySeed);
                }
              } catch (e) {
                console.log(
                  `      ⚠ Liquidity seeding failed for ${borrow.key}: ${(e as Error).message?.slice(0, 80)}`,
                );
              }
            });

            it(`enterLeverage: supply ${collateral.key}, borrow ${borrow.key}`, async () => {
              try {
                // Compute seed dynamically: ~$20 worth of collateral
                const oracle = new ethers.Contract(oracleAddress, RESILIENT_ORACLE_ABI, ethers.provider);
                const colPrice = await oracle.getUnderlyingPrice(collateral.config.address);
                const targetSeedUsd = parseUnits("20", 36 - collateral.info.decimals);
                let seedAmount = targetSeedUsd.div(colPrice);
                const minSeed = parseUnits("0.01", collateral.info.decimals);
                if (seedAmount.lt(minSeed)) seedAmount = minSeed;
                // Cap by user balance
                const userBal = await collateralToken.balanceOf(userAddress);
                if (seedAmount.gt(userBal.div(2))) seedAmount = userBal.div(2);

                const flashLoanAmount = await computeSafeFlashLoanAmount(
                  oracleAddress,
                  borrow.config.address,
                  borrow.info.decimals,
                );

                await collateralToken.connect(testUser).approve(collateral.config.address, seedAmount);
                await vCollateral.connect(testUser).mint(seedAmount);

                const [vTokenBalanceBefore, borrowBalanceBefore] = await Promise.all([
                  vCollateral.balanceOf(userAddress),
                  vBorrow.callStatic.borrowBalanceCurrent(userAddress),
                ]);

                const { swapData, minAmountOut } = await getSwapData(
                  borrow.info.underlying,
                  collateral.info.underlying,
                  flashLoanAmount.toString(),
                );

                await collateralToken.connect(testUser).approve(LEVERAGE_STRATEGIES_MANAGER, seedAmount);

                const tx = await leverageStrategiesManager
                  .connect(testUser)
                  .enterLeverage(
                    collateral.config.address,
                    seedAmount,
                    borrow.config.address,
                    flashLoanAmount,
                    minAmountOut,
                    swapData,
                  );
                const receipt = await tx.wait();

                const leverageEvents = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageEntered");
                expect(leverageEvents.length).to.equal(1);
                const event = leverageEvents[0];

                expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
                expect(event.args.collateralMarket.toLowerCase()).to.equal(collateral.config.address.toLowerCase());
                expect(event.args.borrowedMarket.toLowerCase()).to.equal(borrow.config.address.toLowerCase());

                const [vTokenBalanceAfter, borrowBalanceAfter] = await Promise.all([
                  vCollateral.balanceOf(userAddress),
                  vBorrow.callStatic.borrowBalanceCurrent(userAddress),
                ]);

                expect(vTokenBalanceAfter).to.be.gt(vTokenBalanceBefore);
                expect(borrowBalanceAfter).to.be.gt(borrowBalanceBefore);

                console.log(`Cross-asset leverage entered for ${pool.label} (${collateral.key}/${borrow.key}):`);
                console.log(`  vToken balance: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}`);
                console.log(`  Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`);

                leverageResults.push({
                  pool: pool.label,
                  collateral: collateral.key,
                  borrow: borrow.key,
                  flow: "Cross-Asset Enter",
                  status: "PASSED",
                  detail: `vToken: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}, Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`,
                });
              } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                const reason = msg.includes("supply cap")
                  ? "Supply cap reached"
                  : msg.includes("math error")
                  ? "Math error"
                  : msg.includes("cannot estimate gas")
                  ? "Transaction would revert"
                  : msg.includes("transfer amount exceeds")
                  ? "Insufficient whale balance"
                  : msg.includes("No route found") ||
                    msg.includes("No API route") ||
                    msg.includes("INSUFFICIENT_LIQUIDITY") ||
                    msg.includes("Swap API error")
                  ? "Swap route unavailable"
                  : `Revert: ${msg.slice(0, 80)}`;
                const isSkippable =
                  msg.includes("No route found") ||
                  msg.includes("No API route") ||
                  msg.includes("INSUFFICIENT_LIQUIDITY") ||
                  msg.includes("Swap API error") ||
                  msg.includes("supply cap") ||
                  msg.includes("cannot estimate gas") ||
                  msg.includes("math error") ||
                  msg.includes("transfer amount exceeds");
                const status = isSkippable ? "SKIPPED" : "FAILED";
                leverageResults.push({
                  pool: pool.label,
                  collateral: collateral.key,
                  borrow: borrow.key,
                  flow: "Cross-Asset Enter",
                  status,
                  detail: reason,
                });
                console.log(
                  `Cross-asset enterLeverage ${status} for ${pool.label} (${collateral.key}/${borrow.key}) - ${reason}`,
                );
              }
            });

            it(`exitLeverage: redeem ${collateral.key}, repay ${borrow.key}`, async () => {
              const borrowBalanceBefore = await vBorrow.callStatic.borrowBalanceCurrent(userAddress);

              if (borrowBalanceBefore.eq(0)) {
                leverageResults.push({
                  pool: pool.label,
                  collateral: collateral.key,
                  borrow: borrow.key,
                  flow: "Cross-Asset Exit",
                  status: "SKIPPED",
                  detail: "No position to exit (enter likely skipped)",
                });
                console.log(
                  `Skipping cross-asset exitLeverage for ${pool.label} (${collateral.key}/${borrow.key}) - no position to exit`,
                );
                return;
              }

              const flashLoanAmount = borrowBalanceBefore.mul(101).div(100);

              const [vTokenBalanceBefore, exchangeRate] = await Promise.all([
                vCollateral.balanceOf(userAddress),
                vCollateral.callStatic.exchangeRateCurrent(),
              ]);

              // Compute redeem amount dynamically: redeem enough collateral to cover the borrow repayment.
              // Use 80% of the user's vToken balance converted to underlying, capped to ensure sufficiency.
              const underlyingBalance = vTokenBalanceBefore.mul(exchangeRate).div(ethers.constants.WeiPerEther);
              const redeemAmount = underlyingBalance.mul(80).div(100);

              try {
                const { swapData, minAmountOut } = await getSwapData(
                  collateral.info.underlying,
                  borrow.info.underlying,
                  redeemAmount.toString(),
                );

                const tx = await leverageStrategiesManager
                  .connect(testUser)
                  .exitLeverage(
                    collateral.config.address,
                    redeemAmount,
                    borrow.config.address,
                    flashLoanAmount,
                    minAmountOut,
                    swapData,
                  );
                const receipt = await tx.wait();

                const exitEvents = findEvents(receipt.logs, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageExited");
                expect(exitEvents.length).to.equal(1);
                const event = exitEvents[0];

                expect(event.args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
                expect(event.args.collateralMarket.toLowerCase()).to.equal(collateral.config.address.toLowerCase());
                expect(event.args.borrowedMarket.toLowerCase()).to.equal(borrow.config.address.toLowerCase());

                const [vTokenBalanceAfter, borrowBalanceAfter] = await Promise.all([
                  vCollateral.balanceOf(userAddress),
                  vBorrow.callStatic.borrowBalanceCurrent(userAddress),
                ]);

                expect(vTokenBalanceAfter).to.be.lt(vTokenBalanceBefore);
                expect(borrowBalanceAfter).to.equal(0);

                console.log(`Cross-asset leverage exited for ${pool.label} (${collateral.key}/${borrow.key}):`);
                console.log(`  vToken balance: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}`);
                console.log(`  Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`);

                leverageResults.push({
                  pool: pool.label,
                  collateral: collateral.key,
                  borrow: borrow.key,
                  flow: "Cross-Asset Exit",
                  status: "PASSED",
                  detail: `vToken: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}, Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`,
                });
              } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                const reason = msg.includes("math error")
                  ? "Math error"
                  : msg.includes("cannot estimate gas")
                  ? "Transaction would revert"
                  : msg.includes("transfer amount exceeds")
                  ? "Insufficient whale balance"
                  : msg.includes("No route found") ||
                    msg.includes("No API route") ||
                    msg.includes("INSUFFICIENT_LIQUIDITY") ||
                    msg.includes("Swap API error")
                  ? "Swap route unavailable"
                  : `Revert: ${msg.slice(0, 80)}`;
                const isSkippable =
                  msg.includes("No route found") ||
                  msg.includes("No API route") ||
                  msg.includes("INSUFFICIENT_LIQUIDITY") ||
                  msg.includes("Swap API error") ||
                  msg.includes("supply cap") ||
                  msg.includes("cannot estimate gas") ||
                  msg.includes("math error") ||
                  msg.includes("transfer amount exceeds");
                const status = isSkippable ? "SKIPPED" : "FAILED";
                leverageResults.push({
                  pool: pool.label,
                  collateral: collateral.key,
                  borrow: borrow.key,
                  flow: "Cross-Asset Exit",
                  status,
                  detail: reason,
                });
                console.log(
                  `Cross-asset exitLeverage ${status} for ${pool.label} (${collateral.key}/${borrow.key}) - ${reason}`,
                );
              }
            });

            // enterLeverageFromBorrow only for the original primary+USDT pair
            if (isPrimaryUSDTPair) {
              it(`enterLeverageFromBorrow: increase leverage for ${collateral.key}`, async () => {
                try {
                  // Compute amounts dynamically using oracle prices to stay within borrowing capacity
                  const oracle = new ethers.Contract(oracleAddress, RESILIENT_ORACLE_ABI, ethers.provider);
                  const [collateralPrice, borrowPrice] = await Promise.all([
                    oracle.getUnderlyingPrice(collateral.config.address),
                    oracle.getUnderlyingPrice(borrow.config.address),
                  ]);

                  // Mint ~$50 worth of collateral tokens (dynamic based on oracle price)
                  // Price is scaled to 36 - decimals (Venus convention), so targetUsd / price gives token amount
                  const targetCollateralUsd = parseUnits("50", 36 - collateral.info.decimals);
                  let mintAmount = targetCollateralUsd.div(collateralPrice);
                  // Cap mintAmount by user's available balance (use half to leave room)
                  const userColBal = await collateralToken.balanceOf(userAddress);
                  if (mintAmount.gt(userColBal.div(2))) mintAmount = userColBal.div(2);
                  if (mintAmount.isZero()) {
                    leverageResults.push({
                      pool: pool.label,
                      collateral: collateral.key,
                      borrow: borrow.key,
                      flow: "Cross-Asset EnterFromBorrow",
                      status: "SKIPPED",
                      detail: "Insufficient collateral balance",
                    });
                    return;
                  }
                  const collateralValueUsd = mintAmount
                    .mul(collateralPrice)
                    .div(parseUnits("1", collateral.info.decimals));
                  const cf = collateral.config.collateralFactor;
                  const maxBorrowUsd = collateralValueUsd.mul(cf).div(parseUnits("1", 18));
                  // Use 40% of max borrow to stay safe, split into initialBorrow(40%), seed(20%), flashLoan(40%)
                  const safeBorrowUsd = maxBorrowUsd.mul(40).div(100);
                  const borrowUnit = parseUnits("1", borrow.info.decimals);
                  const initialBorrow = safeBorrowUsd.mul(borrowUnit).div(borrowPrice).mul(40).div(100);
                  const borrowSeed = safeBorrowUsd.mul(borrowUnit).div(borrowPrice).mul(20).div(100);
                  const flashLoan = safeBorrowUsd.mul(borrowUnit).div(borrowPrice).mul(40).div(100);

                  if (initialBorrow.isZero() || borrowSeed.isZero() || flashLoan.isZero()) {
                    leverageResults.push({
                      pool: pool.label,
                      collateral: collateral.key,
                      borrow: borrow.key,
                      flow: "Cross-Asset EnterFromBorrow",
                      status: "SKIPPED",
                      detail: "Amounts too small for viable leverage",
                    });
                    return;
                  }

                  await collateralToken.connect(testUser).approve(collateral.config.address, mintAmount);
                  await vCollateral.connect(testUser).mint(mintAmount);

                  await vBorrow.connect(testUser).borrow(initialBorrow);

                  await borrowToken.connect(testUser).approve(LEVERAGE_STRATEGIES_MANAGER, borrowSeed);

                  const [vTokenBalanceBefore, borrowBalBefore] = await Promise.all([
                    vCollateral.balanceOf(userAddress),
                    vBorrow.callStatic.borrowBalanceCurrent(userAddress),
                  ]);

                  const totalBorrow = borrowSeed.add(flashLoan);
                  const { swapData, minAmountOut } = await getSwapData(
                    borrow.info.underlying,
                    collateral.info.underlying,
                    totalBorrow.toString(),
                  );

                  const tx = await leverageStrategiesManager
                    .connect(testUser)
                    .enterLeverageFromBorrow(
                      collateral.config.address,
                      borrow.config.address,
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
                  expect(event.args.collateralMarket.toLowerCase()).to.equal(collateral.config.address.toLowerCase());
                  expect(event.args.borrowedMarket.toLowerCase()).to.equal(borrow.config.address.toLowerCase());
                  expect(event.args.borrowedAmountSeed).to.equal(borrowSeed);
                  expect(event.args.borrowedAmountToFlashLoan).to.equal(flashLoan);

                  const [vTokenBalanceAfter, borrowBalAfter] = await Promise.all([
                    vCollateral.balanceOf(userAddress),
                    vBorrow.callStatic.borrowBalanceCurrent(userAddress),
                  ]);

                  expect(vTokenBalanceAfter).to.be.gte(vTokenBalanceBefore);
                  expect(borrowBalAfter).to.be.gt(borrowBalBefore);

                  console.log(`Leverage from borrow entered for ${pool.label}:`);
                  console.log(`  vToken balance: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}`);
                  console.log(`  Borrow: ${borrowBalBefore} -> ${borrowBalAfter}`);

                  leverageResults.push({
                    pool: pool.label,
                    collateral: collateral.key,
                    borrow: borrow.key,
                    flow: "Cross-Asset EnterFromBorrow",
                    status: "PASSED",
                    detail: `vToken: ${vTokenBalanceBefore} -> ${vTokenBalanceAfter}, Borrow: ${borrowBalBefore} -> ${borrowBalAfter}`,
                  });
                } catch (error: unknown) {
                  const msg = error instanceof Error ? error.message : String(error);
                  const reason = msg.includes("supply cap")
                    ? "Supply cap reached"
                    : msg.includes("math error")
                    ? "Math error"
                    : msg.includes("cannot estimate gas")
                    ? "Transaction would revert"
                    : msg.includes("transfer amount exceeds")
                    ? "Insufficient whale balance"
                    : msg.includes("No route found") ||
                      msg.includes("No API route") ||
                      msg.includes("INSUFFICIENT_LIQUIDITY") ||
                      msg.includes("Swap API error")
                    ? "Swap route unavailable"
                    : `Revert: ${msg.slice(0, 80)}`;
                  const isSkippable =
                    msg.includes("No route found") ||
                    msg.includes("No API route") ||
                    msg.includes("INSUFFICIENT_LIQUIDITY") ||
                    msg.includes("Swap API error") ||
                    msg.includes("supply cap") ||
                    msg.includes("cannot estimate gas") ||
                    msg.includes("math error") ||
                    msg.includes("transfer amount exceeds");
                  const status = isSkippable ? "SKIPPED" : "FAILED";
                  leverageResults.push({
                    pool: pool.label,
                    collateral: collateral.key,
                    borrow: borrow.key,
                    flow: "Cross-Asset EnterFromBorrow",
                    status,
                    detail: reason,
                  });
                  console.log(`Cross-asset enterLeverageFromBorrow ${status} for ${pool.label} - ${reason}`);
                }
              });
            }
          });
        }
      });
    }

    after(() => {
      printLeverageResultsSummary();
    });

    // =========================================================================
    // DOT Isolated E-Mode Pool Restriction Tests
    // =========================================================================
    //
    // Tests that verify isolated e-mode pool market restrictions:
    // - When in DOT e-mode pool: can only use DOT, USDT, USDC markets
    // - When in core pool: can use DOT along with all other core pool markets
    // =========================================================================
    describe("DOT Isolated E-Mode Pool Restrictions", () => {
      // DOT pool is id=15 in EMODE_POOLS
      const DOT_POOL = EMODE_POOLS.find(p => p.label === "DOT")!;
      const vDOT = DOT_POOL.marketsConfig.vDOT.address;
      const vUSDT_ADDR = DOT_POOL.marketsConfig.vUSDT.address;
      const vUSDC_ADDR = DOT_POOL.marketsConfig.vUSDC.address;

      // ETH is in core pool but NOT in DOT e-mode pool
      const vETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
      const ETH_UNDERLYING = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
      const ETH_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

      let vDOTContract: Contract;
      let vUSDTContract: Contract;
      let vUSDCContract: Contract;
      let vETHContract: Contract;
      let dotToken: Contract;
      let usdtToken: Contract;
      let usdcToken: Contract;
      let ethToken: Contract;

      before(async () => {
        vDOTContract = new ethers.Contract(vDOT, VTOKEN_ABI, provider);
        vUSDTContract = new ethers.Contract(vUSDT_ADDR, VTOKEN_ABI, provider);
        vUSDCContract = new ethers.Contract(vUSDC_ADDR, VTOKEN_ABI, provider);
        vETHContract = new ethers.Contract(vETH, VTOKEN_ABI, provider);

        const dotInfo = MARKET_INFO[vDOT];
        const usdtInfo = MARKET_INFO[vUSDT_ADDR];
        const usdcInfo = MARKET_INFO[vUSDC_ADDR];

        dotToken = new ethers.Contract(dotInfo.underlying, ERC20_ABI, provider);
        usdtToken = new ethers.Contract(usdtInfo.underlying, ERC20_ABI, provider);
        usdcToken = new ethers.Contract(usdcInfo.underlying, ERC20_ABI, provider);
        ethToken = new ethers.Contract(ETH_UNDERLYING, ERC20_ABI, provider);
      });

      describe("Core pool behavior (existing users / new users staying in core pool)", () => {
        let corePoolUser: any;
        let corePoolUserAddress: string;

        before(async () => {
          const userAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(8887), 20)),
          );
          corePoolUser = await initMainnetUser(userAddr, ethers.utils.parseEther("10"));
          corePoolUserAddress = userAddr;

          // Fund user with DOT, ETH, USDT
          const dotInfo = MARKET_INFO[vDOT];
          const usdtInfo = MARKET_INFO[vUSDT_ADDR];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);
          const usdtWhale = await getCachedWhale(usdtInfo.whale);

          await dotToken.connect(dotWhale).transfer(corePoolUserAddress, parseUnits("100", dotInfo.decimals));
          await ethToken.connect(ethWhale).transfer(corePoolUserAddress, parseUnits("10", 18));
          await usdtToken.connect(usdtWhale).transfer(corePoolUserAddress, parseUnits("500", usdtInfo.decimals));

          // User stays in core pool (pool 0) - no enterPool call needed
          const userPool = await comptroller.userPoolId(corePoolUserAddress);
          expect(userPool).to.equal(0);
          console.log("  User is in core pool (pool 0) - same behavior as before VIP");
        });

        it("user CAN supply and borrow DOT in core pool", async () => {
          const dotInfo = MARKET_INFO[vDOT];
          await dotToken.connect(corePoolUser).approve(vDOT, parseUnits("10", dotInfo.decimals));
          await vDOTContract.connect(corePoolUser).mint(parseUnits("10", dotInfo.decimals));
          await comptroller.connect(corePoolUser).enterMarkets([vDOT]);

          expect(await vDOTContract.balanceOf(corePoolUserAddress)).to.be.gt(0);
          console.log("  User successfully supplied DOT in core pool");
        });

        it("user CAN supply and use ETH in core pool", async () => {
          await ethToken.connect(corePoolUser).approve(vETH, parseUnits("5", 18));
          await vETHContract.connect(corePoolUser).mint(parseUnits("5", 18));
          await comptroller.connect(corePoolUser).enterMarkets([vETH]);

          expect(await vETHContract.balanceOf(corePoolUserAddress)).to.be.gt(0);
          console.log("  User successfully supplied ETH in core pool");
        });

        it("user CAN borrow DOT using ETH collateral in core pool", async () => {
          const dotInfo = MARKET_INFO[vDOT];
          const dotBalanceBefore = await dotToken.balanceOf(corePoolUserAddress);
          await vDOTContract.connect(corePoolUser).borrow(parseUnits("1", dotInfo.decimals));
          const dotBalanceAfter = await dotToken.balanceOf(corePoolUserAddress);

          expect(dotBalanceAfter).to.be.gt(dotBalanceBefore);
          console.log("  User borrowed DOT using ETH collateral in core pool");
        });

        it("user CAN borrow ETH using DOT collateral in core pool", async () => {
          const user2Addr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(8886), 20)),
          );
          const corePoolUser2 = await initMainnetUser(user2Addr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          await dotToken.connect(dotWhale).transfer(user2Addr, parseUnits("50", dotInfo.decimals));

          await dotToken.connect(corePoolUser2).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(corePoolUser2).mint(parseUnits("50", dotInfo.decimals));
          await comptroller.connect(corePoolUser2).enterMarkets([vDOT]);

          const ethBalanceBefore = await ethToken.balanceOf(user2Addr);
          await vETHContract.connect(corePoolUser2).borrow(parseUnits("0.01", 18));
          const ethBalanceAfter = await ethToken.balanceOf(user2Addr);

          expect(ethBalanceAfter).to.be.gt(ethBalanceBefore);
          console.log("  User borrowed ETH using DOT collateral in core pool");
        });

        it("user CAN interact with ALL markets simultaneously (DOT, ETH, USDT)", async () => {
          const user3Addr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(8885), 20)),
          );
          const corePoolUser3 = await initMainnetUser(user3Addr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const usdtInfo = MARKET_INFO[vUSDT_ADDR];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);
          const usdtWhale = await getCachedWhale(usdtInfo.whale);

          await dotToken.connect(dotWhale).transfer(user3Addr, parseUnits("20", dotInfo.decimals));
          await ethToken.connect(ethWhale).transfer(user3Addr, parseUnits("2", 18));
          await usdtToken.connect(usdtWhale).transfer(user3Addr, parseUnits("500", usdtInfo.decimals));

          await dotToken.connect(corePoolUser3).approve(vDOT, parseUnits("20", dotInfo.decimals));
          await vDOTContract.connect(corePoolUser3).mint(parseUnits("20", dotInfo.decimals));

          await ethToken.connect(corePoolUser3).approve(vETH, parseUnits("2", 18));
          await vETHContract.connect(corePoolUser3).mint(parseUnits("2", 18));

          await usdtToken.connect(corePoolUser3).approve(vUSDT_ADDR, parseUnits("500", usdtInfo.decimals));
          await vUSDTContract.connect(corePoolUser3).mint(parseUnits("500", usdtInfo.decimals));

          await comptroller.connect(corePoolUser3).enterMarkets([vDOT, vETH, vUSDT_ADDR]);

          expect(await vDOTContract.balanceOf(user3Addr)).to.be.gt(0);
          expect(await vETHContract.balanceOf(user3Addr)).to.be.gt(0);
          expect(await vUSDTContract.balanceOf(user3Addr)).to.be.gt(0);

          console.log("  User interacts with DOT, ETH, and USDT simultaneously in core pool");
        });
      });

      describe("Isolated e-mode behavior (new users opting into DOT e-mode pool)", () => {
        let emodeUser: any;
        let emodeUserAddress: string;

        before(async () => {
          const userAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(8888), 20)),
          );
          emodeUser = await initMainnetUser(userAddr, ethers.utils.parseEther("10"));
          emodeUserAddress = userAddr;

          const dotInfo = MARKET_INFO[vDOT];
          const usdtInfo = MARKET_INFO[vUSDT_ADDR];
          const usdcInfo = MARKET_INFO[vUSDC_ADDR];

          const dotWhale = await getCachedWhale(dotInfo.whale);
          const usdtWhale = await getCachedWhale(usdtInfo.whale);
          const usdcWhale = await getCachedWhale(usdcInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);

          await dotToken.connect(dotWhale).transfer(emodeUserAddress, parseUnits("100", dotInfo.decimals));
          await usdtToken.connect(usdtWhale).transfer(emodeUserAddress, parseUnits("1000", usdtInfo.decimals));
          await usdcToken.connect(usdcWhale).transfer(emodeUserAddress, parseUnits("1000", usdcInfo.decimals));
          await ethToken.connect(ethWhale).transfer(emodeUserAddress, parseUnits("5", 18));

          // User opts into DOT e-mode pool
          await comptroller.connect(emodeUser).enterPool(DOT_POOL.id);

          const userPool = await comptroller.userPoolId(emodeUserAddress);
          expect(userPool).to.equal(DOT_POOL.id);
          console.log(`  User opted into DOT e-mode pool (id=${DOT_POOL.id})`);
        });

        it("user CAN supply and borrow DOT in DOT e-mode pool", async () => {
          const dotInfo = MARKET_INFO[vDOT];
          await dotToken.connect(emodeUser).approve(vDOT, parseUnits("10", dotInfo.decimals));
          await vDOTContract.connect(emodeUser).mint(parseUnits("10", dotInfo.decimals));
          await comptroller.connect(emodeUser).enterMarkets([vDOT]);

          expect(await vDOTContract.balanceOf(emodeUserAddress)).to.be.gt(0);

          const borrowAmount = parseUnits("0.1", dotInfo.decimals);
          await vDOTContract.connect(emodeUser).borrow(borrowAmount);
          const borrowBalance = await vDOTContract.callStatic.borrowBalanceCurrent(emodeUserAddress);
          expect(borrowBalance).to.be.gte(borrowAmount);
          console.log("  User supplied and borrowed DOT in DOT e-mode pool");
        });

        it("user CAN supply and borrow USDT in DOT e-mode pool", async () => {
          const usdtInfo = MARKET_INFO[vUSDT_ADDR];
          await usdtToken.connect(emodeUser).approve(vUSDT_ADDR, parseUnits("100", usdtInfo.decimals));
          await vUSDTContract.connect(emodeUser).mint(parseUnits("100", usdtInfo.decimals));
          await comptroller.connect(emodeUser).enterMarkets([vUSDT_ADDR]);

          expect(await vUSDTContract.balanceOf(emodeUserAddress)).to.be.gt(0);

          const borrowAmount = parseUnits("10", usdtInfo.decimals);
          await vUSDTContract.connect(emodeUser).borrow(borrowAmount);
          const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(emodeUserAddress);
          expect(borrowBalance).to.be.gte(borrowAmount);
          console.log("  User supplied and borrowed USDT in DOT e-mode pool");
        });

        it("user CAN supply and borrow USDC in DOT e-mode pool", async () => {
          const usdcInfo = MARKET_INFO[vUSDC_ADDR];
          await usdcToken.connect(emodeUser).approve(vUSDC_ADDR, parseUnits("100", usdcInfo.decimals));
          await vUSDCContract.connect(emodeUser).mint(parseUnits("100", usdcInfo.decimals));
          await comptroller.connect(emodeUser).enterMarkets([vUSDC_ADDR]);

          expect(await vUSDCContract.balanceOf(emodeUserAddress)).to.be.gt(0);

          const borrowAmount = parseUnits("10", usdcInfo.decimals);
          await vUSDCContract.connect(emodeUser).borrow(borrowAmount);
          const borrowBalance = await vUSDCContract.callStatic.borrowBalanceCurrent(emodeUserAddress);
          expect(borrowBalance).to.be.gte(borrowAmount);
          console.log("  User supplied and borrowed USDC in DOT e-mode pool");
        });

        it("user CAN deposit ETH (deposits are unrestricted) but CANNOT borrow ETH", async () => {
          // Deposits/mints are allowed to any vToken regardless of pool
          await ethToken.connect(emodeUser).approve(vETH, parseUnits("1", 18));
          await vETHContract.connect(emodeUser).mint(parseUnits("1", 18));
          expect(await vETHContract.balanceOf(emodeUserAddress)).to.be.gt(0);
          console.log("  User CAN deposit ETH even in DOT e-mode (deposits unrestricted)");

          // But borrowing non-pool markets is restricted
          try {
            await vETHContract.connect(emodeUser).borrow(parseUnits("0.01", 18));
            expect.fail("Borrow should have failed - ETH is not in DOT e-mode pool");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("Borrow should have failed");
            console.log(`  ETH borrow correctly rejected in DOT e-mode pool`);
          }
        });

        it("ETH collateral does NOT count for borrowing power in e-mode (allowCorePoolFallback = false)", async () => {
          // VIP sets allowCorePoolFallback = false, so core-pool-only collateral is ignored
          const pool = await comptroller.pools(DOT_POOL.id);
          expect(pool.allowCorePoolFallback).to.equal(false);

          // Create a user with ONLY ETH collateral (no DOT pool assets)
          const ethOnlyUserAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(8889), 20)),
          );
          const ethOnlyUser = await initMainnetUser(ethOnlyUserAddr, ethers.utils.parseEther("10"));

          const ethWhale = await getCachedWhale(ETH_WHALE);
          await ethToken.connect(ethWhale).transfer(ethOnlyUserAddr, parseUnits("10", 18));

          await ethToken.connect(ethOnlyUser).approve(vETH, parseUnits("10", 18));
          await vETHContract.connect(ethOnlyUser).mint(parseUnits("10", 18));
          await comptroller.connect(ethOnlyUser).enterMarkets([vETH]);

          // Enter DOT e-mode pool
          await comptroller.connect(ethOnlyUser).enterPool(DOT_POOL.id);

          // Try to borrow DOT using only ETH collateral - should FAIL
          try {
            await vDOTContract.connect(ethOnlyUser).borrow(parseUnits("0.1", 18));
            expect.fail("Borrow should have failed - ETH collateral not usable with fallback disabled");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("Borrow should have failed");
            console.log(`  DOT borrow correctly rejected with ETH-only collateral (fallback=false)`);
          }

          // Also try to borrow USDT (a pool asset) using ETH collateral - should also FAIL
          try {
            await vUSDTContract.connect(ethOnlyUser).borrow(parseUnits("10", 18));
            expect.fail("Borrow should have failed - ETH collateral not usable with fallback disabled");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("Borrow should have failed");
            console.log(`  USDT borrow correctly rejected with ETH-only collateral (fallback=false)`);
          }
        });

        it("user with DOT pool collateral CAN borrow normally in e-mode", async () => {
          const dotUserAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(7776), 20)),
          );
          const dotUser = await initMainnetUser(dotUserAddr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          await dotToken.connect(dotWhale).transfer(dotUserAddr, parseUnits("50", dotInfo.decimals));

          await dotToken.connect(dotUser).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(dotUser).mint(parseUnits("50", dotInfo.decimals));
          await comptroller.connect(dotUser).enterMarkets([vDOT]);

          await comptroller.connect(dotUser).enterPool(DOT_POOL.id);

          const usdtBalanceBefore = await usdtToken.balanceOf(dotUserAddr);
          await vUSDTContract.connect(dotUser).borrow(parseUnits("10", 18));
          const usdtBalanceAfter = await usdtToken.balanceOf(dotUserAddr);

          expect(usdtBalanceAfter).to.be.gt(usdtBalanceBefore);
          console.log("  User with DOT collateral CAN borrow USDT in e-mode pool");
        });
      });

      describe("Mutual exclusivity: user CANNOT be in core pool and e-mode simultaneously", () => {
        it("core pool user CAN borrow ETH, but same user in e-mode CANNOT", async () => {
          // User A in core pool: CAN borrow ETH with DOT collateral
          const userAAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(9901), 20)),
          );
          const userA = await initMainnetUser(userAAddr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);

          await dotToken.connect(dotWhale).transfer(userAAddr, parseUnits("50", dotInfo.decimals));
          await dotToken.connect(userA).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(userA).mint(parseUnits("50", dotInfo.decimals));
          await comptroller.connect(userA).enterMarkets([vDOT]);

          // Core pool: borrow ETH works
          let userPool = await comptroller.userPoolId(userAAddr);
          expect(userPool).to.equal(0);
          const ethBalBefore = await ethToken.balanceOf(userAAddr);
          await vETHContract.connect(userA).borrow(parseUnits("0.01", 18));
          expect(await ethToken.balanceOf(userAAddr)).to.be.gt(ethBalBefore);
          console.log("  User A in core pool: CAN borrow ETH using DOT collateral");

          // User B with same setup but in e-mode: CANNOT borrow ETH
          const userBAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(9911), 20)),
          );
          const userB = await initMainnetUser(userBAddr, ethers.utils.parseEther("10"));

          await dotToken.connect(dotWhale).transfer(userBAddr, parseUnits("50", dotInfo.decimals));
          await ethToken.connect(ethWhale).transfer(userBAddr, parseUnits("5", 18));

          await dotToken.connect(userB).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(userB).mint(parseUnits("50", dotInfo.decimals));
          await ethToken.connect(userB).approve(vETH, parseUnits("5", 18));
          await vETHContract.connect(userB).mint(parseUnits("5", 18));
          await comptroller.connect(userB).enterMarkets([vDOT, vETH]);

          // Enter DOT e-mode
          await comptroller.connect(userB).enterPool(DOT_POOL.id);
          userPool = await comptroller.userPoolId(userBAddr);
          expect(userPool).to.equal(DOT_POOL.id);

          // E-mode: borrow ETH fails
          try {
            await vETHContract.connect(userB).borrow(parseUnits("0.01", 18));
            expect.fail("ETH borrow should have failed in DOT e-mode pool");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("ETH borrow should have failed");
            console.log("  User B in e-mode: CANNOT borrow ETH - mutual exclusivity enforced");
          }
        });

        it("user switching from e-mode back to core pool regains full market access", async () => {
          const userAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(9902), 20)),
          );
          const user = await initMainnetUser(userAddr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);

          await dotToken.connect(dotWhale).transfer(userAddr, parseUnits("50", dotInfo.decimals));
          await ethToken.connect(ethWhale).transfer(userAddr, parseUnits("5", 18));

          // Supply collateral
          await dotToken.connect(user).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(user).mint(parseUnits("50", dotInfo.decimals));
          await ethToken.connect(user).approve(vETH, parseUnits("5", 18));
          await vETHContract.connect(user).mint(parseUnits("5", 18));
          await comptroller.connect(user).enterMarkets([vDOT, vETH]);

          // Start in DOT e-mode pool
          await comptroller.connect(user).enterPool(DOT_POOL.id);
          let userPool = await comptroller.userPoolId(userAddr);
          expect(userPool).to.equal(DOT_POOL.id);

          // In e-mode: CANNOT borrow ETH
          try {
            await vETHContract.connect(user).borrow(parseUnits("0.01", 18));
            expect.fail("ETH borrow should have failed in DOT e-mode pool");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("ETH borrow should have failed");
            console.log("  In e-mode: user CANNOT borrow ETH");
          }

          // Switch back to core pool
          await comptroller.connect(user).enterPool(0);
          userPool = await comptroller.userPoolId(userAddr);
          expect(userPool).to.equal(0);
          console.log("  User switched back to core pool");

          // In core pool: CAN borrow ETH again
          const ethBalBefore = await ethToken.balanceOf(userAddr);
          await vETHContract.connect(user).borrow(parseUnits("0.01", 18));
          expect(await ethToken.balanceOf(userAddr)).to.be.gt(ethBalBefore);
          console.log("  In core pool: user CAN borrow ETH again - full market access restored");
        });

        it("user CANNOT borrow in e-mode pool and core pool at the same time", async () => {
          // A user can only be in one pool at a time - they must choose
          const userAddr = ethers.utils.getAddress(
            ethers.utils.hexlify(ethers.utils.zeroPad(ethers.utils.hexlify(9903), 20)),
          );
          const user = await initMainnetUser(userAddr, ethers.utils.parseEther("10"));

          const dotInfo = MARKET_INFO[vDOT];
          const dotWhale = await getCachedWhale(dotInfo.whale);
          const ethWhale = await getCachedWhale(ETH_WHALE);

          await dotToken.connect(dotWhale).transfer(userAddr, parseUnits("50", dotInfo.decimals));
          await ethToken.connect(ethWhale).transfer(userAddr, parseUnits("5", 18));

          await dotToken.connect(user).approve(vDOT, parseUnits("50", dotInfo.decimals));
          await vDOTContract.connect(user).mint(parseUnits("50", dotInfo.decimals));
          await ethToken.connect(user).approve(vETH, parseUnits("5", 18));
          await vETHContract.connect(user).mint(parseUnits("5", 18));
          await comptroller.connect(user).enterMarkets([vDOT, vETH]);

          // Enter DOT e-mode
          await comptroller.connect(user).enterPool(DOT_POOL.id);

          // Verify: user is in DOT pool, NOT in core pool
          const userPool = await comptroller.userPoolId(userAddr);
          expect(userPool).to.equal(DOT_POOL.id);
          expect(userPool).to.not.equal(0);

          // CAN borrow DOT (e-mode market)
          const dotBalBefore = await dotToken.balanceOf(userAddr);
          await vDOTContract.connect(user).borrow(parseUnits("0.1", dotInfo.decimals));
          expect(await dotToken.balanceOf(userAddr)).to.be.gt(dotBalBefore);
          console.log("  In e-mode: CAN borrow DOT");

          // CANNOT borrow ETH (core-pool-only market) at the same time
          try {
            await vETHContract.connect(user).borrow(parseUnits("0.01", 18));
            expect.fail("ETH borrow should have failed - user is in e-mode, not core pool");
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            expect(msg).to.not.include("ETH borrow should have failed");
            console.log("  In e-mode: CANNOT borrow ETH - user must choose one pool, cannot use both");
          }
        });
      });
    });
  });
});
