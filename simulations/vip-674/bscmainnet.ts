import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import vip674, {
  ADAPTER_FRV,
  FIXED_APY,
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
  OCTAGON_VAULT,
  OPEN_DURATION,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  SOLVBTC,
  SOLVBTC_MAIN_ORACLE,
  SOLVBTC_PIVOT_ORACLE,
  U,
  U_FRV_SOURCE,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-674/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 130064000;

// The framework's fallback proposer has an Active proposal at this block, and Governor Bravo allows one per proposer
const PROPOSER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
const SUPPORTERS = [
  "0x34221485302f6F2029660a000908B5FCABB9BC6e",
  "0xc444949e0054a23c44fc45789738bdf64aed2391",
  "0xeBA4b3c462B9C16f7CCaF4BE6f4D3c17c377411E",
];

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
// Core Pool vSolvBTC, holding ~2,000 SolvBTC of cash: funds the operator on the fork.
const SOLVBTC_HOLDER = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";

const U_HUB = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
const U_CORE_SOURCE = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const NO_RESOURCE = ethers.constants.AddressZero;

// SolvBTC price at which the debt crosses the 85% threshold, as stated in the VIP description.
const DESCRIBED_LIQUIDATION_PRICE = parseUnits("70658", 18);

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
  const solvBTC = new ethers.Contract(SOLVBTC, ERC20_ABI, ethers.provider);
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);
  const frvSource = new ethers.Contract(U_FRV_SOURCE, FRV_SOURCE_ABI, ethers.provider);
  const hub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  const adapterFrv = new ethers.Contract(
    ADAPTER_FRV,
    [
      "function maxWithdraw(address resource, address holder) view returns (uint256)",
      "function totalAssets(address resource, address holder) view returns (uint256)",
      "function spotAPYBps(address resource, uint256 blocksPerYear) view returns (uint64)",
      "function resourceName(address resource) view returns (string)",
    ],
    ethers.provider,
  );
  const liquidationAdapter = new ethers.Contract(
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

  let vaultsBefore: BigNumber;
  let waitingSnapshot: SnapshotRestorer;
  let openSnapshot: SnapshotRestorer;
  let fundraisingSnapshot: SnapshotRestorer;
  let positionTokenIdBefore: BigNumber;
  let predictedVault: string;
  let timelock: SignerWithAddress;
  let solvOracleConfigBefore: { oracles: string[]; enableFlagsForOracles: boolean[] };

  // Test-only: prices SolvBTC at `price` through a ChainlinkOracle direct price, the only ResilientOracle source.
  const setSolvBTCPrice = async (price: BigNumber) => {
    const chainlink = new ethers.Contract(
      bscmainnet.CHAINLINK_ORACLE,
      ["function setDirectPrice(address asset, uint256 price)"],
      timelock,
    );
    await chainlink.setDirectPrice(SOLVBTC, price);
    await resilientOracle
      .connect(timelock)
      .setTokenConfig([
        SOLVBTC,
        [bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
        [true, false, false],
        false,
      ]);
    expect(await resilientOracle.getPrice(SOLVBTC)).to.equal(price);
  };

  before(async () => {
    vaultsBefore = await controller.allVaultsLength();
    positionTokenIdBefore = await positionToken.nextTokenId();
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));
    solvOracleConfigBefore = await resilientOracle.getTokenConfig(SOLVBTC);

    // createVault and every drawdown read both prices, across the VIP's multi-day warp.
    await bypassStalePrices([U, SOLVBTC]);
  });

  describe("Pre-VIP behavior", () => {
    it("ResilientOracle prices SolvBTC from its existing main and pivot oracles", async () => {
      const config = await resilientOracle.getTokenConfig(SOLVBTC);
      expect(config.asset).to.equal(SOLVBTC);
      expect(config.oracles).to.deep.equal([SOLVBTC_MAIN_ORACLE, SOLVBTC_PIVOT_ORACLE, ethers.constants.AddressZero]);
      expect(config.enableFlagsForOracles).to.deep.equal([true, true, false]);
      // Within 10% of the $79,921 deal price.
      expect(await resilientOracle.getPrice(SOLVBTC)).to.be.closeTo(parseUnits("79921", 18), parseUnits("8000", 18));
    });

    it("SolvBTC and U both use 18 decimals", async () => {
      expect(await solvBTC.symbol()).to.equal("SolvBTC");
      expect(await solvBTC.decimals()).to.equal(18);
      expect(await u.decimals()).to.equal(18);
    });

    it("OCTAGON_VAULT is the controller's predicted vault for the operator", async () => {
      expect(await controller.institutionNonce(INSTITUTION_OPERATOR)).to.equal(0);
      expect(predictedVault).to.equal(OCTAGON_VAULT);
      expect(await ethers.provider.getCode(OCTAGON_VAULT)).to.equal("0x");
    });

    it("U FRV source does not list the vault yet", async () => {
      expect(await frvSource.asset()).to.equal(U);
      expect(await frvSource.resources()).to.not.include(predictedVault);
    });

    it("every live U FRV resource uses the same AdapterFRV as this VIP", async () => {
      const resources: string[] = await frvSource.resources();
      expect(resources.length).to.be.gt(0);
      for (const resource of resources) {
        expect((await frvSource.resourceConfig(resource)).adapter).to.equal(ADAPTER_FRV);
      }
    });

    it("U Hub's FRV yield group has room for the full 2M U", async () => {
      const headroom = (await hub.yieldGroupEffectiveCap(U_FRV_SOURCE)).sub(await frvSource.totalAssets());
      expect(headroom).to.be.gte(MAX_BORROW_CAP);
    });

    it("LiquidationAdapter already sends half of the incentive to the protocol", async () => {
      expect(await liquidationAdapter.protocolLiquidationShare()).to.equal(parseUnits("0.5", 18));
      expect(await liquidationAdapter.protocolShareAccrued(SOLVBTC)).to.equal(0);
    });
  });

  testVip("VIP-674 List the Octagon SolvBTC Fixed-Term Institutional Loan Vault", await vip674(), {
    proposer: PROPOSER,
    supporters: SUPPORTERS,
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceAdded"], [1]);
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
      expect(inst.collateralAsset).to.equal(SOLVBTC);
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

    it("leaves SolvBTC's oracle configuration unchanged", async () => {
      const config = await resilientOracle.getTokenConfig(SOLVBTC);
      expect(config.oracles).to.deep.equal(solvOracleConfigBefore.oracles);
      expect(config.enableFlagsForOracles).to.deep.equal(solvOracleConfigBefore.enableFlagsForOracles);
    });

    it("adds the vault to the U FRV source", async () => {
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
      expect(await adapterFrv.resourceName(vault.address)).to.equal(VAULT_NAME);
    });
  });

  describe("Post-VIP vault lifecycle", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    let lenderAddress: string;

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

      const holder = await initMainnetUser(SOLVBTC_HOLDER, parseUnits("1"));
      await solvBTC.connect(holder).transfer(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
    });

    it("operator deposits the 0.5% margin", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      waitingSnapshot = await takeSnapshot();
      await solvBTC.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);

      expect(marginAmount).to.equal(parseUnits("0.16705", 18));
      await expect(vault.connect(operator).depositCollateral(marginAmount))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(marginAmount, marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect(await solvBTC.balanceOf(vault.address)).to.equal(marginAmount);
    });

    it("guardian opens the vault and operator tops up to 33.41 SolvBTC", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      openSnapshot = await takeSnapshot();

      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(marginAmount));
      expect(await solvBTC.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await solvBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(0);

      const price = await resilientOracle.getPrice(SOLVBTC);
      expect(await vault.getCollateralValueUSD()).to.equal(IDEAL_COLLATERAL_AMOUNT.mul(price).div(parseUnits("1", 18)));

      fundraisingSnapshot = await takeSnapshot();
    });

    it("lender supplies 2M U for 1:1 shares", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lenderAddress, LENDER_DEPOSIT);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP);

      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lenderAddress);

      expect(await vault.balanceOf(lenderAddress)).to.equal(LENDER_DEPOSIT);
      expect((await vault.runtime()).totalRaised).to.equal(MAX_BORROW_CAP);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(0);
    });

    it("adapter reports the 3.6% supply APY, net of the reserve factor", async () => {
      expect(await adapterFrv.spotAPYBps(vault.address, 0)).to.equal(360);
    });

    it("vault locks after the 1-day open window", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("operator claims the 2M U", async () => {
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      expect(await vault.outstandingDebt()).to.equal(EXPECTED_DEBT_AT_MATURITY);
    });

    it("full drawdown is healthy at the live price", async () => {
      const [liquidity, shortfall] = await vault.getVaultLiquidity();
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
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
    });

    it("lender redeems principal plus interest", async () => {
      const shares = await vault.balanceOf(lenderAddress);
      const assets = await vault.previewRedeem(shares);
      expect(assets).to.equal(EXPECTED_LENDER_PROCEEDS);

      const before = await u.balanceOf(lenderAddress);
      await vault.connect(lender).redeem(shares, lenderAddress, lenderAddress);
      expect(await u.balanceOf(lenderAddress)).to.equal(before.add(assets));
    });

    it("operator withdraws all collateral", async () => {
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await solvBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await solvBTC.balanceOf(vault.address)).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
    });
  });

  describe("Post-VIP Liquidity Hub flow", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubOperator: SignerWithAddress;

    const HUB_ALLOCATION = MAX_BORROW_CAP;

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

    it("Hub operator fills the whole 2M U vault from Core", async () => {
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
    });

    it("Hub operator moves principal plus interest back to Core", async () => {
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(EXPECTED_HUB_PROCEEDS);

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

  describe("Post-VIP liquidation", () => {
    let vault: Contract;
    let guardian: SignerWithAddress;
    let lockSnapshot: SnapshotRestorer;
    const REPAY = parseUnits("10000", 18);

    // Runs one adapter liquidation and checks every leg against the vault's seize math:
    // seize = repay x U price x incentive / SolvBTC price; the adapter keeps its share of the bonus.
    const expectGuardianLiquidation = async (liquidate: () => Promise<unknown>, incentive: BigNumber) => {
      const seize = REPAY.mul(await resilientOracle.getPrice(U))
        .div(parseUnits("1", 18))
        .mul(incentive)
        .div(await resilientOracle.getPrice(SOLVBTC));
      const bonus = seize.sub(seize.mul(parseUnits("1", 18)).div(incentive));
      const protocolShare = bonus.div(2);
      const debtBefore = await vault.outstandingDebt();
      const guardianBefore = await solvBTC.balanceOf(guardian.address);

      await liquidate();

      expect((await solvBTC.balanceOf(guardian.address)).sub(guardianBefore)).to.equal(seize.sub(protocolShare));
      expect(await solvBTC.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT.sub(seize));
      expect(await liquidationAdapter.protocolShareAccrued(SOLVBTC)).to.equal(protocolShare);
      expect(await vault.outstandingDebt()).to.equal(debtBefore.sub(REPAY));
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
      await u.connect(guardian).approve(liquidationAdapter.address, REPAY);
      lockSnapshot = await takeSnapshot();
    });

    it("the 85% threshold is crossed at the SolvBTC price stated in the VIP", async () => {
      // collateral x price x 85% = debt in USD
      const debtUSD = (await vault.outstandingDebt()).mul(await resilientOracle.getPrice(U)).div(parseUnits("1", 18));
      const liquidationPrice = debtUSD
        .mul(parseUnits("1", 18))
        .div(IDEAL_COLLATERAL_AMOUNT.mul(LIQUIDATION_THRESHOLD).div(parseUnits("1", 18)));
      expect(liquidationPrice).to.be.closeTo(DESCRIBED_LIQUIDATION_PRICE, parseUnits("300", 18));

      await setSolvBTCPrice(liquidationPrice.mul(1001).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.equal(0);
      await setSolvBTCPrice(liquidationPrice.mul(999).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);
    });

    it("guardian is whitelisted on the adapter for both HF and overdue liquidations", async () => {
      expect(await liquidationAdapter.isWhitelistedLiquidator(guardian.address)).to.equal(true);
      expect(await liquidationAdapter.isWhitelistedSettler(guardian.address)).to.equal(true);
    });

    it("guardian liquidates an underwater vault during Lock (HF)", async () => {
      await lockSnapshot.restore();
      await setSolvBTCPrice(parseUnits("65000", 18));
      expect(await vault.state()).to.equal(VaultState.Lock);
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);

      await expectGuardianLiquidation(
        () => liquidationAdapter.connect(guardian).liquidate(vault.address, REPAY),
        LIQUIDATION_INCENTIVE,
      );
    });

    it("protocol share of the seized SolvBTC sweeps to the PSR", async () => {
      const accrued = await liquidationAdapter.protocolShareAccrued(SOLVBTC);
      expect(accrued).to.be.gt(0);
      const psrBefore = await solvBTC.balanceOf(PROTOCOL_SHARE_RESERVE);
      await liquidationAdapter.connect(timelock).sweepProtocolShareToReserve(SOLVBTC);
      expect((await solvBTC.balanceOf(PROTOCOL_SHARE_RESERVE)).sub(psrBefore)).to.equal(accrued);
      expect(await liquidationAdapter.protocolShareAccrued(SOLVBTC)).to.equal(0);
    });

    it("guardian liquidates the vault once the settlement deadline passes (overdue)", async () => {
      await lockSnapshot.restore(); // back to the healthy, locked vault at the live price
      await time.increase(LOCK_DURATION + SETTLEMENT_WINDOW + 2);
      await vault.connect(guardian).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.SettlementDeadlineExceeded);

      await expectGuardianLiquidation(
        () => liquidationAdapter.connect(guardian).liquidateOverdueVault(vault.address, REPAY),
        LATE_PENALTY_RATE,
      );
    });
  });

  // If the one-day window closes with the minimum raised but less than 33.41 SolvBTC posted, the vault confiscates
  // the margin and pays it out in SolvBTC to whoever redeems, the U Hub included.
  describe("Post-VIP institution default", () => {
    let vault: Contract;
    let hubOperator: SignerWithAddress;
    let lender: SignerWithAddress;
    const HUB_ALLOCATION = parseUnits("50000", 18);
    const LENDER_DEPOSIT = parseUnits("10000", 18);
    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));
    const hubMarginShare = marginAmount.mul(HUB_ALLOCATION).div(HUB_ALLOCATION.add(LENDER_DEPOSIT));

    before(async () => {
      await openSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
    });

    it("vault fails and confiscates the margin when the operator never tops up", async () => {
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

      await time.increase(OPEN_DURATION + 1);
      await vault.connect(hubOperator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(true);
      expect(runtime.confiscatedMarginRemaining).to.equal(marginAmount);
    });

    it("Hub pulls its U back and receives its share of the margin in SolvBTC", async () => {
      const hubSolvBefore = await solvBTC.balanceOf(U_HUB);
      const refund = await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE);
      expect(refund).to.equal(HUB_ALLOCATION);
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: refund }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: refund }],
        );
      expect((await solvBTC.balanceOf(U_HUB)).sub(hubSolvBefore)).to.equal(hubMarginShare);
    });

    it("governance can sweep the Hub's SolvBTC", async () => {
      const amount = await solvBTC.balanceOf(U_HUB);
      const treasuryBefore = await solvBTC.balanceOf(bscmainnet.VTREASURY);
      await hub.connect(timelock).sweep(SOLVBTC, bscmainnet.VTREASURY);
      expect(await solvBTC.balanceOf(U_HUB)).to.equal(0);
      expect((await solvBTC.balanceOf(bscmainnet.VTREASURY)).sub(treasuryBefore)).to.equal(amount);
    });

    it("lender redeems U plus the rest of the margin in SolvBTC", async () => {
      const solvBefore = await solvBTC.balanceOf(lender.address);
      const uBefore = await u.balanceOf(lender.address);
      await vault.connect(lender).redeem(LENDER_DEPOSIT, lender.address, lender.address);
      expect((await u.balanceOf(lender.address)).sub(uBefore)).to.equal(LENDER_DEPOSIT);
      expect((await solvBTC.balanceOf(lender.address)).sub(solvBefore)).to.equal(marginAmount.sub(hubMarginShare));
    });

    it("posting all 33.41 SolvBTC before openVault rules the default out", async () => {
      await waitingSnapshot.restore();
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await solvBTC.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);

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
