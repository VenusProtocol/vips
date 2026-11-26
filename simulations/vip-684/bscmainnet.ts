import { SnapshotRestorer, takeSnapshot, time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { defaultAbiCoder, hexZeroPad, keccak256, parseUnits, solidityPack } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { bypassStalePrices } from "src/vip-framework/oracleStaleness";

import { BSTOCK_PAUSE_SENTINEL, KEEPER } from "../../vips/vip-680/bscmainnet";
import {
  ADAPTER_FRV,
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
  MAX_BORROW_CAP,
  MIN_BORROW_CAP,
  MIN_SUPPLIER_DEPOSIT,
  MARGIN_RATE as OLD_MARGIN_RATE,
  OPEN_DURATION,
  OPS_FUND_MULTISIG,
  RESERVE_FACTOR,
  SETTLEMENT_WINDOW,
  STORK,
  SUSN,
  SUSN_STORK_FEED_ID,
  U,
  U_FRV_SOURCE,
} from "../../vips/vip-683/bscmainnet";
import {
  ACM,
  ANTB,
  ANTB_MARKET,
  ATLAS_MAX_STALE_PERIOD,
  ATLAS_ORACLE,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS_MAINSTREAM,
  DEVIATION_BOUNDED_ORACLE,
  NORMAL_TIMELOCK,
  POOL,
  PROTOCOL_SEIZE_SHARE,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  RESILIENT_ORACLE,
  SEED_RECEIVER,
  SPOKE_POOL_REGISTRY,
  SPOKE_VTOKEN_BEACON,
  USDT,
  VTREASURY,
  VUSDT_MAINSTREAM,
} from "../../vips/vip-684/addresses/bscmainnet";
import vip684, {
  CHAINLINK_OEV_SEARCHER,
  MARGIN_AMOUNT,
  MARGIN_RATE,
  MATURED_FRVS,
  NEW_NOON_VAULT,
  OLD_NOON_VAULT,
  UNITROLLER,
  VAULT_NAME,
  VAULT_SYMBOL,
} from "../../vips/vip-684/bscmainnet";
import FLASH_LOAN_FACET_ABI from "../vip-591/abi/FlashLoanFacet.json";
import ACM_ABI from "../vip-675/abi/AccessControlManager.json";
import CHAINLINK_ORACLE_ABI from "../vip-675/abi/ChainlinkOracle.json";
import GATEWAY_ABI from "../vip-675/abi/CollateralGateway.json";
import DBO_ABI from "../vip-675/abi/DeviationBoundedOracle.json";
import COMPTROLLER_ABI from "../vip-675/abi/SpokeComptroller.json";
import REGISTRY_ABI from "../vip-675/abi/SpokePoolRegistry.json";
import VTOKEN_ABI from "../vip-675/abi/VToken.json";
import SENTINEL_ABI from "../vip-680/abi/BStockPauseSentinel.json";
import PAUSE_MANAGER_ABI from "../vip-680/abi/PauseManager.json";
import ERC20_ABI from "./abi/ERC20.json";
import FRV_SOURCE_ABI from "./abi/FRVSource.json";
import HUB_ABI from "./abi/Hub.json";
import POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 135832237;

const POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// IVaultTypes.VaultState
const VaultState = {
  WaitingForMargin: 0,
  MarginDeposited: 1,
  Fundraising: 2,
  Lock: 4,
  PendingSettlement: 5,
  Matured: 7,
  Failed: 8,
  Closed: 10,
};

/// Views every FRV vault type (institutional and Ceffu) shares.
const FRV_VIEW_ABI = ["function state() view returns (uint8)", "function balanceOf(address) view returns (uint256)"];

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

// ERC4626 redemption with the vault's virtual asset/share offset of 1.
const previewRedeemAt = (shares: BigNumber, totalAssets: BigNumber, totalSupply: BigNumber): BigNumber =>
  shares.mul(totalAssets.add(1)).div(totalSupply.add(1));

// Mirrors BaseVault._computeTotalInterest.
const BPS = 10_000;
const YEAR = 365 * 24 * 60 * 60;
const termInterest = (principal: BigNumber): BigNumber =>
  principal.mul(FIXED_APY).mul(LOCK_DURATION).div(BigNumber.from(BPS).mul(YEAR));
const reserveCut = (interest: BigNumber): BigNumber => interest.mul(RESERVE_FACTOR).div(parseUnits("1", 18));

// ---------------------------------------------------------------------------------------------------
// Part 2 (ANTB listing) helpers
// ---------------------------------------------------------------------------------------------------

/// USDT's Core market, which holds USDT as cash and funds the fork.
const CORE_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

/// The bStock issuer's PauseManager, which every bStock the sentinel monitors reports.
const PAUSE_MANAGER = "0x9fc74Be63f3589485B2423984a7a0557e0CF700a";

const account = (name: string) =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id(`vip-684 ${name}`), 12));

/// Fresh accounts. The default hardhat signer carries EIP-7702 code on BNB Chain.
const BORROWER = account("borrower");
const LIQUIDATOR = account("liquidator");

/// bStocks keep balances in OpenZeppelin v5's ERC-7201 `ERC20` namespace, so the fork sets them directly.
const OZ5_ERC20_STORAGE = "0x52c63247e1f47db19d5ce0460030c497f067ca4cebf71ba98eeadabe20bace00";
/// EIP-1967 beacon slot, `bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)`.
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

const MANTISSA_ONE = ethers.utils.parseUnits("1", 18);
const ACTION_MINT = 0;
const ACTION_BORROW = 2;
/// What `028` initializes every spoke market with: 10 ** (18 + 18 - 8).
const INITIAL_EXCHANGE_RATE = ethers.utils.parseUnits("1", 28);
/// The pool's markets before this VIP: USDT, USDC, U and 20 bStocks.
const MARKETS_BEFORE = 23;
/// Rounding in the comptroller's own valuation.
const DUST = ethers.utils.parseUnits("1", 12);

const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));
const beaconOf = async (proxy: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, BEACON_SLOT), 12));

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
/// `isAllowedToCall` asked as `onBehalfOf`, the contract that checks the role.
const mayCall = async (onBehalfOf: string, who: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [who, signature]);
  const [allowed] = ACM_IFACE.decodeFunctionResult(
    "isAllowedToCall",
    await ethers.provider.call({ to: ACM, from: onBehalfOf, data }),
  );
  return allowed;
};

const FEED_IFACE = new ethers.utils.Interface([
  "function description() view returns (string)",
  "function decimals() view returns (uint8)",
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
  "function isAuthorizedCaller(address) view returns (bool)",
]);
const feed = new ethers.Contract(ANTB_MARKET.atlasFeed, FEED_IFACE, ethers.provider);
/// The feed's answer as ATLAS_ORACLE reads it, scaled to 18 decimals, and its age at FORK_BLOCK.
const readFeed = async (): Promise<{ price: BigNumber; age: number }> => {
  const [decimals, [, answer, , updatedAt]] = await Promise.all([
    feed.decimals({ from: ATLAS_ORACLE }),
    feed.latestRoundData({ from: ATLAS_ORACLE }),
  ]);
  const { timestamp } = await ethers.provider.getBlock(FORK_BLOCK);
  return {
    price: BigNumber.from(answer).mul(BigNumber.from(10).pow(18 - decimals)),
    age: timestamp - BigNumber.from(updatedAt).toNumber(),
  };
};

const erc20Of = (address: string) => new ethers.Contract(address, ERC20_ABI, ethers.provider);
const vTokenOf = (address: string) => new ethers.Contract(address, VTOKEN_ABI, ethers.provider);

const fundAntb = async (to: string, amount: BigNumber) => {
  const slot = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [to, OZ5_ERC20_STORAGE]),
  );
  const balance = (await erc20Of(ANTB).balanceOf(to)).add(amount);
  await ethers.provider.send("hardhat_setStorageAt", [ANTB, slot, ethers.utils.hexZeroPad(balance.toHexString(), 32)]);
};

const fundUsdt = async (to: string, amount: BigNumber) => {
  const holder = await initMainnetUser(CORE_VUSDT, ethers.utils.parseEther("1"));
  await erc20Of(USDT).connect(holder).transfer(to, amount);
};

forking(FORK_BLOCK, async () => {
  const controller = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, CONTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const chainlinkOracle = new ethers.Contract(
    bscmainnet.CHAINLINK_ORACLE,
    ["function setDirectPrice(address asset, uint256 price)", "function prices(address) view returns (uint256)"],
    ethers.provider,
  );
  const sUSN = new ethers.Contract(
    SUSN,
    [...ERC20_ABI, "function handle(uint32 origin, bytes32 sender, bytes message) payable"],
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
      "function resourceName(address resource) view returns (string)",
    ],
    ethers.provider,
  );
  const liquidationAdapter = new ethers.Contract(
    LIQUIDATION_ADAPTER,
    [
      "function isWhitelistedLiquidator(address) view returns (bool)",
      "function isWhitelistedSettler(address) view returns (bool)",
    ],
    ethers.provider,
  );
  const oldVault = new ethers.Contract(OLD_NOON_VAULT, VAULT_ABI, ethers.provider);
  const unitroller = new ethers.Contract(UNITROLLER, FLASH_LOAN_FACET_ABI, ethers.provider);

  // ---- Part 2 (ANTB) fork setup
  const m = ANTB_MARKET;
  const V_ANTB = m.vToken;

  const atlas = new ethers.Contract(ATLAS_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);
  const comptroller = new ethers.Contract(POOL, COMPTROLLER_ABI, ethers.provider);
  const registry = new ethers.Contract(SPOKE_POOL_REGISTRY, REGISTRY_ABI, ethers.provider);
  const gateway = new ethers.Contract(COLLATERAL_GATEWAY, GATEWAY_ABI, ethers.provider);
  const vAntb = vTokenOf(V_ANTB);
  const sentinel = new ethers.Contract(BSTOCK_PAUSE_SENTINEL, SENTINEL_ABI, ethers.provider);
  const monitoredBefore: string[] = await sentinel.getMonitoredMarkets();
  // The pool's tier 4 COINB market, which `028` built the same way.
  const reference = vTokenOf(COLLATERAL_MARKETS_MAINSTREAM.find(c => c.symbol === "vCOINB_bStockMainstream")!.vToken);

  const { price, age } = await readFeed();
  const treasuryHeld: BigNumber = await erc20Of(ANTB).balanceOf(VTREASURY);
  const timelockHeld: BigNumber = await erc20Of(ANTB).balanceOf(NORMAL_TIMELOCK);

  // The VTreasury held no ANTB at FORK_BLOCK. Top it up to the seed, as has to happen on chain before execution.
  if (treasuryHeld.lt(m.initialSupply)) await fundAntb(VTREASURY, m.initialSupply.sub(treasuryHeld));
  const treasuryBefore: BigNumber = await erc20Of(ANTB).balanceOf(VTREASURY);

  // The feed goes stale over the simulated voting and timelock delay, so pin its current answer as a direct price,
  // which `getPrice` returns without a staleness check. Atlas's caller gate is checked with `isAuthorizedCaller`.
  const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
  await atlas.connect(timelock).setDirectPrice(ANTB, price);
  // USDT, the loan in the end-to-end test, is priced by Chainlink with Atlas as pivot. Pinned at $1 for the same reason.
  const chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
  await chainlink.connect(timelock).setDirectPrice(USDT, MANTISSA_ONE);
  await atlas.connect(timelock).setDirectPrice(USDT, MANTISSA_ONE);

  const proposal = await vip684();

  // ---- Part 1 (Noon)
  let vaultsBefore: BigNumber;
  let positionTokenIdBefore: BigNumber;
  let oldPositionTokenId: BigNumber;
  let liveRate: BigNumber;
  let fundraisingSnapshot: SnapshotRestorer;

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
    oldPositionTokenId = (await oldVault.institutionalConfig()).positionTokenId;
    liveRate = (await stork.getTemporalNumericValueUnsafeV1(SUSN_STORK_FEED_ID)).quantizedValue;

    await bypassStalePrices([U]);
    // createVault prices sUSN after the governance warp, which ages the Stork value past its 1-hour limit.
    // On mainnet the hourly push keeps it fresh; here sUSN is pinned at the live rate until the VIP executes.
    expect(await chainlinkOracle.prices(SUSN)).to.equal(0);
    await chainlinkOracle.connect(timelock).setDirectPrice(SUSN, liveRate);
  });

  describe("Part 2 (ANTB) inputs", () => {
    // Pending, not failed, while the VTreasury lacks the seed: the rest runs on the fork's top-up.
    if (treasuryHeld.gte(m.initialSupply)) {
      it("has the VTreasury hold the seed", async () => {
        expect(treasuryHeld).to.be.gte(m.initialSupply);
      });
    } else {
      it(`has the VTreasury hold the seed (held ${ethers.utils.formatUnits(treasuryHeld, 18)} ANTB at the fork)`);
    }

    it("has the Atlas feed authorize ATLAS_ORACLE, as SingleFeed ANTB/USD", async () => {
      expect(await feed.isAuthorizedCaller(ATLAS_ORACLE)).to.be.true;
      expect(await feed.description()).to.equal("SingleFeed ANTB/USD");
    });

    it("has a fresh Atlas price the DBO config could read at execution", async () => {
      expect(price).to.be.gt(0);
      expect(age).to.be.lte(ATLAS_MAX_STALE_PERIOD);
    });

    it("sizes the supply cap and seed at about $100k and $10 of the feed price", async () => {
      const usd = (amount: BigNumber) => Number(ethers.utils.formatUnits(amount.mul(price).div(MANTISSA_ONE), 18));
      expect(usd(m.supplyCap)).to.be.within(90_000, 110_000);
      expect(usd(m.initialSupply)).to.be.within(9, 11);
    });
  });

  describe("Parts 3 and 4 pre-VIP", () => {
    for (const { name, vault, source } of MATURED_FRVS) {
      it(`${name} is Matured, on its Hub FRV source, with no Hub shares`, async () => {
        const frv = new ethers.Contract(vault, FRV_VIEW_ABI, ethers.provider);
        const group = new ethers.Contract(source, FRV_SOURCE_ABI, ethers.provider);
        expect(await frv.state()).to.equal(VaultState.Matured);
        expect(await group.resources()).to.include(vault);
        expect(await frv.balanceOf(source)).to.equal(0);
      });
    }

    it("the Chainlink OEV searcher is not yet whitelisted for flash loans", async () => {
      expect(await unitroller.authorizedFlashLoan(CHAINLINK_OEV_SEARCHER)).to.equal(false);
    });
  });

  describe("Part 1 (Noon) pre-VIP behavior", () => {
    it("the VIP-683 vault waits for its 100% margin, with no collateral and no shares", async () => {
      expect(await controller.isRegistered(OLD_NOON_VAULT)).to.equal(true);
      expect(await oldVault.state()).to.equal(VaultState.WaitingForMargin);
      expect((await oldVault.institutionalConfig()).marginRate).to.equal(OLD_MARGIN_RATE);
      expect((await oldVault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
      expect(await sUSN.balanceOf(OLD_NOON_VAULT)).to.equal(0);
      expect(await oldVault.totalSupply()).to.equal(0);
      expect(await oldVault.name()).to.equal(VAULT_NAME);
    });

    it("the VIP-683 vault is an unfunded resource of the U FRV source", async () => {
      expect(await frvSource.resources()).to.include(OLD_NOON_VAULT);
      expect((await frvSource.resourceConfig(OLD_NOON_VAULT)).adapter).to.equal(ADAPTER_FRV);
      expect(await oldVault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      expect(await adapterFrv.totalAssets(OLD_NOON_VAULT, U_FRV_SOURCE)).to.equal(0);
    });

    it("NEW_NOON_VAULT is the controller's predicted vault for the operator", async () => {
      expect(await controller.institutionNonce(INSTITUTION_OPERATOR)).to.equal(1);
      expect(await controller.predictVaultAddress(INSTITUTION_OPERATOR)).to.equal(NEW_NOON_VAULT);
      expect(await ethers.provider.getCode(NEW_NOON_VAULT)).to.equal("0x");
    });

    it("sUSN is priced from the Stork feed, near the $1.24 deal price", async () => {
      expect(liveRate).to.be.closeTo(parseUnits("1.24", 18), parseUnits("0.0124", 18));
    });

    it("both liquidators are already whitelisted for both paths", async () => {
      for (const liquidator of [LIQUIDATOR_BOT, OPS_FUND_MULTISIG]) {
        expect(await liquidationAdapter.isWhitelistedLiquidator(liquidator)).to.equal(true);
        expect(await liquidationAdapter.isWhitelistedSettler(liquidator)).to.equal(true);
      }
    });

    it("the margin is 115.207371 sUSN", async () => {
      expect(MARGIN_AMOUNT).to.equal(parseUnits("115.207371", 18));
    });

    it("U Hub's FRV yield group has room for the full 1M U", async () => {
      const headroom = (await hub.yieldGroupEffectiveCap(U_FRV_SOURCE)).sub(await frvSource.totalAssets());
      expect(headroom).to.be.gte(MAX_BORROW_CAP);
    });
  });

  describe("Part 2 (ANTB) pre-VIP: what the listing relies on", () => {
    it("has ANTB at 18 decimals, on the same beacon as the pool's other bStocks", async () => {
      expect(await erc20Of(ANTB).decimals()).to.equal(18);
      expect(await erc20Of(ANTB).symbol()).to.equal("ANTB");
      const nvdab = COLLATERAL_MARKETS_MAINSTREAM.find(c => c.symbol === "vNVDAB_bStockMainstream")!.underlying;
      expectAddress(await beaconOf(ANTB), await beaconOf(nvdab));
    });

    it("has no Venus oracle or DBO config for ANTB", async () => {
      expect((await atlas.tokenConfigs(ANTB)).asset).to.equal(ethers.constants.AddressZero);
      expect((await resilientOracle.getTokenConfig(ANTB)).asset).to.equal(ethers.constants.AddressZero);
      expect((await dbo.assetProtectionConfig(ANTB)).asset).to.equal(ethers.constants.AddressZero);
    });

    it("has the pool list 23 markets and none of ANTB", async () => {
      expect(await comptroller.getAllMarkets()).to.have.length(MARKETS_BEFORE);
      expect(await registry.getVTokenForAsset(POOL, ANTB)).to.equal(ethers.constants.AddressZero);
      expect((await comptroller.markets(V_ANTB)).isListed).to.be.false;
    });

    it("builds the market as 028 built vCOINB_bStockMainstream: same beacon, pool, rate model, owner and reserves", async () => {
      expectAddress(await beaconOf(V_ANTB), SPOKE_VTOKEN_BEACON);
      expectAddress(await beaconOf(V_ANTB), await beaconOf(reference.address));
      expect(await vAntb.name()).to.equal(m.name);
      expect(await vAntb.symbol()).to.equal(m.symbol);
      expect(await vAntb.decimals()).to.equal(8);
      expect(await vAntb.totalSupply()).to.equal(0);
      expect(await vAntb.exchangeRateStored()).to.equal(INITIAL_EXCHANGE_RATE);
      expectAddress(await vAntb.underlying(), ANTB);
      expectAddress(await vAntb.comptroller(), POOL);
      expectAddress(await vAntb.comptroller(), await reference.comptroller());
      expectAddress(await vAntb.interestRateModel(), await reference.interestRateModel());
      expectAddress(await vAntb.owner(), NORMAL_TIMELOCK);
      expect(await vAntb.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expectAddress(await vAntb.shortfall(), NORMAL_TIMELOCK);
      expectAddress(await vAntb.protocolShareReserve(), PROTOCOL_SHARE_RESERVE);
      expect(await vAntb.reserveFactorMantissa()).to.equal(await reference.reserveFactorMantissa());
      expect(await vAntb.protocolSeizeShareMantissa()).to.equal(PROTOCOL_SEIZE_SHARE);
    });

    it("has the BStockPauseSentinel monitor the pool's other bStocks but not vANTB, and ANTB on the same PauseManager", async () => {
      expect(await sentinel.isMarketMonitored(reference.address)).to.be.true;
      expect(await sentinel.isMarketMonitored(V_ANTB)).to.be.false;
      const bStockToken = ["function pauseManager() view returns (address)"];
      expectAddress(await new ethers.Contract(ANTB, bStockToken, ethers.provider).pauseManager(), PAUSE_MANAGER);
      expectAddress(
        await new ethers.Contract(await reference.underlying(), bStockToken, ethers.provider).pauseManager(),
        PAUSE_MANAGER,
      );
    });

    it("lets the Normal Timelock make every call inline, with no aggregator", async () => {
      const roles: [string, string][] = [
        [ATLAS_ORACLE, "setTokenConfig(TokenConfig)"],
        [RESILIENT_ORACLE, "setTokenConfig(TokenConfig)"],
        [DEVIATION_BOUNDED_ORACLE, "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])"],
        [SPOKE_POOL_REGISTRY, "addMarket(AddMarketInput)"],
        [POOL, "setMarketLiquidationIncentive(address,uint256)"],
        // The comptroller checks the `uint256[]` form, because `Action` is an enum.
        [POOL, "setActionsPaused(address[],uint256[],bool)"],
        [V_ANTB, "setReduceReservesBlockDelta(uint256)"],
        [V_ANTB, "setProtocolSeizeShare(uint256)"],
        [BSTOCK_PAUSE_SENTINEL, "setMarketMonitored(address,bool)"],
      ];
      for (const [contract, role] of roles) {
        expect(await mayCall(contract, NORMAL_TIMELOCK, role), `${contract}: ${role}`).to.be.true;
      }
      const treasury = new ethers.Contract(VTREASURY, ["function owner() view returns (address)"], ethers.provider);
      expectAddress(await treasury.owner(), NORMAL_TIMELOCK);
    });
  });

  testVip("VIP-684 [bscmainnet] Relist the Noon sUSN vault with a 0.01% margin, and list ANTB", proposal, {
    callbackAfterExecution: async txResponse => {
      // Part 1
      await expectEvents(txResponse, [VAULT_ABI], ["VaultCancelled", "VaultClosed"], [1, 1]);
      // The VIP-683 Noon vault and the three matured FRVs (Part 3).
      await expectEvents(txResponse, [FRV_SOURCE_ABI], ["ResourceRemoved", "ResourceAdded"], [4, 1]);
      await expectEvents(txResponse, [CONTROLLER_ABI], ["VaultCreated"], [1]);
      // Part 4
      await expectEvents(txResponse, [FLASH_LOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
      // Part 2
      await expectEvents(txResponse, [CHAINLINK_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);
      await expectEvents(txResponse, [DBO_ABI], ["ProtectionInitialized"], [1]);
      await expectEvents(txResponse, [REGISTRY_ABI], ["PoolRegistered", "MarketAdded"], [0, 1]);
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewReduceReservesBlockDelta", "NewProtocolSeizeShare", "NewReserveFactor"],
        [1, 1, 0],
      );
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["MarketSupported", "NewMarketLiquidationIncentive", "ActionPausedMarket"],
        [1, 1, 1],
      );
      await expectEvents(txResponse, [SENTINEL_ABI], ["MarketMonitoringUpdated"], [1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [0, 0]);
    },
  });

  describe("Parts 3 and 4 post-VIP", () => {
    for (const { name, vault, source } of MATURED_FRVS) {
      it(`${name} is off its Hub FRV source, and still Matured`, async () => {
        const frv = new ethers.Contract(vault, FRV_VIEW_ABI, ethers.provider);
        const group = new ethers.Contract(source, FRV_SOURCE_ABI, ethers.provider);
        expect(await group.resources()).to.not.include(vault);
        expect((await group.resourceConfig(vault)).registered).to.equal(false);
        expect(await frv.state()).to.equal(VaultState.Matured);
      });
    }

    it("whitelists the Chainlink OEV searcher for flash loans", async () => {
      expect(await unitroller.authorizedFlashLoan(CHAINLINK_OEV_SEARCHER)).to.equal(true);
    });
  });

  describe("Part 1 (Noon) post-VIP behavior", () => {
    let vault: Contract;

    before(async () => {
      vault = new ethers.Contract(await controller.allVaults(vaultsBefore), VAULT_ABI, ethers.provider);
      // Lift the sim's pin so sUSN is read from the Stork feed from here on.
      await chainlinkOracle.connect(timelock).setDirectPrice(SUSN, 0);
      await setStorkRate(liveRate);
    });

    it("cancels and closes the VIP-683 vault: Closed, nothing refunded, its position NFT still with the operator", async () => {
      expect(await oldVault.state()).to.equal(VaultState.Closed);
      expect((await oldVault.institutionalRuntime()).totalCollateralDeposited).to.equal(0);
      expect(await positionToken.ownerOf(oldPositionTokenId)).to.equal(INSTITUTION_OPERATOR);
      expect(await oldVault.maxDeposit(INSTITUTION_OPERATOR)).to.equal(0);
    });

    it("the closed VIP-683 vault refuses the margin deposit", async () => {
      const operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      await expect(oldVault.connect(operator).depositCollateral(MARGIN_AMOUNT)).to.be.revertedWithCustomError(
        oldVault,
        "InvalidState",
      );
    });

    it("removes the VIP-683 vault from the U FRV source", async () => {
      expect(await frvSource.resources()).to.not.include(OLD_NOON_VAULT);
      expect((await frvSource.resourceConfig(OLD_NOON_VAULT)).registered).to.equal(false);
    });

    it("creates the new vault at the predicted address", async () => {
      expect(await controller.allVaultsLength()).to.equal(vaultsBefore.add(1));
      expect(vault.address).to.equal(NEW_NOON_VAULT);
      expect(await controller.isRegistered(NEW_NOON_VAULT)).to.equal(true);
      expect(await vault.state()).to.equal(VaultState.WaitingForMargin);
    });

    it("keeps VIP-683's loan terms", async () => {
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
      expect(config).to.deep.equal(await oldVault.config());
    });

    it("sets the 0.01% margin, and mints a new position NFT to the operator", async () => {
      const inst = await vault.institutionalConfig();
      expect(inst.collateralAsset).to.equal(SUSN);
      expect(inst.idealCollateralAmount).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(inst.marginRate).to.equal(MARGIN_RATE);
      expect(inst.institutionOperator).to.equal(INSTITUTION_OPERATOR);
      expect(inst.positionTokenId).to.equal(positionTokenIdBefore);
      expect(await positionToken.vaultToTokenId(vault.address)).to.equal(inst.positionTokenId);
      expect(await positionToken.ownerOf(inst.positionTokenId)).to.equal(INSTITUTION_OPERATOR);
    });

    it("keeps VIP-683's risk parameters", async () => {
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

    it("adds the new vault to the U FRV source behind the AdapterFRV", async () => {
      expect(await frvSource.resources()).to.include(vault.address);
      const resourceConfig = await frvSource.resourceConfig(vault.address);
      expect(resourceConfig.registered).to.equal(true);
      expect(resourceConfig.paused).to.equal(false);
      expect(resourceConfig.adapter).to.equal(ADAPTER_FRV);
      expect(await adapterFrv.resourceName(vault.address)).to.equal(VAULT_NAME);
    });

    it("U Hub still reports its total assets", async () => {
      await hub.totalAssets();
      await frvSource.totalAssets();
    });
  });

  describe("Part 2 (ANTB) post-VIP", () => {
    it("prices ANTB with Atlas alone and a DBO window", async () => {
      const atlasConfig = await atlas.tokenConfigs(ANTB);
      expectAddress(atlasConfig.feed, m.atlasFeed);
      expect(atlasConfig.maxStalePeriod).to.equal(ATLAS_MAX_STALE_PERIOD);

      const config = await resilientOracle.getTokenConfig(ANTB);
      expect(config.oracles.map((o: string) => ethers.utils.getAddress(o))).to.deep.equal([
        ethers.utils.getAddress(ATLAS_ORACLE),
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      ]);
      expect([...config.enableFlagsForOracles]).to.deep.equal([true, false, false]);
      expect(config.cachingEnabled).to.be.false;
      expect(await resilientOracle.getPrice(ANTB)).to.equal(price);

      const window = await dbo.assetProtectionConfig(ANTB);
      expectAddress(window.asset, ANTB);
      expect(window.cooldownPeriod).to.equal(m.dbo.cooldownPeriod);
      expect(window.triggerThreshold).to.equal(m.dbo.triggerThreshold);
      expect(window.resetThreshold).to.equal(m.dbo.resetThreshold);
      expect(window.isBoundedPricingEnabled).to.equal(m.dbo.enableBoundedPricing);
      expect(window.cachingEnabled).to.equal(m.dbo.enableCaching);
    });

    it("lists the market with its risk values and seed, paid by the VTreasury", async () => {
      const market = await comptroller.markets(V_ANTB);
      expect(market.isListed).to.be.true;
      expect(market.collateralFactorMantissa).to.equal(m.collateralFactor);
      expect(market.liquidationThresholdMantissa).to.equal(m.liquidationThreshold);
      expect(await comptroller.supplyCaps(V_ANTB)).to.equal(m.supplyCap);
      expect(await comptroller.borrowCaps(V_ANTB)).to.equal(0);
      expect(await comptroller.getAllMarkets()).to.have.length(MARKETS_BEFORE + 1);
      expectAddress(await registry.getVTokenForAsset(POOL, ANTB), V_ANTB);

      const supply: BigNumber = await vAntb.totalSupply();
      expect(supply).to.equal(m.initialSupply.mul(MANTISSA_ONE).div(INITIAL_EXCHANGE_RATE));
      expect(await vAntb.balanceOf(SEED_RECEIVER)).to.equal(supply);
      expect(await erc20Of(ANTB).balanceOf(VTREASURY)).to.equal(treasuryBefore.sub(m.initialSupply));
      // `withdrawTreasuryBEP20` caps at the treasury's balance, so a short seed would come out of this balance.
      expect(await erc20Of(ANTB).balanceOf(NORMAL_TIMELOCK)).to.equal(timelockHeld);
      expect(await erc20Of(ANTB).allowance(NORMAL_TIMELOCK, SPOKE_POOL_REGISTRY)).to.equal(0);
    });

    it("gives the market its own incentive and seize share, the pool's reserve delta, and pauses borrowing", async () => {
      const incentive: BigNumber = await comptroller.effectiveLiquidationIncentive(V_ANTB);
      expect(incentive).to.equal(m.liquidationIncentive);
      expect(await vAntb.protocolSeizeShareMantissa()).to.equal(m.protocolSeizeShare);
      expect(incentive).to.be.gte(MANTISSA_ONE.add(m.protocolSeizeShare));
      // LT x incentive stays under 1, so a liquidation never seizes more than the collateral backing the loan.
      expect(m.liquidationThreshold.mul(incentive)).to.be.lt(MANTISSA_ONE.mul(MANTISSA_ONE));
      expect(await vAntb.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
      // 28,800 blocks, as on the pool's other markets.
      expect(await vAntb.reduceReservesBlockDelta()).to.equal(await reference.reduceReservesBlockDelta());
      expect(await comptroller.actionPaused(V_ANTB, ACTION_BORROW)).to.be.true;
      expect(await comptroller.actionPaused(V_ANTB, ACTION_MINT)).to.be.false;
      expect(await comptroller.isSupplyAllowlistEnabled(V_ANTB)).to.be.false;
    });

    it("has the BStockPauseSentinel monitor the market, which ANTB's issuer has neither paused nor blocked", async () => {
      expect(await sentinel.isMarketMonitored(V_ANTB)).to.be.true;
      expect(await sentinel.getMonitoredMarkets()).to.have.length(monitoredBefore.length + 1);
      const [isPaused, underlying, pauseManager] = await sentinel.checkBStockPause(V_ANTB);
      expect(isPaused).to.be.false;
      expectAddress(underlying, ANTB);
      expectAddress(pauseManager, PAUSE_MANAGER);
    });

    // The CF and LT as the comptroller applies them: a USDT loan up to the borrowing power and not a wei more, and a
    // liquidation that turns on where the LT stops covering the loan.
    it("lends USDT against ANTB up to its CF, and lets it be liquidated past its LT", async () => {
      const borrower = await initMainnetUser(BORROWER, ethers.utils.parseEther("1"));
      // $200: above the $100 minimum liquidatable collateral after the price drops to the LT edge.
      const supplied = ethers.utils.parseUnits("200", 18).mul(MANTISSA_ONE).div(price);
      await fundAntb(BORROWER, supplied);
      await erc20Of(ANTB).connect(borrower).approve(COLLATERAL_GATEWAY, supplied);
      await gateway.connect(borrower).supplyAndEnterSpokeMarkets([V_ANTB], [supplied]);
      expect(await comptroller.checkMembership(BORROWER, V_ANTB)).to.be.true;

      const held: BigNumber = (await vAntb.balanceOf(BORROWER)).mul(await vAntb.exchangeRateStored()).div(MANTISSA_ONE);
      const value = held.mul(price).div(MANTISSA_ONE);
      const [, power] = await comptroller.getBorrowingPower(BORROWER);
      expect(power).to.be.closeTo(value.mul(m.collateralFactor).div(MANTISSA_ONE), DUST);
      const [, cover] = await comptroller.getAccountLiquidity(BORROWER);
      expect(cover).to.be.closeTo(value.mul(m.liquidationThreshold).div(MANTISSA_ONE), DUST);

      const vUsdt = vTokenOf(VUSDT_MAINSTREAM).connect(borrower);
      await vUsdt.borrow(power);
      expect(await erc20Of(USDT).balanceOf(BORROWER)).to.equal(power);
      await expect(vUsdt.borrow(1)).to.be.revertedWithCustomError(comptroller, "InsufficientLiquidity");
      await expect(vAntb.connect(borrower).borrow(1)).to.be.revertedWithCustomError(comptroller, "ActionPaused");

      // The price at which LT x collateral value equals the loan: CF / LT of today's price.
      const loan: BigNumber = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
      const edge = loan.mul(MANTISSA_ONE).mul(MANTISSA_ONE).div(held.mul(m.liquidationThreshold));
      expect(edge).to.be.closeTo(price.mul(m.collateralFactor).div(m.liquidationThreshold), price.div(10000));

      const liquidator = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));
      const repay = loan.div(10);
      await fundUsdt(LIQUIDATOR, repay);
      await erc20Of(USDT).connect(liquidator).approve(VUSDT_MAINSTREAM, repay);

      await atlas.connect(timelock).setDirectPrice(ANTB, edge.mul(10001).div(10000));
      expect((await comptroller.getAccountLiquidity(BORROWER))[2]).to.equal(0);
      await expect(
        vTokenOf(VUSDT_MAINSTREAM).connect(liquidator).liquidateBorrow(BORROWER, repay, V_ANTB),
      ).to.be.revertedWithCustomError(comptroller, "InsufficientShortfall");

      await atlas.connect(timelock).setDirectPrice(ANTB, edge.mul(9999).div(10000));
      expect((await comptroller.getAccountLiquidity(BORROWER))[2]).to.be.gt(0);
      await vTokenOf(VUSDT_MAINSTREAM).connect(liquidator).liquidateBorrow(BORROWER, repay, V_ANTB);
      expect(await vAntb.balanceOf(LIQUIDATOR)).to.be.gt(0);

      await atlas.connect(timelock).setDirectPrice(ANTB, price);
      await fundUsdt(BORROWER, loan.div(100));
      await erc20Of(USDT).connect(borrower).approve(VUSDT_MAINSTREAM, ethers.constants.MaxUint256);
      await vUsdt.repayBorrow(ethers.constants.MaxUint256);
      expect(await vUsdt.borrowBalanceStored(BORROWER)).to.equal(0);
    });

    // Last: it leaves the market's CF at 0.
    it("lets the keeper zero the market's CF through the sentinel when the issuer pauses ANTB, keeping its LT", async () => {
      let pauseManager = new ethers.Contract(PAUSE_MANAGER, PAUSE_MANAGER_ABI, ethers.provider);
      const pauser = await pauseManager.getRoleMember(await pauseManager.OPS_ROLE(), 0);
      pauseManager = pauseManager.connect(await initMainnetUser(pauser, ethers.utils.parseEther("1")));
      await pauseManager.pauseToken(ANTB);

      const keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      await expect(sentinel.connect(keeper).handleBStockPause(V_ANTB))
        .to.emit(sentinel, "BStockPauseHandled")
        .withArgs(V_ANTB, ANTB, PAUSE_MANAGER);
      const market = await comptroller.markets(V_ANTB);
      expect(market.collateralFactorMantissa).to.equal(0);
      expect(market.liquidationThresholdMantissa).to.equal(m.liquidationThreshold);
    });
  });

  describe("Part 1 (Noon) post-VIP lifecycle: small margin, then the full collateral during the Open period", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubOperator: SignerWithAddress;
    let operatorSUSNBefore: BigNumber;

    const HUB_ALLOCATION = MAX_BORROW_CAP;
    const HUB_INTEREST = termInterest(HUB_ALLOCATION);
    const HUB_TOTAL_ASSETS_AT_MATURITY = HUB_ALLOCATION.add(HUB_INTEREST).sub(reserveCut(HUB_INTEREST));
    const EXPECTED_HUB_PROCEEDS = previewRedeemAt(HUB_ALLOCATION, HUB_TOTAL_ASSETS_AT_MATURITY, HUB_ALLOCATION);

    before(async () => {
      vault = new ethers.Contract(NEW_NOON_VAULT, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      operatorSUSNBefore = await sUSN.balanceOf(INSTITUTION_OPERATOR);
      await bridgeSUSN(INSTITUTION_OPERATOR, IDEAL_COLLATERAL_AMOUNT);
      await sUSN.connect(operator).approve(vault.address, IDEAL_COLLATERAL_AMOUNT);
    });

    it("a deposit below the 115.207371 sUSN margin is refused", async () => {
      await expect(vault.connect(operator).depositCollateral(MARGIN_AMOUNT.sub(1))).to.be.revertedWithCustomError(
        vault,
        "InsufficientCollateral",
      );
    });

    it("operator deposits the 115.207371 sUSN margin", async () => {
      await expect(vault.connect(operator).depositCollateral(MARGIN_AMOUNT))
        .to.emit(vault, "CollateralDeposited")
        .withArgs(MARGIN_AMOUNT, MARGIN_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.MarginDeposited);
    });

    it("Critical Guardian opens the vault", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await controller.connect(criticalGuardian).openVault(vault.address);
      expect(await vault.state()).to.equal(VaultState.Fundraising);
      fundraisingSnapshot = await takeSnapshot();
    });

    it("Hub operator fills the whole 1M U vault from Core", async () => {
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      expect((await vault.runtime()).totalRaised).to.equal(HUB_ALLOCATION);
    });

    it("operator deposits the rest of the collateral before the Open period ends", async () => {
      const rest = IDEAL_COLLATERAL_AMOUNT.sub(MARGIN_AMOUNT);
      await vault.connect(operator).depositCollateral(rest);
      expect((await vault.institutionalRuntime()).totalCollateralDeposited).to.equal(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(vault.address)).to.equal(IDEAL_COLLATERAL_AMOUNT);
    });

    it("vault locks after the 1-day Open period, and the operator claims the 1M U", async () => {
      await time.increase(OPEN_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.Lock);

      await setStorkRate(liveRate);
      const before = await u.balanceOf(INSTITUTION_OPERATOR);
      await vault.connect(operator).claimRaisedFunds();
      expect(await u.balanceOf(INSTITUTION_OPERATOR)).to.equal(before.add(MAX_BORROW_CAP));
      const [liquidity, shortfall] = await vault.getVaultLiquidity();
      expect(liquidity).to.be.gt(0);
      expect(shortfall).to.equal(0);
    });

    it("operator repays at maturity", async () => {
      await time.increase(LOCK_DURATION + 1);
      await vault.connect(operator).updateVaultState();
      expect(await vault.state()).to.equal(VaultState.PendingSettlement);

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
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: EXPECTED_HUB_PROCEEDS }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: EXPECTED_HUB_PROCEEDS }],
        );
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
    });

    it("operator withdraws all collateral", async () => {
      await vault.connect(operator).withdrawCollateral(IDEAL_COLLATERAL_AMOUNT);
      expect(await sUSN.balanceOf(INSTITUTION_OPERATOR)).to.equal(operatorSUSNBefore.add(IDEAL_COLLATERAL_AMOUNT));
      expect(await sUSN.balanceOf(vault.address)).to.equal(0);
    });
  });

  describe("Part 1 (Noon) post-VIP lifecycle: collateral not completed by the end of the Open period", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let lender: SignerWithAddress;
    const LENDER_DEPOSIT = parseUnits("1000", 18);

    before(async () => {
      await fundraisingSnapshot.restore();
      vault = new ethers.Contract(NEW_NOON_VAULT, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      [, lender] = await ethers.getSigners();
      const whale = await initMainnetUser(U_WHALE, parseUnits("40"));
      await u.connect(whale).transfer(lender.address, LENDER_DEPOSIT);
      await u.connect(lender).approve(vault.address, LENDER_DEPOSIT);
      await vault.connect(lender).deposit(LENDER_DEPOSIT, lender.address);
    });

    it("vault fails and confiscates only the 115.207371 sUSN margin", async () => {
      await time.increase(OPEN_DURATION + 1);
      await expect(vault.connect(operator).updateVaultState())
        .to.emit(vault, "MarginConfiscated")
        .withArgs(MARGIN_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.Failed);
      const runtime = await vault.institutionalRuntime();
      expect(runtime.institutionDefaulted).to.equal(true);
      expect(runtime.confiscatedMarginRemaining).to.equal(MARGIN_AMOUNT);
    });

    it("lender gets the deposit back without interest, plus the whole margin in sUSN", async () => {
      const shares = await vault.balanceOf(lender.address);
      const uBefore = await u.balanceOf(lender.address);
      const sUSNBefore = await sUSN.balanceOf(lender.address);
      await expect(vault.connect(lender).redeem(shares, lender.address, lender.address))
        .to.emit(vault, "MarginCompensationClaimed")
        .withArgs(lender.address, MARGIN_AMOUNT);
      expect(await u.balanceOf(lender.address)).to.equal(uBefore.add(LENDER_DEPOSIT));
      expect(await sUSN.balanceOf(lender.address)).to.equal(sUSNBefore.add(MARGIN_AMOUNT));
      expect((await vault.institutionalRuntime()).confiscatedMarginRemaining).to.equal(0);
    });

    it("operator cannot withdraw the confiscated margin", async () => {
      await expect(vault.connect(operator).withdrawCollateral(1)).to.be.revertedWithCustomError(
        vault,
        "InsufficientCollateral",
      );
    });
  });

  describe("Part 1 (Noon) post-VIP lifecycle: Hub-funded vault, collateral not completed", () => {
    let vault: Contract;
    let operator: SignerWithAddress;
    let hubOperator: SignerWithAddress;
    const HUB_ALLOCATION = MAX_BORROW_CAP;
    const holders = [U_FRV_SOURCE, U_HUB, U_CORE_SOURCE];
    const sUSNOf = () => Promise.all(holders.map(h => sUSN.balanceOf(h)));

    before(async () => {
      await fundraisingSnapshot.restore();
      vault = new ethers.Contract(NEW_NOON_VAULT, VAULT_ABI, ethers.provider);
      operator = await initMainnetUser(INSTITUTION_OPERATOR, parseUnits("1"));
      hubOperator = await initMainnetUser(HUB_OPERATOR, parseUnits("1"));
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
        );
      await time.increase(OPEN_DURATION + 1);
      await expect(vault.connect(operator).updateVaultState())
        .to.emit(vault, "MarginConfiscated")
        .withArgs(MARGIN_AMOUNT);
      expect(await vault.state()).to.equal(VaultState.Failed);
    });

    it("Hub operator moves the 1M U back to Core; the sUSN compensation goes with the redeem", async () => {
      expect(await adapterFrv.maxWithdraw(vault.address, U_FRV_SOURCE)).to.equal(HUB_ALLOCATION);
      const before = await sUSNOf();
      await hub
        .connect(hubOperator)
        .reallocate(
          [{ yieldGroup: U_FRV_SOURCE, resource: vault.address, amount: HUB_ALLOCATION }],
          [{ yieldGroup: U_CORE_SOURCE, resource: NO_RESOURCE, amount: HUB_ALLOCATION }],
        );
      const after = await sUSNOf();
      expect(after[0].sub(before[0])).to.equal(0); // FRV source
      expect(after[1].sub(before[1])).to.equal(MARGIN_AMOUNT); // Hub
      expect(after[2].sub(before[2])).to.equal(0); // Core source
      expect(await vault.balanceOf(U_FRV_SOURCE)).to.equal(0);
      expect((await vault.institutionalRuntime()).confiscatedMarginRemaining).to.equal(0);
    });

    it("only the Normal Timelock can sweep the Hub's sUSN, to the treasury", async () => {
      const criticalGuardian = await initMainnetUser(bscmainnet.CRITICAL_GUARDIAN, parseUnits("1"));
      await expect(hub.connect(criticalGuardian).sweep(SUSN, bscmainnet.VTREASURY)).to.be.reverted;
      const before = await sUSN.balanceOf(bscmainnet.VTREASURY);
      await hub.connect(timelock).sweep(SUSN, bscmainnet.VTREASURY);
      expect((await sUSN.balanceOf(bscmainnet.VTREASURY)).sub(before)).to.equal(MARGIN_AMOUNT);
      expect(await sUSN.balanceOf(U_HUB)).to.equal(0);
    });
  });
});
