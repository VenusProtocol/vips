import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodForAllAssets, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip640 from "../../vips/vip-640/bscmainnet";
import vip999, {
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  BTCB,
  BTCB_FEED_FALLBACK,
  BTCB_FEED_MAIN,
  BTCB_FEED_PIVOT,
  BTCB_LOWER_BOUND,
  BTCB_UPPER_BOUND,
  CHAINLINK_ORACLE,
  FIXED_RATE_VAULT_CONTROLLER,
  INITIAL_SUPPLY_RECIPIENT,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  REDSTONE_ORACLE,
  SUPPLY_ASSET,
  VAULT_SHARE_NAME,
  VAULT_SHARE_SYMBOL,
  VCEBTC,
  VCEBTC_INITIAL_SUPPLY,
  instConfig,
  riskConfig,
  vaultConfig,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import BOUND_VALIDATOR_ABI from "./abi/BoundValidator.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/VenusERC20.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 108402150;
const ONE_YEAR = 31536000;

const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; // Binance Hot Wallet
const LENDER = "0x2222222222222222222222222222222222222222"; // dummy test lender

const STUB_ORACLE_BYTECODE =
  "0x6080604052348015600e575f80fd5b5061015e8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c806341976e091461002d575b5f80fd5b610047600480360381019061004291906100cc565b61005d565b604051610054919061010f565b60405180910390f35b5f670de0b6b3a76400009050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009b82610072565b9050919050565b6100ab81610091565b81146100b5575f80fd5b50565b5f813590506100c6816100a2565b92915050565b5f602082840312156100e1576100e061006e565b5b5f6100ee848285016100b8565b91505092915050565b5f819050919050565b610109816100f7565b82525050565b5f6020820190506101225f830184610100565b9291505056fea26469706673582212209282f7f2d85233912d0088d6dc45ce2459097d2866597e41f0a286059758c12c64736f6c63430008190033";
const STUB_ORACLE_ABI = ["function getPrice(address) external pure returns (uint256)"];

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
  let btcb: Contract;
  let usdt: Contract;
  let timelock: any;
  let vaultsBefore: any;
  let btcbPriceAtFork: any;

  before(async () => {
    oracle = await ethers.getContractAt(ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
    usdt = await ethers.getContractAt(ERC20_ABI, SUPPLY_ASSET);
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();

    const usdtPriceAtFork = await oracle.getPrice(SUPPLY_ASSET);
    btcbPriceAtFork = await oracle.getPrice(BTCB);
    await setMaxStalePeriodForAllAssets(oracle, [btcb, usdt]);
    const redstoneOracleForExisting = await ethers.getContractAt(
      ["function setDirectPrice(address asset, uint256 price) external"],
      REDSTONE_ORACLE,
    );
    await redstoneOracleForExisting.connect(timelock).setDirectPrice(BTCB, btcbPriceAtFork);
    await redstoneOracleForExisting.connect(timelock).setDirectPrice(SUPPLY_ASSET, usdtPriceAtFork);

    // Reproduce the prerequisite controller/vault-upgrade VIP (VIP-640), which upgrades the
    // controller/vault implementations and re-grants the 6-arg createVault permission.
    await pretendExecutingVip(await vip640(), bscmainnet.NORMAL_TIMELOCK);

    const [deployer] = await ethers.getSigners();
    const stubFactory = new ethers.ContractFactory(STUB_ORACLE_ABI, STUB_ORACLE_BYTECODE, deployer);
    const stubOracle = await stubFactory.deploy();
    await stubOracle.deployed();
    await controller.connect(timelock).setOracle(stubOracle.address);

    vceBTC = await ethers.getContractAt(ERC20_ABI, VCEBTC);
  });

  describe("Pre-VIP behavior", () => {
    it("vceBTC is deployed with correct ACM, name, symbol, and decimals", async () => {
      expect(await vceBTC.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
      expect(await vceBTC.name()).to.equal("Ceffu Custody BTC for Venus");
      expect(await vceBTC.symbol()).to.equal("vceBTC");
      expect(await vceBTC.decimals()).to.equal(18);
      expect(await vceBTC.totalSupply()).to.equal(0);
    });

    it("ownership has been offered to the Normal Timelock but not yet accepted", async () => {
      expect(await vceBTC.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await vceBTC.owner()).to.not.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("vceBTC has no oracle config yet (getPrice reverts)", async () => {
      await expect(oracle.getPrice(VCEBTC)).to.be.reverted;
    });

    it("Timelock and Guardian cannot yet mint/burn vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "mint(address,uint256)"),
      ).to.equal(false);
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.CRITICAL_GUARDIAN, "mint(address,uint256)"),
      ).to.equal(false);
    });
  });

  testVip("VIP-999 Create Ceffu Custody BTC Fixed Rate Vault", await vip999(), {
    callbackAfterExecution: async () => {
      // vceBTC's oracle config is only created by the VIP itself, so its stale period
      // can only be bumped now.
      for (const [oracleAddress, feed] of [
        [CHAINLINK_ORACLE, BTCB_FEED_MAIN],
        [REDSTONE_ORACLE, BTCB_FEED_PIVOT],
        [ATLAS_ORACLE, BTCB_FEED_FALLBACK],
      ]) {
        await setMaxStalePeriodInChainlinkOracle(oracleAddress, VCEBTC, feed, bscmainnet.NORMAL_TIMELOCK, ONE_YEAR);
      }
      const redstoneOracle = await ethers.getContractAt(
        ["function setDirectPrice(address asset, uint256 price) external"],
        REDSTONE_ORACLE,
      );
      await redstoneOracle.connect(timelock).setDirectPrice(VCEBTC, btcbPriceAtFork);
      await controller.connect(timelock).setOracle(bscmainnet.RESILIENT_ORACLE);
    },
  });

  describe("Post-VIP behavior", () => {
    it("vceBTC is priced close to BTCB", async () => {
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      const tolerance = btcbPriceAtFork.div(100); // 1% tolerance
      expect(vceBtcPrice).to.be.closeTo(btcbPriceAtFork, tolerance);
    });

    it("the Normal Timelock accepted ownership of vceBTC", async () => {
      expect(await vceBTC.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await vceBTC.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Timelock and Guardian can mint/burn vceBTC", async () => {
      const vceBtcAsCaller = await initMainnetUser(VCEBTC, parseUnits("1"));
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "mint(address,uint256)"),
      ).to.equal(true);
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.CRITICAL_GUARDIAN, "mint(address,uint256)"),
      ).to.equal(true);
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.NORMAL_TIMELOCK, "burn(address,uint256)"),
      ).to.equal(true);
      expect(
        await acm.connect(vceBtcAsCaller).isAllowedToCall(bscmainnet.CRITICAL_GUARDIAN, "burn(address,uint256)"),
      ).to.equal(true);
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

    it("initial vceBTC collateral was minted to the Ceffu multisig", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(INITIAL_SUPPLY_RECIPIENT)).to.equal(VCEBTC_INITIAL_SUPPLY);
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

  describe("Oracle configuration for BTCB and vceBTC", () => {
    it("BTCB price is available from ResilientOracle", async () => {
      const btcbPrice = await oracle.getPrice(BTCB);
      expect(btcbPrice).to.be.gt(0);
    });

    it("vceBTC price is available from ResilientOracle", async () => {
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.be.gt(0);
    });

    it("vceBTC price matches BTCB price configuration", async () => {
      const btcbPrice = await oracle.getPrice(BTCB);
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.equal(btcbPrice);
    });

    it("BTCB bounds are configured correctly in BoundValidator", async () => {
      const boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, BOUND_VALIDATOR);
      const btcbBounds = await boundValidator.validateConfigs(BTCB);
      expect(btcbBounds.asset).to.equal(BTCB);
      expect(btcbBounds.upperBoundRatio).to.equal(BTCB_UPPER_BOUND);
      expect(btcbBounds.lowerBoundRatio).to.equal(BTCB_LOWER_BOUND);
    });

    it("vceBTC bounds are configured correctly in BoundValidator (cloned from BTCB)", async () => {
      const boundValidator = await ethers.getContractAt(BOUND_VALIDATOR_ABI, BOUND_VALIDATOR);
      const vceBtcBounds = await boundValidator.validateConfigs(VCEBTC);
      expect(vceBtcBounds.asset).to.equal(VCEBTC);
      expect(vceBtcBounds.upperBoundRatio).to.equal(BTCB_UPPER_BOUND);
      expect(vceBtcBounds.lowerBoundRatio).to.equal(BTCB_LOWER_BOUND);
    });
  });

  describe("Vault lifecycle", () => {
    let vault: Contract;
    let institution: any;
    let lender: any;

    const idealCollateralAmount = BigNumber.from(instConfig[1]);
    const marginRate = BigNumber.from(instConfig[2]);
    const minBorrowCap = BigNumber.from(vaultConfig[3]);
    const openDuration = Number(vaultConfig[6]);
    const lockDuration = Number(vaultConfig[7]);
    const marginAmount = idealCollateralAmount.mul(marginRate).div(parseUnits("1", 18));
    const lenderDepositAmount = minBorrowCap.mul(2);

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);

      institution = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      lender = await initMainnetUser(LENDER, parseUnits("1"));

      // Fund the institution with vceBTC collateral and both parties with the supply asset.
      await vceBTC.connect(timelock).mint(INSTITUTION_OPERATOR, idealCollateralAmount);
      const whale = await initMainnetUser(USDT_WHALE, parseUnits("1"));
      await usdt.connect(whale).transfer(LENDER, lenderDepositAmount);
      await usdt.connect(whale).transfer(INSTITUTION_OPERATOR, lenderDepositAmount.div(5)); // to repay principal + interest
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
