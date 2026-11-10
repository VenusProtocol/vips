import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, constants } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip681, {
  ACCESS_CONTROL_MANAGER,
  ADAPTERS,
  CORE_BEACON,
  CORE_SOURCE_USDT,
  CORE_VUSDT,
  FLUX_BEACON,
  FRV_BEACON,
  GUARDIAN,
  HUB_USDT,
  NEW_YIELD_GROUP_FRV_IMPLEMENTATION,
  NEW_YIELD_GROUP_IMPLEMENTATION,
  NORMAL_TIMELOCK,
  OLD_CORE_IMPLEMENTATION,
  OLD_FLUX_IMPLEMENTATION,
  OLD_FRV_IMPLEMENTATION,
  OLD_SPOKE_IMPLEMENTATION,
  RESOURCES,
  SPOKE_BEACON,
  SYNC_RECEIPT,
  TRACKING_GROUPS,
} from "../../vips/vip-681/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

// After the receipt-ledger implementations and adapters were deployed at block 141872731
const BLOCK_NUMBER = 141878000;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

const BEACON_ABI = [
  "function implementation() view returns (address)",
  "event Upgraded(address indexed implementation)",
];
const ADAPTER_ABI = [
  "function receiptBalance(address resource, address holder) view returns (uint256)",
  "function receiptValue(address resource, uint256 shares) view returns (uint256)",
  "function totalAssets(address resource, address holder) view returns (uint256)",
];
const HUB_ABI = [
  "function totalAssets() view returns (uint256)",
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
const VTOKEN_ABI = [
  "function mint(uint256) returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
];

const BEACONS = [
  { beacon: CORE_BEACON, old: OLD_CORE_IMPLEMENTATION, new: NEW_YIELD_GROUP_IMPLEMENTATION },
  { beacon: FLUX_BEACON, old: OLD_FLUX_IMPLEMENTATION, new: NEW_YIELD_GROUP_IMPLEMENTATION },
  { beacon: FRV_BEACON, old: OLD_FRV_IMPLEMENTATION, new: NEW_YIELD_GROUP_FRV_IMPLEMENTATION },
  { beacon: SPOKE_BEACON, old: OLD_SPOKE_IMPLEMENTATION, new: NEW_YIELD_GROUP_IMPLEMENTATION },
];

// `isAllowedToCall` keys the role on msg.sender, so it is asked from the guarded contract's own address
const isAllowed = async (contract: string, account: string): Promise<boolean> => {
  const acm = new ethers.utils.Interface(ACM_ABI);
  const data = acm.encodeFunctionData("isAllowedToCall", [account, SYNC_RECEIPT]);
  const result = await ethers.provider.call({ to: ACCESS_CONTROL_MANAGER, data, from: contract });
  return acm.decodeFunctionResult("isAllowedToCall", result)[0];
};
const syncReceiptGrants = async () =>
  Promise.all(TRACKING_GROUPS.flatMap(group => [isAllowed(group, NORMAL_TIMELOCK), isAllowed(group, GUARDIAN)]));

const implementations = async () =>
  Promise.all(BEACONS.map(({ beacon }) => new Contract(beacon, BEACON_ABI, ethers.provider).implementation()));

const adaptersInUse = async () =>
  Promise.all(
    RESOURCES.map(async ({ group, resource }) => {
      const [, , adapter] = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resourceConfig(resource);
      return adapter;
    }),
  );

forking(BLOCK_NUMBER, async () => {
  const hub = new Contract(HUB_USDT, HUB_ABI, ethers.provider);
  let hubTotalAssetsBefore: BigNumber;

  describe("Pre-VIP behavior", () => {
    it("beacons point at the current implementations", async () => {
      expect(await implementations()).to.deep.equal(BEACONS.map(({ old }) => old));
    });

    it("every resource uses its current adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].old));
    });

    it("new implementations are deployed with their initializers disabled", async () => {
      for (const implementation of [NEW_YIELD_GROUP_IMPLEMENTATION, NEW_YIELD_GROUP_FRV_IMPLEMENTATION]) {
        // Initializable._initialized, set to type(uint8).max by _disableInitializers()
        expect(await ethers.provider.getStorageAt(implementation, 0)).to.equal(ethers.utils.hexZeroPad("0xff", 32));
      }
    });

    it("new adapters expose receiptValue", async () => {
      for (const { resource, adapter } of RESOURCES) {
        const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
        expect(await fresh.receiptValue(resource, 0)).to.equal(0);
      }
    });

    it("nobody holds syncReceipt yet", async () => {
      expect(await syncReceiptGrants()).to.deep.equal(Array(TRACKING_GROUPS.length * 2).fill(false));
    });

    it("records the Hub's total assets", async () => {
      hubTotalAssetsBefore = await hub.totalAssets();
      expect(hubTotalAssetsBefore).to.be.gt(0);
    });
  });

  testVip("VIP-681 [BNB Chain Testnet] Liquidity Hub receipt tracking upgrade", await vip681(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [TRACKING_GROUPS.length + 1]);
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [BEACONS.length]);
      await expectEvents(
        txResponse,
        [YIELD_GROUP_ABI],
        ["ResourceAdapterUpdated", "ReceiptSynced"],
        [RESOURCES.length, RESOURCES.length],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("beacons point at the new implementations", async () => {
      expect(await implementations()).to.deep.equal(BEACONS.map(({ new: implementation }) => implementation));
    });

    it("every resource uses its new adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].new));
    });

    it("every tracked count equals the receipts its group holds", async () => {
      for (const { group, resource, adapter } of RESOURCES) {
        const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
        const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
        expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(
          await fresh.receiptBalance(resource, group),
        );
      }
    });

    it("every resource is valued the same as its whole wallet", async () => {
      for (const { group, resource, adapter } of RESOURCES) {
        const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
        const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
        const tracked = await yieldGroup.trackedReceipt(resource);
        expect(await fresh.receiptValue(resource, tracked), resource).to.equal(
          await fresh.totalAssets(resource, group),
        );
      }
    });

    it("the Hub's total assets do not fall", async () => {
      expect(await hub.totalAssets()).to.be.gte(hubTotalAssetsBefore);
    });

    it("the Normal Timelock and the Guardian hold syncReceipt on every group", async () => {
      expect(await syncReceiptGrants()).to.deep.equal(Array(TRACKING_GROUPS.length * 2).fill(true));
    });
  });

  describe("Post-VIP functional", () => {
    let snapshot: SnapshotRestorer;
    beforeEach(async () => {
      snapshot = await takeSnapshot();
    });
    afterEach(async () => {
      await snapshot.restore();
    });

    it("donated vTokens stay uncounted, and syncReceipt adds no more than its cap", async () => {
      const [, donor] = await ethers.getSigners();
      const amount = parseUnits("1000", 6);
      await new Contract(USDT, USDT_ABI, donor).allocateTo(donor.address, amount);
      await new Contract(USDT, USDT_ABI, donor).approve(CORE_VUSDT, amount);
      const vToken = new Contract(CORE_VUSDT, VTOKEN_ABI, donor);
      await vToken.mint(amount);
      const donated = await vToken.balanceOf(donor.address);
      expect(donated).to.be.gt(1);

      const coreSource = new Contract(CORE_SOURCE_USDT, YIELD_GROUP_ABI, ethers.provider);
      const trackedBefore = await coreSource.trackedReceipt(CORE_VUSDT);
      await vToken.transfer(CORE_SOURCE_USDT, donated);
      expect(await coreSource.trackedReceipt(CORE_VUSDT)).to.equal(trackedBefore);

      // A cap one below the donation leaves exactly one donated vToken uncounted
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await expect(coreSource.connect(timelock).syncReceipt(CORE_VUSDT, donated.sub(1)))
        .to.emit(coreSource, "ReceiptSynced")
        .withArgs(CORE_VUSDT, trackedBefore, trackedBefore.add(donated).sub(1));
      expect(await vToken.balanceOf(CORE_SOURCE_USDT)).to.equal(trackedBefore.add(donated));
    });

    it("only governance can call syncReceipt", async () => {
      const [stranger] = await ethers.getSigners();
      const coreSource = new Contract(CORE_SOURCE_USDT, YIELD_GROUP_ABI, stranger);
      await expect(coreSource.syncReceipt(CORE_VUSDT, constants.MaxUint256))
        .to.be.revertedWithCustomError(coreSource, "Unauthorized")
        .withArgs(stranger.address, SYNC_RECEIPT);
    });

    it("a Hub deposit and redeem round trip keeps every tracked count equal to its wallet", async () => {
      const [, , depositor] = await ethers.getSigners();
      const amount = parseUnits("1000", 6);
      const usdt = new Contract(USDT, USDT_ABI, depositor);
      await usdt.allocateTo(depositor.address, amount);
      await usdt.approve(HUB_USDT, amount);

      const asDepositor = hub.connect(depositor);
      await asDepositor.deposit(amount, depositor.address);
      expect(await asDepositor.balanceOf(depositor.address)).to.be.gt(0);

      const shares = await asDepositor.maxRedeem(depositor.address);
      const expected = await asDepositor.previewRedeem(shares);
      await asDepositor.redeem(shares, depositor.address, depositor.address);
      expect(await usdt.balanceOf(depositor.address)).to.equal(expected);

      for (const { group, resource, adapter } of RESOURCES) {
        const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
        const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
        expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(
          await fresh.receiptBalance(resource, group),
        );
      }
    });
  });
});
