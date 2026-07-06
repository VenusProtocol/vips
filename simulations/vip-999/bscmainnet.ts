import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodForAllAssets, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  ATLAS_ORACLE,
  BTCB,
  BTCB_FEED_FALLBACK,
  BTCB_FEED_MAIN,
  BTCB_FEED_PIVOT,
  CHAINLINK_ORACLE,
  FIXED_RATE_VAULT_CONTROLLER,
  INSTITUTION_OPERATOR,
  REDSTONE_ORACLE,
  SUPPLY_ASSET,
  VCEBTC,
  VCEBTC_INITIAL_SUPPLY,
  instConfig,
  vaultConfig,
} from "../../vips/vip-999/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ERC20_ABI from "./abi/AccessControlledERC20.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 108402150; // shortly after vceBTC's deployment
const ONE_YEAR = 31536000;

// A separate, not-yet-executed VIP upgrades the controller/vault implementations and
// grants createVault.
const PROXY_ADMIN = "0x6beb6D2695B67FEb73ad4f172E8E2975497187e4";
const NEW_CONTROLLER_IMPLEMENTATION = "0xBD9df626c642591cef3612586CC5e45E9767360f";
const NEW_VAULT_IMPLEMENTATION = "0xC25b2B657D24380eDd1a1Cff5296385541e85204";

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
    btcbPriceAtFork = await oracle.getPrice(BTCB);
    acm = await ethers.getContractAt(ACM_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
    usdt = await ethers.getContractAt(ERC20_ABI, SUPPLY_ASSET);
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();

    const usdtPriceAtFork = await oracle.getPrice(SUPPLY_ASSET);
    await setMaxStalePeriodForAllAssets(oracle, [btcb, usdt]);
    const redstoneOracleForExisting = await ethers.getContractAt(
      ["function setDirectPrice(address asset, uint256 price) external"],
      REDSTONE_ORACLE,
    );
    await redstoneOracleForExisting.connect(timelock).setDirectPrice(BTCB, btcbPriceAtFork);
    await redstoneOracleForExisting.connect(timelock).setDirectPrice(SUPPLY_ASSET, usdtPriceAtFork);

    // --- Reproduce the separate controller/vault-upgrade VIP's end state ---
    const proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PROXY_ADMIN);
    const proxyAdminOwner = await initMainnetUser(await proxyAdmin.owner(), parseUnits("1"));
    await proxyAdmin.connect(proxyAdminOwner).upgrade(FIXED_RATE_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION);
    await controller.connect(timelock).setVaultImplementation(NEW_VAULT_IMPLEMENTATION);
    await acm
      .connect(timelock)
      .giveCallPermission(
        FIXED_RATE_VAULT_CONTROLLER,
        "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string,string)",
        bscmainnet.NORMAL_TIMELOCK,
      );
    await acm
      .connect(timelock)
      .giveCallPermission(FIXED_RATE_VAULT_CONTROLLER, "openVault(address)", bscmainnet.NORMAL_TIMELOCK);

    const [deployer] = await ethers.getSigners();
    const stubFactory = new ethers.ContractFactory(STUB_ORACLE_ABI, STUB_ORACLE_BYTECODE, deployer);
    const stubOracle = await stubFactory.deploy();
    await stubOracle.deployed();
    await controller.connect(timelock).setOracle(stubOracle.address);

    vceBTC = await ethers.getContractAt(ERC20_ABI, VCEBTC);
  });

  describe("Pre-VIP behavior", () => {
    it("vceBTC is deployed and wired to the real ACM", async () => {
      expect(await vceBTC.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
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
      const diff = vceBtcPrice.gt(btcbPriceAtFork)
        ? vceBtcPrice.sub(btcbPriceAtFork)
        : btcbPriceAtFork.sub(vceBtcPrice);
      expect(diff.mul(100).lte(btcbPriceAtFork)).to.equal(true); // within 1%
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

    it("initial vceBTC collateral was minted to the Venus Treasury", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(bscmainnet.VTREASURY)).to.equal(VCEBTC_INITIAL_SUPPLY);
    });

    it("a Fixed Rate Vault backed by vceBTC was created", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      const vaultAddress = await controller.allVaults(vaultsBefore);
      expect(await controller.isRegistered(vaultAddress)).to.equal(true);

      const vault = await ethers.getContractAt(VAULT_ABI, vaultAddress);
      expect((await vault.config()).supplyAsset).to.equal(SUPPLY_ASSET);
      expect((await vault.institutionalConfig()).collateralAsset).to.equal(VCEBTC);
      expect((await vault.institutionalConfig()).institutionOperator).to.equal(INSTITUTION_OPERATOR);
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
