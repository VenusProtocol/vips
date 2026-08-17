import { takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  CHAINLINK_ORACLE,
  FIXED_RATE_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  MINT_BURN_AUTHORIZED,
  PAUSE_UNPAUSE_AUTHORIZED,
  SUPPLY_ASSET,
  VAULT_SHARE_NAME,
  VAULT_SHARE_SYMBOL,
  VCEBTC,
  VCEBTC_DIRECT_PRICE,
  VCEBTC_INITIAL_SUPPLY,
  instConfig,
  riskConfig,
  vaultConfig,
} from "../../vips/vip-999/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import CUSTODY_RECEIPT_TOKEN_ABI from "./abi/CustodyReceiptToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 125582517;

const USDT_FAUCET_ABI = ["function allocateTo(address to, uint256 amount) external"];
const CHAINLINK_ORACLE_GETPRICE_ABI = ["function getPrice(address) external view returns (uint256)"];

const DEAD = "0x000000000000000000000000000000000000dEaD";

// Every governance account that could plausibly be granted mint/burn or pause/unpause, so the
// negative tests below pin down exactly which of them the VIP does *not* authorize.
const GOVERNANCE_ACCOUNTS: Record<string, string> = {
  "Normal Timelock": bsctestnet.NORMAL_TIMELOCK,
  "Fast-track Timelock": bsctestnet.FAST_TRACK_TIMELOCK,
  "Critical Timelock": bsctestnet.CRITICAL_TIMELOCK,
  Guardian: bsctestnet.GUARDIAN,
};

const label = (address: string): string =>
  Object.entries(GOVERNANCE_ACCOUNTS).find(([, a]) => a === address)?.[0] ?? address;

const notAuthorizedTo = (authorized: string[]): string[] =>
  Object.values(GOVERNANCE_ACCOUNTS).filter(a => !authorized.includes(a));

// IVaultTypes.VaultState
const VaultState = {
  WaitingForMargin: 0,
  MarginDeposited: 1,
  Fundraising: 2,
  Lock: 4,
  PendingSettlement: 5,
  Matured: 7,
};

forking(FORK_BLOCK, async () => {
  let oracle: Contract;
  let acm: Contract;
  let controller: Contract;
  let vceBTC: Contract;
  let usdt: Contract;
  let timelock: any;
  let vaultsBefore: any;

  before(async () => {
    oracle = await ethers.getContractAt(ORACLE_ABI, bsctestnet.RESILIENT_ORACLE);
    acm = await ethers.getContractAt(ACM_ABI, bsctestnet.ACCESS_CONTROL_MANAGER);
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    usdt = await ethers.getContractAt(CUSTODY_RECEIPT_TOKEN_ABI, SUPPLY_ASSET);
    timelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();
    vceBTC = await ethers.getContractAt(CUSTODY_RECEIPT_TOKEN_ABI, VCEBTC);
  });

  describe("Pre-VIP behavior", () => {
    it("vceBTC is deployed with correct ACM, name, symbol, and decimals", async () => {
      expect(await vceBTC.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
      expect(await vceBTC.name()).to.equal("Ceffu Custody BTC for Venus");
      expect(await vceBTC.symbol()).to.equal("vceBTC");
      expect(await vceBTC.decimals()).to.equal(18);
      expect(await vceBTC.totalSupply()).to.equal(0);
    });

    it("ownership has been offered to the Normal Timelock but not yet accepted", async () => {
      expect(await vceBTC.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await vceBTC.owner()).to.not.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("vceBTC has no oracle config yet (getPrice reverts)", async () => {
      await expect(oracle.getPrice(VCEBTC)).to.be.reverted;
    });

    it("no account can yet mint/burn or pause/unpause vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      const acmAsToken = acm.connect(vceBtcAsCaller);
      for (const account of MINT_BURN_AUTHORIZED) {
        expect(await acmAsToken.isAllowedToCall(account, "mint(address,uint256)")).to.equal(false);
        expect(await acmAsToken.isAllowedToCall(account, "burn(address,uint256)")).to.equal(false);
      }
      for (const account of PAUSE_UNPAUSE_AUTHORIZED) {
        expect(await acmAsToken.isAllowedToCall(account, "pause()")).to.equal(false);
        expect(await acmAsToken.isAllowedToCall(account, "unpause()")).to.equal(false);
      }
    });
  });

  testVip("VIP-999 Create Ceffu Custody BTC Fixed Rate Vault (Testnet)", await vip999());

  describe("Post-VIP behavior", () => {
    it("vceBTC is priced at the fixed direct price set on the Chainlink sub-oracle", async () => {
      const chainlink = await ethers.getContractAt(CHAINLINK_ORACLE_GETPRICE_ABI, CHAINLINK_ORACLE);
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.equal(VCEBTC_DIRECT_PRICE);
      // ResilientOracle proxies to the Chainlink main sub-oracle, which returns the direct price.
      expect(vceBtcPrice).to.equal(await chainlink.getPrice(VCEBTC));
    });

    it("the Normal Timelock accepted ownership of vceBTC", async () => {
      expect(await vceBTC.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await vceBTC.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("the mint/burn authorized accounts can mint/burn vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      const acmAsToken = acm.connect(vceBtcAsCaller);
      for (const account of MINT_BURN_AUTHORIZED) {
        expect(await acmAsToken.isAllowedToCall(account, "mint(address,uint256)")).to.equal(true);
        expect(await acmAsToken.isAllowedToCall(account, "burn(address,uint256)")).to.equal(true);
      }
    });

    it("the pause/unpause authorized accounts (all timelocks + Guardian) can pause/unpause vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      const acmAsToken = acm.connect(vceBtcAsCaller);
      for (const account of PAUSE_UNPAUSE_AUTHORIZED) {
        expect(await acmAsToken.isAllowedToCall(account, "pause()")).to.equal(true);
        expect(await acmAsToken.isAllowedToCall(account, "unpause()")).to.equal(true);
      }
    });

    it("initial vceBTC collateral was minted to the Guardian", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(bsctestnet.GUARDIAN)).to.equal(VCEBTC_INITIAL_SUPPLY);
    });

    it("a Fixed Rate Vault backed by vceBTC was created with the configured parameters and names", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      const vaultAddress = await controller.allVaults(vaultsBefore);
      expect(await controller.isRegistered(vaultAddress)).to.equal(true);

      const vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);

      // VaultConfig
      const config = await vault.config();
      expect(config.supplyAsset).to.equal(vaultConfig[0]);
      expect(config.fixedAPY).to.equal(vaultConfig[1]);
      expect(config.reserveFactor).to.equal(vaultConfig[2]);
      expect(config.minBorrowCap).to.equal(vaultConfig[3]);
      expect(config.maxBorrowCap).to.equal(vaultConfig[4]);
      expect(config.minSupplierDeposit).to.equal(vaultConfig[5]);
      expect(config.openDuration).to.equal(vaultConfig[6]);
      expect(config.lockDuration).to.equal(vaultConfig[7]);
      expect(config.settlementWindow).to.equal(vaultConfig[8]);

      // InstitutionalConfig (positionTokenId is assigned by the controller)
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(instConfig[0]);
      expect(inst.idealCollateralAmount).to.equal(instConfig[1]);
      expect(inst.marginRate).to.equal(instConfig[2]);
      expect(inst.institutionOperator).to.equal(instConfig[3]);
      expect(inst.positionTokenId).to.be.gt(0);

      // RiskConfig
      const risk = await vault.riskConfig();
      expect(risk.liquidationThreshold).to.equal(riskConfig[0]);
      expect(risk.liquidationIncentive).to.equal(riskConfig[1]);
      expect(risk.latePenaltyRate).to.equal(riskConfig[2]);

      // Share token names + institution name
      expect(await vault.name()).to.equal(VAULT_SHARE_NAME);
      expect(await vault.symbol()).to.equal(VAULT_SHARE_SYMBOL);
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
    });
  });

  describe("vceBTC mint / burn", () => {
    const amount = parseUnits("1", 18);
    let outsider: SignerWithAddress;

    before(async () => {
      const signers = await ethers.getSigners();
      outsider = signers[4];
    });

    for (const account of MINT_BURN_AUTHORIZED) {
      it(`${label(account)} can mint and burn vceBTC`, async () => {
        const caller = await initMainnetUser(account, parseUnits("1"));
        const supplyBefore = await vceBTC.totalSupply();
        const balanceBefore = await vceBTC.balanceOf(DEAD);

        await expect(vceBTC.connect(caller).mint(DEAD, amount))
          .to.emit(vceBTC, "Transfer")
          .withArgs(ethers.constants.AddressZero, DEAD, amount);
        expect(await vceBTC.balanceOf(DEAD)).to.equal(balanceBefore.add(amount));
        expect(await vceBTC.totalSupply()).to.equal(supplyBefore.add(amount));

        await expect(vceBTC.connect(caller).burn(DEAD, amount))
          .to.emit(vceBTC, "Transfer")
          .withArgs(DEAD, ethers.constants.AddressZero, amount);
        expect(await vceBTC.balanceOf(DEAD)).to.equal(balanceBefore);
        expect(await vceBTC.totalSupply()).to.equal(supplyBefore);
      });
    }

    it("an account without the grant cannot mint or burn", async () => {
      for (const account of [...notAuthorizedTo(MINT_BURN_AUTHORIZED), INSTITUTION_OPERATOR]) {
        const caller = await initMainnetUser(account, parseUnits("1"));
        await expect(vceBTC.connect(caller).mint(DEAD, amount), label(account)).to.be.revertedWithCustomError(
          vceBTC,
          "Unauthorized",
        );
        await expect(
          vceBTC.connect(caller).burn(bsctestnet.GUARDIAN, amount),
          label(account),
        ).to.be.revertedWithCustomError(vceBTC, "Unauthorized");
      }
      await expect(vceBTC.connect(outsider).mint(DEAD, amount)).to.be.revertedWithCustomError(vceBTC, "Unauthorized");
      await expect(vceBTC.connect(outsider).burn(bsctestnet.GUARDIAN, amount)).to.be.revertedWithCustomError(
        vceBTC,
        "Unauthorized",
      );
    });

    // burn() takes no allowance: an authorized account can destroy any holder's balance, including
    // collateral already sitting in a vault. Documenting the power the VIP hands out.
    it("burn needs no allowance from the holder whose balance is destroyed", async () => {
      expect(await vceBTC.allowance(bsctestnet.GUARDIAN, bsctestnet.NORMAL_TIMELOCK)).to.equal(0);

      const balanceBefore = await vceBTC.balanceOf(bsctestnet.GUARDIAN);
      const supplyBefore = await vceBTC.totalSupply();
      await vceBTC.connect(timelock).burn(bsctestnet.GUARDIAN, amount);
      expect(await vceBTC.balanceOf(bsctestnet.GUARDIAN)).to.equal(balanceBefore.sub(amount));
      expect(await vceBTC.totalSupply()).to.equal(supplyBefore.sub(amount));

      // Restore the initial supply for the assertions that follow.
      await vceBTC.connect(timelock).mint(bsctestnet.GUARDIAN, amount);
      expect(await vceBTC.totalSupply()).to.equal(supplyBefore);
    });

    it("burning more than a holder's balance reverts", async () => {
      const balance = await vceBTC.balanceOf(bsctestnet.GUARDIAN);
      await expect(vceBTC.connect(timelock).burn(bsctestnet.GUARDIAN, balance.add(1))).to.be.revertedWith(
        "ERC20: burn amount exceeds balance",
      );
    });

    it("minting to the zero address reverts", async () => {
      await expect(vceBTC.connect(timelock).mint(ethers.constants.AddressZero, amount)).to.be.revertedWith(
        "ERC20: mint to the zero address",
      );
    });

    it("total supply is unchanged by these tests", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(bsctestnet.GUARDIAN)).to.equal(VCEBTC_INITIAL_SUPPLY);
    });
  });

  describe("vceBTC pause / unpause", () => {
    const amount = parseUnits("1", 18);
    let holder: SignerWithAddress;
    let spender: SignerWithAddress;

    before(async () => {
      const signers = await ethers.getSigners();
      [holder, spender] = [signers[2], signers[3]];
    });

    afterEach(async () => {
      if (await vceBTC.paused()) {
        await vceBTC.connect(timelock).unpause();
      }
    });

    for (const account of PAUSE_UNPAUSE_AUTHORIZED) {
      it(`${label(account)} can pause and unpause vceBTC`, async () => {
        const caller = await initMainnetUser(account, parseUnits("1"));
        expect(await vceBTC.paused()).to.equal(false);

        await expect(vceBTC.connect(caller).pause()).to.emit(vceBTC, "Paused").withArgs(account);
        expect(await vceBTC.paused()).to.equal(true);

        await expect(vceBTC.connect(caller).unpause()).to.emit(vceBTC, "Unpaused").withArgs(account);
        expect(await vceBTC.paused()).to.equal(false);
      });
    }

    it("an account without the grant cannot pause or unpause", async () => {
      for (const account of [...notAuthorizedTo(PAUSE_UNPAUSE_AUTHORIZED), INSTITUTION_OPERATOR]) {
        const caller = await initMainnetUser(account, parseUnits("1"));
        await expect(vceBTC.connect(caller).pause(), label(account)).to.be.revertedWithCustomError(
          vceBTC,
          "Unauthorized",
        );
        await expect(vceBTC.connect(caller).unpause(), label(account)).to.be.revertedWithCustomError(
          vceBTC,
          "Unauthorized",
        );
      }
      await expect(vceBTC.connect(holder).pause()).to.be.revertedWithCustomError(vceBTC, "Unauthorized");
      await expect(vceBTC.connect(holder).unpause()).to.be.revertedWithCustomError(vceBTC, "Unauthorized");
    });

    it("pausing twice reverts, and unpausing while unpaused reverts", async () => {
      await expect(vceBTC.connect(timelock).unpause()).to.be.revertedWithCustomError(vceBTC, "NotPaused");
      await vceBTC.connect(timelock).pause();
      await expect(vceBTC.connect(timelock).pause()).to.be.revertedWithCustomError(vceBTC, "AlreadyPaused");
    });

    it("while paused, transfer and transferFrom revert but mint, burn and approve still work", async () => {
      const holderAddress = await holder.getAddress();
      const spenderAddress = await spender.getAddress();

      await vceBTC.connect(timelock).mint(holderAddress, amount);
      await vceBTC.connect(timelock).pause();

      // Both transfer paths are blocked while paused.
      await expect(vceBTC.connect(holder).transfer(spenderAddress, amount)).to.be.revertedWithCustomError(
        vceBTC,
        "ActionPaused",
      );
      await vceBTC.connect(holder).approve(spenderAddress, amount); // approvals are not transfers
      expect(await vceBTC.allowance(holderAddress, spenderAddress)).to.equal(amount);
      await expect(
        vceBTC.connect(spender).transferFrom(holderAddress, spenderAddress, amount),
      ).to.be.revertedWithCustomError(vceBTC, "ActionPaused");

      // Custody can still be reconciled while transfers are frozen.
      await vceBTC.connect(timelock).mint(holderAddress, amount);
      expect(await vceBTC.balanceOf(holderAddress)).to.equal(amount.mul(2));
      await vceBTC.connect(timelock).burn(holderAddress, amount);
      expect(await vceBTC.balanceOf(holderAddress)).to.equal(amount);

      // Unpausing restores transfers.
      await vceBTC.connect(timelock).unpause();
      await vceBTC.connect(spender).transferFrom(holderAddress, spenderAddress, amount);
      expect(await vceBTC.balanceOf(holderAddress)).to.equal(0);
      expect(await vceBTC.balanceOf(spenderAddress)).to.equal(amount);

      // Clean up so the total-supply assertions below still hold.
      await vceBTC.connect(timelock).burn(spenderAddress, amount);
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
    });
  });

  describe("Vault lifecycle", () => {
    let vault: Contract;
    let institution: any;
    let lender: any;
    let LENDER: string;

    const idealCollateralAmount = BigNumber.from(instConfig[1]);
    const marginRate = BigNumber.from(instConfig[2]);
    const minBorrowCap = BigNumber.from(vaultConfig[3]);
    const maxBorrowCap = BigNumber.from(vaultConfig[4]);
    const openDuration = Number(vaultConfig[6]);
    const lockDuration = Number(vaultConfig[7]);
    const marginAmount = idealCollateralAmount.mul(marginRate).div(parseUnits("1", 18));
    const lenderDepositAmount = minBorrowCap.add(maxBorrowCap).div(2);

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);

      institution = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));

      // Lender is a pre-funded Hardhat signer (account #1), so no impersonation is needed.
      const [deployer, lenderSigner] = await ethers.getSigners();
      lender = lenderSigner;
      LENDER = await lenderSigner.getAddress();

      // Fund the institution with vceBTC collateral and both parties with the supply asset (USDT).
      await vceBTC.connect(timelock).mint(INSTITUTION_OPERATOR, idealCollateralAmount);
      const usdtFaucet = await ethers.getContractAt(USDT_FAUCET_ABI, SUPPLY_ASSET);
      await usdtFaucet.connect(deployer).allocateTo(LENDER, lenderDepositAmount);
      await usdtFaucet.connect(deployer).allocateTo(INSTITUTION_OPERATOR, lenderDepositAmount.div(5)); // buffer to cover interest on repay (principal comes from claimed funds)
    });

    it("institution deposits margin collateral (WaitingForMargin -> MarginDeposited)", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await vceBTC.connect(institution).approve(vault.address, idealCollateralAmount);
      await vault.connect(institution).depositCollateral(marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
    });

    it("controller opens the vault (MarginDeposited -> Fundraising)", async () => {
      await controller.connect(timelock).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
    });

    // The emergency safeguard, exercised on the live vault: while vceBTC is paused the institution
    // cannot move collateral in or out, because both directions are holder-to-holder transfers.
    it("a vceBTC pause blocks collateral deposits into the vault", async () => {
      const guardian = await initMainnetUser(bsctestnet.GUARDIAN, parseUnits("1"));
      await vceBTC.connect(guardian).pause();
      await expect(
        vault.connect(institution).depositCollateral(idealCollateralAmount.sub(marginAmount)),
      ).to.be.revertedWithCustomError(vceBTC, "ActionPaused");
      await vceBTC.connect(guardian).unpause();
    });

    it("institution tops up collateral to the full ideal amount", async () => {
      await vault.connect(institution).depositCollateral(idealCollateralAmount.sub(marginAmount));
      expect(await vceBTC.balanceOf(vault.address)).to.equal(idealCollateralAmount);
    });

    it("a lender deposits the supply asset", async () => {
      await usdt.connect(lender).approve(vault.address, lenderDepositAmount);
      await vault.connect(lender).deposit(lenderDepositAmount, LENDER);
      expect(await vault.balanceOf(LENDER)).to.be.gt(0);
    });

    it("the open window elapses and the vault locks (Fundraising -> Lock)", async () => {
      await time.increase(openDuration + 1);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("the institution claims the raised funds", async () => {
      const usdtBefore = await usdt.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(institution).claimRaisedFunds();
      expect(await usdt.balanceOf(INSTITUTION_OPERATOR)).to.equal(usdtBefore.add(lenderDepositAmount));
      expect(await vault.outstandingDebt()).to.be.gt(lenderDepositAmount); // principal + accrued interest
    });

    it("the institution repays in full after the lock period (Lock -> PendingSettlement -> Matured)", async () => {
      await time.increase(lockDuration + 1);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

      const owed = await vault.outstandingDebt();
      await usdt.connect(institution).approve(vault.address, owed);
      await vault.connect(institution).repay(owed);
      await vault.updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Matured);
      expect(await vault.outstandingDebt()).to.equal(0);
    });

    it("the lender redeems principal plus interest", async () => {
      const shares = await vault.balanceOf(LENDER);
      const expectedAssets = await vault.previewRedeem(shares);
      expect(expectedAssets).to.be.gt(lenderDepositAmount); // net of the reserve-factor cut

      const usdtBefore = await usdt.balanceOf(LENDER);
      await vault.connect(lender).redeem(shares, LENDER, LENDER);
      expect(await usdt.balanceOf(LENDER)).to.equal(usdtBefore.add(expectedAssets));
      expect(await vault.balanceOf(LENDER)).to.equal(0);
    });

    // burn() moves no tokens the vault can observe: the vault tracks collateral in storage
    // (_instRuntime.totalCollateralDeposited) and prices *that*, so burning the vault's balance
    // leaves its accounting and USD valuation untouched while the tokens are gone. Reverted via
    // snapshot so the happy-path withdrawal below still runs.
    it("burning the vault's collateral is invisible to the vault's own accounting", async () => {
      const snapshot = await takeSnapshot();

      const collateral = await vceBTC.balanceOf(vault.address);
      const trackedBefore = (await vault.institutionalRuntime()).totalCollateralDeposited;
      const valueBefore = await vault.getCollateralValueUSD();
      expect(trackedBefore).to.equal(collateral);

      await vceBTC.connect(timelock).burn(vault.address, collateral);
      expect(await vceBTC.balanceOf(vault.address)).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(trackedBefore);
      expect(await vault.getCollateralValueUSD()).to.equal(valueBefore);

      // The shortfall only surfaces when the vault tries to move the tokens it no longer holds.
      await expect(vault.connect(institution).withdrawCollateral(collateral)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance",
      );

      await snapshot.restore();
      expect(await vceBTC.balanceOf(vault.address)).to.equal(collateral);
    });

    it("a vceBTC pause blocks the institution from withdrawing its collateral", async () => {
      const guardian = await initMainnetUser(bsctestnet.GUARDIAN, parseUnits("1"));
      const collateral = await vceBTC.balanceOf(vault.address);
      await vceBTC.connect(guardian).pause();
      await expect(vault.connect(institution).withdrawCollateral(collateral)).to.be.revertedWithCustomError(
        vceBTC,
        "ActionPaused",
      );
      await vceBTC.connect(guardian).unpause();
    });

    it("the institution withdraws its collateral", async () => {
      const collateral = await vceBTC.balanceOf(vault.address);
      expect(collateral).to.equal(idealCollateralAmount);

      const before = await vceBTC.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(institution).withdrawCollateral(collateral);
      expect(await vceBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(collateral));
      expect(await vceBTC.balanceOf(vault.address)).to.equal(0);
    });
  });
});
