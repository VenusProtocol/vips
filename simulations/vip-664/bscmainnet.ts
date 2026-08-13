import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  CASH_PLUS,
  CASH_PLUS_NAV_FEED,
  CHAINLINK_ORACLE,
  FIXED_APY,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  LATE_PENALTY_RATE,
  LIQUIDATION_ADAPTER,
  LIQUIDATION_INCENTIVE,
  LIQUIDATION_THRESHOLD,
  LOCK_DURATION,
  MARGIN_RATE,
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  ONE_YEAR,
  OPEN_DURATION,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  U,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-664/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATION_ADAPTER_ABI from "./abi/LiquidationAdapter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 115672492;

const FEED_ABI = ["function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)"];
const POSITION_TOKEN_ABI = ["function ownerOf(uint256) view returns (address)"];

// The legacy vault's operator holds token 1, so createVault mints 2 for this deal.
const EXPECTED_POSITION_TOKEN_ID = 2;

const U_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; // Binance hot wallet, ~494M U

// One position NFT for the whole vault system (controller.positionToken()).
const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// IVaultTypes.VaultState
const VaultState = { WaitingForMargin: 0, MarginDeposited: 1, Fundraising: 2 };

forking(FORK_BLOCK, async () => {
  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const liquidationAdapter = new ethers.Contract(LIQUIDATION_ADAPTER, LIQUIDATION_ADAPTER_ABI, ethers.provider);
  const cashPlus = new ethers.Contract(CASH_PLUS, ERC20_ABI, ethers.provider);
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const feed = new ethers.Contract(CASH_PLUS_NAV_FEED, FEED_ABI, ethers.provider);
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);

  let timelock: any;
  let vaultsBefore: BigNumber;
  let predictedVault: string;

  before(async () => {
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);

    // createVault reverts unless the ResilientOracle prices both U and CASH+. The VIP handles CASH+
    // (ONE_YEAR when simulations=true); U it does not touch, and U's 86,700s windows lapse once the
    // governance lifecycle warps block.timestamp ~2 days forward. Widen every enabled oracle in U's
    // config, not just the main one — a stale pivot (Atlas) invalidates the main price too.
    const uOracleConfig = await resilientOracle.getTokenConfig(U);
    for (const [i, oracle] of uOracleConfig.oracles.entries()) {
      if (!uOracleConfig.enableFlagsForOracles[i] || oracle === ethers.constants.AddressZero) continue;
      await setMaxStalePeriodInChainlinkOracle(
        oracle,
        U,
        ethers.constants.AddressZero, // reuse the feed already registered for U
        bscmainnet.NORMAL_TIMELOCK,
        ONE_YEAR,
      );
    }
  });

  describe("Pre-VIP behavior", () => {
    it("only the legacy vault exists", async () => {
      expect(vaultsBefore).to.equal(1);
    });

    it("CASH+ has no direct price shadowing the feed (prices == 0)", async () => {
      expect(await chainlinkOracle.prices(CASH_PLUS)).to.equal(0);
    });

    it("CASH+ has no ChainlinkOracle feed configured", async () => {
      const config = await chainlinkOracle.tokenConfigs(CASH_PLUS);
      expect(config.feed).to.equal(ethers.constants.AddressZero);
    });

    it("CASH+ is not priced by the ResilientOracle yet (getPrice reverts)", async () => {
      await expect(resilientOracle.getPrice(CASH_PLUS)).to.be.reverted;
    });
  });

  testVip("VIP-664 List the Asseto CASH+ Fixed-Term Institutional Loan Vault", await vip664(true), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
    });

    it("registers a new vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(predictedVault);
      expect(await controller.isRegistered(vault.address)).to.equal(true);
    });

    it("stores the vault config", async () => {
      const config = await vault.config();
      expect(config.supplyAsset).to.equal(U);
      expect(config.fixedAPY).to.equal(FIXED_APY);
      expect(config.reserveFactor).to.equal(RESERVE_FACTOR);
      expect(config.minBorrowCap).to.equal(MIN_BORROW_CAP);
      expect(config.maxBorrowCap).to.equal(MAX_BORROW_CAP);
      expect(config.minSupplierDeposit).to.equal(MIN_SUPPLIER_DEPOSIT);
      expect(config.openDuration).to.equal(OPEN_DURATION);
      expect(config.lockDuration).to.equal(LOCK_DURATION);
      expect(config.settlementWindow).to.equal(SETTLEMENT_WINDOW);
    });

    it("stores the institutional config", async () => {
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(CASH_PLUS);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(EXPECTED_POSITION_TOKEN_ID);
      expect(await vault.positionToken()).to.equal(POSITION_TOKEN);
      expect(await positionToken.ownerOf(inst.positionTokenId)).to.equal(INSTITUTION_OPERATOR);
    });

    it("stores the risk config", async () => {
      const risk = await vault.riskConfig();
      expect(risk.liquidationThreshold).to.equal(LIQUIDATION_THRESHOLD);
      expect(risk.liquidationIncentive).to.equal(LIQUIDATION_INCENTIVE);
      expect(risk.latePenaltyRate).to.equal(LATE_PENALTY_RATE);
    });

    it("stores the institution name and share token name/symbol", async () => {
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
      expect(await vault.name()).to.equal(VAULT_NAME);
      expect(await vault.symbol()).to.equal(VAULT_SYMBOL);
    });

    it("prices CASH+ from the live Chainlink NAV feed", async () => {
      const feedAnswer = (await feed.latestRoundData())[1];
      // 18-dec feed on an 18-dec asset → getPrice returns the NAV verbatim.
      const chainlinkPrice = await chainlinkOracle.getPrice(CASH_PLUS);
      expect(chainlinkPrice).to.equal(feedAnswer);
      expect(await chainlinkOracle.tokenConfigs(CASH_PLUS)).to.have.property("feed", CASH_PLUS_NAV_FEED);

      const resilientPrice = await resilientOracle.getPrice(CASH_PLUS);
      expect(resilientPrice).to.be.gt(0);
      expect(resilientPrice).to.equal(chainlinkPrice);
    });
  });

  describe("Post-VIP behavioral proof: the vault is live", () => {
    let vault: Contract;
    let operator: any;
    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));
    // Inside [minBorrowCap, maxBorrowCap] = [1,000 U, 500,000 U].
    const LENDER_DEPOSIT = parseUnits("250000", 18);

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      // depositCollateral is onlyPositionHolder, and the operator already holds ~7,169 CASH+.
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await cashPlus.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
    });

    it("institution deposits margin -> MarginDeposited (depositCollateral is not price-gated)", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await expect(vault.connect(operator).depositCollateral(marginAmount))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(marginAmount, marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
    });

    it("controller opens the vault -> Fundraising, and collateral tops up to the ideal amount", async () => {
      // openVault is the guardian follow-up named in the VIP; the Normal Timelock also holds the role.
      await controller.connect(timelock).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);

      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(marginAmount));
      expect(await cashPlus.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("lender funds the vault -> shares minted, totalRaised recorded, borrow cap respected", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      const [, lender] = await ethers.getSigners();
      const lenderAddress = await lender.getAddress();
      await u.connect(whale).transfer(lenderAddress, LENDER_DEPOSIT);

      // Nothing raised yet, so the whole max borrow cap is still depositable.
      expect((await vault.runtime()).totalRaised).to.equal(0);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP);

      const uInVaultBefore = await u.balanceOf(vault.address);
      const expectedShares = await vault.previewDeposit(LENDER_DEPOSIT);

      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lenderAddress);

      // First deposit into an empty vault mints 1:1.
      expect(expectedShares).to.equal(LENDER_DEPOSIT);
      expect(await vault.balanceOf(lenderAddress)).to.equal(expectedShares);
      expect(await vault.totalSupply()).to.equal(expectedShares);
      expect((await vault.runtime()).totalRaised).to.equal(LENDER_DEPOSIT);
      expect(await u.balanceOf(vault.address)).to.equal(uInVaultBefore.add(LENDER_DEPOSIT));
      // Remaining headroom is the max borrow cap net of what was raised.
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP.sub(LENDER_DEPOSIT));
    });
  });
});
