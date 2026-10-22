import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip996, {
  ACM,
  ADAPTERS,
  BSTOCK_PAUSE_SENTINEL,
  CENTRIFUGE_SOURCE_USDT,
  CENTRIFUGE_VAULT_USDT,
  CORE_COMPTROLLER,
  DECREASE_CF,
  EBRAKE,
  ENTER_MARKET_FOR_ACCOUNT,
  GATEWAY_COMPTROLLERS,
  GUARDIAN,
  HUB_BEACON,
  HUB_NAV_SETTERS,
  HUB_USDT,
  MIN_HUB_NAV_GAP_BPS,
  NEW_COLLATERAL_GATEWAY,
  NEW_EBRAKE_IMPLEMENTATION,
  NEW_HUB_IMPLEMENTATION,
  NEW_HUB_NAV_SENTINEL,
  NEW_PSR_IMPLEMENTATION,
  NORMAL_TIMELOCK,
  OLD_COLLATERAL_GATEWAY,
  OLD_EBRAKE_IMPLEMENTATION,
  OLD_HUB_IMPLEMENTATION,
  OLD_HUB_NAV_SENTINEL,
  OLD_PSR_IMPLEMENTATION,
  PAUSE_DOWN_BPS,
  PAUSE_HUB,
  PAUSE_UP_BPS,
  PSR,
  QA_SPOKE_COMPTROLLER,
  RESOURCES,
  SENTINEL_SETTERS,
  SET_ACTIONS_PAUSED,
  SPOKE_COMPTROLLER,
} from "../../vips/vip-668/bsctestnet-hub-upgrades";
import ACM_ABI from "./abi/AccessControlManager.json";
import FLASH_LOAN_FACET_ABI from "./abi/FlashLoanFacet.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// After the new PSR, Hub, adapter, CollateralGateway, EBrake and BStockPauseSentinel deployments.
const BLOCK_NUMBER = 136587609;

const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const CORE_VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const HUB_LENS = "0x2e5e48242aB01b636CA0684AED2B22aDE108e337";
const VUSDT_SPOKE = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a";
const VTSLAB_SPOKE = "0x301d27Fa22FE4d2e7397550ACa825140EB7Bff3a";
const VUSDT_QA_SPOKE = "0x1AEf50b005089AeA10DE70b83250C55d6A9E9848";
const DEPLOYER = "0x9b0A3EAE7f174937d31745B710BbeA68e9D1BEf7";
const BORROW_ACTION = 2;

// Holds nothing anywhere. `enterMarketForAccount` only records membership, so it needs no balance.
const BENEFICIARY = "0x0000000000000000000000000000000000000200";

const UPGRADED_ABI = [
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "implementation", type: "address" }],
    name: "Upgraded",
    type: "event",
  },
];
const PSR_ABI = [
  "function getPoolRegistries() view returns (address[])",
  "function maxLoopsLimit() view returns (uint256)",
  "function setMaxLoopsLimit(uint256)",
];
const BEACON_ABI = ["function implementation() view returns (address)"];
const HUB_ABI = [
  "function totalAssets() view returns (uint256)",
  "function maxDeposit(address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",
  "function maxRedeem(address owner) view returns (uint256)",
  "function previewRedeem(uint256 shares) view returns (uint256)",
];
const USDT_ABI = [
  "function allocateTo(address, uint256)",
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];
const HUB_LENS_ABI = ["function maxDeposit(address hub) view returns (uint256)"];
const OWNABLE_ABI = ["function owner() view returns (address)", "function pendingOwner() view returns (address)"];
const OWNERSHIP_EVENT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
];
const HUB_NAV_SENTINEL_ABI = [
  "function trustedKeepers(address) view returns (bool)",
  "function minHubNavGapBps() view returns (uint16)",
  "function navGuardConfigs(address, address) view returns (address hub, uint16 pauseUpBps, uint16 pauseDownBps, bool enabled)",
];
const EBRAKE_ABI = [
  "function decreaseCF(address market, uint256 newCF)",
  "function pauseBorrow(address market)",
  "function pauseHub(address hub)",
];
const SPOKE_COMPTROLLER_ABI = [
  "function markets(address) view returns (bool isListed, uint256 collateralFactorMantissa, uint256 liquidationThresholdMantissa)",
  "function actionPaused(address market, uint8 action) view returns (bool)",
];
const ENTER_MARKET_ABI = [
  "function enterMarketForAccount(address account, address vToken)",
  "function checkMembership(address account, address vToken) view returns (bool)",
];

const implementationOf = async (proxy: string): Promise<string> => {
  const word = await ethers.provider.getStorageAt(proxy, IMPLEMENTATION_SLOT);
  return ethers.utils.getAddress(ethers.utils.hexDataSlice(word, 12));
};

const adaptersInUse = async (): Promise<string[]> =>
  Promise.all(
    RESOURCES.map(async ({ group, resource }) => {
      const yieldGroup = await ethers.getContractAt(YIELD_GROUP_ABI, group);
      const [, , adapter] = await yieldGroup.resourceConfig(resource);
      return adapter;
    }),
  );

// `isAllowedToCall` keys the role on `msg.sender`, so it is asked from the guarded contract's own address. It also
// counts address(0) wildcards, which `hasRole` does not.
const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const isAllowed = async (contract: string, sig: string, account: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, sig]);
  const result = await ethers.provider.call({ to: ACM, data, from: contract });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};
const enterMarketGrants = async (account: string) =>
  Promise.all(GATEWAY_COMPTROLLERS.map(comptroller => isAllowed(comptroller, ENTER_MARKET_FOR_ACCOUNT, account)));
const hubNavGrants = async () => [
  await isAllowed(EBRAKE, PAUSE_HUB, NEW_HUB_NAV_SENTINEL),
  await isAllowed(EBRAKE, PAUSE_HUB, OLD_HUB_NAV_SENTINEL),
  ...(await Promise.all(
    [NORMAL_TIMELOCK, GUARDIAN].flatMap(account =>
      HUB_NAV_SETTERS.map(sig => isAllowed(NEW_HUB_NAV_SENTINEL, sig, account)),
    ),
  )),
];
const eBrakeGrants = async () => [
  await isAllowed(SPOKE_COMPTROLLER, SET_ACTIONS_PAUSED, EBRAKE),
  await isAllowed(QA_SPOKE_COMPTROLLER, SET_ACTIONS_PAUSED, EBRAKE),
  await isAllowed(EBRAKE, DECREASE_CF, BSTOCK_PAUSE_SENTINEL),
  ...(await Promise.all(
    SENTINEL_SETTERS.flatMap(sig => [
      isAllowed(BSTOCK_PAUSE_SENTINEL, sig, NORMAL_TIMELOCK),
      isAllowed(BSTOCK_PAUSE_SENTINEL, sig, GUARDIAN),
    ]),
  )),
];

forking(BLOCK_NUMBER, async () => {
  let core: Contract;
  let psr: Contract;
  let hub: Contract;
  let registriesBefore: string[];
  let maxLoopsLimitBefore: BigNumber;
  let totalAssetsBefore: BigNumber;

  before(async () => {
    core = await ethers.getContractAt(FLASH_LOAN_FACET_ABI, CORE_COMPTROLLER);
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    registriesBefore = await psr.getPoolRegistries();
    maxLoopsLimitBefore = await psr.maxLoopsLimit();
    totalAssetsBefore = await hub.totalAssets();
  });

  describe("Pre-VIP state", () => {
    it("ProtocolShareReserve runs the previous implementation", async () => {
      expect(await implementationOf(PSR)).to.equal(ethers.utils.getAddress(OLD_PSR_IMPLEMENTATION));
    });

    it("the Hub beacon points at the previous implementation", async () => {
      const beacon = await ethers.getContractAt(BEACON_ABI, HUB_BEACON);
      expect(await beacon.implementation()).to.equal(OLD_HUB_IMPLEMENTATION);
    });

    it("every resource uses its previous adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].old));
    });

    it("EBrake runs the previous implementation", async () => {
      expect(await implementationOf(EBRAKE)).to.equal(OLD_EBRAKE_IMPLEMENTATION);
    });

    it("EBrake and the BStockPauseSentinel hold none of the new grants", async () => {
      expect(await eBrakeGrants()).to.deep.equal([false, false, false, false, false, false, false]);
    });

    it("the BStockPauseSentinel is owned by its deployer, with the Normal Timelock pending", async () => {
      const sentinel = await ethers.getContractAt(OWNABLE_ABI, BSTOCK_PAUSE_SENTINEL);
      expect(await sentinel.owner()).to.equal(DEPLOYER);
      expect(await sentinel.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("only the previous HubNavDeviationSentinel can pause a Hub, and the new one holds no grant", async () => {
      expect(await hubNavGrants()).to.deep.equal([false, true, false, false, false, false, false, false, false, false]);
    });

    it("the new HubNavDeviationSentinel is owned by its deployer, with the Normal Timelock pending", async () => {
      const sentinel = await ethers.getContractAt(OWNABLE_ABI, NEW_HUB_NAV_SENTINEL);
      expect(await sentinel.owner()).to.equal(DEPLOYER);
      expect(await sentinel.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the new gateway holds no grant, not even through a wildcard", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([false, false, false]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("the old gateway holds all four grants", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([true, true, true]);
      expect(await core.authorizedFlashLoan(OLD_COLLATERAL_GATEWAY)).to.equal(true);
    });
  });

  testVip(
    "VIP-996 [BNB Chain Testnet] Hub, ProtocolShareReserve, CollateralGateway and EBrake upgrades",
    await vip996(),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(txResponse, [UPGRADED_ABI], ["Upgraded"], [3]);
        await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdapterUpdated"], [RESOURCES.length]);
        await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [19, 3]);
        await expectEvents(txResponse, [FLASH_LOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [2]);
        await expectEvents(txResponse, [OWNERSHIP_EVENT_ABI], ["OwnershipTransferred"], [2]);
      },
    },
  );

  describe("Post-VIP state", () => {
    it("ProtocolShareReserve runs the new implementation with its registries and loop limit unchanged", async () => {
      expect(await implementationOf(PSR)).to.equal(ethers.utils.getAddress(NEW_PSR_IMPLEMENTATION));
      expect(await psr.getPoolRegistries()).to.deep.equal(registriesBefore);
      expect(await psr.maxLoopsLimit()).to.equal(maxLoopsLimitBefore);
    });

    it("ProtocolShareReserve exposes setMaxLoopsLimit, restricted to its owner", async () => {
      const [stranger] = await ethers.getSigners();
      await expect(psr.connect(stranger).setMaxLoopsLimit(maxLoopsLimitBefore.add(1))).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

    it("the Hub beacon points at the new implementation", async () => {
      const beacon = await ethers.getContractAt(BEACON_ABI, HUB_BEACON);
      expect(await beacon.implementation()).to.equal(NEW_HUB_IMPLEMENTATION);
    });

    it("Hub_USDT's maxDeposit is uncapped, as the new implementation defines it", async () => {
      expect(await hub.maxDeposit(BENEFICIARY)).to.equal(ethers.constants.MaxUint256);
    });

    it("Hub_USDT's total assets do not fall", async () => {
      expect(await hub.totalAssets()).to.be.gte(totalAssetsBefore);
    });

    it("every resource uses its new adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].new));
    });

    it("EBrake runs the new implementation", async () => {
      expect(await implementationOf(EBRAKE)).to.equal(ethers.utils.getAddress(NEW_EBRAKE_IMPLEMENTATION));
    });

    it("EBrake and the BStockPauseSentinel hold every new grant", async () => {
      expect(await eBrakeGrants()).to.deep.equal([true, true, true, true, true, true, true]);
    });

    it("the Normal Timelock owns the BStockPauseSentinel", async () => {
      const sentinel = await ethers.getContractAt(OWNABLE_ABI, BSTOCK_PAUSE_SENTINEL);
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("both HubNavDeviationSentinels can pause a Hub, and governance holds the new one's setters", async () => {
      expect(await hubNavGrants()).to.deep.equal([true, true, true, true, true, true, true, true, true, true]);
    });

    it("the Normal Timelock owns the new HubNavDeviationSentinel", async () => {
      const sentinel = await ethers.getContractAt(OWNABLE_ABI, NEW_HUB_NAV_SENTINEL);
      expect(await sentinel.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the new HubNavDeviationSentinel carries the previous one's configuration", async () => {
      const fresh = await ethers.getContractAt(HUB_NAV_SENTINEL_ABI, NEW_HUB_NAV_SENTINEL);
      const old = await ethers.getContractAt(HUB_NAV_SENTINEL_ABI, OLD_HUB_NAV_SENTINEL);
      expect(await fresh.trustedKeepers(GUARDIAN)).to.equal(true);
      expect(await fresh.minHubNavGapBps()).to.equal(MIN_HUB_NAV_GAP_BPS);
      const config = await fresh.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      expect([config.hub, config.pauseUpBps, config.pauseDownBps, config.enabled]).to.deep.equal([
        HUB_USDT,
        PAUSE_UP_BPS,
        PAUSE_DOWN_BPS,
        true,
      ]);
      const previous = await old.navGuardConfigs(CENTRIFUGE_SOURCE_USDT, CENTRIFUGE_VAULT_USDT);
      expect([previous.hub, previous.pauseUpBps, previous.pauseDownBps, previous.enabled]).to.deep.equal([
        config.hub,
        config.pauseUpBps,
        config.pauseDownBps,
        config.enabled,
      ]);
      expect(await old.minHubNavGapBps()).to.equal(MIN_HUB_NAV_GAP_BPS);
    });

    it("the new gateway holds all three enterMarketForAccount roles and the flash loan whitelist", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([true, true, true]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("the old gateway holds none of them", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([false, false, false]);
      expect(await core.authorizedFlashLoan(OLD_COLLATERAL_GATEWAY)).to.equal(false);
    });
  });

  describe("Post-VIP behaviour", () => {
    it("HubLens reads deposit capacity from the upgraded Hub", async () => {
      const lens = await ethers.getContractAt(HUB_LENS_ABI, HUB_LENS);
      expect(await lens.maxDeposit(HUB_USDT)).to.be.gt(0);
    });

    it("a deposit into Hub_USDT mints shares, and redeeming up to maxRedeem pays out the preview", async () => {
      const [, depositor] = await ethers.getSigners();
      const amount = ethers.utils.parseUnits("1000", 6);
      const usdt = await ethers.getContractAt(USDT_ABI, USDT, depositor);
      await usdt.allocateTo(depositor.address, amount);
      await usdt.approve(HUB_USDT, amount);

      const asDepositor = hub.connect(depositor);
      await asDepositor.deposit(amount, depositor.address);
      expect(await asDepositor.balanceOf(depositor.address)).to.be.gt(0);

      const shares = await asDepositor.maxRedeem(depositor.address);
      const expected = await asDepositor.previewRedeem(shares);
      expect(expected).to.be.gt(0);
      await asDepositor.redeem(shares, depositor.address, depositor.address);
      expect(await usdt.balanceOf(depositor.address)).to.equal(expected);
    });

    it("the previous HubNavDeviationSentinel can still pause a Hub through the upgraded EBrake", async () => {
      const sentinel = await initMainnetUser(OLD_HUB_NAV_SENTINEL, ethers.utils.parseEther("1"));
      const eBrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, sentinel);
      await expect(eBrake.pauseHub(HUB_USDT)).to.not.be.reverted;
    });

    it("the new HubNavDeviationSentinel pauses a Hub through the upgraded EBrake", async () => {
      const sentinel = await initMainnetUser(NEW_HUB_NAV_SENTINEL, ethers.utils.parseEther("1"));
      const eBrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, sentinel);
      await expect(eBrake.pauseHub(HUB_USDT)).to.not.be.reverted;
    });

    it("the BStockPauseSentinel zeroes a Spoke market's collateral factor through EBrake, keeping its LT", async () => {
      const sentinel = await initMainnetUser(BSTOCK_PAUSE_SENTINEL, ethers.utils.parseEther("1"));
      const eBrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, sentinel);
      const comptroller = await ethers.getContractAt(SPOKE_COMPTROLLER_ABI, SPOKE_COMPTROLLER);
      const [, , ltBefore] = await comptroller.markets(VTSLAB_SPOKE);
      await eBrake.decreaseCF(VTSLAB_SPOKE, 0);
      const [, cf, lt] = await comptroller.markets(VTSLAB_SPOKE);
      expect(cf).to.equal(0);
      expect(lt).to.equal(ltBefore);
    });

    it("EBrake pauses borrowing on a Spoke market", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const eBrake = new ethers.Contract(EBRAKE, EBRAKE_ABI, guardian);
      const comptroller = await ethers.getContractAt(SPOKE_COMPTROLLER_ABI, SPOKE_COMPTROLLER);
      expect(await comptroller.actionPaused(VUSDT_SPOKE, BORROW_ACTION)).to.equal(false);
      await eBrake.pauseBorrow(VUSDT_SPOKE);
      expect(await comptroller.actionPaused(VUSDT_SPOKE, BORROW_ACTION)).to.equal(true);
    });

    const markets = [
      ["Core", CORE_COMPTROLLER, CORE_VUSDT],
      ["Spoke", SPOKE_COMPTROLLER, VUSDT_SPOKE],
      ["QA Spoke", QA_SPOKE_COMPTROLLER, VUSDT_QA_SPOKE],
    ];

    for (const [pool, comptroller, vToken] of markets) {
      it(`the new gateway enters a ${pool} market on an account's behalf`, async () => {
        const gateway = await initMainnetUser(NEW_COLLATERAL_GATEWAY, ethers.utils.parseEther("1"));
        const asGateway = new ethers.Contract(comptroller, ENTER_MARKET_ABI, gateway);
        expect(await asGateway.checkMembership(BENEFICIARY, vToken)).to.equal(false);
        await asGateway.enterMarketForAccount(BENEFICIARY, vToken);
        expect(await asGateway.checkMembership(BENEFICIARY, vToken)).to.equal(true);
      });

      it(`the old gateway can no longer enter a ${pool} market`, async () => {
        const gateway = await initMainnetUser(OLD_COLLATERAL_GATEWAY, ethers.utils.parseEther("1"));
        const asGateway = new ethers.Contract(comptroller, ENTER_MARKET_ABI, gateway);
        await expect(asGateway.enterMarketForAccount(BENEFICIARY, vToken)).to.be.reverted;
      });
    }
  });
});
