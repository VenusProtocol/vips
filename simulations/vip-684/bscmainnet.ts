import { SnapshotRestorer, setBalance, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices, pinOracleFeedPrice } from "src/vip-framework/oracleStaleness";

import vip684, {
  ACCESS_CONTROL_MANAGER,
  ADAPTER_FRV,
  BOUND_VALIDATOR,
  BTCB,
  BTCB_FEEDS,
  BTCB_LOWER_BOUND,
  BTCB_RESILIENT_ORACLES,
  BTCB_UPPER_BOUND,
  CRITICAL_GUARDIAN,
  CTBTC,
  CTBTC_MINT_AMOUNT,
  CTBTC_ROLES,
  CTBTC_ROLE_HOLDERS,
  FIXED_APY,
  FRV_SOURCE_USDT,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  LATE_PENALTY_RATE,
  LIQUIDATION_INCENTIVE,
  LIQUIDATION_THRESHOLD,
  LOCK_DURATION,
  LTP_VAULT,
  MARGIN_RATE,
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  NORMAL_TIMELOCK,
  OPEN_DURATION,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  USDT,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-684/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import BOUND_VALIDATOR_ABI from "./abi/BoundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import CTBTC_ABI from "./abi/CustodyReceiptToken.json";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ADAPTER_ABI from "./abi/LiquidationAdapter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 133916000;

// VIP-681 is queued at this block. It replaces the AdapterFRV this VIP registers the vault with, so it runs first.
const VIP_681_PROPOSAL_ID = 681;
const QUEUED = 5;

// BPNC's deployment: the same CustodyReceiptToken bytecode, deployed by isolated-pools deploy/029. Until ctBTC is
// deployed, the sim deploys a stand-in from this creation code with ctBTC's constructor arguments.
const BPNC_DEPLOY_TX = "0xed7d851ec5aeef7f8dcf37a1791b2817662df12351598f74483fd7d6bdc8505f";
const encodeTokenArgs = (name: string, symbol: string) =>
  defaultAbiCoder.encode(["string", "string", "uint8", "address"], [name, symbol, 18, ACCESS_CONTROL_MANAGER]);

const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";
const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";

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

const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const USDT_HUB = "0x18AfDACF30F8671021dec4b78297E39d2FE87226";
const USDT_CORE_SOURCE = "0xC9E6ceD9589363f8dC5695Be2C79AB4dDaECC94B";
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const NO_RESOURCE = ethers.constants.AddressZero;

// BTC price at which the debt crosses the 92% threshold, as stated in the VIP description.
const DESCRIBED_LIQUIDATION_PRICE = parseUnits("55045", 18);

// ERC4626 redemption with the vault's virtual asset/share offset of 1.
const previewRedeemAt = (shares: BigNumber, totalAssets: BigNumber, totalSupply: BigNumber): BigNumber =>
  shares.mul(totalAssets.add(1)).div(totalSupply.add(1));

// Mirrors BaseVault._computeTotalInterest.
const BPS = 10_000;
const YEAR = 365 * 24 * 60 * 60;
const termInterest = (principal: BigNumber): BigNumber =>
  principal.mul(FIXED_APY).mul(LOCK_DURATION).div(BigNumber.from(BPS).mul(YEAR));

const reserveCut = (interest: BigNumber): BigNumber => interest.mul(RESERVE_FACTOR).div(parseUnits("1", 18));

const executeQueuedVip681 = async () => {
  const governor = new ethers.Contract(
    bscmainnet.GOVERNOR_PROXY,
    [
      "function state(uint256) view returns (uint8)",
      "function proposals(uint256) view returns (uint256 id, address proposer, uint256 eta)",
      "function execute(uint256) payable",
    ],
    ethers.provider,
  );
  if ((await governor.state(VIP_681_PROPOSAL_ID)) !== QUEUED) return;
  await time.increaseTo((await governor.proposals(VIP_681_PROPOSAL_ID)).eta.toNumber());
  const [executor] = await ethers.getSigners();
  await governor.connect(executor).execute(VIP_681_PROPOSAL_ID);
};

// Deploys a CustodyReceiptToken named like ctBTC and nominates the Normal Timelock, as deploy/029 does.
const deployCtBTCStandIn = async (): Promise<string> => {
  const deployTx = await ethers.provider.getTransaction(BPNC_DEPLOY_TX);
  const bpncArgs = encodeTokenArgs("BPN Credit Token", "BPNC").slice(2);
  expect(deployTx.data.endsWith(bpncArgs)).to.equal(true);
  const creationCode = deployTx.data.slice(0, deployTx.data.length - bpncArgs.length);

  const [deployer] = await ethers.getSigners();
  const tx = await deployer.sendTransaction({
    data: creationCode + encodeTokenArgs("Custodian BTC", "ctBTC").slice(2),
  });
  const { contractAddress } = await tx.wait();
  const token = new ethers.Contract(contractAddress, CTBTC_ABI, deployer);
  await token.transferOwnership(NORMAL_TIMELOCK);
  return contractAddress;
};

forking(FORK_BLOCK, async () => {
  // VIP-681 pays its LayerZero fees from the Normal Timelock, whose balance the price helpers below reset to 1 BNB.
  const timelockBalance = await ethers.provider.getBalance(NORMAL_TIMELOCK);
  const CTBTC_ADDRESS = CTBTC === ethers.constants.AddressZero ? await deployCtBTCStandIn() : CTBTC;

  // BTCB as the chain has it, before the price helpers below lengthen its stale periods.
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const subOracle = (address: string) =>
    new ethers.Contract(
      address,
      [...CHAINLINK_ORACLE_ABI, "function setDirectPrice(address asset, uint256 price)"],
      ethers.provider,
    );
  const btcbPriceAtFork: BigNumber = await resilientOracle.getPrice(BTCB);
  const btcbFeedsAtFork = await Promise.all(BTCB_FEEDS.map(({ oracle }) => subOracle(oracle).tokenConfigs(BTCB)));

  // createVault prices ctBTC from the feeds the VIP adds, after the governance warp; each pin is the feed's price.
  // Pinned before VIP-681's warp to its ETA, which leaves BTCB's 100-second feeds stale.
  for (const { oracle, feed, maxStalePeriod } of BTCB_FEEDS) {
    await pinOracleFeedPrice(oracle, { asset: CTBTC_ADDRESS, feed, maxStalePeriod });
  }
  await bypassStalePrices([USDT, BTCB]);
  await setBalance(NORMAL_TIMELOCK, timelockBalance);
  await executeQueuedVip681();

  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, ethers.provider);
  const acm = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const ctBTC = new ethers.Contract(CTBTC_ADDRESS, CTBTC_ABI, ethers.provider);
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);
  const frvSource = new ethers.Contract(FRV_SOURCE_USDT, FRV_SOURCE_ABI, ethers.provider);
  const hub = new ethers.Contract(USDT_HUB, HUB_ABI, ethers.provider);
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
  const liquidationAdapter = new ethers.Contract(LIQUIDATION_ADAPTER, ADAPTER_ABI, ethers.provider);

  let vaultsBefore: BigNumber;
  let openSnapshot: SnapshotRestorer;
  let fundraisingSnapshot: SnapshotRestorer;
  let positionTokenIdBefore: BigNumber;
  let predictedVault: string;
  let timelock: SignerWithAddress;
  let criticalGuardian: SignerWithAddress;

  const isAllowed = (account: string, role: string): Promise<boolean> =>
    acm.isAllowedToCall(account, role, { from: CTBTC_ADDRESS });

  // Test-only: prices ctBTC at `price` on all three of its sub-oracles, keeping the VIP's ResilientOracle config.
  const setCtBTCPrice = async (price: BigNumber) => {
    for (const { oracle } of BTCB_FEEDS) {
      await subOracle(oracle).connect(timelock).setDirectPrice(CTBTC_ADDRESS, price);
    }
    expect(await resilientOracle.getPrice(CTBTC_ADDRESS)).to.equal(price);
  };

  before(async () => {
    vaultsBefore = await controller.allVaultsLength();
    positionTokenIdBefore = await positionToken.nextTokenId();
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);
    timelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("1"));
    criticalGuardian = await initMainnetUser(CRITICAL_GUARDIAN, parseUnits("1"));
  });

  describe("Pre-VIP behavior", () => {
    it("VIP-681 has executed, so the USDT FRV source runs on its AdapterFRV", async () => {
      const resources: string[] = await frvSource.resources();
      expect(resources.length).to.be.gt(0);
      for (const resource of resources) {
        expect((await frvSource.resourceConfig(resource)).adapter).to.equal(ADAPTER_FRV);
      }
    });

    it("ctBTC is an empty 18-decimal Custodian BTC with the Normal Timelock nominated as owner", async () => {
      expect(await ctBTC.name()).to.equal("Custodian BTC");
      expect(await ctBTC.symbol()).to.equal("ctBTC");
      expect(await ctBTC.decimals()).to.equal(18);
      expect(await ctBTC.totalSupply()).to.equal(0);
      expect(await ctBTC.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      expect(await ctBTC.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await ctBTC.paused()).to.equal(false);
    });

    it("no one holds a ctBTC role yet", async () => {
      for (const role of CTBTC_ROLES) {
        for (const account of CTBTC_ROLE_HOLDERS) {
          expect(await isAllowed(account, role)).to.equal(false);
        }
      }
    });

    it("ctBTC is not priced on Venus yet", async () => {
      await expect(resilientOracle.getPrice(CTBTC_ADDRESS)).to.be.reverted;
    });

    it("BTCB's oracle config is the one the VIP copies", async () => {
      BTCB_FEEDS.forEach(({ feed, maxStalePeriod }, i) => {
        expect(btcbFeedsAtFork[i].feed).to.equal(feed);
        expect(btcbFeedsAtFork[i].maxStalePeriod).to.equal(maxStalePeriod);
      });
      const roConfig = await resilientOracle.getTokenConfig(BTCB);
      expect(roConfig.oracles).to.deep.equal(BTCB_RESILIENT_ORACLES);
      expect(roConfig.enableFlagsForOracles).to.deep.equal([true, true, true]);
      const bounds = await boundValidator.validateConfigs(BTCB);
      expect(bounds.upperBoundRatio).to.equal(BTCB_UPPER_BOUND);
      expect(bounds.lowerBoundRatio).to.equal(BTCB_LOWER_BOUND);
    });

    it("LTP_VAULT is the controller's predicted vault for the operator", async () => {
      expect(await controller.institutionNonce(INSTITUTION_OPERATOR)).to.equal(0);
      expect(predictedVault).to.equal(LTP_VAULT);
      expect(await ethers.provider.getCode(LTP_VAULT)).to.equal("0x");
    });

    it("USDT FRV source does not list the vault yet, and has room for the full 1M USDT", async () => {
      expect(await frvSource.asset()).to.equal(USDT);
      expect(await frvSource.resources()).to.not.include(predictedVault);
      const headroom = (await hub.yieldGroupEffectiveCap(FRV_SOURCE_USDT)).sub(await frvSource.totalAssets());
      expect(headroom).to.be.gte(MAX_BORROW_CAP);
    });

    it("LiquidationAdapter already sends half of the incentive to the protocol", async () => {
      expect(await liquidationAdapter.protocolLiquidationShare()).to.equal(parseUnits("0.5", 18));
      expect(await liquidationAdapter.isWhitelistedLiquidator(CRITICAL_GUARDIAN)).to.equal(true);
      expect(await liquidationAdapter.isWhitelistedSettler(CRITICAL_GUARDIAN)).to.equal(true);
    });
  });

  testVip("VIP-684 List the LTP ctBTC Fixed-Term Institutional Loan Vault", await vip684(CTBTC_ADDRESS), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [3]);
      await expectEvents(txResponse, [BOUND_VALIDATOR_ABI], ["ValidateConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [CTBTC_ABI], ["OwnershipTransferred"], [1]);
      // The mainnet ACM emits no PermissionGranted, so RoleGranted is the count.
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [CTBTC_ROLES.length * CTBTC_ROLE_HOLDERS.length]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
    });

    it("prices ctBTC from BTCB's feeds, oracle order and bound", async () => {
      for (const { oracle, feed, maxStalePeriod } of BTCB_FEEDS) {
        const config = await subOracle(oracle).tokenConfigs(CTBTC_ADDRESS);
        expect(config.feed).to.equal(feed);
        expect(config.maxStalePeriod).to.equal(maxStalePeriod);
      }
      const roConfig = await resilientOracle.getTokenConfig(CTBTC_ADDRESS);
      expect(roConfig.oracles).to.deep.equal(BTCB_RESILIENT_ORACLES);
      expect(roConfig.enableFlagsForOracles).to.deep.equal([true, true, true]);
      expect(roConfig.cachingEnabled).to.equal(false);
      const bounds = await boundValidator.validateConfigs(CTBTC_ADDRESS);
      expect(bounds.upperBoundRatio).to.equal(BTCB_UPPER_BOUND);
      expect(bounds.lowerBoundRatio).to.equal(BTCB_LOWER_BOUND);
      // Each sub-oracle is pinned at its feed's price at the fork block, so ctBTC reads BTCB's price there.
      expect(await resilientOracle.getPrice(CTBTC_ADDRESS)).to.equal(btcbPriceAtFork);
    });

    it("hands ctBTC to the Normal Timelock", async () => {
      expect(await ctBTC.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await ctBTC.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("grants mint, burn, pause and unpause to the Normal Timelock and the Critical Guardian only", async () => {
      for (const role of CTBTC_ROLES) {
        for (const account of CTBTC_ROLE_HOLDERS) {
          expect(await isAllowed(account, role)).to.equal(true);
        }
        for (const account of [INSTITUTION_OPERATOR, HUB_OPERATOR]) {
          expect(await isAllowed(account, role)).to.equal(false);
        }
      }
    });

    it("mints the whole 20 ctBTC supply to LTP", async () => {
      expect(await ctBTC.totalSupply()).to.equal(CTBTC_MINT_AMOUNT);
      expect(await ctBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(CTBTC_MINT_AMOUNT);
    });

    it("creates the vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(predictedVault);
      expect(await controller.isRegistered(vault.address)).to.equal(true);
    });

    it("sets the loan terms", async () => {
      const config = await vault.config();
      expect(config.supplyAsset).to.equal(USDT);
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
      expect(inst.collateralAsset).to.equal(CTBTC_ADDRESS);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(positionTokenIdBefore);
      expect(await positionToken.vaultToTokenId(vault.address)).to.equal(inst.positionTokenId);
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

    it("adds the vault to the USDT FRV source", async () => {
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
      expect(await adapterFrv.resourceName(vault.address)).to.equal(VAULT_NAME);
    });
  });

  describe("Post-VIP ctBTC controls", () => {
    let restore: SnapshotRestorer;

    before(async () => {
      restore = await takeSnapshot();
    });

    after(async () => {
      await restore.restore();
    });

    it("Critical Guardian pauses transfers; mint and burn still work", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await ctBTC.connect(criticalGuardian).pause();
      await expect(ctBTC.connect(operator).transfer(HUB_OPERATOR, 1)).to.be.revertedWithCustomError(
        ctBTC,
        "ActionPaused",
      );
      await ctBTC.connect(criticalGuardian).mint(HUB_OPERATOR, 1);
      await ctBTC.connect(timelock).burn(HUB_OPERATOR, 1);
      await ctBTC.connect(criticalGuardian).unpause();
      await ctBTC.connect(operator).transfer(HUB_OPERATOR, 1);
    });

    it("the operator cannot mint or burn ctBTC", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await expect(ctBTC.connect(operator).mint(INSTITUTION_OPERATOR, 1)).to.be.revertedWithCustomError(
        ctBTC,
        "Unauthorized",
      );
      await expect(ctBTC.connect(operator).burn(INSTITUTION_OPERATOR, 1)).to.be.revertedWithCustomError(
        ctBTC,
        "Unauthorized",
      );
    });
  });

  describe("Post-VIP vault lifecycle", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    let livePrice: BigNumber;

    const LENDER_DEPOSIT = MAX_BORROW_CAP;

    const EXPECTED_INTEREST = termInterest(MAX_BORROW_CAP);
    const EXPECTED_DEBT_AT_MATURITY = MAX_BORROW_CAP.add(EXPECTED_INTEREST);
    const EXPECTED_PROTOCOL_FEE = reserveCut(EXPECTED_INTEREST);
    const TOTAL_ASSETS_AT_MATURITY = EXPECTED_DEBT_AT_MATURITY.sub(EXPECTED_PROTOCOL_FEE);
    const EXPECTED_LENDER_PROCEEDS = previewRedeemAt(LENDER_DEPOSIT, TOTAL_ASSETS_AT_MATURITY, MAX_BORROW_CAP);

    before(async () => {
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
      livePrice = await resilientOracle.getPrice(CTBTC_ADDRESS);
    });

    it("the 100% margin is the whole collateral: less than all of it is refused", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await ctBTC.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
      await expect(vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(1))).to.be.reverted;
    });

    it("operator deposits all 20 ctBTC as the margin", async () => {
      await expect(vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(IDEAL_COLLATERAL_AMOUNT, IDEAL_COLLATERAL_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect(await ctBTC.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("guardian opens the vault, collateral valued at the BTC price", async () => {
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      openSnapshot = await takeSnapshot();

      expect(await vault.getCollateralValueUSD()).to.equal(
        IDEAL_COLLATERAL_AMOUNT.mul(livePrice).div(parseUnits("1", 18)),
      );
      fundraisingSnapshot = await takeSnapshot();
    });

    it("lender supplies 1M USDT for 1:1 shares", async () => {
      const whale = await initMainnetUser(USDT_WHALE, parseUnits("40"));
      await usdt.connect(whale).transfer(lender.address, LENDER_DEPOSIT);
      expect(await vault.maxDeposit(lender.address)).to.equal(MAX_BORROW_CAP);

      await usdt.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lender.address);

      expect(await vault.balanceOf(lender.address)).to.equal(LENDER_DEPOSIT);
      expect((await vault.runtime()).totalRaised).to.equal(MAX_BORROW_CAP);
      expect(await vault.maxDeposit(lender.address)).to.equal(0);
    });

    it("adapter reports the 4.68% supply APY, net of the reserve factor", async () => {
      expect(await adapterFrv.spotAPYBps(vault.address, 0)).to.equal(468);
    });

    it("vault locks after the 1-day open window", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("operator claims the 1M USDT; the debt includes the whole 90-day coupon", async () => {
      const before = await usdt.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await usdt.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      expect(await vault.outstandingDebt()).to.equal(EXPECTED_DEBT_AT_MATURITY);
      expect(EXPECTED_DEBT_AT_MATURITY).to.be.closeTo(parseUnits("1012822", 18), parseUnits("1", 18));
    });

    it("full drawdown is healthy at the live BTC price", async () => {
      const [liquidity, shortfall] = await vault.getVaultLiquidity();
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
    });

    it("operator repays in full after the 90-day term", async () => {
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

      const owed = await vault.outstandingDebt();
      expect(owed).to.equal(EXPECTED_DEBT_AT_MATURITY);

      const whale = await initMainnetUser(USDT_WHALE, parseUnits("40"));
      await usdt.connect(whale).transfer(INSTITUTION_OPERATOR, owed.sub(MAX_BORROW_CAP));
      await usdt.connect(operator).approve(vault.address, owed);
      const psrBefore = await usdt.balanceOf(PROTOCOL_SHARE_RESERVE);
      await vault.connect(operator).repay(owed);

      expect(await vault.state()).to.equal(VaultState.Matured);
      expect(await vault.outstandingDebt()).to.equal(0);
      expect((await usdt.balanceOf(PROTOCOL_SHARE_RESERVE)).sub(psrBefore)).to.equal(EXPECTED_PROTOCOL_FEE);
    });

    it("lender redeems principal plus interest", async () => {
      const shares = await vault.balanceOf(lender.address);
      const assets = await vault.previewRedeem(shares);
      expect(assets).to.equal(EXPECTED_LENDER_PROCEEDS);

      const before = await usdt.balanceOf(lender.address);
      await vault.connect(lender).redeem(shares, lender.address, lender.address);
      expect(await usdt.balanceOf(lender.address)).to.equal(before.add(assets));
    });

    it("operator withdraws all collateral", async () => {
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await ctBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await ctBTC.balanceOf(vault.address)).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
    });

    it("Critical Guardian burns the returned ctBTC when the custody BTC is released", async () => {
      await ctBTC.connect(criticalGuardian).burn(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
      expect(await ctBTC.totalSupply()).to.equal(0);
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
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
    });

    it("Hub operator fills the whole 1M USDT vault from Core", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: USDT_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: FRV_SOURCE_USDT, resource: vault.address, amount: HUB_ALLOCATION }],
        );

      expect(await vault.balanceOf(FRV_SOURCE_USDT)).to.equal(HUB_ALLOCATION);
      expect(await adapterFrv.totalAssets(vault.address, FRV_SOURCE_USDT)).to.equal(HUB_ALLOCATION);
      expect((await vault.runtime()).totalRaised).to.equal(HUB_ALLOCATION);
    });

    it("Hub cannot withdraw from the vault during Lock", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
      expect(await adapterFrv.maxWithdraw(vault.address, FRV_SOURCE_USDT)).to.equal(0);

      await expect(
        hub
          .connect(hubOperator)
          .reallocate(
            [{ yieldGroup: FRV_SOURCE_USDT, resource: vault.address, amount: HUB_ALLOCATION }],
            [{ yieldGroup: USDT_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
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

      const whale = await initMainnetUser(USDT_WHALE, parseUnits("40"));
      await usdt.connect(whale).transfer(INSTITUTION_OPERATOR, owed.sub(HUB_ALLOCATION));
      await usdt.connect(operator).approve(vault.address, owed);
      await vault.connect(operator).repay(owed);
      expect(await vault.state()).to.equal(VaultState.Matured);
    });

    it("Hub operator moves principal plus interest back to Core", async () => {
      expect(await adapterFrv.maxWithdraw(vault.address, FRV_SOURCE_USDT)).to.equal(EXPECTED_HUB_PROCEEDS);

      // reallocate reverts unless the vault delivers exactly this amount into Core.
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: FRV_SOURCE_USDT, resource: vault.address, amount: EXPECTED_HUB_PROCEEDS }],
          [{ yieldGroup: USDT_CORE_SOURCE, resource: NO_RESOURCE, amount: EXPECTED_HUB_PROCEEDS }],
        );

      expect(await vault.balanceOf(FRV_SOURCE_USDT)).to.equal(0);
      expect(await adapterFrv.totalAssets(vault.address, FRV_SOURCE_USDT)).to.equal(0);
    });
  });

  describe("Post-VIP liquidation", () => {
    let vault: Contract;
    let lockSnapshot: SnapshotRestorer;
    const REPAY = parseUnits("10000", 18);

    // Runs one adapter liquidation and checks every leg against the vault's seize math:
    // seize = repay x USDT price x incentive / ctBTC price; the adapter keeps its share of the bonus.
    const expectLiquidation = async (liquidate: () => Promise<unknown>, incentive: BigNumber) => {
      const seize = REPAY.mul(await resilientOracle.getPrice(USDT))
        .div(parseUnits("1", 18))
        .mul(incentive)
        .div(await resilientOracle.getPrice(CTBTC_ADDRESS));
      const bonus = seize.sub(seize.mul(parseUnits("1", 18)).div(incentive));
      const protocolShare = bonus.div(2);
      const debtBefore = await vault.outstandingDebt();
      const liquidatorBefore = await ctBTC.balanceOf(CRITICAL_GUARDIAN);

      await liquidate();

      expect((await ctBTC.balanceOf(CRITICAL_GUARDIAN)).sub(liquidatorBefore)).to.equal(seize.sub(protocolShare));
      expect(await ctBTC.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT.sub(seize));
      expect(await liquidationAdapter.protocolShareAccrued(CTBTC_ADDRESS)).to.equal(protocolShare);
      expect(await vault.outstandingDebt()).to.equal(debtBefore.sub(REPAY));
    };

    const fundCriticalGuardian = async () => {
      const whale = await initMainnetUser(USDT_WHALE, parseUnits("40"));
      await usdt.connect(whale).transfer(CRITICAL_GUARDIAN, REPAY);
      await usdt.connect(criticalGuardian).approve(liquidationAdapter.address, REPAY);
    };

    before(async () => {
      await fundraisingSnapshot.restore();
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      const [, lender] = await ethers.getSigners();

      const whale = await initMainnetUser(USDT_WHALE, parseUnits("40"));
      await usdt.connect(whale).transfer(lender.address, MAX_BORROW_CAP);
      await usdt.connect(lender).approve(vault.address, MAX_BORROW_CAP);
      await vault.connect(lender).deposit(MAX_BORROW_CAP, lender.address);
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      await vault.connect(operator).claimRaisedFunds();

      // Test-only: lets the Normal Timelock set ctBTC direct prices on every sub-oracle.
      for (const { oracle } of BTCB_FEEDS) {
        await acm.connect(timelock).giveCallPermission(oracle, "setDirectPrice(address,uint256)", NORMAL_TIMELOCK);
      }
      lockSnapshot = await takeSnapshot();
    });

    it("the 92% threshold is crossed at the BTC price stated in the VIP", async () => {
      // collateral x price x 92% = debt in USD
      const debtUSD = (await vault.outstandingDebt())
        .mul(await resilientOracle.getPrice(USDT))
        .div(parseUnits("1", 18));
      const liquidationPrice = debtUSD
        .mul(parseUnits("1", 18))
        .div(IDEAL_COLLATERAL_AMOUNT.mul(LIQUIDATION_THRESHOLD).div(parseUnits("1", 18)));
      expect(liquidationPrice).to.be.closeTo(DESCRIBED_LIQUIDATION_PRICE, parseUnits("60", 18));

      await setCtBTCPrice(liquidationPrice.mul(1001).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.equal(0);
      await setCtBTCPrice(liquidationPrice.mul(999).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);
    });

    it("Critical Guardian liquidates an underwater vault during Lock (HF)", async () => {
      await lockSnapshot.restore();
      await fundCriticalGuardian();
      await setCtBTCPrice(parseUnits("50000", 18));
      expect(await vault.state()).to.equal(VaultState.Lock);
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);

      await expectLiquidation(
        () => liquidationAdapter.connect(criticalGuardian).liquidate(vault.address, REPAY),
        LIQUIDATION_INCENTIVE,
      );
    });

    it("protocol share of the seized ctBTC sweeps to the PSR", async () => {
      const accrued = await liquidationAdapter.protocolShareAccrued(CTBTC_ADDRESS);
      expect(accrued).to.be.gt(0);
      await liquidationAdapter.connect(timelock).sweepProtocolShareToReserve(CTBTC_ADDRESS);
      expect(await ctBTC.balanceOf(PROTOCOL_SHARE_RESERVE)).to.equal(accrued);
      expect(await liquidationAdapter.protocolShareAccrued(CTBTC_ADDRESS)).to.equal(0);
    });

    it("Critical Guardian liquidates the vault once the settlement deadline passes (overdue)", async () => {
      await lockSnapshot.restore(); // back to the healthy, locked vault
      await fundCriticalGuardian();
      await time.increase(LOCK_DURATION + SETTLEMENT_WINDOW + 2);
      await vault.connect(criticalGuardian).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.SettlementDeadlineExceeded);
      await setCtBTCPrice(btcbPriceAtFork);

      await expectLiquidation(
        () => liquidationAdapter.connect(criticalGuardian).liquidateOverdueVault(vault.address, REPAY),
        LATE_PENALTY_RATE,
      );
    });
  });

  // With a 100% margin the vault can only fail for an undersubscribed raise, never for a collateral shortfall.
  describe("Post-VIP failed raise", () => {
    let vault: Contract;

    before(async () => {
      await openSnapshot.restore();
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
    });

    it("fails without a default when less than 10 USDT is raised", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(false);
      expect(runtime.confiscatedMarginRemaining).to.equal(0);
    });

    it("operator takes back all the ctBTC", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await ctBTC.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await ctBTC.balanceOf(vault.address)).to.equal(0);
    });
  });
});
