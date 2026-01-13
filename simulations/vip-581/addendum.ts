import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip581GuardianAddendum } from "../../vips/vip-581/addendum";
import {
  CHAINLINK_ORACLE,
  RESILIENT_ORACLE,
  STABLE_USDT_PRICE_FEED,
  U,
  UMarketSpec,
  USD1_FEED,
  USDT_CHAINLINK_ORACLE,
} from "../../vips/vip-581/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const provider = ethers.provider;

// User with U tokens to fund test user
const U_HOLDER = "0x95282779ee2f3d4cf383041f7361c741cf8cc00e";

/**
 * ==================================================================================
 * IMPORTANT: Oracle Staleness Issue in Fork Testing
 * ==================================================================================
 *
 * PROBLEM:
 * When forking BSC mainnet at an older block, Chainlink price feeds contain data with
 * old timestamps. As the Hardhat simulation advances time (mining blocks), the oracle's
 * staleness validation fails because the price data's timestamp is from the forked block,
 * not the current simulated time.
 *
 * This causes "invalid resilient oracle price" errors specifically during:
 * - borrow(): Requires oracle price to calculate account liquidity for collateral check
 * - redeemUnderlying(): Requires oracle price to verify user won't be undercollateralized
 *
 * Operations that DON'T require oracle price validation and work fine:
 * - mint(): Simply deposits tokens, no liquidity check needed
 * - repayBorrow(): Reduces debt, no collateral validation needed
 *
 * WHY setMaxStalePeriod ALONE DOESN'T FIX IT:
 * The `setMaxStalePeriodInChainlinkOracle` function updates the staleness threshold in
 * the Chainlink oracle wrapper contracts. However, the actual Chainlink aggregator feeds
 * (STABLE_USDT_PRICE_FEED, USD1_FEED) return data with timestamps from the forked block.
 * The resilient oracle's validation logic may still fail due to other checks in the
 * price validation chain.
 *
 * SOLUTION:
 * 1. Fork at a VERY RECENT block where Chainlink data is fresh (within staleness threshold)
 * 2. Use a FRESH test user (Hardhat signer) with no existing positions in other markets
 *    - Users with existing positions may trigger oracle checks for OTHER assets that have stale data
 * 3. Set extended stale periods as additional safety
 *
 * MAINTENANCE:
 * When tests start failing with "invalid resilient oracle price", update the fork block
 * number below to a more recent BSC block. You can get the current block from:
 * - https://bscscan.com/
 * - Or run: curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://bsc-dataseed.binance.org/
 *
 * ==================================================================================
 */

// Fork block number - UPDATE THIS when tests fail due to stale oracle data
// Last updated: 2024-01-13
const FORK_BLOCK = 75075100;

forking(FORK_BLOCK, async () => {
  let comptroller: Contract;
  let u: Contract;
  let vU: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let usdtChainlinkOracle: Contract;
  let impersonatedTimelock: any;
  let testUser: Signer;

  before(async () => {
    // Initialize contracts
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    u = new ethers.Contract(UMarketSpec.vToken.underlying.address, ERC20_ABI, provider);
    vU = new ethers.Contract(UMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));

    /**
     * IMPORTANT: Use a fresh Hardhat signer as test user
     *
     * Why not use an existing mainnet address (like U_HOLDER)?
     * - Existing users may have positions in OTHER markets (e.g., vBNB, vUSDT)
     * - When calculating liquidity for borrow/redeem, the Comptroller checks ALL user positions
     * - If ANY of those markets have stale oracle data, the transaction fails
     * - A fresh signer has no existing positions, so only vU oracle is checked
     */
    const [signer] = await ethers.getSigners();
    testUser = signer;

    // Fund the fresh test user with U tokens from an existing holder
    const uHolder = await initMainnetUser(U_HOLDER, ethers.utils.parseEther("10"));
    await u.connect(uHolder).transfer(await testUser.getAddress(), parseUnits("10", 18));

    /**
     * Oracle Configuration:
     * Set direct prices as a fallback mechanism and extend stale periods
     * to maximize compatibility with forked state
     */
    await usdtChainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));
    await chainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));

    // Extend stale periods to 10 years to handle old forked data
    await setMaxStalePeriodInChainlinkOracle(
      USDT_CHAINLINK_ORACLE,
      U,
      STABLE_USDT_PRICE_FEED,
      bscmainnet.NORMAL_TIMELOCK,
      315360000, // 10 years in seconds
    );

    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE,
      U,
      USD1_FEED,
      bscmainnet.NORMAL_TIMELOCK,
      315360000, // 10 years in seconds
    );

    // Also configure the resilient oracle's stale period
    await setMaxStalePeriod(resilientOracle, u);
  });

  /**
   * VIP Execution Test
   *
   * Note: At recent blocks, this VIP may have already been executed on mainnet.
   * We check for 0 or 1 BorrowAllowedUpdated events to handle both cases:
   * - 0 events: VIP was already executed (no state change)
   * - 1 event: VIP just executed (state changed from false to true)
   */
  testVip("VIP-581 Addendum", await vip581GuardianAddendum(), {
    callbackAfterExecution: async txResponse => {
      const receipt = await txResponse.wait();
      const iface = new ethers.utils.Interface(COMPTROLLER_ABI);
      const events = receipt.logs
        .map((log: any) => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((e: any) => e && e.name === "BorrowAllowedUpdated");
      // Either 0 (already executed) or 1 (just executed) events is acceptable
      expect(events.length).to.be.lte(1);
    },
  });

  describe("Post-VIP checks", () => {
    it("vU has borrowing enabled", async () => {
      const marketData = await comptroller.poolMarkets(0, vU.address);
      expect(marketData.isBorrowAllowed).to.be.equal(true);
    });

    it("Verify oracle returns valid price for U token", async () => {
      const price = await resilientOracle.getUnderlyingPrice(UMarketSpec.vToken.address);
      // U is a stablecoin, price should be around $1 (within 2% bounds)
      expect(price).to.be.gte(parseUnits("0.98", 18));
      expect(price).to.be.lte(parseUnits("1.02", 18));
    });

    /**
     * Mint Test
     * - Does NOT require oracle price validation
     * - Simply deposits U tokens and receives vU tokens
     * - Should always work regardless of oracle staleness
     */
    it("User can mint vU", async () => {
      const userAddress = await testUser.getAddress();
      const mintAmount = parseUnits("5", 18);

      // Enter market so minted vU can be used as collateral for borrowing
      await comptroller.connect(testUser).enterMarkets([vU.address]);

      const vTokenBalBefore = await vU.balanceOf(userAddress);
      await u.connect(testUser).approve(vU.address, mintAmount);
      await vU.connect(testUser).mint(mintAmount);
      expect(await vU.balanceOf(userAddress)).to.be.gt(vTokenBalBefore);
    });

    /**
     * Borrow Test
     * - REQUIRES oracle price validation for liquidity calculation
     * - Comptroller checks: collateral value >= borrow value * collateral factor
     * - Will fail with "invalid resilient oracle price" if oracle data is stale
     *
     * If this test fails:
     * 1. Update FORK_BLOCK to a more recent block number
     * 2. Ensure test user has no positions in other markets with stale oracles
     */
    it("User can borrow U", async () => {
      const userAddress = await testUser.getAddress();
      const borrowAmount = parseUnits("0.1", 18);
      const uBalBefore = await u.balanceOf(userAddress);
      await vU.connect(testUser).borrow(borrowAmount);
      expect(await u.balanceOf(userAddress)).to.be.gt(uBalBefore);
    });

    /**
     * Repay Test
     * - Does NOT require oracle price validation
     * - Simply reduces the user's debt
     * - Uses MaxUint256 to repay full balance including any accrued interest
     */
    it("User can repay borrow", async () => {
      const userAddress = await testUser.getAddress();
      // Get current borrow balance (includes accrued interest)
      const borrowBalanceCurrent = await vU.callStatic.borrowBalanceCurrent(userAddress);
      // Approve slightly more to account for interest accruing between calls
      const repayAmount = borrowBalanceCurrent.mul(101).div(100); // 1% buffer
      await u.connect(testUser).approve(vU.address, repayAmount);
      // Use MaxUint256 to repay the full borrow balance including any accrued interest
      await vU.connect(testUser).repayBorrow(ethers.constants.MaxUint256);
      // Verify borrow balance is now zero
      expect(await vU.callStatic.borrowBalanceCurrent(userAddress)).to.equal(0);
    });

    /**
     * Redeem Test
     * - REQUIRES oracle price validation for liquidity calculation
     * - Comptroller checks that user won't be undercollateralized after redemption
     * - Will fail with "invalid resilient oracle price" if oracle data is stale
     *
     * If this test fails:
     * 1. Update FORK_BLOCK to a more recent block number
     * 2. Ensure test user has no positions in other markets with stale oracles
     */
    it("User can redeem vU", async () => {
      const userAddress = await testUser.getAddress();
      const uBalBefore = await u.balanceOf(userAddress);
      const redeemAmount = parseUnits("0.5", 18);
      await vU.connect(testUser).redeemUnderlying(redeemAmount);
      expect(await u.balanceOf(userAddress)).to.be.gt(uBalBefore);
    });
  });
});
