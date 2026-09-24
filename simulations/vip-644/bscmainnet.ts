import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, pinResilientOraclePriceViaRedstone } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip644, {
  ALLEZ_LABS,
  ALLEZ_LABS_USDC_AMOUNT,
  BORROW,
  DAI,
  DEVIATION_SENTINEL,
  EBRAKE,
  FIXED_RATE_VAULT_CONTROLLER,
  NEW_VAULT_IMPLEMENTATION,
  OLD_VAULT_IMPLEMENTATION,
  TOKEN_REDEEMER,
  USDC,
  VUSDC_WITHDRAW_AMOUNT,
  vDAI,
  vUSDC,
} from "../../vips/vip-644/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import EBRAKE_ABI from "./abi/EBrake.json";
import ERC20_ABI from "./abi/ERC20.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Block shortly before the proposal — vDAI borrowing is paused, the sentinel still monitors DAI,
// the EBrake snapshots for vDAI are empty (the weekend incident only paused borrowing), and the
// FRV controller still clones the old (pre-consent) vault implementation.
const FORK_BLOCK = 109660000;

const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

// A trusted keeper on the DeviationSentinel (verified on-chain) — used to call handleDeviation.
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
// Collateral market used to prove borrowing DAI works again (vUSDT has a non-zero collateral factor).
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// Core Pool id for the CF snapshot read on EBrake.
const CORE_POOL_ID = 0;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const deviationSentinel = new ethers.Contract(DEVIATION_SENTINEL, DEVIATION_SENTINEL_ABI, ethers.provider);
  const ebrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, ethers.provider);

  let controller: Contract;
  let resilientOracle: Contract;
  let timelock: any;
  let vaultsBefore: BigNumber;

  let usdc: Contract;
  let vUsdc: Contract;
  let allezUsdcBefore: BigNumber;
  let treasuryUsdcBefore: BigNumber;
  let treasuryVUsdcBefore: BigNumber;

  // DAI and USDT prices captured at the fork block (before the governance lifecycle warps time and
  // makes the RedStone pivot feed stale) so the behavioral DAI borrow can pin them via the Chainlink feed.
  let daiPrice: BigNumber;
  let usdtPrice: BigNumber;

  before(async () => {
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();

    resilientOracle = await ethers.getContractAt(ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    daiPrice = await resilientOracle.getPrice(DAI);
    usdtPrice = await resilientOracle.getPrice(USDT);

    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    vUsdc = await ethers.getContractAt(ERC20_ABI, vUSDC);
    allezUsdcBefore = await usdc.balanceOf(ALLEZ_LABS);
    treasuryUsdcBefore = await usdc.balanceOf(bscmainnet.VTREASURY);
    treasuryVUsdcBefore = await vUsdc.balanceOf(bscmainnet.VTREASURY);

    await pinResilientOraclePriceViaRedstone(resilientOracle, BTCB);
    await pinResilientOraclePriceViaRedstone(resilientOracle, USDT);
  });

  // Repoint an asset to the Chainlink feed as the sole ResilientOracle source and pin an exact price.
  const pinPriceViaChainlink = async (asset: string, price: BigNumber) => {
    await resilientOracle.connect(timelock).setTokenConfig({
      asset,
      oracles: [bscmainnet.CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      enableFlagsForOracles: [true, false, false],
      cachingEnabled: false,
    });
    const chainlinkOracle = new ethers.Contract(
      bscmainnet.CHAINLINK_ORACLE,
      ["function setDirectPrice(address,uint256)"],
      timelock,
    );
    await chainlinkOracle.setDirectPrice(asset, price);
  };

  describe("Pre-VIP behavior", () => {
    it("controller still clones the old vault implementation", async () => {
      expect(await controller.vaultImplementation()).to.equal(OLD_VAULT_IMPLEMENTATION);
    });

    it("consent entrypoints are absent from the old implementation but present in the new one", async () => {
      const iface = new ethers.utils.Interface(VAULT_ABI);
      const selectors = [iface.getSighash("depositWithConsent"), iface.getSighash("mintWithConsent")].map(s =>
        s.slice(2),
      );
      const oldCode = await ethers.provider.getCode(OLD_VAULT_IMPLEMENTATION);
      const newCode = await ethers.provider.getCode(NEW_VAULT_IMPLEMENTATION);
      for (const selector of selectors) {
        expect(oldCode, "old impl should not expose the consent entrypoints").to.not.include(selector);
        expect(newCode, "new impl should expose the consent entrypoints").to.include(selector);
      }
    });

    it("borrowing is paused on the vDAI market", async () => {
      expect(await comptroller.actionPaused(vDAI, BORROW)).to.equal(true);
    });

    it("vDAI collateral factor is 0", async () => {
      const market = await comptroller.markets(vDAI);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("DeviationSentinel monitors DAI (enabled, deviation 10%)", async () => {
      const config = await deviationSentinel.tokenConfigs(DAI);
      expect(config.enabled).to.equal(true);
      expect(config.deviation).to.equal(10);
    });

    it("EBrake holds no collateral-factor snapshot for vDAI", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vDAI, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
    });

    it("EBrake holds no cap snapshots for vDAI", async () => {
      const state = await ebrake.marketStates(vDAI);
      expect(state.borrowCapSnapshotted).to.equal(false);
      expect(state.supplyCapSnapshotted).to.equal(false);
    });
  });

  testVip("VIP-644 Fix DAI market + upgrade Institutional Fixed Rate Vault implementation", await vip644(), {
    callbackAfterExecution: async txResponse => {
      // Monitoring toggled off for DAI on the DeviationSentinel.
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TokenMonitoringStatusChanged"], [1]);
      // Borrow action unpaused on the Core Pool Comptroller for vDAI.
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["ActionPausedMarket"], [1]);
      // Three EBrake snapshots reset for vDAI.
      await expectEvents(
        txResponse,
        [EBRAKE_ABI],
        ["CFSnapshotReset", "BorrowCapSnapshotReset", "SupplyCapSnapshotReset"],
        [1, 1, 1],
      );
      // FRV clone source upgraded on the controller.
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultImplementationUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("controller now clones the new vault implementation", async () => {
      expect(await controller.vaultImplementation()).to.equal(NEW_VAULT_IMPLEMENTATION);
    });

    it("borrowing is resumed on the vDAI market", async () => {
      expect(await comptroller.actionPaused(vDAI, BORROW)).to.equal(false);
    });

    it("vDAI collateral factor is unchanged (0)", async () => {
      const market = await comptroller.markets(vDAI);
      expect(market.collateralFactorMantissa).to.equal(0);
    });

    it("DeviationSentinel no longer monitors DAI (deviation config preserved)", async () => {
      const config = await deviationSentinel.tokenConfigs(DAI);
      expect(config.enabled).to.equal(false);
      expect(config.deviation).to.equal(10);
    });

    it("EBrake snapshots for vDAI remain empty", async () => {
      const [cf, lt] = await ebrake.getMarketCFSnapshot(vDAI, CORE_POOL_ID);
      expect(cf).to.equal(0);
      expect(lt).to.equal(0);
      const state = await ebrake.marketStates(vDAI);
      expect(state.borrowCapSnapshotted).to.equal(false);
      expect(state.supplyCapSnapshotted).to.equal(false);
    });
  });

  describe("Post-VIP behavior: Allez Labs Q3 2026 payment", () => {
    it("Allez Labs received exactly 105,000 USDC", async () => {
      expect(await usdc.balanceOf(ALLEZ_LABS)).to.equal(allezUsdcBefore.add(ALLEZ_LABS_USDC_AMOUNT));
    });

    it("treasury liquid USDC is untouched", async () => {
      expect(await usdc.balanceOf(bscmainnet.VTREASURY)).to.equal(treasuryUsdcBefore);
    });

    it("treasury vUSDC decreased by at most the withdrawn amount (remainder returned)", async () => {
      const treasuryVUsdcAfter = await vUsdc.balanceOf(bscmainnet.VTREASURY);
      const consumed = treasuryVUsdcBefore.sub(treasuryVUsdcAfter);
      // The redeemer consumes only what 105,000 USDC requires at the execution-time
      // exchange rate and returns the rest; the 3.96M withdrawal carries ~0.13% headroom.
      expect(consumed).to.be.lte(VUSDC_WITHDRAW_AMOUNT);
      expect(consumed).to.be.gte(VUSDC_WITHDRAW_AMOUNT.mul(99).div(100));
    });

    it("the Token Redeemer retains no vUSDC or USDC", async () => {
      expect(await vUsdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
      expect(await usdc.balanceOf(TOKEN_REDEEMER)).to.equal(0);
    });
  });

  describe("New vault: deposit/mint with consent + normal flow", () => {
    // IVaultTypes.VaultState
    const VaultState = {
      WaitingForMargin: 0,
      MarginDeposited: 1,
      Fundraising: 2,
      Lock: 4,
      PendingSettlement: 5,
      Matured: 7,
    };

    const idealCollateralAmount = parseUnits("21.92", 18);
    const marginRate = parseUnits("0.005", 18); // 0.5%
    const marginAmount = idealCollateralAmount.mul(marginRate).div(parseUnits("1", 18));
    const openDuration = 7 * 24 * 60 * 60;
    const lockDuration = 30 * 24 * 60 * 60;

    const vaultConfig = [
      USDT, // supplyAsset
      600, // fixedAPY = 6%
      parseUnits("0.3", 18), // reserveFactor = 30%
      parseUnits("10", 18), // minBorrowCap = 10 USDT
      parseUnits("1000000", 18), // maxBorrowCap = 1M USDT
      0, // minSupplierDeposit
      openDuration,
      lockDuration,
      3 * 24 * 60 * 60, // settlementWindow = 3 days
    ];
    const riskConfig = [parseUnits("0.9", 18), parseUnits("1.1", 18), parseUnits("1.1", 18)];
    const VAULT_SHARE_NAME = "FRV Consent Test";
    const VAULT_SHARE_SYMBOL = "FRV-consent-test";
    const INSTITUTION_NAME = "ConsentTest";

    // 4 lenders * 100k deposit = 400k < 1M cap.
    const depositAmount = parseUnits("100000", 18);
    const lenderFunding = parseUnits("200000", 18);
    const consentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Venus FRV disclaimer v1"));

    let vault: Contract;
    let btcb: Contract;
    let usdt: Contract;
    let institution: any;
    let institutionAddress: string;
    let lenderA: any;
    let lenderB: any;
    let lenderC: any;
    let lenderD: any;
    let otherReceiver: any;

    before(async () => {
      btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
      usdt = await ethers.getContractAt(ERC20_ABI, USDT);

      // Institution + lenders are Hardhat signers (pre-funded with gas).
      [, institution, lenderA, lenderB, lenderC, lenderD, otherReceiver] = await ethers.getSigners();
      institutionAddress = await institution.getAddress();

      // Create a fresh vault; it is cloned from the just-installed consent-enabled implementation.
      const instConfig = [BTCB, idealCollateralAmount, marginRate, institutionAddress, 0];
      await controller
        .connect(timelock)
        .createVault(vaultConfig, instConfig, riskConfig, VAULT_SHARE_NAME, VAULT_SHARE_SYMBOL, INSTITUTION_NAME);
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);

      // Fund the institution with BTCB collateral and the lenders + institution with USDT (from the whale).
      const whale = await initMainnetUser(WHALE, parseUnits("40"));
      await btcb.connect(whale).transfer(institutionAddress, idealCollateralAmount);
      for (const lender of [lenderA, lenderB, lenderC, lenderD]) {
        await usdt.connect(whale).transfer(await lender.getAddress(), lenderFunding);
      }
      await usdt.connect(whale).transfer(institutionAddress, parseUnits("50000", 18));
    });

    it("a new vault backed by the new implementation was registered", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(await controller.isRegistered(vault.address)).to.equal(true);
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
    });

    it("institution deposits margin and controller opens the vault (-> Fundraising)", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await btcb.connect(institution).approve(vault.address, idealCollateralAmount);
      await vault.connect(institution).depositCollateral(marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);

      await controller.connect(timelock).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);

      // Top up to the full ideal collateral before fundraising deposits.
      await vault.connect(institution).depositCollateral(idealCollateralAmount.sub(marginAmount));
      expect(await btcb.balanceOf(vault.address)).to.equal(idealCollateralAmount);
    });

    it("normal deposit(assets, receiver) mints shares", async () => {
      const receiver = await lenderA.getAddress();
      await usdt.connect(lenderA).approve(vault.address, lenderFunding);
      await vault.connect(lenderA).deposit(depositAmount, receiver);
      expect(await vault.balanceOf(receiver)).to.be.gt(0);
    });

    it("normal mint(shares, receiver) pulls assets", async () => {
      const receiver = await lenderB.getAddress();
      const shares = await vault.previewDeposit(depositAmount);
      await usdt.connect(lenderB).approve(vault.address, lenderFunding);
      await vault.connect(lenderB).mint(shares, receiver);
      expect(await vault.balanceOf(receiver)).to.equal(shares);
    });

    it("depositWithConsent records the consent hash with supplier as sender, not receiver", async () => {
      const supplier = await lenderC.getAddress();
      const receiver = await otherReceiver.getAddress();
      const before = await vault.balanceOf(receiver);
      await usdt.connect(lenderC).approve(vault.address, lenderFunding);
      await expect(vault.connect(lenderC).depositWithConsent(depositAmount, receiver, consentHash))
        .to.emit(vault, "ConsentRecorded")
        .withArgs(supplier, receiver, consentHash);
      expect(await vault.balanceOf(receiver)).to.be.gt(before);
    });

    it("mintWithConsent records the consent hash with supplier as sender, not receiver", async () => {
      const supplier = await lenderD.getAddress();
      const receiver = await otherReceiver.getAddress();
      const shares = await vault.previewDeposit(depositAmount);
      const before = await vault.balanceOf(receiver);
      await usdt.connect(lenderD).approve(vault.address, lenderFunding);
      await expect(vault.connect(lenderD).mintWithConsent(shares, receiver, consentHash))
        .to.emit(vault, "ConsentRecorded")
        .withArgs(supplier, receiver, consentHash);
      expect(await vault.balanceOf(receiver)).to.equal(before.add(shares));
    });

    it("depositWithConsent / mintWithConsent accept a zero consent hash without emitting", async () => {
      const zero = ethers.constants.HashZero;
      const receiver = await lenderA.getAddress();
      const smallDeposit = parseUnits("10000", 18);

      // A zero hash skips consent recording: no event, no revert, deposit/mint still happens.
      const beforeDeposit = await vault.balanceOf(receiver);
      await expect(vault.connect(lenderA).depositWithConsent(smallDeposit, receiver, zero)).to.not.emit(
        vault,
        "ConsentRecorded",
      );
      const afterDeposit = await vault.balanceOf(receiver);
      expect(afterDeposit).to.be.gt(beforeDeposit);

      await expect(
        vault.connect(lenderA).mintWithConsent(await vault.previewDeposit(smallDeposit), receiver, zero),
      ).to.not.emit(vault, "ConsentRecorded");
      expect(await vault.balanceOf(receiver)).to.be.gt(afterDeposit);
    });

    it("normal flow completes: lock -> claim -> repay -> matured -> redeem -> withdraw collateral", async () => {
      // Lock the vault once the open window elapses.
      await ethers.provider.send("evm_increaseTime", [openDuration + 1]);
      await ethers.provider.send("evm_mine", []);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);

      // Institution claims the raised funds.
      const raised = await usdt.balanceOf(vault.address);
      const instUsdtBefore = await usdt.balanceOf(institutionAddress);
      await vault.connect(institution).claimRaisedFunds();
      expect(await usdt.balanceOf(institutionAddress)).to.equal(instUsdtBefore.add(raised));

      // After the lock period the vault expects settlement; institution repays in full.
      await ethers.provider.send("evm_increaseTime", [lockDuration + 1]);
      await ethers.provider.send("evm_mine", []);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

      const owed = await vault.outstandingDebt();
      await usdt.connect(institution).approve(vault.address, owed);
      await vault.connect(institution).repay(owed);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Matured);
      expect(await vault.outstandingDebt()).to.equal(0);

      // A lender redeems principal + net interest.
      const receiver = await lenderA.getAddress();
      const shares = await vault.balanceOf(receiver);
      const expectedAssets = await vault.previewRedeem(shares);
      expect(expectedAssets).to.be.gt(depositAmount);
      const usdtBefore = await usdt.balanceOf(receiver);
      await vault.connect(lenderA).redeem(shares, receiver, receiver);
      expect(await usdt.balanceOf(receiver)).to.equal(usdtBefore.add(expectedAssets));
      expect(await vault.balanceOf(receiver)).to.equal(0);

      // Institution withdraws its collateral.
      const collateral = await btcb.balanceOf(vault.address);
      expect(collateral).to.equal(idealCollateralAmount);
      const instBtcbBefore = await btcb.balanceOf(institutionAddress);
      await vault.connect(institution).withdrawCollateral(collateral);
      expect(await btcb.balanceOf(institutionAddress)).to.equal(instBtcbBefore.add(collateral));
      expect(await btcb.balanceOf(vault.address)).to.equal(0);
    });
  });

  describe("Post-VIP behavioral proof: DAI market", () => {
    it("a user with collateral can borrow DAI, and the sentinel can no longer act on vDAI", async () => {
      const dai = new ethers.Contract(DAI, ERC20_ABI, ethers.provider);
      const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
      const vUsdt = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
      const vDai = new ethers.Contract(vDAI, VTOKEN_ABI, ethers.provider);

      // The mined governance lifecycle and the FRV vault lifecycle advance time, staling DAI/USDT's
      // RedStone pivot feed (its internal guard cannot be widened). Repoint both to the Chainlink feed
      // as the single source and pin the price captured at the fork block, so the borrow path prices
      // don't revert.
      await pinPriceViaChainlink(DAI, daiPrice);
      await pinPriceViaChainlink(USDT, usdtPrice);

      const user = await initMainnetUser("0x000000000000000000000000000000000000dEaD", parseUnits("10"));
      const whale = await initMainnetUser(WHALE, parseUnits("10"));

      // Fund the user with USDT collateral and supply it.
      const collateral = parseUnits("1000", 18);
      await usdt.connect(whale).transfer(user.address, collateral);
      await usdt.connect(user).approve(vUSDT, collateral);
      await vUsdt.connect(user).mint(collateral);
      await comptroller.connect(user).enterMarkets([vUSDT]);

      // Borrow a small amount of DAI — previously reverted on the borrow-paused guard.
      const borrowAmount = parseUnits("100", 18);
      const daiBefore = await dai.balanceOf(user.address);
      await expect(vDai.connect(user).borrow(borrowAmount)).to.not.be.reverted;
      expect(await dai.balanceOf(user.address)).to.equal(daiBefore.add(borrowAmount));
      expect(await vDai.callStatic.borrowBalanceCurrent(user.address)).to.be.gte(borrowAmount);

      // With monitoring disabled, a trusted keeper can no longer act on the vDAI market.
      const keeper = await initMainnetUser(GUARDIAN, parseUnits("10"));
      await expect(deviationSentinel.connect(keeper).handleDeviation(vDAI)).to.be.revertedWithCustomError(
        deviationSentinel,
        "TokenMonitoringDisabled",
      );
    });
  });
});
