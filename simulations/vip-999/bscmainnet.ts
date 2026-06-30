import { expect } from "chai";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  pinResilientOraclePriceViaRedstone,
  setMaxStalePeriod,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip999 from "../../vips/vip-999/bscmainnet";
import {
  ACCESS_CONTROL_MANAGER,
  EXECUTOR,
  FACETS,
  LEVERAGE_PROXY_ADMIN,
  LEVERAGE_STRATEGIES_MANAGER,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_EXECUTOR_IMPL,
  NEW_LEVERAGE_IMPL,
  NEW_LIQUIDATOR_IMPL,
  NEW_VTOKEN_DELEGATE,
  PROXY_ADMIN,
  SEIZE_VENUS_FILTERED_SIGNATURE,
  SEIZE_VENUS_PERMISSION_GRANTEES,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "../../vips/vip-999/utils/data.bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import LEVERAGE_ABI from "./abi/LeverageStrategiesManager.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const XVS_VTOKEN = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D"; // vXVS

const NEW_CLAIM_AS_COLLATERAL_SELECTOR = "0xc2dbfc50"; // claimVenusAsCollateral(address,address[])
const NEW_SEIZE_SELECTOR = "0xf74c8f31"; // seizeVenus(address[],address,address[])

const REWARD_FACET_NEW_ABI = [
  "function seizeVenus(address[],address,address[]) returns (uint256)",
  "function claimVenusAsCollateral(address,address[])",
];

const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"; // BTCB — collateral for the lifecycle e2e
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B"; // vBTC (CF 0.8)
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7"; // VAI — read by the new Liquidator's force-VAI gate
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address,uint256) returns (bool)",
];

const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;
const SWAP_BACKEND_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
let saltCounter = 0;
const RELATIVE_POSITION_MANAGER = "0x1525D804DFff218DcC8B9359940F423209356C42";

const normalizeSelectors = (arr: string[]): string[] => [...arr].map(s => s.toLowerCase()).sort();

const facetOf = async (comptroller: Contract, selector: string): Promise<string> => {
  return (await comptroller.facetAddress(selector)).facetAddress;
};

// On-chain selector set bound to a facet, normalized for a deep-equals against our data arrays.
const facetSelectorsOf = async (comptroller: Contract, facet: string): Promise<string[]> => {
  return normalizeSelectors(await comptroller.facetFunctionSelectors(facet));
};

// Snapshot a handful of RelativePositionManager storage-backed values via its public getters.
const readRpmSnapshot = async (rpm: Contract) => ({
  proportionalCloseTolerance: (await rpm.proportionalCloseTolerance()).toString(),
  isPartiallyPaused: await rpm.isPartiallyPaused(),
  isCompletelyPaused: await rpm.isCompletelyPaused(),
  dsaVTokenIndexCounter: (await rpm.dsaVTokenIndexCounter()).toString(),
  isPositionAccountImplementationLocked: await rpm.isPositionAccountImplementationLocked(),
});

const readStorageSnapshot = async (c: Contract) => {
  const globals = {
    closeFactor: (await c.closeFactorMantissa()).toString(),
    pauseGuardian: await c.pauseGuardian(),
    vaiController: await c.vaiController(),
    vaiMintRate: (await c.vaiMintRate()).toString(),
    xvsAddress: await c.getXVSAddress(),
    xvsVToken: await c.getXVSVTokenAddress(),
    allMarkets: (await c.getAllMarkets()).join(","),
  };
  const perMarket: Record<string, unknown> = {};
  for (const market of markets.slice(0, 5)) {
    const m = await c.markets(market);
    perMarket[market] = {
      isListed: m.isListed,
      collateralFactor: m.collateralFactorMantissa.toString(),
      isVenus: m.isVenus,
      supplyCap: (await c.supplyCaps(market)).toString(),
      borrowCap: (await c.borrowCaps(market)).toString(),
      supplySpeed: (await c.venusSupplySpeeds(market)).toString(),
      borrowSpeed: (await c.venusBorrowSpeeds(market)).toString(),
    };
  }
  return { globals, perMarket };
};

const markets = Object.values(VTOKENS_TO_UPGRADE);

const pinPriceFeeds = async () => {
  const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
  const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
  const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

  for (const asset of [USDT, USDC, WBNB, ETH, XVS]) {
    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      asset,
      ethers.constants.AddressZero,
      NORMAL_TIMELOCK,
    );
    await setRedstonePrice(
      bscmainnet.REDSTONE_ORACLE,
      asset,
      ethers.constants.AddressZero,
      NORMAL_TIMELOCK,
      undefined,
      {
        tokenDecimals: 18,
      },
    );
  }
};

forking(105727000, async () => {
  let comptroller: Contract;
  let liquidator: Contract;
  let liquidatorProxyAdmin: Contract;
  let leverageProxyAdmin: Contract;
  let leverageManager: Contract;
  let executorProxyAdmin: Contract;
  let rpm: Contract;
  let acm: Contract;
  let comptrollerSigner: Signer;
  let user: Signer;
  let userAddress: string;
  let leverageOwnerBefore: string;
  let storageBefore: any;
  let rpmStorageBefore: any;
  let originalBtcSpot: BigNumber;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);
    liquidatorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LIQUIDATOR_PROXY_ADMIN);
    leverageProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LEVERAGE_PROXY_ADMIN);
    leverageManager = await ethers.getContractAt(LEVERAGE_ABI, LEVERAGE_STRATEGIES_MANAGER);
    executorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, PROXY_ADMIN);
    rpm = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
    acm = await ethers.getContractAt(ACM_ABI, ACCESS_CONTROL_MANAGER);
    comptrollerSigner = await initMainnetUser(UNITROLLER, ethers.utils.parseEther("1"));
    [user] = await ethers.getSigners();
    userAddress = await user.getAddress();

    leverageOwnerBefore = await leverageManager.owner();
    // Snapshot Core Pool storage pre-VIP so we can assert the diamond recut leaves every slot intact.
    storageBefore = await readStorageSnapshot(comptroller);
    // Snapshot RPM storage pre-VIP (RPM is not upgraded; this must survive the VIP unchanged).
    rpmStorageBefore = await readRpmSnapshot(rpm);

    await pinPriceFeeds();

    // Pin BTC to a single Redstone feed
    const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    const btcbToken = await ethers.getContractAt(ERC20_ABI, BTCB);
    await setMaxStalePeriod(resilientOracle, btcbToken);
    await pinResilientOraclePriceViaRedstone(resilientOracle, BTCB);
    originalBtcSpot = await resilientOracle.getPrice(BTCB);

    await pinResilientOraclePriceViaRedstone(resilientOracle, VAI);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PRE-VIP — nothing points at the new implementations yet
  // ──────────────────────────────────────────────────────────────────────────
  describe("Pre-VIP behaviour", () => {
    it("the Diamond implementation is not yet the newly deployed one", async () => {
      expect(await comptroller.comptrollerImplementation()).to.not.equal(NEW_DIAMOND);
    });

    it("maxAssets() is currently served (the Diamond's inherited public getter still exists)", async () => {
      expect(await comptroller.maxAssets()).to.equal(100);
    });

    // The recompiled facets are not wired into the diamond yet — none of the selectors point at them.
    for (const { name, newFacet, selectors } of FACETS) {
      it(`${name}: its selectors are not bound to the new facet yet`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.not.equal(newFacet);
        }
      });
    }

    // … and the brand-new overloads do not exist on the diamond at all yet.
    it("the new RewardFacet overloads are not yet registered", async () => {
      expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(ethers.constants.AddressZero);
      expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(ethers.constants.AddressZero);
    });

    // Each existing selector is bound to the expected old facet, and that facet's on-chain selector
    // set deep-equals our data array exactly.
    for (const { name, oldFacet, selectors } of FACETS) {
      it(`${name}: the existing (old) facet matches our selector data exactly`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.equal(oldFacet);
        }
        expect(await facetSelectorsOf(comptroller, oldFacet)).to.deep.equal(normalizeSelectors(selectors));
      });
    }

    it("ComptrollerLens, Liquidator, LeverageStrategiesManager and Executor are not yet upgraded", async () => {
      expect(await comptroller.comptrollerLens()).to.not.equal(NEW_COMPTROLLER_LENS);
      expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.not.equal(NEW_LIQUIDATOR_IMPL);
      expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.not.equal(
        NEW_LEVERAGE_IMPL,
      );
      expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.not.equal(NEW_EXECUTOR_IMPL);
    });

    it("Core Pool markets are not yet on the newly deployed VBep20Delegate", async () => {
      for (const market of markets) {
        const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
        expect(await vToken.implementation()).to.not.equal(NEW_VTOKEN_DELEGATE);
      }
    });

    it("no grantee can call the new market-filtered seizeVenus overload yet", async () => {
      for (const account of SEIZE_VENUS_PERMISSION_GRANTEES) {
        expect(await acm.connect(comptrollerSigner).isAllowedToCall(account, SEIZE_VENUS_FILTERED_SIGNATURE)).to.equal(
          false,
        );
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // EXECUTE — run governance flow and assert emitted events
  // ──────────────────────────────────────────────────────────────────────────
  testVip("VIP-999 BNB Chain mainnet", await vip999(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);
      // Liquidator + LeverageStrategiesManager + Executor proxy upgrades.
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [3]);
      // One NewImplementation per repointed market plus one for the Diamond implementation swap.
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [markets.length + 1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [SEIZE_VENUS_PERMISSION_GRANTEES.length]);
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST-VIP — facet mapping preserved, everything repointed
  // ──────────────────────────────────────────────────────────────────────────
  describe("Post-VIP behaviour", () => {
    for (const { name, oldFacet, newFacet, selectors, newSelectors } of FACETS) {
      it(`every ${name} selector now resolves to the recompiled ${name}, no longer the old facet`, async () => {
        for (const selector of selectors) {
          const fa = await facetOf(comptroller, selector);
          expect(fa).to.equal(newFacet);
          expect(fa).to.not.equal(oldFacet);
        }
        // The recompiled facet's on-chain selector set deep-equals our existing selectors plus any
        // brand-new selectors the facet gained (RewardFacet's two market-filtered overloads).
        expect(await facetSelectorsOf(comptroller, newFacet)).to.deep.equal(
          normalizeSelectors([...selectors, ...newSelectors]),
        );
      });
    }

    it("the two new RewardFacet overloads are registered on the recompiled RewardFacet", async () => {
      const rewardFacet = FACETS.find(f => f.name === "RewardFacet")!.newFacet;
      expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(rewardFacet);
      expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(rewardFacet);
    });

    it("the Diamond implementation is swapped", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(NEW_DIAMOND);
    });

    it("Core Pool storage is preserved across the diamond recut (slots read identically)", async () => {
      expect(await readStorageSnapshot(comptroller)).to.deep.equal(storageBefore);
    });

    it("maxAssets() is dropped by the storage-visibility change (public -> private)", async () => {
      await expect(comptroller.maxAssets()).to.be.reverted;
    });

    it("ComptrollerLens is updated", async () => {
      expect(await comptroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
    });

    it("Liquidator, LeverageStrategiesManager and Executor are upgraded", async () => {
      expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.equal(NEW_LIQUIDATOR_IMPL);
      expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.equal(NEW_LEVERAGE_IMPL);
      expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.equal(NEW_EXECUTOR_IMPL);
    });

    it("RelativePositionManager storage is preserved across the VIP (it is not upgraded)", async () => {
      expect(await readRpmSnapshot(rpm)).to.deep.equal(rpmStorageBefore);
    });

    it("every upgraded Core Pool market points at the new VBep20Delegate", async () => {
      for (const market of markets) {
        const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
        expect(await vToken.implementation()).to.equal(NEW_VTOKEN_DELEGATE);
      }
    });

    it("every grantee is permitted to call the new market-filtered seizeVenus overload", async () => {
      for (const account of SEIZE_VENUS_PERMISSION_GRANTEES) {
        expect(await acm.connect(comptrollerSigner).isAllowedToCall(account, SEIZE_VENUS_FILTERED_SIGNATURE)).to.equal(
          true,
        );
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST-VIP — functional checks (recut diamond and upgraded proxies still work)
  // ──────────────────────────────────────────────────────────────────────────
  describe("Post-VIP functional checks", () => {
    it("the recut diamond still serves RewardFacet selectors", async () => {
      expect(await comptroller.getXVSVTokenAddress()).to.equal(XVS_VTOKEN);
    });

    it("the upgraded Liquidator proxy remains functional", async () => {
      expect((await liquidator.comptroller()).toLowerCase()).to.equal(UNITROLLER.toLowerCase());
    });

    it("the upgraded LeverageStrategiesManager preserves its state", async () => {
      expect(await leverageManager.owner()).to.equal(leverageOwnerBefore);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST-VIP — end-to-end behaviour against the real deployed implementations
  // ──────────────────────────────────────────────────────────────────────────
  describe("Post-VIP e2e", () => {
    it("market: a user can mint and redeem on the upgraded VBep20Delegate", async () => {
      const token = await ethers.getContractAt(ERC20_ABI, USDT);
      const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, VUSDT);
      const whale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await comptroller.connect(timelock)._setMarketSupplyCaps([VUSDT], [ethers.constants.MaxUint256]);

      const amount = ethers.utils.parseUnits("1000", await token.decimals());
      await token.connect(whale).transfer(userAddress, amount);
      await token.connect(user).approve(VUSDT, amount);
      await vToken.connect(user).mint(amount);

      // The full amount was supplied and the minted vTokens are worth ~that amount.
      expect(await token.balanceOf(userAddress)).to.equal(0);
      const vBalance = await vToken.balanceOf(userAddress);
      expect(await vToken.callStatic.balanceOfUnderlying(userAddress)).to.be.closeTo(amount, amount.div(1000));

      await vToken.connect(user).redeem(vBalance);
      // Fully redeemed back to the underlying.
      expect(await vToken.balanceOf(userAddress)).to.equal(0);
      expect(await token.balanceOf(userAddress)).to.be.closeTo(amount, amount.div(1000));
    });

    it("comptroller: a user can enter a market on the recut diamond", async () => {
      await comptroller.connect(user).enterMarkets([VUSDT]);
      expect(await comptroller.checkMembership(userAddress, VUSDT)).to.equal(true);
    });

    it("comptroller: the timelock can call the new market-filtered seizeVenus overload", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const [, freshHolder] = await ethers.getSigners();
      const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, timelock);
      await expect(rewardFacet.seizeVenus([await freshHolder.getAddress()], NORMAL_TIMELOCK, [XVS_VTOKEN])).to.not.be
        .reverted;
    });

    it("comptroller: the new market-filtered seizeVenus overload reverts for an unauthorized caller", async () => {
      const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, user);
      await expect(rewardFacet.seizeVenus([userAddress], userAddress, [XVS_VTOKEN])).to.be.revertedWith(
        "access denied",
      );
    });

    it("comptroller: a user can call the new market-filtered claimVenusAsCollateral overload", async () => {
      const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, user);
      await expect(rewardFacet.claimVenusAsCollateral(userAddress, [VUSDT])).to.not.be.reverted;
    });

    it("LSM: the owner is the Normal Timelock and can sweep tokens from the upgraded manager", async () => {
      const ownerAddress = await leverageManager.owner();
      expect(ownerAddress).to.equal(NORMAL_TIMELOCK);

      const token = await ethers.getContractAt(ERC20_ABI, USDT);
      const amount = ethers.utils.parseUnits("100", await token.decimals());
      const whale = await initMainnetUser(USDT_WHALE, ethers.utils.parseEther("1"));
      await token.connect(whale).transfer(LEVERAGE_STRATEGIES_MANAGER, amount);
      const owner = await initMainnetUser(ownerAddress, ethers.utils.parseEther("1"));
      const before = await token.balanceOf(ownerAddress);
      await expect(leverageManager.connect(owner).sweepToken(USDT)).to.emit(leverageManager, "TokensSwept");
      expect(await token.balanceOf(ownerAddress)).to.equal(before.add(amount));
    });

    it("LSM: sweepToken reverts for a non-owner", async () => {
      await expect(leverageManager.connect(user).sweepToken(USDT)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  // Cross-asset leverage round-trip driven through the RelativePositionManager, which opens and
  // unwinds the position via the upgraded LeverageStrategiesManager. DSA = USDC, long = WBNB, short = ETH.
  describe("Post-VIP e2e: cross-asset leverage via RelativePositionManager", function () {
    const DSA = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // USDC
    const LONG = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
    const vLONG = VTOKENS_TO_UPGRADE.vWBNB;
    const SHORT = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"; // ETH
    const vSHORT = VTOKENS_TO_UPGRADE.vETH;
    const USDC_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury
    const ETH_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury
    const WBNB_WHALE = vLONG; // vWBNB holds the underlying WBNB

    // A full close adds the 2% proportional-close tolerance plus a 0.2% interest-accrual buffer.
    const FULL_CLOSE_BUFFER_BPS = 1022;

    let rpm: Contract;
    let swapHelper: Contract;
    let dsa: Contract;
    let shortVToken: Contract;
    let alice: Signer;
    let aliceAddress: string;
    let domain: { name: string; version: string; chainId: number; verifyingContract: string };

    // Deterministic swap: fund the SwapHelper with the output token from a whale and sign a multicall
    // that transfers exactly amountOut to the recipient.
    const manipulatedSwap = async (
      tokenOut: string,
      amountOut: BigNumber,
      recipient: string,
      whale: string,
    ): Promise<string> => {
      const whaleSigner = await initMainnetUser(whale, ethers.utils.parseEther("1"));
      await new ethers.Contract(tokenOut, ERC20_ABI, whaleSigner).transfer(swapHelper.address, amountOut);

      const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);
      const transferData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [recipient, amountOut]);
      const calls = [swapHelperIface.encodeFunctionData("genericCall", [tokenOut, transferData])];
      const deadline = Math.floor(Date.now() / 1000) + 20 * 365 * 24 * 60 * 60;
      const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));
      const types = {
        Multicall: [
          { name: "caller", type: "address" },
          { name: "calls", type: "bytes[]" },
          { name: "deadline", type: "uint256" },
          { name: "salt", type: "bytes32" },
        ],
      };
      const signature = await new Wallet(SWAP_BACKEND_PK, ethers.provider)._signTypedData(domain, types, {
        caller: recipient,
        calls,
        deadline,
        salt,
      });
      return swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);
    };

    before(async () => {
      [, alice] = await ethers.getSigners();
      aliceAddress = await alice.getAddress();

      rpm = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
      dsa = await ethers.getContractAt(ERC20_ABI, DSA);
      shortVToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, vSHORT);

      swapHelper = await ethers.getContractAt(SWAP_HELPER_ABI, await leverageManager.swapHelper());
      const eip712 = await swapHelper.eip712Domain();
      const { chainId } = await ethers.provider.getNetwork();
      domain = { name: eip712.name, version: eip712.version, chainId, verifyingContract: swapHelper.address };
      const swapHelperOwner = await initMainnetUser(await swapHelper.owner(), ethers.utils.parseEther("1"));
      await swapHelper.connect(swapHelperOwner).setBackendSigner(new Wallet(SWAP_BACKEND_PK).address);
    });

    it("opens a leveraged position and fully closes it with profit", async () => {
      const INITIAL_PRINCIPAL = ethers.utils.parseUnits("9000", 18);
      const SHORT_AMOUNT = ethers.utils.parseUnits("4", 18); // 4 ETH flash-borrowed
      const LONG_AMOUNT = ethers.utils.parseUnits("30", 18); // 30 WBNB collateral
      const leverage = ethers.utils.parseUnits("1.5", 18);

      const usdcWhale = await initMainnetUser(USDC_WHALE, ethers.utils.parseEther("1"));
      await dsa.connect(usdcWhale).transfer(aliceAddress, INITIAL_PRINCIPAL);
      await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

      // Open: the flash-borrowed ETH is swapped into WBNB collateral.
      const minLong = LONG_AMOUNT.mul(98).div(100);
      const openSwapData = await manipulatedSwap(LONG, LONG_AMOUNT, LEVERAGE_STRATEGIES_MANAGER, WBNB_WHALE);
      await rpm
        .connect(alice)
        .activateAndOpenPosition(vLONG, vSHORT, 0, INITIAL_PRINCIPAL, leverage, SHORT_AMOUNT, minLong, openSwapData);

      const position = await rpm.getPosition(aliceAddress, vLONG, vSHORT);
      expect(position.isActive).to.equal(true);
      const positionAccount = position.positionAccount;

      const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
      const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(aliceAddress, vLONG, vSHORT);
      expect(shortDebtAfterOpen).to.be.closeTo(SHORT_AMOUNT, SHORT_AMOUNT.div(1000));
      expect(longBalanceAfterOpen).to.be.gte(minLong);

      // Full close with profit: 75% of the WBNB repays the ETH debt, the remaining 25% is taken as USDC profit.
      const longForRepay = longBalanceAfterOpen.mul(75).div(100);
      const longForProfit = longBalanceAfterOpen.sub(longForRepay);
      const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);
      const estimatedProfit = longForProfit.mul(500); // ~1 WBNB ≈ 500 USDC

      const repaySwapData = await manipulatedSwap(SHORT, shortRepayAmount, LEVERAGE_STRATEGIES_MANAGER, ETH_WHALE);
      const profitSwapData = await manipulatedSwap(DSA, estimatedProfit, RELATIVE_POSITION_MANAGER, USDC_WHALE);

      await rpm
        .connect(alice)
        .closeWithProfit(
          vLONG,
          vSHORT,
          10000,
          longForRepay,
          shortRepayAmount,
          repaySwapData,
          longForProfit,
          estimatedProfit.mul(98).div(100),
          profitSwapData,
        );

      // The position is fully unwound: no remaining ETH debt and no remaining WBNB collateral.
      expect(await shortVToken.callStatic.borrowBalanceCurrent(positionAccount)).to.equal(0);
      expect(await rpm.callStatic.getLongCollateralBalance(aliceAddress, vLONG, vSHORT)).to.equal(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST-VIP e2e — full Core Pool lifecycle exercising the recut diamond and the
  // newly deployed VBep20Delegate end to end: supply → borrow → liquidate →
  // repay → redeem. BTCB is the collateral (CF 0.8); USDT is the borrowed asset.
  // ──────────────────────────────────────────────────────────────────────────
  describe("Post-VIP e2e: Core Pool supply → borrow → liquidate → repay → redeem", () => {
    const WHALE = bscmainnet.GENERIC_TEST_USER_ACCOUNT;
    let BORROWER!: string;
    let LIQ!: string;

    let resilient: Contract;
    let redstone: Contract;
    let vBtc: Contract;
    let vUsdt: Contract;
    let btcb: Contract;
    let usdtToken: Contract;
    let liquidatorContract: Contract;
    let timelock: Signer;
    let whale: Signer;
    let borrower: Signer;
    let liquidatorUser: Signer;
    let snapshotId: string;
    let borrowAmount: BigNumber;

    before(async () => {
      snapshotId = await ethers.provider.send("evm_snapshot", []);

      resilient = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
      redstone = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
      vBtc = await ethers.getContractAt(VTOKEN_ABI, VBTC);
      vUsdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
      btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
      usdtToken = await ethers.getContractAt(ERC20_ABI, USDT);
      liquidatorContract = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);

      timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      whale = await initMainnetUser(WHALE, ethers.utils.parseEther("1"));
      // Fresh actors: Hardhat's pre-funded local signers (indices 0/1 are used by other tests).
      [, , borrower, liquidatorUser] = await ethers.getSigners();
      BORROWER = await borrower.getAddress();
      LIQ = await liquidatorUser.getAddress();

      // BTC was pinned to a single Redstone feed.
      // Lift caps so neither leg is gated by a supply/borrow cap.
      await comptroller.connect(timelock)._setMarketSupplyCaps([VBTC], [ethers.constants.MaxUint256]);
      await comptroller.connect(timelock)._setMarketBorrowCaps([VUSDT], [ethers.constants.MaxUint256]);

      // Fund the fresh accounts from the whale.
      await btcb.connect(whale).transfer(BORROWER, ethers.utils.parseEther("1"));
      await usdtToken.connect(whale).transfer(LIQ, ethers.utils.parseUnits("50000", 18));
    });

    after(async () => {
      await ethers.provider.send("evm_revert", [snapshotId]);
    });

    it("supply: borrower mints vBTC on the new delegate and enters the market", async () => {
      const amount = ethers.utils.parseEther("1");
      await btcb.connect(borrower).approve(VBTC, amount);
      await vBtc.connect(borrower).mint(amount);
      await comptroller.connect(borrower).enterMarkets([VBTC]);

      expect(await vBtc.balanceOf(BORROWER)).to.be.gt(0);
      expect(await comptroller.checkMembership(BORROWER, VBTC)).to.equal(true);
    });

    it("borrow: borrower draws USDT (~70% of capacity) against the BTC collateral", async () => {
      const [err, liquidity] = await comptroller.getAccountLiquidity(BORROWER);
      expect(err).to.equal(0);
      expect(liquidity).to.be.gt(0);

      const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
      borrowAmount = liquidity.mul(70).div(100).mul(ethers.constants.WeiPerEther).div(usdtPrice);

      const before = await usdtToken.balanceOf(BORROWER);
      await vUsdt.connect(borrower).borrow(borrowAmount);
      expect((await usdtToken.balanceOf(BORROWER)).sub(before)).to.equal(borrowAmount);
      expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.closeTo(borrowAmount, borrowAmount.div(1000));
    });

    it("liquidate: a 50% BTC crash flips the borrower into shortfall and a liquidator seizes vBTC", async () => {
      await redstone.connect(timelock).setDirectPrice(BTCB, originalBtcSpot.div(2));
      expect(await resilient.getPrice(BTCB)).to.equal(originalBtcSpot.div(2));

      const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(shortfall).to.be.gt(0);

      const repayAmount = ethers.utils.parseUnits("1000", 18); // well under closeFactor (50%) of the debt
      await usdtToken.connect(liquidatorUser).approve(LIQUIDATOR, repayAmount);

      const liqVBtcBefore = await vBtc.balanceOf(LIQ);
      const debtBefore = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
      await expect(
        liquidatorContract.connect(liquidatorUser).liquidateBorrow(VUSDT, BORROWER, repayAmount, VBTC),
      ).to.emit(vUsdt, "LiquidateBorrow");

      expect(await vBtc.balanceOf(LIQ)).to.be.gt(liqVBtcBefore); // seized vBTC collateral
      expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.lt(debtBefore); // debt reduced
    });

    it("repay: borrower fully repays the remaining USDT debt", async () => {
      await usdtToken.connect(whale).transfer(BORROWER, ethers.utils.parseUnits("50000", 18));
      await usdtToken.connect(borrower).approve(VUSDT, ethers.constants.MaxUint256);
      await vUsdt.connect(borrower).repayBorrow(ethers.constants.MaxUint256);
      expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.equal(0);
    });

    it("redeem: borrower redeems the remaining vBTC back to BTCB on the new delegate", async () => {
      await redstone.connect(timelock).setDirectPrice(BTCB, originalBtcSpot); // restore price
      const vBtcBalance = await vBtc.balanceOf(BORROWER);
      expect(vBtcBalance).to.be.gt(0);

      const btcBefore = await btcb.balanceOf(BORROWER);
      await vBtc.connect(borrower).redeem(vBtcBalance);
      expect(await vBtc.balanceOf(BORROWER)).to.equal(0);
      expect(await btcb.balanceOf(BORROWER)).to.be.gt(btcBefore);
    });
  });
});
