import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bsctestnet";
import {
  ACCESS_CONTROL_MANAGER,
  FLASHLOAN_FACET_SELECTORS,
  LEVERAGE_PROXY_ADMIN,
  LEVERAGE_STRATEGIES_MANAGER,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  MARKET_FACET_SELECTORS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_FLASHLOAN_FACET,
  NEW_LEVERAGE_IMPL,
  NEW_LIQUIDATOR_IMPL,
  NEW_MARKET_FACET,
  NEW_POLICY_FACET,
  NEW_REWARD_FACET,
  NEW_SETTER_FACET,
  NEW_VTOKEN_DELEGATE,
  POLICY_FACET_SELECTORS,
  REWARD_FACET_EXISTING_SELECTORS,
  SEIZE_VENUS_FILTERED_SIGNATURE,
  SEIZE_VENUS_PERMISSION_GRANTEES,
  SETTER_FACET_SELECTORS,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "../../vips/vip-999/utils/data.bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import LEVERAGE_ABI from "./abi/LeverageStrategiesManager.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const XVS_VTOKEN = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E"; // vXVS

const NEW_CLAIM_AS_COLLATERAL_SELECTOR = "0xc2dbfc50"; // claimVenusAsCollateral(address,address[])
const NEW_SEIZE_SELECTOR = "0xf74c8f31"; // seizeVenus(address[],address,address[])

const E2E_USER = "0x1111111111111111111111111111111111111112";
const VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const VTOKEN_ABI = [
  "function mint(uint256) returns (uint256)",
  "function redeem(uint256) returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allocateTo(address,uint256)",
];
const SEIZE_VENUS_NEW_ABI = ["function seizeVenus(address[],address,address[]) returns (uint256)"];
const CLAIM_AS_COLLATERAL_NEW_ABI = ["function claimVenusAsCollateral(address,address[])"];
const MAX_ASSETS_ABI = ["function maxAssets() view returns (uint256)"];
const READS_ABI = [
  "function closeFactorMantissa() view returns (uint256)",
  "function pauseGuardian() view returns (address)",
  "function vaiController() view returns (address)",
  "function vaiMintRate() view returns (uint256)",
  "function getXVSAddress() view returns (address)",
  "function getXVSVTokenAddress() view returns (address)",
  "function getAllMarkets() view returns (address[])",
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, bool isVenus)",
  "function supplyCaps(address) view returns (uint256)",
  "function borrowCaps(address) view returns (uint256)",
  "function venusSupplySpeeds(address) view returns (uint256)",
  "function venusBorrowSpeeds(address) view returns (uint256)",
];

const NORMAL_TIMELOCK = bsctestnet.NORMAL_TIMELOCK;

const FACET_GROUPS = [
  { name: "MarketFacet", newFacet: NEW_MARKET_FACET, selectors: MARKET_FACET_SELECTORS },
  { name: "PolicyFacet", newFacet: NEW_POLICY_FACET, selectors: POLICY_FACET_SELECTORS },
  { name: "RewardFacet", newFacet: NEW_REWARD_FACET, selectors: REWARD_FACET_EXISTING_SELECTORS },
  { name: "SetterFacet", newFacet: NEW_SETTER_FACET, selectors: SETTER_FACET_SELECTORS },
  { name: "FlashLoanFacet", newFacet: NEW_FLASHLOAN_FACET, selectors: FLASHLOAN_FACET_SELECTORS },
];

const facetOf = async (comptroller: Contract, selector: string): Promise<string> => {
  return (await comptroller.facetAddress(selector)).facetAddress;
};

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

forking(111367637, async () => {
  let comptroller: Contract;
  let liquidator: Contract;
  let liquidatorProxyAdmin: Contract;
  let leverageProxyAdmin: Contract;
  let leverageManager: Contract;
  let acm: Contract;
  let reads: Contract;
  let maxAssetsView: Contract;
  let comptrollerSigner: Signer;
  let leverageOwnerBefore: string;
  let storageBefore: any;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);
    liquidatorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LIQUIDATOR_PROXY_ADMIN);
    leverageProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LEVERAGE_PROXY_ADMIN);
    leverageManager = await ethers.getContractAt(LEVERAGE_ABI, LEVERAGE_STRATEGIES_MANAGER);
    acm = await ethers.getContractAt(ACM_ABI, ACCESS_CONTROL_MANAGER);
    reads = await ethers.getContractAt(READS_ABI, UNITROLLER);
    maxAssetsView = await ethers.getContractAt(MAX_ASSETS_ABI, UNITROLLER);
    comptrollerSigner = await initMainnetUser(UNITROLLER, ethers.utils.parseEther("1"));

    leverageOwnerBefore = await leverageManager.owner();
    // Snapshot Core Pool storage pre-VIP so we can assert the diamond recut leaves every slot intact.
    storageBefore = await readStorageSnapshot(reads);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PRE-VIP — nothing points at the new implementations yet
  // ──────────────────────────────────────────────────────────────────────────
  describe("Pre-VIP behaviour", () => {
    it("the new RewardFacet overloads are not yet registered", async () => {
      expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(ethers.constants.AddressZero);
      expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(ethers.constants.AddressZero);
    });

    it("the Diamond implementation is not yet the newly deployed one", async () => {
      expect(await comptroller.comptrollerImplementation()).to.not.equal(NEW_DIAMOND);
    });

    it("maxAssets() is currently served (the Diamond's inherited public getter still exists)", async () => {
      expect(await maxAssetsView.maxAssets()).to.be.gte(0);
    });

    for (const { name, newFacet, selectors } of FACET_GROUPS) {
      it(`all ${name} selectors are served by a single existing facet (not the new one)`, async () => {
        const current = await facetOf(comptroller, selectors[0]);
        expect(current).to.not.equal(ethers.constants.AddressZero);
        expect(current).to.not.equal(newFacet);
      });
    }

    it("ComptrollerLens, Liquidator and LeverageStrategiesManager are not yet upgraded", async () => {
      expect(await comptroller.comptrollerLens()).to.not.equal(NEW_COMPTROLLER_LENS);
      expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.not.equal(NEW_LIQUIDATOR_IMPL);
      expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.not.equal(
        NEW_LEVERAGE_IMPL,
      );
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
  testVip("VIP-999 BNB Chain testnet", await vip999(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut"], [1]);
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewComptrollerLens"], [1]);
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [2]);
      // One NewImplementation per repointed market plus one for the Diamond implementation swap.
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [markets.length + 1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [SEIZE_VENUS_PERMISSION_GRANTEES.length]);
    },
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST-VIP — facet mapping preserved, everything repointed
  // ──────────────────────────────────────────────────────────────────────────
  describe("Post-VIP behaviour", () => {
    for (const { name, newFacet, selectors } of FACET_GROUPS) {
      it(`every ${name} selector now resolves to the recompiled ${name} (mapping preserved)`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.equal(newFacet);
        }
      });
    }

    it("the two new RewardFacet overloads are registered on the recompiled RewardFacet", async () => {
      expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(NEW_REWARD_FACET);
      expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(NEW_REWARD_FACET);
    });

    it("the Diamond implementation is swapped", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(NEW_DIAMOND);
    });

    it("Core Pool storage is preserved across the diamond recut (slots read identically)", async () => {
      expect(await readStorageSnapshot(reads)).to.deep.equal(storageBefore);
    });

    it("maxAssets() is dropped by the storage-visibility change (public -> private)", async () => {
      await expect(maxAssetsView.maxAssets()).to.be.reverted;
    });

    it("ComptrollerLens is updated", async () => {
      expect(await comptroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
    });

    it("Liquidator and LeverageStrategiesManager are upgraded", async () => {
      expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.equal(NEW_LIQUIDATOR_IMPL);
      expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.equal(NEW_LEVERAGE_IMPL);
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
      const vToken = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      const timelock = await initMainnetUser(SEIZE_VENUS_PERMISSION_GRANTEES[0], ethers.utils.parseEther("1"));
      await comptroller.connect(timelock)._setMarketSupplyCaps([VUSDT], [ethers.constants.MaxUint256]);

      const amount = ethers.utils.parseUnits("1000", await token.decimals());
      await token.allocateTo(E2E_USER, amount);
      await token.connect(user).approve(VUSDT, amount);
      await expect(vToken.connect(user).mint(amount)).to.not.be.reverted;
      const vBalance = await vToken.balanceOf(E2E_USER);
      expect(vBalance).to.be.gt(0);
      await expect(vToken.connect(user).redeem(vBalance)).to.not.be.reverted;
    });

    it("comptroller: a user can enter a market on the recut diamond", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      await comptroller.connect(user).enterMarkets([VUSDT]);
      expect(await comptroller.checkMembership(E2E_USER, VUSDT)).to.equal(true);
    });

    it("comptroller: the timelock can call the new market-filtered seizeVenus overload", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const diamond = await ethers.getContractAt(SEIZE_VENUS_NEW_ABI, UNITROLLER);
      await expect(diamond.connect(timelock).seizeVenus([E2E_USER], NORMAL_TIMELOCK, [XVS_VTOKEN])).to.not.be.reverted;
    });

    it("comptroller: the new market-filtered seizeVenus overload reverts for an unauthorized caller", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      const diamond = await ethers.getContractAt(SEIZE_VENUS_NEW_ABI, UNITROLLER);
      await expect(diamond.connect(user).seizeVenus([E2E_USER], E2E_USER, [XVS_VTOKEN])).to.be.revertedWith(
        "access denied",
      );
    });

    it("comptroller: a user can call the new market-filtered claimVenusAsCollateral overload", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      const diamond = await ethers.getContractAt(CLAIM_AS_COLLATERAL_NEW_ABI, UNITROLLER);
      await expect(diamond.connect(user).claimVenusAsCollateral(E2E_USER, [VUSDT])).to.not.be.reverted;
    });

    it("LSM: the owner is the Normal Timelock and can sweep tokens from the upgraded manager", async () => {
      const ownerAddress = await leverageManager.owner();
      expect(ownerAddress).to.equal(NORMAL_TIMELOCK);

      const token = await ethers.getContractAt(ERC20_ABI, USDT);
      const amount = ethers.utils.parseUnits("100", await token.decimals());
      await token.allocateTo(LEVERAGE_STRATEGIES_MANAGER, amount);
      const owner = await initMainnetUser(ownerAddress, ethers.utils.parseEther("1"));
      const before = await token.balanceOf(ownerAddress);
      await expect(leverageManager.connect(owner).sweepToken(USDT)).to.emit(leverageManager, "TokensSwept");
      expect(await token.balanceOf(ownerAddress)).to.equal(before.add(amount));
    });

    it("LSM: sweepToken reverts for a non-owner", async () => {
      const user = await initMainnetUser(E2E_USER, ethers.utils.parseEther("1"));
      await expect(leverageManager.connect(user).sweepToken(USDT)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });
});
