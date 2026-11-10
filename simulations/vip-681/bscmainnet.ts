import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract, constants } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip681, {
  ADAPTERS,
  CORE_BEACON,
  CORE_SOURCE_USDT,
  FLUX_BEACON,
  FRV_BEACON,
  HUB_U,
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
  SYNC_RECEIPT,
  TRACKING_GROUPS,
} from "../../vips/vip-681/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.bscmainnet;

// After the receipt-ledger implementations and adapters were deployed at block 132740503
const BLOCK_NUMBER = 132741900;

const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; // holds U, USDC and USDT
const HUBS = [
  { hub: HUB_U, asset: U },
  { hub: HUB_USDC, asset: USDC },
  { hub: HUB_USDT, asset: USDT },
];

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
const ERC20_ABI = [
  "function approve(address, uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
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
const syncReceiptGrants = async (account: string) =>
  Promise.all(TRACKING_GROUPS.map(group => isAllowed(group, account)));

const implementations = async () =>
  Promise.all(BEACONS.map(({ beacon }) => new Contract(beacon, BEACON_ABI, ethers.provider).implementation()));

const adaptersInUse = async () =>
  Promise.all(
    RESOURCES.map(async ({ group, resource }) => {
      const [, , adapter] = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resourceConfig(resource);
      return adapter;
    }),
  );

const expectEveryCountToMatchItsWallet = async () => {
  for (const { group, resource, adapter } of RESOURCES) {
    const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
    const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
    expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(await fresh.receiptBalance(resource, group));
  }
};

forking(BLOCK_NUMBER, async () => {
  let hubTotalAssetsBefore: BigNumber[];

  describe("Pre-VIP behavior", () => {
    it("beacons point at the current implementations", async () => {
      expect(await implementations()).to.deep.equal(BEACONS.map(({ old }) => old));
    });

    it("every resource uses its current adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].old));
    });

    it("every group's registered resources are the ones the VIP repoints", async () => {
      for (const group of TRACKING_GROUPS) {
        const registered = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resources();
        expect(registered, group).to.deep.equal(
          RESOURCES.filter(entry => entry.group === group).map(({ resource }) => resource),
        );
      }
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
      expect(await syncReceiptGrants(NORMAL_TIMELOCK)).to.deep.equal(TRACKING_GROUPS.map(() => false));
      expect(await syncReceiptGrants(GUARDIAN)).to.deep.equal(TRACKING_GROUPS.map(() => false));
    });

    it("records each Hub's total assets", async () => {
      hubTotalAssetsBefore = await Promise.all(
        HUBS.map(({ hub }) => new Contract(hub, HUB_ABI, ethers.provider).totalAssets()),
      );
      hubTotalAssetsBefore.forEach((totalAssets, i) => expect(totalAssets, HUBS[i].hub).to.be.gt(0));
    });
  });

  testVip("VIP-681 [BNB Chain] Liquidity Hub receipt tracking upgrade", await vip681(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [1]);
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
      await expectEveryCountToMatchItsWallet();
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

    it("no Hub's total assets fall", async () => {
      for (const [i, { hub }] of HUBS.entries()) {
        expect(await new Contract(hub, HUB_ABI, ethers.provider).totalAssets(), hub).to.be.gte(hubTotalAssetsBefore[i]);
      }
    });

    it("the Normal Timelock holds syncReceipt on every group, and the Guardian does not", async () => {
      expect(await syncReceiptGrants(NORMAL_TIMELOCK)).to.deep.equal(TRACKING_GROUPS.map(() => true));
      expect(await syncReceiptGrants(GUARDIAN)).to.deep.equal(TRACKING_GROUPS.map(() => false));
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

    it("donated vUSDT stays uncounted, and syncReceipt adds no more than its cap", async () => {
      // A fresh donor, not the whale: the whale has entered markets, so its vToken transfer runs a
      // liquidity check against oracle prices that go stale while the VIP is voted on
      const [, , donor] = await ethers.getSigners();
      const amount = parseUnits("1000", 18);
      const whale = await initMainnetUser(WHALE, parseEther("1"));
      await new Contract(USDT, ERC20_ABI, whale).transfer(donor.address, amount);
      await new Contract(USDT, ERC20_ABI, donor).approve(VUSDT, amount);
      const vToken = new Contract(VUSDT, VTOKEN_ABI, donor);
      await vToken.mint(amount);
      const donated = await vToken.balanceOf(donor.address);
      expect(donated).to.be.gt(1);

      const coreSource = new Contract(CORE_SOURCE_USDT, YIELD_GROUP_ABI, ethers.provider);
      const trackedBefore = await coreSource.trackedReceipt(VUSDT);
      await vToken.transfer(CORE_SOURCE_USDT, donated);
      expect(await coreSource.trackedReceipt(VUSDT)).to.equal(trackedBefore);

      // A cap one below the donation leaves exactly one donated vToken uncounted
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await expect(coreSource.connect(timelock).syncReceipt(VUSDT, donated.sub(1)))
        .to.emit(coreSource, "ReceiptSynced")
        .withArgs(VUSDT, trackedBefore, trackedBefore.add(donated).sub(1));
      expect(await vToken.balanceOf(CORE_SOURCE_USDT)).to.equal(trackedBefore.add(donated));
    });

    it("only governance can call syncReceipt", async () => {
      const [stranger] = await ethers.getSigners();
      const coreSource = new Contract(CORE_SOURCE_USDT, YIELD_GROUP_ABI, stranger);
      await expect(coreSource.syncReceipt(VUSDT, constants.MaxUint256))
        .to.be.revertedWithCustomError(coreSource, "Unauthorized")
        .withArgs(stranger.address, SYNC_RECEIPT);
    });

    for (const { hub, asset } of HUBS) {
      it(`a deposit and redeem round trip on ${hub} keeps every tracked count equal to its wallet`, async () => {
        const [, depositor] = await ethers.getSigners();
        const amount = parseUnits("1000", 18);
        const whale = await initMainnetUser(WHALE, parseEther("1"));
        await new Contract(asset, ERC20_ABI, whale).transfer(depositor.address, amount);
        const token = new Contract(asset, ERC20_ABI, depositor);
        await token.approve(hub, amount);

        const asDepositor = new Contract(hub, HUB_ABI, depositor);
        await asDepositor.deposit(amount, depositor.address);
        expect(await asDepositor.balanceOf(depositor.address)).to.be.gt(0);

        const shares = await asDepositor.maxRedeem(depositor.address);
        const expected = await asDepositor.previewRedeem(shares);
        const balanceBefore = await token.balanceOf(depositor.address);
        await asDepositor.redeem(shares, depositor.address, depositor.address);
        // redeem accrues interest before paying, so it pays at least what the stale preview quoted
        expect((await token.balanceOf(depositor.address)).sub(balanceBefore)).to.be.gte(expected);

        await expectEveryCountToMatchItsWallet();
      });
    }
  });
});
