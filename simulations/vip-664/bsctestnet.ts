import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip664, {
  MOCK_UXRP,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  VUXRP,
  convertAmountToVTokens,
  marketSpecs,
  vTokensRemaining,
} from "../../vips/vip-664/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

// A few blocks after the MockUXRP (115008472) and vUXRP (115008496) deploy transactions.
const FORK_BLOCK = 115008600;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const vToken = new ethers.Contract(VUXRP, VTOKEN_ABI, ethers.provider);
  const underlying = new ethers.Contract(MOCK_UXRP, ERC20_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("vUXRP market is not listed", async () => {
      const market = await comptroller.markets(VUXRP);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-664 List vUXRP in the Core Pool (Testnet)", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
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
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("sets the new IRM on the market", async () => {
      expect(await vToken.interestRateModel()).to.equal(marketSpecs.rateModel);
    });

    checkInterestRate(marketSpecs.rateModel, marketSpecs.vToken.symbol, {
      base: marketSpecs.interestRateModel.baseRatePerYear,
      multiplier: marketSpecs.interestRateModel.multiplierPerYear,
      jump: marketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: marketSpecs.interestRateModel.kink,
    });

    checkVToken(VUXRP, {
      name: marketSpecs.vToken.name,
      symbol: marketSpecs.vToken.symbol,
      decimals: marketSpecs.vToken.decimals,
      underlying: marketSpecs.vToken.underlying,
      exchangeRate: marketSpecs.vToken.exchangeRate,
      comptroller: marketSpecs.vToken.comptroller,
    });

    checkRiskParameters(VUXRP, marketSpecs.vToken, marketSpecs.riskParameters);

    it("configures the oracle to return $2.50 for vUXRP", async () => {
      expect(await resilientOracle.getUnderlyingPrice(VUXRP)).to.equal(marketSpecs.oracle.directPrice);
    });

    it("sets the liquidation threshold to 70%", async () => {
      const market = await comptroller.markets(VUXRP);
      expect(market.liquidationThresholdMantissa).to.equal(marketSpecs.riskParameters.liquidationThreshold);
    });

    it("sets the liquidation incentive to 110%", async () => {
      const market = await comptroller.markets(VUXRP);
      expect(market.liquidationIncentiveMantissa).to.equal(marketSpecs.riskParameters.liquidationIncentive);
    });

    it("enables borrowing for the market", async () => {
      const market = await comptroller.markets(VUXRP);
      expect(market.isBorrowAllowed).to.equal(true);
    });

    it("has the correct admin (Normal Timelock)", async () => {
      expect(await vToken.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("has the correct ACM", async () => {
      expect(await vToken.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("has the correct protocol share reserve", async () => {
      expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("has the correct reduce reserves block delta", async () => {
      expect(await vToken.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
    });

    it("mints the configured initial supply", async () => {
      expect(await vToken.totalSupply()).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
      expect(await underlying.balanceOf(VUXRP)).to.equal(marketSpecs.initialSupply.amount);
    });

    it("burns a slice of vTokens and sends the rest to the receiver", async () => {
      expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(marketSpecs.initialSupply.vTokensToBurn);
      expect(await vToken.balanceOf(marketSpecs.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining);
      expect(await vToken.balanceOf(bsctestnet.NORMAL_TIMELOCK)).to.equal(0);
    });
  });

  describe("Post-VIP functional: supply, borrow and cap enforcement", () => {
    let user: SignerWithAddress;
    let userVToken: Contract;
    let userUnderlying: Contract;
    let userComptroller: Contract;

    const SUPPLY_AMOUNT = parseUnits("100", 18); // $250 collateral
    const BORROW_OK = parseUnits("0.01", 18); // tiny borrow, well within CF
    const BORROW_OVER_CF = parseUnits("100", 18); // $250 > $150 borrow power → must revert

    before(async () => {
      // Use a fresh signer with no pre-existing market membership: the liquidity check
      // only prices vUXRP (whose price is pinned via setDirectPrice), avoiding stale feeds
      // on the shared testnet test account's other markets.
      [user] = await ethers.getSigners();
      userVToken = vToken.connect(user);
      userUnderlying = underlying.connect(user);
      userComptroller = comptroller.connect(user);

      // The Chainlink direct price ($2.50) has no aggregator timestamp, so it never goes stale on the fork.
      await userUnderlying.faucet(parseUnits("500", 18));
      await userUnderlying.approve(VUXRP, ethers.constants.MaxUint256);
      await userVToken.mint(SUPPLY_AMOUNT);
      await userComptroller.enterMarkets([VUXRP]);
    });

    it("lets a user supply UXRP as collateral and borrow within the collateral factor", async () => {
      const balanceBefore = await underlying.balanceOf(user.address);
      await expect(userVToken.borrow(BORROW_OK)).to.not.be.reverted;
      expect(await underlying.balanceOf(user.address)).to.equal(balanceBefore.add(BORROW_OK));
    });

    it("reverts when borrowing beyond the collateral factor limit", async () => {
      await expect(userVToken.borrow(BORROW_OVER_CF)).to.be.reverted;
    });

    it("enforces the supply cap of 236 UXRP", async () => {
      // Already supplied ~100 UXRP (plus the 0.26 VIP seed); minting 200 more crosses the 236 cap.
      await expect(userVToken.mint(parseUnits("200", 18))).to.be.reverted;
    });
  });
});
