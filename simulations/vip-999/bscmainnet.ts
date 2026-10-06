import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  ADAPTER_FRV,
  ATLAS_ORACLE,
  FIXED_APY,
  HASH_GLOBAL_VAULT,
  HBNB,
  HBNB_FEED,
  HBNB_MAX_STALE_PERIOD,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  LATE_PENALTY_RATE,
  LIQUIDATION_INCENTIVE,
  LIQUIDATION_THRESHOLD,
  LOCK_DURATION,
  MARGIN_RATE,
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  OPEN_DURATION,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  U,
  U_FRV_SOURCE,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-999/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import MANAGEMENT_ABI from "./abi/Management.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SECURITY_TOKEN_ABI from "./abi/SecurityToken.json";
import FEED_ABI from "./abi/SingleFeed.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 125992901;

// contract StubOracle { function getPrice(address) external pure returns (uint256) { return 1e18; } }
const STUB_ORACLE_BYTECODE =
  "0x6080604052348015600e575f80fd5b5061015e8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c806341976e091461002d575b5f80fd5b610047600480360381019061004291906100cc565b61005d565b604051610054919061010f565b60405180910390f35b5f670de0b6b3a76400009050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009b82610072565b9050919050565b6100ab81610091565b81146100b5575f80fd5b50565b5f813590506100c6816100a2565b92915050565b5f602082840312156100e1576100e061006e565b5b5f6100ee848285016100b8565b91505092915050565b5f819050919050565b610109816100f7565b82525050565b5f6020820190506101225f830184610100565b9291505056fea26469706673582212209282f7f2d85233912d0088d6dc45ce2459097d2866597e41f0a286059758c12c64736f6c63430008190033";

const deployStubOracle = async (): Promise<Contract> => {
  const [deployer] = await ethers.getSigners();
  const factory = new ethers.ContractFactory(
    ["function getPrice(address) external pure returns (uint256)"],
    STUB_ORACLE_BYTECODE,
    deployer,
  );
  const stubOracle = await factory.deploy();
  await stubOracle.deployed();
  return stubOracle;
};

// DigiFT's compliance registry gating every hBNB transfer.
const MANAGEMENT = "0x2b6d846B07D4DF426a297e4Fe152aca832d9b3B3";

const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";

const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// IVaultTypes.VaultState
const VaultState = {
  WaitingForMargin: 0,
  MarginDeposited: 1,
  Fundraising: 2,
  Lock: 4,
  PendingSettlement: 5,
  SettlementDeadlineExceeded: 6,
  Matured: 7,
  Failed: 8,
};

const U_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const U_HUB = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
const U_CORE_SOURCE = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const NO_RESOURCE = ethers.constants.AddressZero;

// ERC4626 redemption with the vault's virtual asset/share offset of 1.
const previewRedeemAt = (shares: BigNumber, totalAssets: BigNumber, totalSupply: BigNumber): BigNumber =>
  shares.mul(totalAssets.add(1)).div(totalSupply.add(1));

// Mirrors BaseVault._computeTotalInterest.
const BPS = 10_000;
const YEAR = 365 * 24 * 60 * 60;
const termInterest = (principal: BigNumber): BigNumber =>
  principal.mul(FIXED_APY).mul(LOCK_DURATION).div(BigNumber.from(BPS).mul(YEAR));

const reserveCut = (interest: BigNumber): BigNumber => interest.mul(RESERVE_FACTOR).div(parseUnits("1", 18));

forking(FORK_BLOCK, async () => {
  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const hBNB = new ethers.Contract(HBNB, SECURITY_TOKEN_ABI, ethers.provider);
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const management = new ethers.Contract(MANAGEMENT, MANAGEMENT_ABI, ethers.provider);
  const feed = new ethers.Contract(HBNB_FEED, FEED_ABI, ethers.provider);
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);
  const frvSource = new ethers.Contract(U_FRV_SOURCE, FRV_SOURCE_ABI, ethers.provider);
  const hub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  const adapterFrv = new ethers.Contract(
    ADAPTER_FRV,
    [
      "function maxWithdraw(address resource, address holder) view returns (uint256)",
      "function totalAssets(address resource, address holder) view returns (uint256)",
    ],
    ethers.provider,
  );

  let vaultsBefore: BigNumber;
  let waitingSnapshot: SnapshotRestorer;
  let openSnapshot: SnapshotRestorer;
  let fundraisingSnapshot: SnapshotRestorer;
  let positionTokenIdBefore: BigNumber;
  let predictedVault: string;
  let feedAsAtlas: Contract;
  let timelock: SignerWithAddress;
  let originalControllerOracle: string;

  before(async () => {
    vaultsBefore = await controller.allVaultsLength();
    positionTokenIdBefore = await positionToken.nextTokenId();
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);
    feedAsAtlas = feed.connect(await initMainnetUser(ATLAS_ORACLE, parseUnits("1")));
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));

    const uOracleConfig = await resilientOracle.getTokenConfig(U);
    for (const [i, oracle] of uOracleConfig.oracles.entries()) {
      if (!uOracleConfig.enableFlagsForOracles[i] || oracle === ethers.constants.AddressZero) continue;
      await setMaxStalePeriodInChainlinkOracle(oracle, U, ethers.constants.AddressZero, bscmainnet.NORMAL_TIMELOCK);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("AtlasOracle has no direct price set for hBNB", async () => {
      expect(await atlasOracle.prices(HBNB)).to.equal(0);
    });

    it("AtlasOracle has no feed for hBNB", async () => {
      const config = await atlasOracle.tokenConfigs(HBNB);
      expect(config.asset).to.equal(ethers.constants.AddressZero);
      expect(config.feed).to.equal(ethers.constants.AddressZero);
      expect(config.maxStalePeriod).to.equal(0);
    });

    it("ResilientOracle cannot price hBNB yet", async () => {
      const config = await resilientOracle.getTokenConfig(HBNB);
      expect(config.asset).to.equal(ethers.constants.AddressZero);
      expect(config.oracles).to.deep.equal([
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect(config.enableFlagsForOracles).to.deep.equal([false, false, false]);
      await expect(resilientOracle.getPrice(HBNB)).to.be.revertedWith("invalid resilient oracle price");
    });

    it("hBNB and its USD feed both use 18 decimals", async () => {
      expect(await feed.description()).to.equal("SingleFeed hBNB/USD");
      expect(await feed.decimals()).to.equal(18);
      expect(await hBNB.name()).to.equal("DigiFT Hash Global BNB Yield Fund Token");
      expect(await hBNB.symbol()).to.equal("hBNB");
      expect(await hBNB.decimals()).to.equal(18);
    });

    it("hBNB feed updated within maxStalePeriod", async () => {
      const updatedAt = (await feedAsAtlas.latestRoundData())[3];
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      expect(now - updatedAt.toNumber()).to.be.lte(HBNB_MAX_STALE_PERIOD);
    });

    it("HASH_GLOBAL_VAULT is the controller's predicted vault for the operator", async () => {
      expect(predictedVault).to.equal(HASH_GLOBAL_VAULT);
      expect(await ethers.provider.getCode(HASH_GLOBAL_VAULT)).to.equal("0x");
    });

    it("U FRV source does not list the vault yet", async () => {
      expect(await frvSource.asset()).to.equal(U);
      expect(await frvSource.resources()).to.not.include(predictedVault);
    });

    // Under transferFlag 2 a whitelisted investor can both send and receive hBNB. The operator and the vault
    // cover collateral in and out; the adapter and the Guardian cover the on-chain liquidation fallback.
    it("DigiFT whitelists the operator, vault, adapter and Guardian as investors", async () => {
      expect(await hBNB.transferFlag()).to.equal(2);
      expect(await management.isWhiteInvestor(INSTITUTION_OPERATOR)).to.equal(true);
      expect(await management.isWhiteInvestor(predictedVault)).to.equal(true);
      expect(await management.isWhiteInvestor(LIQUIDATION_ADAPTER)).to.equal(true);
      expect(await management.isWhiteInvestor(bscmainnet.CRITICAL_GUARDIAN)).to.equal(true);
    });

    // Neither ever receives hBNB on the normal path; see the PSR sweep and institution-default tests below.
    it("DigiFT has not whitelisted the PSR or the U Hub", async () => {
      expect(await management.isWhiteInvestor(PROTOCOL_SHARE_RESERVE)).to.equal(false);
      expect(await management.isWhiteInvestor(U_HUB)).to.equal(false);
    });

    it("[Test-Only] stubs the controller oracle for createVault's price check", async () => {
      originalControllerOracle = await controller.oracle();
      expect(originalControllerOracle).to.equal(RESILIENT_ORACLE);
      const stubOracle = await deployStubOracle();
      await controller.connect(timelock).setOracle(stubOracle.address);
      expect(await controller.oracle()).to.equal(stubOracle.address);
    });
  });

  testVip("VIP-999 List the Hash Global hBNB Fixed-Term Institutional Loan Vault", await vip999(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: [
      "0x34221485302f6F2029660a000908B5FCABB9BC6e",
      "0xc444949e0054a23c44fc45789738bdf64aed2391",
      "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
    ],
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceAdded"], [1]);

      await controller.connect(timelock).setOracle(originalControllerOracle);

      // Assert the VIP's maxStalePeriod before widening it for the post-VIP reads.
      const oracle = await atlasOracle.tokenConfigs(HBNB);
      expect(oracle.feed).to.equal(HBNB_FEED);
      expect(oracle.maxStalePeriod).to.equal(HBNB_MAX_STALE_PERIOD);

      await setMaxStalePeriodInChainlinkOracle(
        ATLAS_ORACLE,
        HBNB,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
      );
    },
  });

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
    });

    it("creates the vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(predictedVault);
      expect(await controller.isRegistered(vault.address)).to.equal(true);
    });

    it("sets the loan terms", async () => {
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

    it("sets the collateral terms and mints the position NFT to the operator", async () => {
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(HBNB);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(positionTokenIdBefore);
      expect(await positionToken.vaultToTokenId(vault.address)).to.equal(inst.positionTokenId);
      expect(await vault.positionToken()).to.equal(POSITION_TOKEN);
      expect(await positionToken.ownerOf(inst.positionTokenId)).to.equal(INSTITUTION_OPERATOR);
    });

    it("sets the risk parameters", async () => {
      const risk = await vault.riskConfig();
      expect(risk.liquidationThreshold).to.equal(LIQUIDATION_THRESHOLD);
      expect(risk.liquidationIncentive).to.equal(LIQUIDATION_INCENTIVE);
      expect(risk.latePenaltyRate).to.equal(LATE_PENALTY_RATE);
    });

    it("sets the institution name and share name/symbol", async () => {
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
      expect(await vault.name()).to.equal(VAULT_NAME);
      expect(await vault.symbol()).to.equal(VAULT_SYMBOL);
    });

    it("prices hBNB from the feed", async () => {
      // 18-dec feed on an 18-dec asset: getPrice returns the NAV verbatim.
      const nav = (await feedAsAtlas.latestRoundData())[1];
      expect(nav).to.be.gt(0);
      expect(await atlasOracle.getPrice(HBNB)).to.equal(nav);
      expect(await resilientOracle.getPrice(HBNB)).to.equal(nav);
      expect(await atlasOracle.prices(HBNB)).to.equal(0);
    });

    it("uses AtlasOracle as hBNB's only ResilientOracle source", async () => {
      const config = await resilientOracle.getTokenConfig(HBNB);
      expect(config.asset).to.equal(HBNB);
      expect(config.oracles).to.deep.equal([ATLAS_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero]);
      expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
      expect(config.cachingEnabled).to.equal(false);
    });

    it("adds the vault to the U FRV source", async () => {
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
    });
  });

  describe("Post-VIP vault lifecycle", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    let lenderAddress: string;
    let operatorHBNBBefore: BigNumber;

    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));
    const LENDER_DEPOSIT = MAX_BORROW_CAP;

    const EXPECTED_INTEREST = termInterest(MAX_BORROW_CAP);
    const EXPECTED_DEBT_AT_MATURITY = MAX_BORROW_CAP.add(EXPECTED_INTEREST);
    const EXPECTED_PROTOCOL_FEE = reserveCut(EXPECTED_INTEREST);
    const TOTAL_ASSETS_AT_MATURITY = EXPECTED_DEBT_AT_MATURITY.sub(EXPECTED_PROTOCOL_FEE);
    const EXPECTED_LENDER_PROCEEDS = previewRedeemAt(LENDER_DEPOSIT, TOTAL_ASSETS_AT_MATURITY, MAX_BORROW_CAP);

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
      lenderAddress = await lender.getAddress();
      operatorHBNBBefore = await hBNB.balanceOf(INSTITUTION_OPERATOR);
    });

    it("operator deposits the 1% margin", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      waitingSnapshot = await takeSnapshot();
      expect(operatorHBNBBefore).to.be.gte(IDEAL_COLLATERAL_AMOUNT);
      await hBNB.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);

      await expect(vault.connect(operator).depositCollateral(marginAmount))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(marginAmount, marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect(await hBNB.balanceOf(vault.address)).to.equal(marginAmount);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(marginAmount);
    });

    it("guardian opens the vault and operator tops up to 198 hBNB", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      openSnapshot = await takeSnapshot();

      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(marginAmount));
      expect(await hBNB.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(INSTITUTION_OPERATOR)).to.equal(operatorHBNBBefore.sub(IDEAL_COLLATERAL_AMOUNT));

      const nav = await resilientOracle.getPrice(HBNB);
      expect(await vault.getCollateralValueUSD()).to.equal(IDEAL_COLLATERAL_AMOUNT.mul(nav).div(parseUnits("1", 18)));

      fundraisingSnapshot = await takeSnapshot();
    });

    it("lender supplies 150k U for 1:1 shares", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lenderAddress, LENDER_DEPOSIT);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP);
      expect(await vault.previewDeposit(LENDER_DEPOSIT)).to.equal(LENDER_DEPOSIT);

      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lenderAddress);

      expect(await vault.balanceOf(lenderAddress)).to.equal(LENDER_DEPOSIT);
      expect(await vault.totalSupply()).to.equal(MAX_BORROW_CAP);
      expect((await vault.runtime()).totalRaised).to.equal(MAX_BORROW_CAP);
      expect(await u.balanceOf(vault.address)).to.equal(MAX_BORROW_CAP);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(0);
    });

    it("vault locks after the 7-day open window", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("operator claims the 150k U", async () => {
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      expect(await u.balanceOf(vault.address)).to.equal(0);
      expect(await vault.outstandingDebt()).to.equal(EXPECTED_DEBT_AT_MATURITY);
    });

    it("operator repays in full after the 30-day term", async () => {
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

      const owed = await vault.outstandingDebt();
      expect(owed).to.equal(EXPECTED_DEBT_AT_MATURITY);

      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(INSTITUTION_OPERATOR, owed.sub(MAX_BORROW_CAP));
      await u.connect(operator).approve(vault.address, owed);
      const psrBefore = await u.balanceOf(PROTOCOL_SHARE_RESERVE);
      await vault.connect(operator).repay(owed);

      expect(await vault.state()).to.equal(VaultState.Matured);
      expect(await vault.outstandingDebt()).to.equal(0);
      expect((await u.balanceOf(PROTOCOL_SHARE_RESERVE)).sub(psrBefore)).to.equal(EXPECTED_PROTOCOL_FEE);
      expect(await u.balanceOf(vault.address)).to.equal(EXPECTED_DEBT_AT_MATURITY.sub(EXPECTED_PROTOCOL_FEE));
    });

    it("lender redeems principal plus interest", async () => {
      const shares = await vault.balanceOf(lenderAddress);
      const assets = await vault.previewRedeem(shares);
      expect(assets).to.equal(EXPECTED_LENDER_PROCEEDS);

      const before = await u.balanceOf(lenderAddress);
      await vault.connect(lender).redeem(shares, lenderAddress, lenderAddress);
      expect(await u.balanceOf(lenderAddress)).to.equal(before.add(assets));
      expect(await vault.balanceOf(lenderAddress)).to.equal(0);
    });

    it("operator withdraws all collateral", async () => {
      expect(await hBNB.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(INSTITUTION_OPERATOR)).to.equal(operatorHBNBBefore);
      expect(await hBNB.balanceOf(vault.address)).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
    });
  });

  describe("Post-VIP Liquidity Hub flow", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubOperator: SignerWithAddress;

    const HUB_ALLOCATION = parseUnits("50000", 18);

    const HUB_INTEREST = termInterest(HUB_ALLOCATION);
    const HUB_TOTAL_ASSETS_AT_MATURITY = HUB_ALLOCATION.add(HUB_INTEREST).sub(reserveCut(HUB_INTEREST));
    const EXPECTED_HUB_PROCEEDS = previewRedeemAt(HUB_ALLOCATION, HUB_TOTAL_ASSETS_AT_MATURITY, HUB_ALLOCATION);

    before(async () => {
      await fundraisingSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
    });

    it("Hub operator moves 50k U from Core into the vault", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );

      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect(await adapterFrv.totalAssets(vault.address, U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect((await vault.runtime()).totalRaised).to.equal(HUB_ALLOCATION);
    });

    it("Hub cannot withdraw from the vault during Lock", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);

      // The coupon accrues but maxWithdraw is 0 outside terminal states, so nothing is deliverable mid-lock.
      expect(await adapterFrv.totalAssets(vault.address, U_FRV_SOURCE)).to.be.gt(HUB_ALLOCATION);
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(0);

      await expect(
        hub
          .connect(hubOperator)
          .reallocate(
            [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
            [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          ),
      )
        .to.be.revertedWithCustomError(frvSource, "ResourceLiquidityInsufficient")
        .withArgs(HUB_ALLOCATION, 0);
    });

    it("operator repays at maturity", async () => {
      await vault.connect(operator).claimRaisedFunds();
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();

      const owed = await vault.outstandingDebt();
      expect(owed).to.equal(HUB_ALLOCATION.add(HUB_INTEREST));

      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(INSTITUTION_OPERATOR, owed.sub(HUB_ALLOCATION));
      await u.connect(operator).approve(vault.address, owed);
      await vault.connect(operator).repay(owed);
      expect(await vault.state()).to.equal(VaultState.Matured);
      expect(await vault.outstandingDebt()).to.equal(0);
    });

    it("Hub operator moves principal plus interest back to Core", async () => {
      expect(await vault.previewRedeem(HUB_ALLOCATION)).to.equal(EXPECTED_HUB_PROCEEDS);
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(EXPECTED_HUB_PROCEEDS);
      expect(await adapterFrv.totalAssets(vault.address, U_FRV_SOURCE)).to.equal(EXPECTED_HUB_PROCEEDS);

      // reallocate reverts unless the vault delivers exactly this amount into Core.
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: EXPECTED_HUB_PROCEEDS }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: EXPECTED_HUB_PROCEEDS }],
        );

      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      expect(await adapterFrv.totalAssets(vault.address, U_FRV_SOURCE)).to.equal(0);
    });
  });

  // Liquidation is handled off-chain, but under transferFlag 2 the Guardian can still liquidate on-chain as a
  // fallback, through the LiquidationAdapter: the vault, the adapter and the Guardian are all whitelisted investors.
  describe("Post-VIP Guardian liquidation fallback", () => {
    let vault: Contract;
    let guardian: SignerWithAddress;
    let lockSnapshot: SnapshotRestorer;
    const adapter = new ethers.Contract(
      LIQUIDATION_ADAPTER,
      [
        "function liquidate(address vault, uint256 repayAmount)",
        "function liquidateOverdueVault(address vault, uint256 repayAmount)",
        "function isWhitelistedLiquidator(address) view returns (bool)",
        "function isWhitelistedSettler(address) view returns (bool)",
        "function protocolLiquidationShare() view returns (uint256)",
        "function protocolShareAccrued(address collateral) view returns (uint256)",
        "function sweepProtocolShareToReserve(address collateral)",
      ],
      ethers.provider,
    );
    const REPAY = parseUnits("10000", 18);

    // Runs one adapter liquidation and checks every leg against the vault's seize math:
    // seize = repay x U price x incentive / hBNB price; the adapter keeps its share of the bonus.
    const expectGuardianLiquidation = async (liquidate: () => Promise<unknown>, incentive: BigNumber) => {
      const seize = REPAY.mul(await resilientOracle.getPrice(U))
        .div(parseUnits("1", 18))
        .mul(incentive)
        .div(await resilientOracle.getPrice(HBNB));
      const bonus = seize.sub(seize.mul(parseUnits("1", 18)).div(incentive));
      const protocolShare = bonus.mul(await adapter.protocolLiquidationShare()).div(parseUnits("1", 18));
      const debtBefore = await vault.outstandingDebt();

      await liquidate();

      expect(await hBNB.balanceOf(guardian.address)).to.equal(seize.sub(protocolShare));
      expect(await hBNB.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT.sub(seize));
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(
        IDEAL_COLLATERAL_AMOUNT.sub(seize),
      );
      expect(await adapter.protocolShareAccrued(HBNB)).to.equal(protocolShare);
      expect(await hBNB.balanceOf(adapter.address)).to.equal(protocolShare);
      expect(await vault.outstandingDebt()).to.equal(debtBefore.sub(REPAY));
      expect(await u.balanceOf(guardian.address)).to.equal(0);
    };

    before(async () => {
      await fundraisingSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      guardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      const [, lender] = await ethers.getSigners();

      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lender.address, MAX_BORROW_CAP);
      await u.connect(lender).approve(vault.address, MAX_BORROW_CAP);
      await vault.connect(lender).deposit(MAX_BORROW_CAP, lender.address);
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      await vault.connect(operator).claimRaisedFunds();

      await u.connect(whale).transfer(guardian.address, REPAY);
      await u.connect(guardian).approve(adapter.address, REPAY);
      lockSnapshot = await takeSnapshot();
    });

    it("guardian is whitelisted on the adapter for both HF and overdue liquidations", async () => {
      expect(await adapter.isWhitelistedLiquidator(guardian.address)).to.equal(true);
      expect(await adapter.isWhitelistedSettler(guardian.address)).to.equal(true);
    });

    it("guardian cannot liquidate the vault directly, only through the adapter", async () => {
      await expect(vault.connect(guardian).liquidate(REPAY)).to.be.revertedWithCustomError(vault, "Unauthorized");
    });

    it("guardian liquidates an underwater vault during Lock (HF)", async () => {
      // hBNB at $1,000 puts 198 hBNB x 75% below the ~150.3k U debt.
      const atlas = new ethers.Contract(
        ATLAS_ORACLE,
        ["function setDirectPrice(address asset, uint256 price)"],
        timelock,
      );
      await atlas.setDirectPrice(HBNB, parseUnits("1000", 18));
      expect(await vault.state()).to.equal(VaultState.Lock);
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);

      await expectGuardianLiquidation(
        () => adapter.connect(guardian).liquidate(vault.address, REPAY),
        LIQUIDATION_INCENTIVE,
      );
    });

    it("guardian liquidates the vault once the settlement deadline passes (overdue)", async () => {
      await lockSnapshot.restore(); // back to the healthy, locked vault at the live NAV
      await time.increase(LOCK_DURATION + SETTLEMENT_WINDOW + 2);
      await vault.connect(guardian).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.SettlementDeadlineExceeded);

      await expectGuardianLiquidation(
        () => adapter.connect(guardian).liquidateOverdueVault(vault.address, REPAY),
        LATE_PENALTY_RATE,
      );
    });

    it("protocol share cannot be swept to the PSR, which is not whitelisted for hBNB", async () => {
      await expect(adapter.connect(timelock).sweepProtocolShareToReserve(HBNB)).to.be.revertedWith("Forbid transfer");
    });
  });

  // If fundraising closes with the minimum raised but less than 198 hBNB posted, the vault confiscates the margin and
  // pays it out in hBNB to whoever redeems. Neither the Hub nor a plain lender is a DigiFT investor.
  describe("Post-VIP institution default", () => {
    let vault: Contract;
    let hubOperator: SignerWithAddress;
    let lender: SignerWithAddress;
    const HUB_ALLOCATION = parseUnits("50000", 18);
    const LENDER_DEPOSIT = parseUnits("10000", 18);
    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));

    before(async () => {
      await openSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
    });

    it("Hub operator and a lender supply 60k U while only the margin is posted", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lender.address, LENDER_DEPOSIT);
      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lender.address);

      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect(await vault.balanceOf(lender.address)).to.equal(LENDER_DEPOSIT);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(marginAmount);
    });

    it("vault fails and confiscates the margin when the operator never tops up", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(hubOperator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(true);
      expect(runtime.confiscatedMarginRemaining).to.equal(marginAmount);
    });

    it("Hub cannot pull its U back until DigiFT whitelists the Hub", async () => {
      const refund = await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE);
      expect(refund).to.equal(HUB_ALLOCATION);
      await expect(
        hub
          .connect(hubOperator)
          .reallocate(
            [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: refund }],
            [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: refund }],
          ),
      ).to.be.revertedWith("Forbid transfer");
    });

    it("a lender that is not a DigiFT investor cannot redeem either", async () => {
      expect(await management.isWhiteInvestor(lender.address)).to.equal(false);
      await expect(vault.connect(lender).redeem(LENDER_DEPOSIT, lender.address, lender.address)).to.be.revertedWith(
        "Forbid transfer",
      );
    });

    it("posting all 198 hBNB before openVault rules the default out", async () => {
      await waitingSnapshot.restore(); // also undoes the gas funding from before()
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await hBNB.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(IDEAL_COLLATERAL_AMOUNT);

      const guardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(guardian).openVault(vault.address);
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(hubOperator).updateVaultState();

      expect(await vault.state()).to.equal(VaultState.Lock);
      expect((await vault.institutionalRuntime()).institutionDefaulted).to.equal(false);
    });
  });
});
