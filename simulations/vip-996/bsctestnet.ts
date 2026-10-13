import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip996, {
  ACM,
  ADAPTERS,
  CORE_COMPTROLLER,
  ENTER_MARKET_FOR_ACCOUNT,
  HUB_BEACON,
  HUB_USDT,
  NEW_COLLATERAL_GATEWAY,
  NEW_HUB_IMPLEMENTATION,
  NEW_PSR_IMPLEMENTATION,
  OLD_COLLATERAL_GATEWAY,
  OLD_HUB_IMPLEMENTATION,
  OLD_PSR_IMPLEMENTATION,
  PSR,
  RESOURCES,
  SPOKE_COMPTROLLER,
} from "../../vips/vip-996/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import FLASH_LOAN_FACET_ABI from "./abi/FlashLoanFacet.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// After the new PSR, Hub, adapter and CollateralGateway deployments.
const BLOCK_NUMBER = 136540861;

const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const CORE_VUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const HUB_LENS = "0x2e5e48242aB01b636CA0684AED2B22aDE108e337";
const VUSDT_SPOKE = "0xC88bAF0bA49a98F15A00182752f6d10bd3932F6a";

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

// `isAllowedToCall` keys the role on `msg.sender`, so it is asked from the Comptroller's own address. It also
// counts address(0) wildcards, which `hasRole` does not.
const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayEnterMarket = async (comptroller: string, account: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, ENTER_MARKET_FOR_ACCOUNT]);
  const result = await ethers.provider.call({ to: ACM, data, from: comptroller });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};
const enterMarketGrants = async (account: string) => [
  await mayEnterMarket(CORE_COMPTROLLER, account),
  await mayEnterMarket(SPOKE_COMPTROLLER, account),
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

    it("the new gateway holds no grant, not even through a wildcard", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([false, false]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(false);
    });

    it("the old gateway holds all three grants", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([true, true]);
      expect(await core.authorizedFlashLoan(OLD_COLLATERAL_GATEWAY)).to.equal(true);
    });
  });

  testVip("VIP-996 [BNB Chain Testnet] Hub, ProtocolShareReserve and CollateralGateway upgrades", await vip996(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [UPGRADED_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdapterUpdated"], [RESOURCES.length]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [2, 2]);
      await expectEvents(txResponse, [FLASH_LOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [2]);
    },
  });

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

    it("the new gateway holds both enterMarketForAccount roles and the flash loan whitelist", async () => {
      expect(await enterMarketGrants(NEW_COLLATERAL_GATEWAY)).to.deep.equal([true, true]);
      expect(await core.authorizedFlashLoan(NEW_COLLATERAL_GATEWAY)).to.equal(true);
    });

    it("the old gateway holds none of them", async () => {
      expect(await enterMarketGrants(OLD_COLLATERAL_GATEWAY)).to.deep.equal([false, false]);
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

    const markets = [
      ["Core", CORE_COMPTROLLER, CORE_VUSDT],
      ["Spoke", SPOKE_COMPTROLLER, VUSDT_SPOKE],
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
