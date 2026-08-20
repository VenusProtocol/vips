import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip658, {
  ADAPTER_FRV,
  ATLAS_ORACLE,
  FIXED_APY,
  HBNB,
  HBNB_FEED,
  HBNB_MAX_STALE_PERIOD,
  IDEAL_COLLATERAL_AMOUNT,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_NAME,
  INSTITUTION_OPERATOR,
  LATE_PENALTY_RATE,
  LIQUIDATION_INCENTIVE,
  LIQUIDATION_THRESHOLD,
  LOCK_DURATION,
  MARGIN_RATE,
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  OPEN_DURATION,
  RESERVE_FACTOR,
  RESILIENT_ORACLE,
  SETTLEMENT_WINDOW,
  U,
  U_FRV_SOURCE,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-658/bscmainnet";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import MANAGEMENT_ABI from "./abi/Management.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SECURITY_TOKEN_ABI from "./abi/SecurityToken.json";
import FEED_ABI from "./abi/SingleFeed.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 117020000;

// Minimal price-oracle stub that always returns 1e18.
//   contract StubOracle {
//       function getPrice(address) external pure returns (uint256) { return 1e18; }
//   }
const STUB_ORACLE_BYTECODE =
  "0x6080604052348015600e575f80fd5b5061015e8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c806341976e091461002d575b5f80fd5b610047600480360381019061004291906100cc565b61005d565b604051610054919061010f565b60405180910390f35b5f670de0b6b3a76400009050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009b82610072565b9050919050565b6100ab81610091565b81146100b5575f80fd5b50565b5f813590506100c6816100a2565b92915050565b5f602082840312156100e1576100e061006e565b5b5f6100ee848285016100b8565b91505092915050565b5f819050919050565b610109816100f7565b82525050565b5f6020820190506101225f830184610100565b9291505056fea26469706673582212209282f7f2d85233912d0088d6dc45ce2459097d2866597e41f0a286059758c12c64736f6c63430008190033";

const deployStubOracle = async (): Promise<Contract> => {
  const [deployer] = await ethers.getSigners();
  const factory = new ethers.ContractFactory(
    ["function getPrice(address) external pure returns (uint256)"],
    STUB_ORACLE_BYTECODE,
    deployer,
  );
  const stubOracle = await factory.deploy();
  await stubOracle.deployed();
  return stubOracle;
};

// DigiFT's compliance registry — hBNB reads every transfer permission from it.
const MANAGEMENT = "0x2b6d846B07D4DF426a297e4Fe152aca832d9b3B3";

// Seize-path participants DigiFT must whitelist for a liquidation to complete.
const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";

// One position NFT for the whole vault system (controller.positionToken()).
const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// IVaultTypes.VaultState
const VaultState = {
  WaitingForMargin: 0,
  MarginDeposited: 1,
  Fundraising: 2,
  Lock: 4,
  PendingSettlement: 5,
  Matured: 7,
};

const U_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const U_HUB = "0x0e5AA174d4F31b757a237eb1999DE151596788B0";
const U_CORE_SOURCE = "0x8A680F77A5367FA7cD33a02f51896Cb1d55159c3";
const HUB_OPERATOR = "0x83f426233B358A36953F6951161E76FB7c866a7A";
const NO_RESOURCE = ethers.constants.AddressZero;

const MANAGEMENT_SLOT = { whiteList: 0, restrictList: 1, blockList: 2, contractList: 3 };

// hBNB's own layout, read off its verified BaseERC20 source: name 0, symbol 1, decimals 2,
// _totalSupply 3, _balanceOf 4. Confirmed on chain — slot 3 holds 266.087295e18, matching
// totalSupply(), and slot 2 holds 18.
const HBNB_SLOT = { totalSupply: 3, balanceOf: 4 };

// ERC4626 redemption with the virtual asset/share offset of 1 the vault inherits: an exact holding of
// the whole supply redeems one wei short of totalAssets, and the dust stays in the vault.
const previewRedeemAt = (shares: BigNumber, totalAssets: BigNumber, totalSupply: BigNumber): BigNumber =>
  shares.mul(totalAssets.add(1)).div(totalSupply.add(1));

// Mirrors BaseVault._computeTotalInterest: totalRaised * fixedAPY * lockDuration / (BPS * YEAR),
// with YEAR = 365 days.
const BPS = 10_000;
const YEAR = 365 * 24 * 60 * 60;
const termInterest = (principal: BigNumber): BigNumber =>
  principal.mul(FIXED_APY).mul(LOCK_DURATION).div(BigNumber.from(BPS).mul(YEAR));

const reserveCut = (interest: BigNumber): BigNumber => interest.mul(RESERVE_FACTOR).div(parseUnits("1", 18));

const mappingSlot = (slotIndex: number, key: string): string =>
  ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [key, slotIndex]));

const setStorage = async (target: string, slot: string, value: BigNumber | number) =>
  ethers.provider.send("hardhat_setStorageAt", [
    target,
    slot,
    ethers.utils.hexZeroPad(BigNumber.from(value).toHexString(), 32),
  ]);

const setManagementFlag = async (slotIndex: number, account: string, value: boolean) =>
  setStorage(MANAGEMENT, mappingSlot(slotIndex, account), value ? 1 : 0);

// hBNB cannot be dealt by transferring from a holder: under transferFlag == 1 only a whitelisted
// contract may move it, so any funding route is itself gated. Written straight into the balance and
// supply slots instead, which is equivalent to DigiFT issuing the institution its subscription.
const dealHBNB = async (account: string, amount: BigNumber) => {
  const supply = await new ethers.Contract(HBNB, SECURITY_TOKEN_ABI, ethers.provider).totalSupply();
  await setStorage(HBNB, mappingSlot(HBNB_SLOT.balanceOf, account), amount);
  await setStorage(HBNB, ethers.utils.hexZeroPad(ethers.utils.hexlify(HBNB_SLOT.totalSupply), 32), supply.add(amount));
};

forking(FORK_BLOCK, async () => {
  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const atlasOracle = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const hBNB = new ethers.Contract(HBNB, SECURITY_TOKEN_ABI, ethers.provider);
  const u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
  const management = new ethers.Contract(MANAGEMENT, MANAGEMENT_ABI, ethers.provider);
  const feed = new ethers.Contract(HBNB_FEED, FEED_ABI, ethers.provider);
  const positionToken = new ethers.Contract(POSITION_TOKEN, POSITION_TOKEN_ABI, ethers.provider);
  const frvSource = new ethers.Contract(U_FRV_SOURCE, FRV_SOURCE_ABI, ethers.provider);
  const hub = new ethers.Contract(U_HUB, HUB_ABI, ethers.provider);
  // Core is a YieldGroupCore, not an FRV group — only the YieldGroupBase views are read from it.
  const coreSource = new ethers.Contract(
    U_CORE_SOURCE,
    ["function totalAssets() view returns (uint256)"],
    ethers.provider,
  );
  // The shared FRV adapter's own view of the position: 0 outside the vault's terminal states.
  const adapterFrv = new ethers.Contract(
    ADAPTER_FRV,
    ["function maxWithdraw(address resource, address holder) view returns (uint256)"],
    ethers.provider,
  );

  let vaultsBefore: BigNumber;
  let fundraisingSnapshot: SnapshotRestorer;
  let positionTokenIdBefore: BigNumber;
  let predictedVault: string;
  let feedAsAtlas: Contract;
  let timelock: SignerWithAddress;
  let originalControllerOracle: string;

  before(async () => {
    vaultsBefore = await controller.allVaultsLength();
    positionTokenIdBefore = await positionToken.nextTokenId();
    predictedVault = await controller.predictVaultAddress(INSTITUTION_OPERATOR);
    feedAsAtlas = feed.connect(await initMainnetUser(ATLAS_ORACLE, parseUnits("1")));
    timelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, parseUnits("1"));

    const uOracleConfig = await resilientOracle.getTokenConfig(U);
    for (const [i, oracle] of uOracleConfig.oracles.entries()) {
      if (!uOracleConfig.enableFlagsForOracles[i] || oracle === ethers.constants.AddressZero) continue;
      await setMaxStalePeriodInChainlinkOracle(oracle, U, ethers.constants.AddressZero, bscmainnet.NORMAL_TIMELOCK);
    }
  });

  describe("Pre-VIP behavior", () => {
    it("hBNB has no direct price shadowing the feed (prices == 0)", async () => {
      expect(await atlasOracle.prices(HBNB)).to.equal(0);
    });

    it("hBNB has no AtlasOracle feed configured", async () => {
      const config = await atlasOracle.tokenConfigs(HBNB);
      expect(config.asset).to.equal(ethers.constants.AddressZero);
      expect(config.feed).to.equal(ethers.constants.AddressZero);
      expect(config.maxStalePeriod).to.equal(0);
    });

    it("hBNB is not priced by the ResilientOracle yet (getPrice reverts)", async () => {
      const config = await resilientOracle.getTokenConfig(HBNB);
      expect(config.asset).to.equal(ethers.constants.AddressZero);
      expect(config.oracles).to.deep.equal([
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect(config.enableFlagsForOracles).to.deep.equal([false, false, false]);
      await expect(resilientOracle.getPrice(HBNB)).to.be.revertedWith("invalid resilient oracle price");
    });

    // The feed and the token the VIP wires together: identity plus the 18/18 decimal pairing the
    // ChainlinkOracle scaling (and therefore the post-VIP price equality) depends on.
    it("the hBNB/USD feed and hBNB are the assets the VIP configures, both 18-decimal", async () => {
      expect(await feed.description()).to.equal("SingleFeed hBNB/USD");
      expect(await feed.decimals()).to.equal(18);
      expect(await hBNB.name()).to.equal("DigiFT Hash Global BNB Yield Fund Token");
      expect(await hBNB.symbol()).to.equal("hBNB");
      expect(await hBNB.decimals()).to.equal(18);
    });

    it("the U FRV source is the U Hub's source and does not hold this vault yet", async () => {
      expect(await frvSource.asset()).to.equal(U);
      expect(await frvSource.resources()).to.not.include(predictedVault);
    });

    it("[Test-Only] swaps the controller's oracle for a stub so createVault's price probe passes", async () => {
      originalControllerOracle = await controller.oracle();
      expect(originalControllerOracle).to.equal(RESILIENT_ORACLE);
      const stubOracle = await deployStubOracle();
      await controller.connect(timelock).setOracle(stubOracle.address);
      expect(await controller.oracle()).to.equal(stubOracle.address);
    });
  });

  testVip("VIP-658 List the Hash Global hBNB Fixed-Term Institutional Loan Vault", await vip658(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceAdded"], [1]);

      await controller.connect(timelock).setOracle(originalControllerOracle);

      // Check what the VIP actually wrote before widening the window for the post-VIP reads.
      const oracle = await atlasOracle.tokenConfigs(HBNB);
      expect(oracle.feed).to.equal(HBNB_FEED);
      expect(oracle.maxStalePeriod).to.equal(HBNB_MAX_STALE_PERIOD);

      await setMaxStalePeriodInChainlinkOracle(
        ATLAS_ORACLE,
        HBNB,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
      );
    },
  });

  describe("Post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
    });

    it("registers a new vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(predictedVault);
      expect(await controller.isRegistered(vault.address)).to.equal(true);
    });

    it("stores the vault config", async () => {
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

    it("stores the institutional config and mints the position NFT to the operator", async () => {
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(HBNB);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(positionTokenIdBefore);
      expect(await positionToken.vaultToTokenId(vault.address)).to.equal(inst.positionTokenId);
      expect(await vault.positionToken()).to.equal(POSITION_TOKEN);
      expect(await positionToken.ownerOf(inst.positionTokenId)).to.equal(INSTITUTION_OPERATOR);
    });

    it("stores the risk config", async () => {
      const risk = await vault.riskConfig();
      expect(risk.liquidationThreshold).to.equal(LIQUIDATION_THRESHOLD);
      expect(risk.liquidationIncentive).to.equal(LIQUIDATION_INCENTIVE);
      expect(risk.latePenaltyRate).to.equal(LATE_PENALTY_RATE);
    });

    it("stores the institution name and share token name/symbol", async () => {
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
      expect(await vault.name()).to.equal(VAULT_NAME);
      expect(await vault.symbol()).to.equal(VAULT_SYMBOL);
    });

    it("prices hBNB from the live NAV feed", async () => {
      // 18-dec feed on an 18-dec asset → getPrice returns the NAV verbatim, all the way through.
      const nav = (await feedAsAtlas.latestRoundData())[1];
      expect(nav).to.be.gt(0);
      expect(await atlasOracle.getPrice(HBNB)).to.equal(nav);
      expect(await resilientOracle.getPrice(HBNB)).to.equal(nav);
      expect((await atlasOracle.tokenConfigs(HBNB)).feed).to.equal(HBNB_FEED);
      expect(await atlasOracle.prices(HBNB)).to.equal(0);
    });

    it("wires hBNB as a main-only ResilientOracle config (no pivot, no fallback)", async () => {
      const config = await resilientOracle.getTokenConfig(HBNB);
      expect(config.asset).to.equal(HBNB);
      expect(config.oracles).to.deep.equal([ATLAS_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero]);
      expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
      expect(config.cachingEnabled).to.equal(false);
    });

    it("registers the vault as an FRV resource on the U Hub's FRV source", async () => {
      // Membership, not the exact array: VIP-657 registers the CASH+ vault on this same source.
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
    });
  });

  describe("Post-VIP behavioral proof: the vault is live but collateral is gated by DigiFT", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));

    before(async () => {
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
    });

    it("the vault starts in WaitingForMargin with the full borrow cap available", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      expect((await vault.runtime()).totalRaised).to.equal(0);
      expect(await vault.totalSupply()).to.equal(0);
      expect(await vault.outstandingDebt()).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
    });

    it("approving the vault to spend hBNB is permitted (approve is not gated)", async () => {
      await hBNB.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.allowance(INSTITUTION_OPERATOR, vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    // transferFlag == 1 with nothing whitelisted, proven on the live token: nothing can start until
    // DigiFT whitelists the vault clone (as a contract) and the operator (as an investor).
    it("depositCollateral reverts while the vault is not a DigiFT-whitelisted contract", async () => {
      expect(await management.isWhiteContract(vault.address)).to.equal(false);
      expect(await management.isWhiteInvestor(INSTITUTION_OPERATOR)).to.equal(false);
      await expect(vault.connect(operator).depositCollateral(marginAmount)).to.be.revertedWith("Forbid transferFrom");
    });
  });

  describe("Post-VIP behavioral proof: full vault lifecycle once DigiFT whitelists the participants", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    let lenderAddress: string;

    const marginAmount = IDEAL_COLLATERAL_AMOUNT.mul(MARGIN_RATE).div(parseUnits("1", 18));
    const LENDER_DEPOSIT = MAX_BORROW_CAP;

    // 150,000 U borrowed for 30 days at a 2.7% fixed APY = 332.876712328767123287 U of interest.
    // Suppliers share the principal plus that interest net of the 20% reserve factor (2.16% net APY),
    // pro rata to shares; the reserve cut goes to the ProtocolShareReserve at settlement.
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
    });

    it("[Test-Only] DigiFT whitelists the vault, the operator and the seize path", async () => {
      await setManagementFlag(MANAGEMENT_SLOT.contractList, vault.address, true);
      await setManagementFlag(MANAGEMENT_SLOT.contractList, LIQUIDATION_ADAPTER, true);
      await setManagementFlag(MANAGEMENT_SLOT.whiteList, INSTITUTION_OPERATOR, true);
      await setManagementFlag(MANAGEMENT_SLOT.whiteList, LIQUIDATION_ADAPTER, true);
      await setManagementFlag(MANAGEMENT_SLOT.whiteList, PROTOCOL_SHARE_RESERVE, true);
      await setManagementFlag(MANAGEMENT_SLOT.whiteList, bscmainnet.CRITICAL_GUARDIAN, true);

      expect(await management.isWhiteContract(vault.address)).to.equal(true);
      expect(await management.isWhiteContract(LIQUIDATION_ADAPTER)).to.equal(true);
      expect(await management.isWhiteInvestor(INSTITUTION_OPERATOR)).to.equal(true);
      expect(await management.isWhiteInvestor(LIQUIDATION_ADAPTER)).to.equal(true);
      expect(await management.isWhiteInvestor(PROTOCOL_SHARE_RESERVE)).to.equal(true);
      expect(await management.isWhiteInvestor(bscmainnet.CRITICAL_GUARDIAN)).to.equal(true);
    });

    it("[Test-Only] the institution holds its 237.2 hBNB subscription", async () => {
      const supplyBefore = await hBNB.totalSupply();
      await dealHBNB(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.totalSupply()).to.equal(supplyBefore.add(IDEAL_COLLATERAL_AMOUNT));
    });

    it("institution posts its 1% margin -> MarginDeposited", async () => {
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
      await hBNB.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);

      await expect(vault.connect(operator).depositCollateral(marginAmount))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(marginAmount, marginAmount);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
      expect(await hBNB.balanceOf(vault.address)).to.equal(marginAmount);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(marginAmount);
    });

    // openVault is a Critical Guardian action in production (it also holds the ACM role), so the
    // lifecycle is driven through the same actor the VIP description promises.
    it("the Critical Guardian opens the vault -> Fundraising, and collateral tops up to the ideal amount", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);

      await vault.connect(operator).depositCollateral(IDEAL_COLLATERAL_AMOUNT.sub(marginAmount));
      expect(await hBNB.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(INSTITUTION_OPERATOR)).to.equal(0);

      const nav = await resilientOracle.getPrice(HBNB);
      expect(await vault.getCollateralValueUSD()).to.equal(IDEAL_COLLATERAL_AMOUNT.mul(nav).div(parseUnits("1", 18)));

      fundraisingSnapshot = await takeSnapshot();
    });

    it("a lender funds the vault up to the max borrow cap -> shares minted 1:1", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lenderAddress, LENDER_DEPOSIT);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(MAX_BORROW_CAP);
      expect(await vault.previewDeposit(LENDER_DEPOSIT)).to.equal(LENDER_DEPOSIT);

      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lenderAddress);

      expect(await vault.balanceOf(lenderAddress)).to.equal(LENDER_DEPOSIT);
      expect(await vault.totalSupply()).to.equal(MAX_BORROW_CAP);
      expect((await vault.runtime()).totalRaised).to.equal(MAX_BORROW_CAP);
      expect(await u.balanceOf(vault.address)).to.equal(MAX_BORROW_CAP);
      expect(await vault.maxDeposit(lenderAddress)).to.equal(0);
    });

    it("the open window elapses -> Lock", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);
    });

    it("the institution draws down the raised funds", async () => {
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      expect(await u.balanceOf(vault.address)).to.equal(0);
      expect(await vault.outstandingDebt()).to.equal(EXPECTED_DEBT_AT_MATURITY);
    });

    it("the vault is solvent at the full drawdown under the 75% liquidation threshold", async () => {
      const [liquidity, shortfall] = await vault.getVaultLiquidity();
      const thresholdCap = (await vault.getCollateralValueUSD()).mul(LIQUIDATION_THRESHOLD).div(parseUnits("1", 18));

      expect(shortfall).to.equal(0);
      expect(liquidity).to.equal(thresholdCap.sub(await vault.getDebtValueUSD()));
      expect(await vault.getDebtValueUSD()).to.be.lt(thresholdCap);
    });

    it("the term ends -> PendingSettlement, and the institution repays in full -> Matured", async () => {
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

      // 30 days of 2.7% fixed APY on 150,000 U.
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
      expect(await u.balanceOf(vault.address)).to.equal(EXPECTED_DEBT_AT_MATURITY.sub(EXPECTED_PROTOCOL_FEE));
    });

    it("the lender redeems principal plus interest, net of the 20% reserve factor", async () => {
      const shares = await vault.balanceOf(lenderAddress);
      const assets = await vault.previewRedeem(shares);
      expect(assets).to.equal(EXPECTED_LENDER_PROCEEDS);

      const before = await u.balanceOf(lenderAddress);
      await vault.connect(lender).redeem(shares, lenderAddress, lenderAddress);
      expect(await u.balanceOf(lenderAddress)).to.equal(before.add(assets));
      expect(await vault.balanceOf(lenderAddress)).to.equal(0);
    });

    it("the institution withdraws its collateral back out of the vault", async () => {
      expect(await hBNB.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(INSTITUTION_OPERATOR)).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await hBNB.balanceOf(vault.address)).to.equal(0);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
    });
  });

  describe("Post-VIP behavioral proof: Liquidity Hub routes into and out of the vault", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubUser: SignerWithAddress;
    let hubUserAddress: string;
    let hubOperator: SignerWithAddress;

    const HUB_ALLOCATION = parseUnits("50000", 18);
    // The FRV group's cap is 30% of Hub TVL, so the Hub must hold well over HUB_ALLOCATION / 0.3
    // before the allocation leg fits under the cap.
    const HUB_DEPOSIT = parseUnits("200000", 18);

    // 50,000 U for 30 days at 2.7%, same arithmetic as the lifecycle suite. The Hub is the only
    // supplier here, so it redeems the vault's entire assets at maturity.
    const HUB_INTEREST = termInterest(HUB_ALLOCATION);
    const HUB_TOTAL_ASSETS_AT_MATURITY = HUB_ALLOCATION.add(HUB_INTEREST).sub(reserveCut(HUB_INTEREST));
    const EXPECTED_HUB_PROCEEDS = previewRedeemAt(HUB_ALLOCATION, HUB_TOTAL_ASSETS_AT_MATURITY, HUB_ALLOCATION);

    before(async () => {
      await fundraisingSnapshot.restore();
      const vaultAddress = await controller.allVaults(vaultsBefore);
      vault = new ethers.Contract(vaultAddress, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      [, , hubUser] = await ethers.getSigners();
      hubUserAddress = await hubUser.getAddress();
    });

    it("a Hub deposit lands in Core, never in FRV", async () => {
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(hubUserAddress, HUB_DEPOSIT);
      await u.connect(hubUser).approve(hub.address, HUB_DEPOSIT);

      const coreBefore = await coreSource.totalAssets();
      await hub.connect(hubUser).deposit(HUB_DEPOSIT, hubUserAddress);

      expect(await frvSource.totalAssets()).to.equal(0);
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      // Core is a live vToken market accruing between blocks, so the deposit is a floor on its growth.
      expect(await coreSource.totalAssets()).to.be.at.least(coreBefore.add(HUB_DEPOSIT));
    });

    it("the Operator reallocates Core -> the vault, and the FRV group takes a supplier position", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );

      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect(await frvSource.totalAssets()).to.equal(HUB_ALLOCATION);
      expect((await vault.runtime()).totalRaised).to.equal(HUB_ALLOCATION);
    });

    it("the FRV position is locked for the whole term - no early exit for the Hub", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);

      // The mechanism, AdapterFRV.maxWithdraw delegates to the vault's own maxWithdraw,
      // which is 0 outside the terminal states — the accrued coupon in totalAssets is not
      // deliverable mid-lock. So even a targeted pull leg against the vault reverts.
      expect(await frvSource.totalAssets()).to.be.gt(HUB_ALLOCATION); // coupon is accruing
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(0);

      await expect(
        hub
          .connect(hubOperator)
          .reallocate(
            [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
            [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          ),
      ).to.be.reverted;
    });

    it("the loan runs to maturity and is repaid", async () => {
      await vault.connect(operator).claimRaisedFunds();
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();

      const owed = await vault.outstandingDebt();
      expect(owed).to.equal(HUB_ALLOCATION.add(HUB_INTEREST));

      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(INSTITUTION_OPERATOR, owed.sub(HUB_ALLOCATION));
      await u.connect(operator).approve(vault.address, owed);
      await vault.connect(operator).repay(owed);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Matured);
    });

    it("the Operator pulls the matured position back into Core, principal plus interest", async () => {
      expect(await vault.previewRedeem(HUB_ALLOCATION)).to.equal(EXPECTED_HUB_PROCEEDS);
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(EXPECTED_HUB_PROCEEDS);

      expect(await frvSource.maxWithdraw()).to.equal(0);

      const coreBefore = await coreSource.totalAssets();
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: EXPECTED_HUB_PROCEEDS }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: EXPECTED_HUB_PROCEEDS }],
        );

      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      expect(await frvSource.totalAssets()).to.equal(0);
      expect(await coreSource.totalAssets()).to.be.at.least(coreBefore.add(EXPECTED_HUB_PROCEEDS));
    });
  });
});
