import { time } from "@nomicfoundation/hardhat-network-helpers";
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
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/VenusERC20.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 117573000;

const USDT_FAUCET_ABI = ["function allocateTo(address to, uint256 amount) external"];
const CHAINLINK_ORACLE_GETPRICE_ABI = ["function getPrice(address) external view returns (uint256)"];

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
    usdt = await ethers.getContractAt(ERC20_ABI, SUPPLY_ASSET);
    timelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();
    vceBTC = await ethers.getContractAt(ERC20_ABI, VCEBTC);
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

    it("Timelock and Guardian cannot yet mint/burn vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.NORMAL_TIMELOCK, "mint(address,uint256)"),
      ).to.equal(false);
      expect(await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.GUARDIAN, "mint(address,uint256)")).to.equal(
        false,
      );
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

    it("Timelock and Guardian can mint/burn vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.NORMAL_TIMELOCK, "mint(address,uint256)"),
      ).to.equal(true);
      expect(await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.GUARDIAN, "mint(address,uint256)")).to.equal(
        true,
      );
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.NORMAL_TIMELOCK, "burn(address,uint256)"),
      ).to.equal(true);
      expect(await acm.connect(vceBtcAsCaller).isAllowedToCall(bsctestnet.GUARDIAN, "burn(address,uint256)")).to.equal(
        true,
      );
    });

    it("the Normal Timelock can mint and burn vceBTC", async () => {
      const recipient = "0x000000000000000000000000000000000000dEaD";
      const amount = parseUnits("1", 18);

      const supplyBefore = await vceBTC.totalSupply();
      const balanceBefore = await vceBTC.balanceOf(recipient);

      await vceBTC.connect(timelock).mint(recipient, amount);
      expect(await vceBTC.balanceOf(recipient)).to.equal(balanceBefore.add(amount));
      expect(await vceBTC.totalSupply()).to.equal(supplyBefore.add(amount));

      await vceBTC.connect(timelock).burn(recipient, amount);
      expect(await vceBTC.balanceOf(recipient)).to.equal(balanceBefore);
      expect(await vceBTC.totalSupply()).to.equal(supplyBefore);
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
