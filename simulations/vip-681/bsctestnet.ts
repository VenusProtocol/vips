import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, constants } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip681, {
  CORE_BEACON,
  CORE_SOURCE_USDC,
  CORE_SOURCE_USDT,
  CORE_VUSDT,
  FLUX_BEACON,
  FLUX_SOURCE_USDT,
  FRV_BEACON,
  FRV_SOURCE_USDC,
  FRV_SOURCE_USDT,
  HUB_USDC,
  HUB_USDT,
  NEW_YIELD_GROUP_FRV_IMPLEMENTATION,
  NEW_YIELD_GROUP_IMPLEMENTATION,
  OLD_CORE_IMPLEMENTATION,
  OLD_FLUX_IMPLEMENTATION,
  OLD_FRV_IMPLEMENTATION,
  OLD_SPOKE_IMPLEMENTATION,
  RESOURCES,
  SPOKE_BEACON,
  SPOKE_SOURCE_USDT,
  SYNC_RECEIPT,
  UPDATE_RESOURCE_ADAPTER,
} from "../../vips/vip-681/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;

// After the receipt-ledger implementations and adapters were deployed at block 141872731
const BLOCK_NUMBER = 141878000;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
const HUBS = [
  { hub: HUB_USDT, asset: USDT },
  { hub: HUB_USDC, asset: USDC },
];

// Adapter each group's resources use at the fork block
const OLD_ADAPTER: Record<string, string> = {
  [CORE_SOURCE_USDT]: "0x07c80ed1F928913ab68E1fABB2fe0439CdC99F88",
  [FLUX_SOURCE_USDT]: "0x51d8cAdc16Df3F8Cd0D1B536e943FbDcE77AC523",
  [FRV_SOURCE_USDT]: "0xcdd9cf27C388dAc9e89De257505aff9290183537",
  [SPOKE_SOURCE_USDT]: "0x439034668f201B9f2D45286b4518e6DB122B5e17",
  [CORE_SOURCE_USDC]: "0xDf669957448eCB23309eEFda4de230c62d22AE33",
  [FRV_SOURCE_USDC]: "0xeF0E85ab9A23F50EB4595CF7e2F5461feF7E7fc5",
};
const TRACKING_GROUPS = [
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  SPOKE_SOURCE_USDT,
  CORE_SOURCE_USDC,
  FRV_SOURCE_USDC,
];
const USDC_GROUPS = [CORE_SOURCE_USDC, FRV_SOURCE_USDC];

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
const TOKEN_ABI = [
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
const isAllowed = async (contract: string, account: string, signature: string): Promise<boolean> => {
  const acm = new ethers.utils.Interface(ACM_ABI);
  const data = acm.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACCESS_CONTROL_MANAGER, data, from: contract });
  return acm.decodeFunctionResult("isAllowedToCall", result)[0];
};
const syncReceiptGrants = async () =>
  Promise.all(
    TRACKING_GROUPS.flatMap(group => [
      isAllowed(group, NORMAL_TIMELOCK, SYNC_RECEIPT),
      isAllowed(group, GUARDIAN, SYNC_RECEIPT),
    ]),
  );
const usdcAdapterGrants = async () =>
  Promise.all(USDC_GROUPS.map(group => isAllowed(group, NORMAL_TIMELOCK, UPDATE_RESOURCE_ADAPTER)));

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
  const totalAssetsBefore: Record<string, BigNumber> = {};

  describe("Pre-VIP behavior", () => {
    it("beacons point at the current implementations", async () => {
      expect(await implementations()).to.deep.equal(BEACONS.map(({ old }) => old));
    });

    it("the VIP lists every resource registered on the six groups", async () => {
      for (const group of TRACKING_GROUPS) {
        const registered = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resources();
        expect(registered, group).to.deep.equal(
          RESOURCES.filter(r => r.group === group).map(({ resource }) => resource),
        );
      }
    });

    it("every resource uses its current adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ group }) => OLD_ADAPTER[group]));
    });

    it("new implementations are deployed with their initializers disabled", async () => {
      for (const implementation of [NEW_YIELD_GROUP_IMPLEMENTATION, NEW_YIELD_GROUP_FRV_IMPLEMENTATION]) {
        // Initializable._initialized, set to type(uint8).max by _disableInitializers()
        expect(await ethers.provider.getStorageAt(implementation, 0)).to.equal(ethers.utils.hexZeroPad("0xff", 32));
      }
    });

    it("new adapters expose receiptValue", async () => {
      for (const { resource, adapter } of RESOURCES) {
        const fresh = new Contract(adapter, ADAPTER_ABI, ethers.provider);
        expect(await fresh.receiptValue(resource, 0)).to.equal(0);
      }
    });

    it("nobody holds syncReceipt yet", async () => {
      expect(await syncReceiptGrants()).to.deep.equal(Array(TRACKING_GROUPS.length * 2).fill(false));
    });

    it("the Normal Timelock cannot update adapters on the USDC groups yet", async () => {
      expect(await usdcAdapterGrants()).to.deep.equal([false, false]);
    });

    it("records each Hub's total assets", async () => {
      for (const { hub } of HUBS) {
        totalAssetsBefore[hub] = await new Contract(hub, HUB_ABI, ethers.provider).totalAssets();
        expect(totalAssetsBefore[hub], hub).to.be.gt(0);
      }
    });
  });

  testVip("VIP-681 [BNB Chain Testnet] Liquidity Hub receipt tracking upgrade", await vip681(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [2 + USDC_GROUPS.length]); // two syncReceipt wildcards
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
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => adapter));
    });

    it("every tracked count equals the receipts its group holds", async () => {
      for (const { group, resource, adapter } of RESOURCES) {
        const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
        const fresh = new Contract(adapter, ADAPTER_ABI, ethers.provider);
        expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(
          await fresh.receiptBalance(resource, group),
        );
      }
    });

    it("every resource is valued the same as its whole wallet", async () => {
      for (const { group, resource, adapter } of RESOURCES) {
        const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
        const fresh = new Contract(adapter, ADAPTER_ABI, ethers.provider);
        const tracked = await yieldGroup.trackedReceipt(resource);
        expect(await fresh.receiptValue(resource, tracked), resource).to.equal(
          await fresh.totalAssets(resource, group),
        );
      }
    });

    it("no Hub's total assets fall", async () => {
      for (const { hub } of HUBS) {
        expect(await new Contract(hub, HUB_ABI, ethers.provider).totalAssets(), hub).to.be.gte(totalAssetsBefore[hub]);
      }
    });

    it("the Normal Timelock and the Guardian hold syncReceipt on every group", async () => {
      expect(await syncReceiptGrants()).to.deep.equal(Array(TRACKING_GROUPS.length * 2).fill(true));
    });

    it("the Normal Timelock can update adapters on the USDC groups", async () => {
      expect(await usdcAdapterGrants()).to.deep.equal([true, true]);
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
      await new Contract(USDT, TOKEN_ABI, donor).allocateTo(donor.address, amount);
      await new Contract(USDT, TOKEN_ABI, donor).approve(CORE_VUSDT, amount);
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

    for (const { hub, asset } of HUBS) {
      it(`a deposit and redeem round trip on ${hub} keeps every tracked count equal to its wallet`, async () => {
        const [, , depositor] = await ethers.getSigners();
        const amount = parseUnits("1000", 6);
        const token = new Contract(asset, TOKEN_ABI, depositor);
        await token.allocateTo(depositor.address, amount);
        await token.approve(hub, amount);

        const asDepositor = new Contract(hub, HUB_ABI, depositor);
        await asDepositor.deposit(amount, depositor.address);
        expect(await asDepositor.balanceOf(depositor.address)).to.be.gt(0);

        const shares = await asDepositor.maxRedeem(depositor.address);
        const expected = await asDepositor.previewRedeem(shares);
        const balanceBefore = await token.balanceOf(depositor.address);
        await asDepositor.redeem(shares, depositor.address, depositor.address);
        expect((await token.balanceOf(depositor.address)).sub(balanceBefore)).to.equal(expected);

        for (const { group, resource, adapter } of RESOURCES) {
          const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
          const fresh = new Contract(adapter, ADAPTER_ABI, ethers.provider);
          expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(
            await fresh.receiptBalance(resource, group),
          );
        }
      });
    }
  });
});
