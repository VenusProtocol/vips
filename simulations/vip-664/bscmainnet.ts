import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
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
  LIQUIDATOR,
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
import ACM_ABI from "./abi/AccessControlManager.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATION_ADAPTER_ABI from "./abi/LiquidationAdapter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Block shortly before the proposal: no CASH+ vault exists (allVaultsLength == 1, the legacy vault),
// CASH+ is not priced yet (ChainlinkOracle.prices(CASH+) == 0 and it has no feed config), and the
// deal liquidator is not whitelisted on the adapter.
const FORK_BLOCK = 115672492;

const FEED_ABI = ["function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)"];

// IVaultTypes.VaultState
const VaultState = { WaitingForMargin: 0, MarginDeposited: 1, Fundraising: 2 };

// Sim-only: a fresh lender used for the fundraising leg. U ("United Stables") is a plain
// OpenZeppelin upgradeable ERC20 whose `_balances` mapping sits at storage slot 51 (verified
// on-chain), so we can deal U directly by writing that slot — no whale, no blacklist dependency.
const LENDER = "0xE110000000000000000000000000000000000e11";
const U_BALANCES_SLOT = 51;
// Second ChainlinkOracle instance used as the PIVOT source for U in the ResilientOracle.
const U_PIVOT_CHAINLINK_ORACLE = "0x9e6928ec418948ceb9f1cd9872fd312b13d841d0";

forking(FORK_BLOCK, async () => {
  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const liquidationAdapter = new ethers.Contract(LIQUIDATION_ADAPTER, LIQUIDATION_ADAPTER_ABI, ethers.provider);
  const cashPlus = new ethers.Contract(CASH_PLUS, ERC20_ABI, ethers.provider);
  const feed = new ethers.Contract(CASH_PLUS_NAV_FEED, FEED_ABI, ethers.provider);

  let timelock: any;
  let vaultsBefore: BigNumber;
  let predictedVault: string;

  before(async () => {
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();
    // The institution's nonce is 0, so the vault address is deterministic before creation.
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);

    // Sim-only staleness workaround. createVault probes the ResilientOracle for BOTH assets
    // (it reverts unless getPrice(U) and getPrice(CASH+) are non-zero). CASH+ is handled by the
    // VIP itself (its ChainlinkOracle config is written with ONE_YEAR when simulations=true). U is
    // a pre-existing market the VIP does not touch: the ResilientOracle prices it from a main +
    // pivot pair of Chainlink feeds (no fallback), both on ~24h (86,700s) stale windows. Once the
    // mined governance lifecycle warps block.timestamp ~2 days forward both feeds go stale, and
    // with no fallback configured getPrice(U) needs BOTH the main and the pivot fresh — so
    // createVault would revert on getPrice(U). Widen both feeds' stale windows to ONE_YEAR on
    // their respective ChainlinkOracle instances (NORMAL_TIMELOCK holds setTokenConfig on both).
    // This leaves U's ResilientOracle config untouched and writes NO direct price (prices[U] stays
    // 0), so it does not introduce the stored-price shadow hazard the VIP description warns about,
    // and touches nothing the VIP asserts.
    const uPivotOracle = new ethers.Contract(U_PIVOT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    const uMainFeed = (await chainlinkOracle.tokenConfigs(U)).feed;
    const uPivotFeed = (await uPivotOracle.tokenConfigs(U)).feed;
    await chainlinkOracle.connect(timelock).setTokenConfig({ asset: U, feed: uMainFeed, maxStalePeriod: ONE_YEAR });
    await uPivotOracle.connect(timelock).setTokenConfig({ asset: U, feed: uPivotFeed, maxStalePeriod: ONE_YEAR });
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

    it("the deal liquidator is not whitelisted on the adapter", async () => {
      expect(await liquidationAdapter.isWhitelistedLiquidator(LIQUIDATOR)).to.equal(false);
    });
  });

  testVip("VIP-664 List the Asseto CASH+ Fixed-Term Institutional Loan Vault", await vip664(true), {
    callbackAfterExecution: async txResponse => {
      // CASH+ feed registered on the ChainlinkOracle and wired into the ResilientOracle.
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      // Vault created and the liquidator whitelisted.
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [LIQUIDATION_ADAPTER_ABI], ["LiquidatorWhitelistUpdated"], [1]);
      // No ACM grants — the Normal Timelock already holds every role used here.
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "PermissionGranted"], [0, 0]);
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
      // positionTokenId is overwritten by the controller (createVault ignores the passed 0). The
      // position NFT counter is at 1 (the legacy vault holds tokenId 1), so this vault mints 2.
      expect(inst.positionTokenId).to.equal(2);
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
      // The ResilientOracle price tracks the live feed (no pivot/fallback), not a hardcoded value.
      expect(resilientPrice).to.equal(chainlinkPrice);
    });

    it("whitelists the deal liquidator on the adapter", async () => {
      expect(await liquidationAdapter.isWhitelistedLiquidator(LIQUIDATOR)).to.equal(true);
    });
  });

  describe("Post-VIP behavioral proof: the vault is live", () => {
    let vault: Contract;
    let operator: any;
    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      // The position NFT was minted to the institution operator; depositCollateral is onlyPositionHolder.
      // The operator already holds ~7,169 CASH+ (> idealCollateralAmount), so no whale is needed.
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
      // openVault is the Critical Guardian / timelock follow-up named in the VIP; the Normal
      // Timelock also holds the role, so it stands in for the guardian here.
      await controller.connect(timelock).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);

      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(marginAmount));
      expect(await cashPlus.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("a lender funds the vault -> shares minted and totalRaised recorded", async () => {
      expect(await vault.state()).to.equal(VaultState.Fundraising);

      const lenderAmount = parseUnits("100000", 18); // 100k U, within the 500k max borrow cap
      const lender = await initMainnetUser(LENDER, parseUnits("1"));

      // Deal U to the lender by writing its ERC20 balance slot directly (no whale / blacklist dep).
      const balanceSlot = ethers.utils.solidityKeccak256(["uint256", "uint256"], [LENDER, U_BALANCES_SLOT]);
      await ethers.provider.send("hardhat_setStorageAt", [
        U,
        balanceSlot,
        ethers.utils.hexZeroPad(lenderAmount.toHexString(), 32),
      ]);
      const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
      expect(await u.balanceOf(LENDER)).to.equal(lenderAmount);
      await u.connect(lender).approve(vault.address, lenderAmount);

      const expectedShares = await vault.previewDeposit(lenderAmount);
      const totalRaisedBefore = (await vault.runtime()).totalRaised;

      await expect(vault.connect(lender).deposit(lenderAmount, LENDER))
        .to.emit(vault, "Deposit")
        .withArgs(LENDER, LENDER, lenderAmount, expectedShares);

      // Shares minted to the lender, totalRaised advanced by the deposit, and the U landed in the vault.
      expect(await vault.balanceOf(LENDER)).to.equal(expectedShares);
      expect((await vault.runtime()).totalRaised).to.equal(totalRaisedBefore.add(lenderAmount));
      expect(await u.balanceOf(vault.address)).to.equal(lenderAmount);
    });
  });
});
