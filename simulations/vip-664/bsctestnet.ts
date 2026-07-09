import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodForAllAssets } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip664, {
  MOCKUXRP,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  REDUCE_RESERVES_BLOCK_DELTA,
  UXRPMarketSpec,
  UXRP_PRICE,
  convertAmountToVTokens,
  vUXRP,
} from "../../vips/vip-664/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bsctestnet } = NETWORK_ADDRESSES;

// Existing Core-pool market used to prove UXRP works as collateral against a real borrowable asset.
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

// Impersonated actors for the behavioral tests.
const SUPPLIER = "0x0000000000000000000000000000000000000101";
const CAP_TESTER = "0x0000000000000000000000000000000000000103";

forking(118114143, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let uxrp: Contract;
  let usdt: Contract;
  let vUxrp: Contract;
  let vUsdt: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(UXRPMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    uxrp = new ethers.Contract(MOCKUXRP, ERC20_ABI, provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);
    vUxrp = new ethers.Contract(vUXRP, VTOKEN_ABI, provider);
    vUsdt = new ethers.Contract(vUSDT, VTOKEN_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("UXRP market is not listed", async () => {
      const market = await comptroller.markets(vUXRP);
      expect(market.isListed).to.equal(false);
    });

    it("resilient oracle has no config for UXRP", async () => {
      const config = await resilientOracle.getTokenConfig(MOCKUXRP);
      expect(config.asset).to.equal(ethers.constants.AddressZero);
    });
  });

  testVip("VIP-664 Add UXRP market to the Core pool", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, VTREASURY_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "BorrowAllowedUpdated",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("uses the new JumpRateModel", async () => {
      expect(await vUxrp.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vUXRP", {
      base: UXRPMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: UXRPMarketSpec.interestRateModel.multiplierPerYear,
      jump: UXRPMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: UXRPMarketSpec.interestRateModel.kink,
    });

    checkVToken(vUXRP, {
      name: "Venus UXRP",
      symbol: "vUXRP",
      decimals: 8,
      underlying: MOCKUXRP,
      exchangeRate: UXRPMarketSpec.vToken.exchangeRate,
      comptroller: UXRPMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(vUXRP, UXRPMarketSpec.vToken, UXRPMarketSpec.riskParameters);

    it("sets the requested collateral factor, liquidation threshold, incentive and borrow flag", async () => {
      const market = await comptroller.markets(vUXRP);
      expect(market.isListed).to.equal(true);
      expect(market.collateralFactorMantissa).to.equal(UXRPMarketSpec.riskParameters.collateralFactor);
      expect(market.liquidationThresholdMantissa).to.equal(UXRPMarketSpec.riskParameters.liquidationThreshold);
      expect(market.liquidationIncentiveMantissa).to.equal(UXRPMarketSpec.riskParameters.liquidationIncentive);
      expect(market.isBorrowAllowed).to.equal(true);
    });

    it("prices UXRP at $2.50 through the resilient oracle", async () => {
      // 18-decimal underlying → getUnderlyingPrice equals the 18-decimal USD price.
      expect(await resilientOracle.getUnderlyingPrice(vUXRP)).to.equal(UXRP_PRICE);
    });

    it("has the correct admin, ACM and protocol share reserve", async () => {
      expect(await vUxrp.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await vUxrp.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
      expect(await vUxrp.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
      expect(await vUxrp.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("seeds initial supply, burns a slice and sends the rest to VTreasury", async () => {
      const minted = convertAmountToVTokens(UXRPMarketSpec.initialSupply.amount, UXRPMarketSpec.vToken.exchangeRate);
      expect(await vUxrp.totalSupply()).to.equal(minted);
      expect(await uxrp.balanceOf(vUXRP)).to.equal(UXRPMarketSpec.initialSupply.amount);
      expect(await vUxrp.balanceOf(ethers.constants.AddressZero)).to.equal(UXRPMarketSpec.initialSupply.vTokensToBurn);
      expect(await vUxrp.balanceOf(bsctestnet.VTREASURY)).to.equal(
        minted.sub(UXRPMarketSpec.initialSupply.vTokensToBurn),
      );
      expect(await vUxrp.balanceOf(bsctestnet.NORMAL_TIMELOCK)).to.equal(0);
    });
  });

  describe("Post-VIP behavior: market is functional", () => {
    // Testnet USDT (the asset borrowed against UXRP collateral) has 6 decimals and is priced at
    // $0.50 by the resilient oracle on this fork.
    const USDT_DECIMALS = 6;
    let supplier: Awaited<ReturnType<typeof initMainnetUser>>;

    before(async () => {
      // Pin the borrowed asset's price (the fork advances ~3 days past proposal, so its
      // Chainlink/Binance feed would otherwise go stale). UXRP uses a direct price, which
      // never goes stale, so it does not need bumping.
      await setMaxStalePeriodForAllAssets(resilientOracle, [usdt]);

      // Give the USDT market headroom so borrowing USDT against UXRP exercises the collateral
      // path rather than the (unrelated) USDT borrow cap.
      const timelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("2", 18));
      await comptroller.connect(timelock)._setMarketBorrowCaps([vUSDT], [parseUnits("100000000", USDT_DECIMALS)]);

      supplier = await initMainnetUser(SUPPLIER, parseUnits("1", 18));

      // Supply 30 UXRP ($75) as collateral → borrow power = $75 * 60% CF = $45.
      const supplyAmount = parseUnits("30", 18);
      await uxrp.connect(supplier).faucet(supplyAmount);
      await uxrp.connect(supplier).approve(vUXRP, supplyAmount);
      await vUxrp.connect(supplier).mint(supplyAmount);
      await comptroller.connect(supplier).enterMarkets([vUXRP]);
    });

    it("lets a user supply UXRP as collateral and borrow USDT against it", async () => {
      const borrowAmount = parseUnits("20", USDT_DECIMALS); // 20 USDT ≈ $10 < $45 borrow power
      const before = await usdt.balanceOf(SUPPLIER);
      await vUsdt.connect(supplier).borrow(borrowAmount);
      expect(await usdt.balanceOf(SUPPLIER)).to.equal(before.add(borrowAmount));
    });

    it("enforces the 60% collateral factor: a borrow above borrow power reverts", async () => {
      // $45 borrow power, ~$10 already used. Borrowing another 200 USDT (~$100) exceeds it.
      await expect(vUsdt.connect(supplier).borrow(parseUnits("200", USDT_DECIMALS))).to.be.revertedWith("math error");
    });

    it("lets a well-collateralized user borrow UXRP under the cap", async () => {
      const borrowAmount = parseUnits("5", 18); // $12.5, within remaining borrow power
      const before = await uxrp.balanceOf(SUPPLIER);
      await vUxrp.connect(supplier).borrow(borrowAmount);
      expect(await uxrp.balanceOf(SUPPLIER)).to.equal(before.add(borrowAmount));
    });

    it("enforces the 236 UXRP borrow cap", async () => {
      // The Comptroller borrow-cap guard runs before the liquidity/cash checks, so borrowing
      // above the cap reverts with the cap error even for a collateralized borrower.
      await expect(vUxrp.connect(supplier).borrow(parseUnits("237", 18))).to.be.revertedWith(
        "market borrow cap reached",
      );
    });

    it("enforces the 236 UXRP supply cap", async () => {
      const capTester = await initMainnetUser(CAP_TESTER, parseUnits("1", 18));

      // Current total supply ~130 UXRP (100 initial + 30 supplied). Minting 90 → ~220, under cap.
      const withinCap = parseUnits("90", 18);
      await uxrp.connect(capTester).faucet(withinCap);
      await uxrp.connect(capTester).approve(vUXRP, withinCap);
      await vUxrp.connect(capTester).mint(withinCap);

      // Minting another 30 → ~250, above the 236 cap.
      const overCap = parseUnits("30", 18);
      await uxrp.connect(capTester).faucet(overCap);
      await uxrp.connect(capTester).approve(vUXRP, overCap);
      await expect(vUxrp.connect(capTester).mint(overCap)).to.be.revertedWith("market supply cap reached");
    });
  });
});
