import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder, hexZeroPad, keccak256, parseUnits, solidityPack } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import {
  ADAPTER_FRV,
  FIXED_APY,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  LATE_PENALTY_RATE,
  LIQUIDATION_ADAPTER,
  LIQUIDATION_INCENTIVE,
  LIQUIDATION_THRESHOLD,
  LIQUIDATOR_BOT,
  LOCK_DURATION,
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  MARGIN_RATE as OLD_MARGIN_RATE,
  OPEN_DURATION,
  OPS_FUND_MULTISIG,
  RESERVE_FACTOR,
  SETTLEMENT_WINDOW,
  STORK,
  SUSN,
  SUSN_STORK_FEED_ID,
  U,
  U_FRV_SOURCE,
} from "../../vips/vip-683/bscmainnet";
import vip686, {
  MARGIN_AMOUNT,
  MARGIN_RATE,
  NEW_NOON_VAULT,
  OLD_NOON_VAULT,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-686/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 135663000;

const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// IVaultTypes.VaultState
const VaultState = {
  WaitingForMargin: 0,
  MarginDeposited: 1,
  Fundraising: 2,
  Lock: 4,
  PendingSettlement: 5,
  Matured: 7,
  Failed: 8,
};

const U_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const U_HUB = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
const U_CORE_SOURCE = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const NO_RESOURCE = ethers.constants.AddressZero;

// sUSN on BNB Chain is minted by its Hyperlane mailbox for transfers from the Ethereum sUSN vault.
const HYPERLANE_MAILBOX = "0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a4";
const ETHEREUM_DOMAIN = 1;
const ETHEREUM_SUSN = "0xE24a3DC889621612422A64E6388927901608B91D";

// Stork stores each feed's latest value at keccak256(id . 3), packed as quantizedValue << 64 | timestampNs.
const STORK_VALUE_SLOT = keccak256(defaultAbiCoder.encode(["bytes32", "uint256"], [SUSN_STORK_FEED_ID, 3]));

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
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(
    bscmainnet.CHAINLINK_ORACLE,
    ["function setDirectPrice(address asset, uint256 price)", "function prices(address) view returns (uint256)"],
    ethers.provider,
  );
  const sUSN = new ethers.Contract(
    SUSN,
    [...ERC20_ABI, "function handle(uint32 origin, bytes32 sender, bytes message) payable"],
    ethers.provider,
  );
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const stork = new ethers.Contract(
    STORK,
    ["function getTemporalNumericValueUnsafeV1(bytes32 id) view returns ((uint64 timestampNs, int192 quantizedValue))"],
    ethers.provider,
  );
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);
  const frvSource = new ethers.Contract(U_FRV_SOURCE, FRV_SOURCE_ABI, ethers.provider);
  const hub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  const adapterFrv = new ethers.Contract(
    ADAPTER_FRV,
    [
      "function maxWithdraw(address resource, address holder) view returns (uint256)",
      "function totalAssets(address resource, address holder) view returns (uint256)",
      "function resourceName(address resource) view returns (string)",
    ],
    ethers.provider,
  );
  const liquidationAdapter = new ethers.Contract(
    LIQUIDATION_ADAPTER,
    [
      "function isWhitelistedLiquidator(address) view returns (bool)",
      "function isWhitelistedSettler(address) view returns (bool)",
    ],
    ethers.provider,
  );
  const oldVault = new ethers.Contract(OLD_NOON_VAULT, VAULT_ABI, ethers.provider);

  let vaultsBefore: BigNumber;
  let positionTokenIdBefore: BigNumber;
  let oldPositionTokenId: BigNumber;
  let liveRate: BigNumber;
  let timelock: SignerWithAddress;
  let fundraisingSnapshot: SnapshotRestorer;

  // Writes a Stork sUSN value stamped with the latest block time, as an hourly push would.
  const setStorkRate = async (rate: BigNumber) => {
    const timestampNs = BigNumber.from(await time.latest()).mul(1e9);
    await ethers.provider.send("hardhat_setStorageAt", [
      STORK,
      STORK_VALUE_SLOT,
      hexZeroPad(rate.shl(64).or(timestampNs).toHexString(), 32),
    ]);
    expect(await resilientOracle.getPrice(SUSN)).to.equal(rate);
  };

  // Mints sUSN to `to` the way a Hyperlane transfer from Ethereum does, through the inbound rate limit.
  const bridgeSUSN = async (to: string, amount: BigNumber) => {
    const mailbox = await initMainnetUser(HYPERLANE_MAILBOX, parseUnits("1"));
    const message = solidityPack(["bytes32", "uint256"], [hexZeroPad(to, 32), amount]);
    await sUSN.connect(mailbox).handle(ETHEREUM_DOMAIN, hexZeroPad(ETHEREUM_SUSN, 32), message);
  };

  before(async () => {
    vaultsBefore = await controller.allVaultsLength();
    positionTokenIdBefore = await positionToken.nextTokenId();
    oldPositionTokenId = (await oldVault.institutionalConfig()).positionTokenId;
    liveRate = (await stork.getTemporalNumericValueUnsafeV1(SUSN_STORK_FEED_ID)).quantizedValue;

    await bypassStalePrices([U]);
    // createVault prices sUSN after the governance warp, which ages the Stork value past its 1-hour limit.
    // On mainnet the hourly push keeps it fresh; here sUSN is pinned at the live rate until the VIP executes.
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));
    expect(await chainlinkOracle.prices(SUSN)).to.equal(0);
    await chainlinkOracle.connect(timelock).setDirectPrice(SUSN, liveRate);
  });

  describe("Pre-VIP behavior", () => {
    it("the VIP-683 vault waits for its 100% margin, with no collateral and no shares", async () => {
      expect(await controller.isRegistered(OLD_NOON_VAULT)).to.equal(true);
      expect(await oldVault.state()).to.equal(VaultState.WaitingForMargin);
      expect((await oldVault.institutionalConfig()).marginRate).to.equal(OLD_MARGIN_RATE);
      expect((await oldVault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
      expect(await sUSN.balanceOf(OLD_NOON_VAULT)).to.equal(0);
      expect(await oldVault.totalSupply()).to.equal(0);
      expect(await oldVault.name()).to.equal(VAULT_NAME);
    });

    it("the VIP-683 vault is an unfunded resource of the U FRV source", async () => {
      expect(await frvSource.resources()).to.include(OLD_NOON_VAULT);
      expect((await frvSource.resourceConfig(OLD_NOON_VAULT)).adapter).to.equal(ADAPTER_FRV);
      expect(await oldVault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      expect(await adapterFrv.totalAssets(OLD_NOON_VAULT, U_FRV_SOURCE)).to.equal(0);
    });

    it("NEW_NOON_VAULT is the controller's predicted vault for the operator", async () => {
      expect(await controller.institutionNonce(INSTITUTION_OPERATOR)).to.equal(1);
      expect(await controller.predictVaultAddress(INSTITUTION_OPERATOR)).to.equal(NEW_NOON_VAULT);
      expect(await ethers.provider.getCode(NEW_NOON_VAULT)).to.equal("0x");
    });

    it("sUSN is priced from the Stork feed, near the $1.24 deal price", async () => {
      expect(liveRate).to.be.closeTo(parseUnits("1.24", 18), parseUnits("0.0124", 18));
    });

    it("both liquidators are already whitelisted for both paths", async () => {
      for (const liquidator of [LIQUIDATOR_BOT, OPS_FUND_MULTISIG]) {
        expect(await liquidationAdapter.isWhitelistedLiquidator(liquidator)).to.equal(true);
        expect(await liquidationAdapter.isWhitelistedSettler(liquidator)).to.equal(true);
      }
    });

    it("the margin is 115.207371 sUSN", async () => {
      expect(MARGIN_AMOUNT).to.equal(parseUnits("115.207371", 18));
    });

    it("U Hub's FRV yield group has room for the full 1M U", async () => {
      const headroom = (await hub.yieldGroupEffectiveCap(U_FRV_SOURCE)).sub(await frvSource.totalAssets());
      expect(headroom).to.be.gte(MAX_BORROW_CAP);
    });
  });

  testVip(
    "VIP-686 Relist the Noon Capital sUSN Fixed-Term Institutional Loan Vault with a 0.01% Margin",
    await vip686(),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(txResponse, [VAULT_ABI], ["VaultCancelled"], [1]);
        await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceRemoved", "ResourceAdded"], [1, 1]);
        await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      },
    },
  );

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
      // Lift the sim's pin so sUSN is read from the Stork feed from here on.
      await chainlinkOracle.connect(timelock).setDirectPrice(SUSN, 0);
      await setStorkRate(liveRate);
    });

    it("cancels the VIP-683 vault: Failed, nothing refunded, its position NFT still with the operator", async () => {
      expect(await oldVault.state()).to.equal(VaultState.Failed);
      expect((await oldVault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
      expect(await positionToken.ownerOf(oldPositionTokenId)).to.equal(INSTITUTION_OPERATOR);
      expect(await oldVault.maxDeposit(INSTITUTION_OPERATOR)).to.equal(0);
    });

    it("removes the VIP-683 vault from the U FRV source", async () => {
      expect(await frvSource.resources()).to.not.include(OLD_NOON_VAULT);
      expect((await frvSource.resourceConfig(OLD_NOON_VAULT)).registered).to.equal(false);
    });

    it("creates the new vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(NEW_NOON_VAULT);
      expect(await controller.isRegistered(NEW_NOON_VAULT)).to.equal(true);
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
    });

    it("keeps VIP-683's loan terms", async () => {
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
      expect(config).to.deep.equal(await oldVault.config());
    });

    it("sets the 0.01% margin, and mints a new position NFT to the operator", async () => {
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(SUSN);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(positionTokenIdBefore);
      expect(await positionToken.vaultToTokenId(vault.address)).to.equal(inst.positionTokenId);
      expect(await positionToken.ownerOf(inst.positionTokenId)).to.equal(INSTITUTION_OPERATOR);
    });

    it("keeps VIP-683's risk parameters", async () => {
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

    it("adds the new vault to the U FRV source behind the AdapterFRV", async () => {
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
      expect(await adapterFrv.resourceName(vault.address)).to.equal(VAULT_NAME);
    });

    it("U Hub still reports its total assets", async () => {
      await hub.totalAssets();
      await frvSource.totalAssets();
    });
  });

  describe("Post-VIP lifecycle: small margin, then the full collateral during the Open period", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubOperator: SignerWithAddress;
    let operatorSUSNBefore: BigNumber;

    const HUB_ALLOCATION = MAX_BORROW_CAP;
    const HUB_INTEREST = termInterest(HUB_ALLOCATION);
    const HUB_TOTAL_ASSETS_AT_MATURITY = HUB_ALLOCATION.add(HUB_INTEREST).sub(reserveCut(HUB_INTEREST));
    const EXPECTED_HUB_PROCEEDS = previewRedeemAt(HUB_ALLOCATION, HUB_TOTAL_ASSETS_AT_MATURITY, HUB_ALLOCATION);

    before(async () => {
      vault = new ethers.Contract(NEW_NOON_VAULT, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      operatorSUSNBefore = await sUSN.balanceOf(INSTITUTION_OPERATOR);
      await bridgeSUSN(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
      await sUSN.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
    });

    it("a deposit below the 115.207371 sUSN margin is refused", async () => {
      await expect(vault.connect(operator).depositCollateral(MARGIN_AMOUNT.sub(1))).to.be.revertedWithCustomError(
        vault,
        "InsufficientCollateral",
      );
    });

    it("operator deposits the 115.207371 sUSN margin", async () => {
      await expect(vault.connect(operator).depositCollateral(MARGIN_AMOUNT))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(MARGIN_AMOUNT, MARGIN_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
    });

    it("Critical Guardian opens the vault", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      fundraisingSnapshot = await takeSnapshot();
    });

    it("Hub operator fills the whole 1M U vault from Core", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect((await vault.runtime()).totalRaised).to.equal(HUB_ALLOCATION);
    });

    it("operator deposits the rest of the collateral before the Open period ends", async () => {
      const rest = IDEAL_COLLATERAL_AMOUNT.sub(MARGIN_AMOUNT);
      await vault.connect(operator).depositCollateral(rest);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("vault locks after the 1-day Open period, and the operator claims the 1M U", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);

      await setStorkRate(liveRate);
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      const [liquidity, shortfall] = await vault.getVaultLiquidity();
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
    });

    it("operator repays at maturity", async () => {
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

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
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: EXPECTED_HUB_PROCEEDS }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: EXPECTED_HUB_PROCEEDS }],
        );
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
    });

    it("operator withdraws all collateral", async () => {
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(INSTITUTION_OPERATOR)).to.equal(operatorSUSNBefore.add(IDEAL_COLLATERAL_AMOUNT));
      expect(await sUSN.balanceOf(vault.address)).to.equal(0);
    });
  });

  describe("Post-VIP lifecycle: collateral not completed by the end of the Open period", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    const LENDER_DEPOSIT = parseUnits("1000", 18);

    before(async () => {
      await fundraisingSnapshot.restore();
      vault = new ethers.Contract(NEW_NOON_VAULT, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lender.address, LENDER_DEPOSIT);
      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lender.address);
    });

    it("vault fails and confiscates only the 115.207371 sUSN margin", async () => {
      await time.increase(OPEN_DURATION + 1);
      await expect(vault.connect(operator).updateVaultState())
        .to.emit(vault, "MarginConfiscated")
        .withArgs(MARGIN_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(true);
      expect(runtime.confiscatedMarginRemaining).to.equal(MARGIN_AMOUNT);
    });

    it("lender gets the deposit back, without interest", async () => {
      const shares = await vault.balanceOf(lender.address);
      const before = await u.balanceOf(lender.address);
      await vault.connect(lender).redeem(shares, lender.address, lender.address);
      expect(await u.balanceOf(lender.address)).to.equal(before.add(LENDER_DEPOSIT));
    });

    it("operator cannot withdraw the confiscated margin", async () => {
      await expect(vault.connect(operator).withdrawCollateral(1)).to.be.revertedWithCustomError(
        vault,
        "InsufficientCollateral",
      );
    });
  });
});
