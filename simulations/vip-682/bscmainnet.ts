import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder, hexZeroPad, keccak256, parseUnits, solidityPack } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices, pinOracleFeedPrice } from "src/vip-framework/oracleStaleness";

import vip682, {
  ADAPTER_FRV,
  CHAINLINK_ORACLE,
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
  MARGIN_RATE,
  MAX_BORROW_CAP,
  MAX_STALE_PERIOD,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  NOON_VAULT,
  OPEN_DURATION,
  OPS_FUND_MULTISIG,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  STORK,
  SUSN,
  SUSN_STORK_FEED,
  SUSN_STORK_FEED_ID,
  U,
  U_FRV_SOURCE,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-682/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import ADAPTER_ABI from "./abi/LiquidationAdapter.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 133289000;

const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
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

// sUSN price at which the debt crosses the 86% threshold, as stated in the VIP description.
const DESCRIBED_LIQUIDATION_PRICE = parseUnits("1.014", 18);

// FOLLOW-UP: SUSN_STORK_FEED is not deployed yet. Until it is, the sim installs this reference adapter there:
// Stork's StorkChainlinkAdapter with startedAt/updatedAt in seconds. Source (solc 0.8.25, optimizer 200 runs):
//   contract StorkChainlinkAdapterSeconds {
//     IStork public immutable stork;
//     bytes32 public immutable priceId;
//     constructor(IStork stork_, bytes32 priceId_) { stork = stork_; priceId = priceId_; }
//     function decimals() external pure returns (uint8) { return 18; }
//     function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
//       IStork.TemporalNumericValue memory value = stork.getTemporalNumericValueUnsafeV1(priceId);
//       uint256 updatedAt = value.timestampNs / 1e9;
//       return (uint80(value.timestampNs), value.quantizedValue, updatedAt, updatedAt, uint80(value.timestampNs));
//     }
//   }
const REFERENCE_ADAPTER_BYTECODE =
  "0x60c0604052348015600e575f80fd5b50604051610388380380610388833981016040819052602b916040565b6001600160a01b0390911660805260a0526075565b5f80604083850312156050575f80fd5b82516001600160a01b03811681146065575f80fd5b6020939093015192949293505050565b60805160a0516102e66100a25f395f81816053015261014c01525f8181609c015261011d01526102e65ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c8063311893341461004e578063313ce567146100885780635515f7f614610097578063feaf968c146100d6575b5f80fd5b6100757f000000000000000000000000000000000000000000000000000000000000000081565b6040519081526020015b60405180910390f35b6040516012815260200161007f565b6100be7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b03909116815260200161007f565b6100de610115565b6040805169ffffffffffffffffffff968716815260208101959095528401929092526060830152909116608082015260a00161007f565b5f805f805f807f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663f69058c17f00000000000000000000000000000000000000000000000000000000000000006040518263ffffffff1660e01b815260040161018991815260200190565b6040805180830381865afa1580156101a3573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101c79190610206565b80519091506101db90633b9aca009061027e565b815160209092015167ffffffffffffffff928316975060170b95501692508291508490509091929394565b5f60408284031215610216575f80fd5b6040516040810167ffffffffffffffff828210818311171561024657634e487b7160e01b5f52604160045260245ffd5b8160405284519150808216821461025b575f80fd5b5081526020830151601781900b8114610272575f80fd5b60208201529392505050565b5f67ffffffffffffffff808416806102a457634e487b7160e01b5f52601260045260245ffd5b9216919091049291505056fea2646970667358221220ba648031f35edb2fce51f945bd9b430e922fe564cc4896302ba87ad76157275564736f6c63430008190033";

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
  const chainlinkOracle = new ethers.Contract(
    CHAINLINK_ORACLE,
    [...CHAINLINK_ORACLE_ABI, "function setDirectPrice(address asset, uint256 price)"],
    ethers.provider,
  );
  const sUSN = new ethers.Contract(
    SUSN,
    [
      ...ERC20_ABI,
      "function paused() view returns (bool)",
      "function blacklist(address) view returns (bool)",
      "function handle(uint32 origin, bytes32 sender, bytes message) payable",
    ],
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
  let liveRate: BigNumber;
  let susnDirectPriceOnChain: BigNumber;

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
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));
    liveRate = (await stork.getTemporalNumericValueUnsafeV1(SUSN_STORK_FEED_ID)).quantizedValue;
    susnDirectPriceOnChain = await chainlinkOracle.prices(SUSN);

    expect(await ethers.provider.getCode(SUSN_STORK_FEED)).to.equal("0x");
    const [deployer] = await ethers.getSigners();
    const reference = await new ethers.ContractFactory(
      ["constructor(address stork, bytes32 priceId)"],
      REFERENCE_ADAPTER_BYTECODE,
      deployer,
    ).deploy(STORK, SUSN_STORK_FEED_ID);
    await ethers.provider.send("hardhat_setCode", [SUSN_STORK_FEED, await ethers.provider.getCode(reference.address)]);

    // createVault prices sUSN from the feed the VIP adds, after the governance warp; the pin is lifted after the VIP.
    await pinOracleFeedPrice(CHAINLINK_ORACLE, {
      asset: SUSN,
      feed: SUSN_STORK_FEED,
      maxStalePeriod: MAX_STALE_PERIOD,
    });
    await bypassStalePrices([U]);
  });

  describe("Pre-VIP behavior", () => {
    it("sUSN is the 18-decimal Staked USN, unpaused, with neither the vault nor the operator blacklisted", async () => {
      expect(await sUSN.symbol()).to.equal("sUSN");
      expect(await sUSN.decimals()).to.equal(18);
      expect(await u.decimals()).to.equal(18);
      expect(await sUSN.paused()).to.equal(false);
      expect(await sUSN.blacklist(predictedVault)).to.equal(false);
      expect(await sUSN.blacklist(INSTITUTION_OPERATOR)).to.equal(false);
    });

    it("sUSN is not priced on Venus yet", async () => {
      expect((await chainlinkOracle.tokenConfigs(SUSN)).feed).to.equal(ethers.constants.AddressZero);
      expect(susnDirectPriceOnChain).to.equal(0);
      await expect(resilientOracle.getPrice(SUSN)).to.be.reverted;
    });

    it("Stork's sUSN feed is fresh and within 1% of the $1.24 deal price", async () => {
      const value = await stork.getTemporalNumericValueUnsafeV1(SUSN_STORK_FEED_ID);
      expect((await time.latest()) - value.timestampNs.div(1e9).toNumber()).to.be.lte(MAX_STALE_PERIOD);
      expect(value.quantizedValue).to.be.closeTo(parseUnits("1.24", 18), parseUnits("0.0124", 18));
    });

    it("NOON_VAULT is the controller's predicted vault for the operator", async () => {
      expect(await controller.institutionNonce(INSTITUTION_OPERATOR)).to.equal(0);
      expect(predictedVault).to.equal(NOON_VAULT);
      expect(await ethers.provider.getCode(NOON_VAULT)).to.equal("0x");
    });

    it("neither liquidator is whitelisted yet", async () => {
      for (const liquidator of [LIQUIDATOR_BOT, OPS_FUND_MULTISIG]) {
        expect(await liquidationAdapter.isWhitelistedLiquidator(liquidator)).to.equal(false);
        expect(await liquidationAdapter.isWhitelistedSettler(liquidator)).to.equal(false);
      }
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

    it("U Hub's FRV yield group has room for the full 1M U", async () => {
      const headroom = (await hub.yieldGroupEffectiveCap(U_FRV_SOURCE)).sub(await frvSource.totalAssets());
      expect(headroom).to.be.gte(MAX_BORROW_CAP);
    });

    it("LiquidationAdapter already sends half of the incentive to the protocol", async () => {
      expect(await liquidationAdapter.protocolLiquidationShare()).to.equal(parseUnits("0.5", 18));
      expect(await liquidationAdapter.protocolShareAccrued(SUSN)).to.equal(0);
    });
  });

  testVip("VIP-682 List the Noon Capital sUSN Fixed-Term Institutional Loan Vault", await vip682(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [ADAPTER_ABI], ["LiquidatorWhitelistUpdated", "SettlerWhitelistUpdated"], [2, 2]);
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      // Lift the sim's pin so sUSN is read from the Stork feed from here on.
      await chainlinkOracle.connect(timelock).setDirectPrice(SUSN, 0);
    });

    it("prices sUSN from the Stork feed through the ChainlinkOracle", async () => {
      const config = await chainlinkOracle.tokenConfigs(SUSN);
      expect(config.asset).to.equal(SUSN);
      expect(config.feed).to.equal(SUSN_STORK_FEED);
      expect(config.maxStalePeriod).to.equal(MAX_STALE_PERIOD);

      const roConfig = await resilientOracle.getTokenConfig(SUSN);
      expect(roConfig.oracles).to.deep.equal([
        CHAINLINK_ORACLE,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect(roConfig.enableFlagsForOracles).to.deep.equal([true, false, false]);
      expect(roConfig.cachingEnabled).to.equal(false);

      await setStorkRate(liveRate);
    });

    it("stops pricing sUSN once the feed is older than 3,900s", async () => {
      const fresh = await takeSnapshot();
      await time.increase(MAX_STALE_PERIOD - 10);
      expect(await resilientOracle.getPrice(SUSN)).to.equal(liveRate);
      await time.increase(20);
      await expect(resilientOracle.getPrice(SUSN)).to.be.reverted;
      await fresh.restore();
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
      expect(inst.collateralAsset).to.equal(SUSN);
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

    it("whitelists both liquidators for both paths, and keeps the Critical Guardian", async () => {
      for (const liquidator of [LIQUIDATOR_BOT, OPS_FUND_MULTISIG, bscmainnet.CRITICAL_GUARDIAN]) {
        expect(await liquidationAdapter.isWhitelistedLiquidator(liquidator)).to.equal(true);
        expect(await liquidationAdapter.isWhitelistedSettler(liquidator)).to.equal(true);
      }
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

      // The whole 1,152,073.71 sUSN fits through the bridge's inbound rate limit in one transfer.
      await bridgeSUSN(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("the 100% margin is the whole collateral: less than all of it is refused", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await sUSN.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
      await expect(vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(1))).to.be.reverted;
    });

    it("operator deposits all 1,152,073.71 sUSN as the margin", async () => {
      await expect(vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(IDEAL_COLLATERAL_AMOUNT, IDEAL_COLLATERAL_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect(await sUSN.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("guardian opens the vault, collateral valued at the Stork rate", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      openSnapshot = await takeSnapshot();

      await setStorkRate(liveRate);
      expect(await vault.getCollateralValueUSD()).to.equal(
        IDEAL_COLLATERAL_AMOUNT.mul(liveRate).div(parseUnits("1", 18)),
      );
      fundraisingSnapshot = await takeSnapshot();
    });

    it("lender supplies 1M U for 1:1 shares", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lenderAddress, LENDER_DEPOSIT);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP);

      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lenderAddress);

      expect(await vault.balanceOf(lenderAddress)).to.equal(LENDER_DEPOSIT);
      expect((await vault.runtime()).totalRaised).to.equal(MAX_BORROW_CAP);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(0);
    });

    it("adapter reports the 5.4% supply APY, net of the reserve factor", async () => {
      expect(await adapterFrv.spotAPYBps(vault.address, 0)).to.equal(540);
    });

    it("vault locks after the 1-day open window", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("operator claims the 1M U", async () => {
      await setStorkRate(liveRate);
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      expect(await vault.outstandingDebt()).to.equal(EXPECTED_DEBT_AT_MATURITY);
    });

    it("full drawdown is healthy at the live rate", async () => {
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
      expect(await sUSN.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(vault.address)).to.equal(0);
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

    it("Hub operator fills the whole 1M U vault from Core", async () => {
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
      await setStorkRate(liveRate);
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
    let lockSnapshot: SnapshotRestorer;
    const REPAY = parseUnits("10000", 18);

    // Runs one adapter liquidation and checks every leg against the vault's seize math:
    // seize = repay x U price x incentive / sUSN price; the adapter keeps its share of the bonus.
    const expectLiquidation = async (
      liquidator: SignerWithAddress,
      liquidate: () => Promise<unknown>,
      incentive: BigNumber,
    ) => {
      const seize = REPAY.mul(await resilientOracle.getPrice(U))
        .div(parseUnits("1", 18))
        .mul(incentive)
        .div(await resilientOracle.getPrice(SUSN));
      const bonus = seize.sub(seize.mul(parseUnits("1", 18)).div(incentive));
      const protocolShare = bonus.div(2);
      const debtBefore = await vault.outstandingDebt();
      const liquidatorBefore = await sUSN.balanceOf(liquidator.address);

      await liquidate();

      expect((await sUSN.balanceOf(liquidator.address)).sub(liquidatorBefore)).to.equal(seize.sub(protocolShare));
      expect(await sUSN.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT.sub(seize));
      expect(await liquidationAdapter.protocolShareAccrued(SUSN)).to.equal(protocolShare);
      expect(await vault.outstandingDebt()).to.equal(debtBefore.sub(REPAY));
    };

    const fundedLiquidator = async (address: string) => {
      const liquidator = await initMainnetUser(address, parseUnits("1"));
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(address, REPAY);
      await u.connect(liquidator).approve(liquidationAdapter.address, REPAY);
      return liquidator;
    };

    before(async () => {
      await fundraisingSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      const [, lender] = await ethers.getSigners();

      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lender.address, MAX_BORROW_CAP);
      await u.connect(lender).approve(vault.address, MAX_BORROW_CAP);
      await vault.connect(lender).deposit(MAX_BORROW_CAP, lender.address);
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      await setStorkRate(liveRate);
      await vault.connect(operator).claimRaisedFunds();
      lockSnapshot = await takeSnapshot();
    });

    it("the 86% threshold is crossed at the sUSN price stated in the VIP", async () => {
      // collateral x price x 86% = debt in USD
      const debtUSD = (await vault.outstandingDebt()).mul(await resilientOracle.getPrice(U)).div(parseUnits("1", 18));
      const liquidationPrice = debtUSD
        .mul(parseUnits("1", 18))
        .div(IDEAL_COLLATERAL_AMOUNT.mul(LIQUIDATION_THRESHOLD).div(parseUnits("1", 18)));
      expect(liquidationPrice).to.be.closeTo(DESCRIBED_LIQUIDATION_PRICE, parseUnits("0.001", 18));

      await setStorkRate(liquidationPrice.mul(1001).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.equal(0);
      await setStorkRate(liquidationPrice.mul(999).div(1000));
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);
    });

    it("liquidator bot liquidates an underwater vault during Lock (HF)", async () => {
      await lockSnapshot.restore();
      const bot = await fundedLiquidator(LIQUIDATOR_BOT);
      await setStorkRate(parseUnits("0.95", 18));
      expect(await vault.state()).to.equal(VaultState.Lock);
      expect((await vault.getVaultLiquidity())[1]).to.be.gt(0);

      await expectLiquidation(
        bot,
        () => liquidationAdapter.connect(bot).liquidate(vault.address, REPAY),
        LIQUIDATION_INCENTIVE,
      );
    });

    it("protocol share of the seized sUSN sweeps to the PSR", async () => {
      const accrued = await liquidationAdapter.protocolShareAccrued(SUSN);
      expect(accrued).to.be.gt(0);
      const psrBefore = await sUSN.balanceOf(PROTOCOL_SHARE_RESERVE);
      await liquidationAdapter.connect(timelock).sweepProtocolShareToReserve(SUSN);
      expect((await sUSN.balanceOf(PROTOCOL_SHARE_RESERVE)).sub(psrBefore)).to.equal(accrued);
      expect(await liquidationAdapter.protocolShareAccrued(SUSN)).to.equal(0);
    });

    it("Operational Fund Multisig liquidates the vault once the settlement deadline passes (overdue)", async () => {
      await lockSnapshot.restore(); // back to the healthy, locked vault
      const opsFund = await fundedLiquidator(OPS_FUND_MULTISIG);
      await time.increase(LOCK_DURATION + SETTLEMENT_WINDOW + 2);
      await vault.connect(opsFund).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.SettlementDeadlineExceeded);
      await setStorkRate(liveRate);

      await expectLiquidation(
        opsFund,
        () => liquidationAdapter.connect(opsFund).liquidateOverdueVault(vault.address, REPAY),
        LATE_PENALTY_RATE,
      );
    });
  });

  // With a 100% margin the vault can only fail for an undersubscribed raise, never for a collateral shortfall.
  describe("Post-VIP failed raise", () => {
    let vault: Contract;

    before(async () => {
      await openSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
    });

    it("fails without a default when less than 10 U is raised", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(false);
      expect(runtime.confiscatedMarginRemaining).to.equal(0);
    });

    it("operator takes back all the sUSN", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(vault.address)).to.equal(0);
    });
  });
});
