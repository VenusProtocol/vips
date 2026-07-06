import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodForAllAssets, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  BTCB,
  BTCB_FEED_MAIN,
  CHAINLINK_ORACLE,
  FIXED_RATE_VAULT_CONTROLLER,
  INSTITUTION_OPERATOR,
  SUPPLY_ASSET,
  VCEBTC,
  VCEBTC_INITIAL_SUPPLY,
  instConfig,
  vaultConfig,
} from "../../vips/vip-999/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import ORACLE_ABI from "./abi/ResilientOracle.json";
import ERC20_ABI from "./abi/VenusERC20.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 117554000;
const ONE_YEAR = 31536000;

// A separate, not-yet-executed VIP upgrades the controller/vault implementations to the
// versions supporting the 6-argument createVault (with institution name). Reproduced here.
const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
const NEW_CONTROLLER_IMPLEMENTATION = "0xC36dFaCc7a125859C106F29b9F2d874CCF29A55A";
const NEW_VAULT_IMPLEMENTATION = "0x97421799419Eb782628e73e7220d8E0A207469a3";

const USDT_FAUCET_ABI = ["function allocateTo(address to, uint256 amount) external"];
const LENDER = "0x2222222222222222222222222222222222222222"; // dummy test lender

const CHAINLINK_ORACLE_GETPRICE_ABI = ["function getPrice(address) external view returns (uint256)"];

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

  before(async () => {
    oracle = await ethers.getContractAt(ORACLE_ABI, bsctestnet.RESILIENT_ORACLE);
    acm = await ethers.getContractAt(ACM_ABI, bsctestnet.ACCESS_CONTROL_MANAGER);
    controller = await ethers.getContractAt(CONTROLLER_ABI, FIXED_RATE_VAULT_CONTROLLER);
    btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
    usdt = await ethers.getContractAt(ERC20_ABI, SUPPLY_ASSET);
    timelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, parseUnits("40"));
    vaultsBefore = await controller.allVaultsLength();

    // Bump the stale period for the pre-existing assets so their prices remain readable on the fork.
    await setMaxStalePeriodForAllAssets(oracle, [btcb, usdt]);

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
        bsctestnet.NORMAL_TIMELOCK,
      );

    // Point the controller at a stub oracle so createVault can price vceBTC during the
    // time-advanced execute() (see the STUB_ORACLE_BYTECODE comment). Restored in the callback.
    const [deployer] = await ethers.getSigners();
    const stubFactory = new ethers.ContractFactory(STUB_ORACLE_ABI, STUB_ORACLE_BYTECODE, deployer);
    const stubOracle = await stubFactory.deploy();
    await stubOracle.deployed();
    await controller.connect(timelock).setOracle(stubOracle.address);

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

  testVip("VIP-999 Create Ceffu Custody BTC Fixed Rate Vault (Testnet)", await vip999(), {
    callbackAfterExecution: async () => {
      // vceBTC's oracle config (Chainlink main only) is only created by the VIP itself, so its
      // stale period can only be bumped now — needed so the price survives the ~37-day time
      // travel in the vault lifecycle test below.
      await setMaxStalePeriodInChainlinkOracle(
        CHAINLINK_ORACLE,
        VCEBTC,
        BTCB_FEED_MAIN,
        bsctestnet.NORMAL_TIMELOCK,
        ONE_YEAR,
      );
      // Restore the real ResilientOracle now that vceBTC is priceable with a bumped stale period.
      await controller.connect(timelock).setOracle(bsctestnet.RESILIENT_ORACLE);
    },
  });

  describe("Post-VIP behavior", () => {
    it("vceBTC is priced from the Chainlink feed cloned from BTCB's config", async () => {
      const chainlink = await ethers.getContractAt(CHAINLINK_ORACLE_GETPRICE_ABI, CHAINLINK_ORACLE);
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.be.gt(0);
      // ResilientOracle proxies to the Chainlink main sub-oracle, which reads the cloned feed.
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

    it("initial vceBTC collateral was minted to the Venus Treasury", async () => {
      expect(await vceBTC.totalSupply()).to.equal(VCEBTC_INITIAL_SUPPLY);
      expect(await vceBTC.balanceOf(bsctestnet.VTREASURY)).to.equal(VCEBTC_INITIAL_SUPPLY);
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

  describe("Oracle configuration for BTCB and vceBTC", () => {
    it("BTCB price is available from ResilientOracle", async () => {
      const btcbPrice = await oracle.getPrice(BTCB);
      expect(btcbPrice).to.be.gt(0);
    });

    it("vceBTC price is available from ResilientOracle", async () => {
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.be.gt(0);
    });

    it("vceBTC price equals the value derived from its cloned Chainlink feed", async () => {
      const chainlink = await ethers.getContractAt(CHAINLINK_ORACLE_GETPRICE_ABI, CHAINLINK_ORACLE);
      const vceBtcPrice = await oracle.getPrice(VCEBTC);
      expect(vceBtcPrice).to.equal(await chainlink.getPrice(VCEBTC));
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

      // Fund the institution with vceBTC collateral and both parties with the supply asset (USDT).
      await vceBTC.connect(timelock).mint(INSTITUTION_OPERATOR, idealCollateralAmount);
      const [deployer] = await ethers.getSigners();
      const usdtFaucet = await ethers.getContractAt(USDT_FAUCET_ABI, SUPPLY_ASSET);
      await usdtFaucet.connect(deployer).allocateTo(LENDER, lenderDepositAmount);
      await usdtFaucet.connect(deployer).allocateTo(INSTITUTION_OPERATOR, lenderDepositAmount.div(5)); // repay principal + interest
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
