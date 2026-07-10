import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  FIXED_RATE_VAULT_CONTROLLER,
  NEW_VAULT_IMPLEMENTATION,
  OLD_VAULT_IMPLEMENTATION,
} from "../../vips/vip-999/bsctestnet";
import ERC20_ABI from "./abi/ERC20.json";
import FAUCET_TOKEN_ABI from "./abi/FaucetToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 118291763;

forking(FORK_BLOCK, async () => {
  let controller: Contract;
  let timelock: any;
  let vaultsBefore: BigNumber;

  before(async () => {
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    timelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();
  });

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
  });

  testVip("VIP-999 Upgrade Institutional Fixed Rate Vault implementation", await vip999(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultImplementationUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("controller now clones the new vault implementation", async () => {
      expect(await controller.vaultImplementation()).to.equal(NEW_VAULT_IMPLEMENTATION);
    });
  });

  describe("New vault: deposit/mint with consent + normal flow", () => {
    const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
    const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
    const BTCB_WHALE = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

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
      parseUnits("10", 6), // minBorrowCap = 10 USDT
      parseUnits("1000000", 6), // maxBorrowCap = 1M USDT
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
    const depositAmount = parseUnits("100000", 6);
    const lenderFunding = parseUnits("200000", 6);
    const consentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Venus FRV disclaimer v1"));

    let vault: Contract;
    let btcb: Contract;
    let usdt: Contract;
    let institution: any;
    let institutionAddress: string;
    let deployer: any;
    let lenderA: any;
    let lenderB: any;
    let lenderC: any;
    let lenderD: any;

    before(async () => {
      btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
      usdt = await ethers.getContractAt(FAUCET_TOKEN_ABI, USDT);

      // Institution + lenders are Hardhat signers (pre-funded with gas).
      [deployer, institution, lenderA, lenderB, lenderC, lenderD] = await ethers.getSigners();
      institutionAddress = await institution.getAddress();

      // Create a fresh vault; it is cloned from the just-installed consent-enabled implementation.
      const instConfig = [BTCB, idealCollateralAmount, marginRate, institutionAddress, 0];
      await controller
        .connect(timelock)
        .createVault(vaultConfig, instConfig, riskConfig, VAULT_SHARE_NAME, VAULT_SHARE_SYMBOL, INSTITUTION_NAME);
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);

      // Fund the institution with BTCB collateral and the lenders + institution with USDT.
      const whale = await initMainnetUser(BTCB_WHALE, parseUnits("40"));
      await btcb.connect(whale).transfer(institutionAddress, idealCollateralAmount);

      for (const lender of [lenderA, lenderB, lenderC, lenderD]) {
        await usdt.connect(deployer).allocateTo(await lender.getAddress(), lenderFunding);
      }
      await usdt.connect(deployer).allocateTo(institutionAddress, parseUnits("50000", 6));
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

    it("depositWithConsent records the consent hash and mints shares", async () => {
      const receiver = await lenderC.getAddress();
      await usdt.connect(lenderC).approve(vault.address, lenderFunding);
      await expect(vault.connect(lenderC).depositWithConsent(depositAmount, receiver, consentHash))
        .to.emit(vault, "ConsentRecorded")
        .withArgs(receiver, receiver, consentHash);
      expect(await vault.balanceOf(receiver)).to.be.gt(0);
    });

    it("mintWithConsent records the consent hash and pulls assets", async () => {
      const receiver = await lenderD.getAddress();
      const shares = await vault.previewDeposit(depositAmount);
      await usdt.connect(lenderD).approve(vault.address, lenderFunding);
      await expect(vault.connect(lenderD).mintWithConsent(shares, receiver, consentHash))
        .to.emit(vault, "ConsentRecorded")
        .withArgs(receiver, receiver, consentHash);
      expect(await vault.balanceOf(receiver)).to.equal(shares);
    });

    it("depositWithConsent / mintWithConsent accept a zero consent hash without emitting", async () => {
      const zero = ethers.constants.HashZero;
      const receiver = await lenderA.getAddress();
      const smallDeposit = parseUnits("10000", 6);

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
});
