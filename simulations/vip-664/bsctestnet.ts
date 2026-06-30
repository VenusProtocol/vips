import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  MARKET_MCBT,
  MCBT,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  convertAmountToVTokens,
  vMCBT_ADDRESS,
  vTokensRemaining,
  vip664,
} from "../../vips/vip-664/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 116326144; // 0x6EEFF00 — first block where vMCBT is deployed

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;
  let vMCBT: Contract;
  let mcbt: Contract;
  let resilientOracle: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);
    vMCBT = new ethers.Contract(vMCBT_ADDRESS, VTOKEN_ABI, provider);
    mcbt = new ethers.Contract(MCBT, ERC20_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  // ─── Part 1: Pre-VIP ───────────────────────────────────────────────────────

  describe("Pre-VIP behavior", async () => {
    it("vMCBT is not listed in the Core pool", async () => {
      const market = await comptroller.markets(vMCBT_ADDRESS);
      expect(market.isListed).to.equal(false);
    });
  });

  // ─── Part 2: Execute VIP + event assertions ────────────────────────────────

  testVip("VIP-664 [BNB Chain Testnet] Add MCBT market to the Venus Core Pool", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  // ─── Part 3: Post-VIP state ────────────────────────────────────────────────

  describe("Post-VIP state", async () => {
    it("vMCBT is listed in the Core pool", async () => {
      const market = await comptroller.markets(vMCBT_ADDRESS);
      expect(market.isListed).to.equal(true);
    });

    it("IRM is correct", async () => {
      expect(await vMCBT.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vMCBT", {
      base: MARKET_MCBT.interestRateModel.baseRatePerYear,
      multiplier: MARKET_MCBT.interestRateModel.multiplierPerYear,
      jump: MARKET_MCBT.interestRateModel.jumpMultiplierPerYear,
      kink: MARKET_MCBT.interestRateModel.kink,
    });

    checkVToken(vMCBT_ADDRESS, {
      name: MARKET_MCBT.vToken.name,
      symbol: MARKET_MCBT.vToken.symbol,
      decimals: MARKET_MCBT.vToken.decimals,
      underlying: MARKET_MCBT.vToken.underlying,
      exchangeRate: MARKET_MCBT.vToken.exchangeRate,
      comptroller: MARKET_MCBT.vToken.comptroller,
    });

    checkRiskParameters(vMCBT_ADDRESS, MARKET_MCBT.vToken, {
      collateralFactor: MARKET_MCBT.riskParameters.collateralFactor,
      liquidationThreshold: MARKET_MCBT.riskParameters.liquidationThreshold,
      reserveFactor: MARKET_MCBT.riskParameters.reserveFactor,
      supplyCap: MARKET_MCBT.riskParameters.supplyCap,
      borrowCap: MARKET_MCBT.riskParameters.borrowCap,
    });

    it("liquidation threshold is 70%", async () => {
      const market = await comptroller.markets(vMCBT_ADDRESS);
      expect(market.liquidationThresholdMantissa).to.equal(MARKET_MCBT.riskParameters.liquidationThreshold);
    });

    it("liquidation incentive is 10%", async () => {
      expect(await comptroller.getLiquidationIncentive(vMCBT_ADDRESS)).to.equal(
        MARKET_MCBT.riskParameters.liquidationIncentive,
      );
    });

    it("oracle price is $2.50", async () => {
      expect(await resilientOracle.getUnderlyingPrice(vMCBT_ADDRESS)).to.equal(MARKET_MCBT.oracle.directPrice);
    });

    it("admin is NormalTimelock", async () => {
      expect(await vMCBT.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("ACM is set", async () => {
      expect(await vMCBT.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("protocol share reserve is set", async () => {
      expect(await vMCBT.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("reduce reserves block delta is 28800", async () => {
      expect(await vMCBT.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("initial vToken supply equals expected (faucet amount converted)", async () => {
      expect(await vMCBT.totalSupply()).to.equal(
        convertAmountToVTokens(MARKET_MCBT.initialSupply.amount, MARKET_MCBT.vToken.exchangeRate),
      );
    });

    it("initial underlying balance equals faucet amount", async () => {
      expect(await mcbt.balanceOf(vMCBT_ADDRESS)).to.equal(MARKET_MCBT.initialSupply.amount);
    });

    it("burn slice sent to address(0)", async () => {
      expect(await vMCBT.balanceOf(ethers.constants.AddressZero)).to.equal(MARKET_MCBT.initialSupply.vTokensToBurn);
    });

    it("remaining vTokens sent to VTREASURY", async () => {
      expect(await vMCBT.balanceOf(MARKET_MCBT.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining(MARKET_MCBT));
    });

    it("no vTokens left in the timelock", async () => {
      expect(await vMCBT.balanceOf(bsctestnet.NORMAL_TIMELOCK)).to.equal(0);
    });
  });

  // ─── Part 4: Behavioral tests ──────────────────────────────────────────────
  //
  // These use FRESH impersonated accounts (not a shared testnet whale) so each
  // user's only collateral is MCBT — keeping the collateral-factor and supply/borrow
  // cap arithmetic exact and deterministic.
  //
  // Oracle staleness: the proposal→execution timelock advances the fork clock ~3 days,
  // which would make a real Chainlink feed's answer stale and revert the borrow-time
  // liquidity check. MCBT is priced via the Venus ChainlinkOracle's `setDirectPrice`
  // (no aggregator feed), so its price is read without any `maxStalePeriod` check and
  // is inherently staleness-proof across the timelock (the post-VIP "$2.50" assertion
  // above already confirms this post-advance). Because every borrower here holds only
  // MCBT collateral, no real-feed asset is ever priced. We still apply the canonical
  // `setMaxStalePeriodForAllAssets` guard for the assets the tests touch — the standard
  // bsctestnet market-addition workaround — so the simulation is robust regardless.

  describe("Behavioral tests", async () => {
    let userA: any;
    let userB: any;
    const SUPPLY_AMOUNT = parseUnits("10", 18); // 10 MCBT collateral for user A
    // Deterministic fresh accounts, in no pre-existing markets.
    const USER_A = "0xaaaa000000000000000000000000000000000001";
    const USER_B = "0xbbbb000000000000000000000000000000000002";

    before(async () => {
      userA = await initMainnetUser(USER_A, parseUnits("2"));
      userB = await initMainnetUser(USER_B, parseUnits("2"));

      // Refresh the max stale period for the assets these tests price (MCBT). MCBT uses a
      // direct price so this is a defensive no-op for it, but it mirrors the prior-VIP
      // staleness workaround and keeps the sim correct if the touched asset set grows.
      await setMaxStalePeriodForAllAssets(resilientOracle, [mcbt]);
    });

    it("supply MCBT as collateral and borrow MCBT against it", async () => {
      const vMCBTUser = vMCBT.connect(userA);
      const mcbtUser = mcbt.connect(userA);

      // Faucet MCBT, mint vMCBT, enter market
      await mcbtUser.faucet(SUPPLY_AMOUNT);
      await mcbtUser.approve(vMCBT_ADDRESS, SUPPLY_AMOUNT);
      await vMCBTUser.mint(SUPPLY_AMOUNT);
      await comptroller.connect(userA).enterMarkets([vMCBT_ADDRESS]);

      // Borrow a tiny amount of MCBT — should succeed (well within CF headroom)
      const BORROW_AMOUNT = parseUnits("0.001", 18);
      const mcbtBefore: BigNumber = await mcbt.balanceOf(userA.address);
      await vMCBTUser.borrow(BORROW_AMOUNT);
      const mcbtAfter: BigNumber = await mcbt.balanceOf(userA.address);
      expect(mcbtAfter.sub(mcbtBefore)).to.equal(BORROW_AMOUNT);
    });

    it("over-borrowing beyond the collateral factor is blocked", async () => {
      // userA has 10 MCBT × $2.50 × CF 0.6 = $15 max borrow capacity (already borrowed
      // 0.001 MCBT ≈ $0.0025). Borrowing 7 MCBT ($17.50) exceeds it → borrowAllowed
      // returns INSUFFICIENT_LIQUIDITY → VToken.borrowFresh reverts with "math error".
      const bigBorrow = parseUnits("7", 18);
      await expect(vMCBT.connect(userA).borrow(bigBorrow)).to.be.revertedWith("math error");
    });

    it("minting above the 236 MCBT supply cap reverts", async () => {
      // 0.1 (VIP initial) + 10 (userA) = 10.1 MCBT in market.
      // Minting 230 MCBT would push total to ~240.1, exceeding the 236 supply cap.
      const overCapAmount = parseUnits("230", 18);
      await mcbt.connect(userB).faucet(overCapAmount);
      await mcbt.connect(userB).approve(vMCBT_ADDRESS, overCapAmount);
      await expect(vMCBT.connect(userB).mint(overCapAmount)).to.be.revertedWith("market supply cap reached");
    });

    it("minting below the supply cap succeeds", async () => {
      // 10.1 MCBT already in market; mint 100 MCBT → total = 110.1 ≤ 236 cap.
      const underCapAmount = parseUnits("100", 18);
      await mcbt.connect(userB).faucet(underCapAmount);
      await mcbt.connect(userB).approve(vMCBT_ADDRESS, underCapAmount);
      await expect(vMCBT.connect(userB).mint(underCapAmount)).to.emit(vMCBT, "Mint");
    });

    it("borrowing above the 236 MCBT borrow cap reverts", async () => {
      // totalBorrows ≈ 0.001 MCBT. Borrowing 237 MCBT:
      //   0.001 + 237 = 237.001 > 236 cap → borrowAllowed require fails → "market borrow cap reached".
      // This cap check runs before the liquidity check, so it reverts regardless of headroom.
      const overBorrowCap = parseUnits("237", 18);
      await expect(vMCBT.connect(userA).borrow(overBorrowCap)).to.be.revertedWith("market borrow cap reached");
    });

    it("borrowing below the borrow cap succeeds", async () => {
      // totalBorrows = 0.001 MCBT; borrow 0.01 MCBT → 0.011 ≤ 236 cap.
      // userA has ~$14.975 remaining CF headroom; 0.01 MCBT = $0.025 well within limit.
      const smallBorrow = parseUnits("0.01", 18);
      const mcbtBefore: BigNumber = await mcbt.balanceOf(userA.address);
      await vMCBT.connect(userA).borrow(smallBorrow);
      const mcbtAfter: BigNumber = await mcbt.balanceOf(userA.address);
      expect(mcbtAfter.sub(mcbtBefore)).to.equal(smallBorrow);
    });
  });
});
