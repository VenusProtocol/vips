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
  ALLEZ_LABS,
  ALLEZ_LABS_USDC_AMOUNT,
  CORE_BEACON,
  CORE_SOURCE_USDT,
  FLOKI,
  FLOKI_PRICE_VIP_679,
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
  UPDATE_RESOURCE_ADAPTER,
  VHUSDC_WITHDRAW_AMOUNT,
} from "../../vips/vip-681/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

const { ACCESS_CONTROL_MANAGER, CHAINLINK_ORACLE, GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE, VTREASURY } =
  NETWORK_ADDRESSES.bscmainnet;

// After the receipt-ledger implementations and adapters were deployed at block 132740503
const BLOCK_NUMBER = 132741900;

const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC"; // holds U, USDC and USDT
const HUB_REGISTRY = "0x6D93Fd479f2d37445CFBe132412e316a0364acc2";
// Centrifuge does not track receipts, so the VIP leaves its groups alone
const CENTRIFUGE_GROUPS = ["0x84bAeCF7Ac76039f731a0780EB59A03b2C7B593c", "0xDA5AFfeb43719f517676E031a727071c7D400983"];
const CENTRIFUGE_BEACON = "0xAe90Cfb3E2Bc97508F58E7e076Acf38f3bfC820f";
const CENTRIFUGE_IMPLEMENTATION = "0x4996aa488f5269B5C544Dab1C2d1126F6bBdFF24";
const CENTRIFUGE_ADAPTER = "0xaa9D52758890997D91950E595886FF9CDEca81ae";
// ERC-1967 slot a BeaconProxy reads its beacon from
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";
const HUBS = [
  { hub: HUB_U, asset: U },
  { hub: HUB_USDC, asset: USDC },
  { hub: HUB_USDT, asset: USDT },
];

const ADAPTER_ABI = [
  "function receiptBalance(address resource, address holder) view returns (uint256)",
  "function receiptValue(address resource, uint256 shares) view returns (uint256)",
  "function totalAssets(address resource, address holder) view returns (uint256)",
];
const ORACLE_ABI = [
  "function prices(address asset) view returns (uint256)",
  "function getPrice(address asset) view returns (uint256)",
];
const REGISTRY_ABI = ["function getHubs() view returns (address[])"];
const HUB_ABI = [
  "function registeredYieldGroups() view returns (address[])",
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
const isAllowed = async (contract: string, account: string, signature: string): Promise<boolean> => {
  const acm = new ethers.utils.Interface(ACM_ABI);
  const data = acm.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACCESS_CONTROL_MANAGER, data, from: contract });
  return acm.decodeFunctionResult("isAllowedToCall", result)[0];
};
const syncReceiptGrants = async (account: string) =>
  Promise.all(TRACKING_GROUPS.map(group => isAllowed(group, account, SYNC_RECEIPT)));
// The grants are wildcards, so they reach the Centrifuge groups too
const updateResourceAdapterGrants = async (account: string) =>
  Promise.all(
    [...TRACKING_GROUPS, ...CENTRIFUGE_GROUPS].map(group => isAllowed(group, account, UPDATE_RESOURCE_ADAPTER)),
  );

const implementations = async () =>
  Promise.all(BEACONS.map(({ beacon }) => new Contract(beacon, BEACON_ABI, ethers.provider).implementation()));

const adaptersInUse = async () =>
  Promise.all(
    RESOURCES.map(async ({ group, resource }) => {
      const [, , adapter] = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resourceConfig(resource);
      return adapter;
    }),
  );

// Centrifuge runs behind its own beacon, which the VIP does not upgrade, on adapters it does not repoint
const expectCentrifugeUntouched = async () => {
  const beacon = new Contract(CENTRIFUGE_BEACON, BEACON_ABI, ethers.provider);
  expect(await beacon.implementation()).to.equal(CENTRIFUGE_IMPLEMENTATION);
  for (const group of CENTRIFUGE_GROUPS) {
    const slot = await ethers.provider.getStorageAt(group, BEACON_SLOT);
    expect(ethers.utils.getAddress(ethers.utils.hexDataSlice(slot, 12)), group).to.equal(CENTRIFUGE_BEACON);
    const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
    const resources: string[] = await yieldGroup.resources();
    expect(resources, group).to.not.be.empty;
    for (const resource of resources) {
      expect((await yieldGroup.resourceConfig(resource)).adapter, resource).to.equal(CENTRIFUGE_ADAPTER);
    }
  }
};

// Each group's stored state, read through its live code. The adapter is left out because the VIP changes it
const storedState = async () =>
  Promise.all(
    TRACKING_GROUPS.map(async group => {
      const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
      const resources: string[] = await yieldGroup.resources();
      return {
        accessControlManager: await yieldGroup.accessControlManager(),
        hub: await yieldGroup.hub(),
        asset: await yieldGroup.asset(),
        resources,
        innerDepositQueue: await yieldGroup.innerDepositQueue(),
        innerWithdrawQueue: await yieldGroup.innerWithdrawQueue(),
        paused: await Promise.all(resources.map(async resource => (await yieldGroup.resourceConfig(resource)).paused)),
      };
    }),
  );

type Resource = (typeof RESOURCES)[number];

// The group's tracked receipts, priced by the new adapter
const newAdapterValue = async ({ group, resource, adapter }: Resource): Promise<BigNumber> => {
  const tracked = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).trackedReceipt(resource);
  return new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider).receiptValue(resource, tracked);
};

// The group's whole wallet, priced by the adapter it had before the VIP
const oldAdapterValue = ({ group, resource, adapter }: Resource): Promise<BigNumber> =>
  new Contract(ADAPTERS[adapter].old, ADAPTER_ABI, ethers.provider).totalAssets(resource, group);

// The group's idle asset plus each of its resources on the old adapter
const oldGroupTotalAssets = async (group: string, asset: Contract) => {
  let total: BigNumber = await asset.balanceOf(group);
  for (const entry of RESOURCES.filter(r => r.group === group)) {
    total = total.add(await oldAdapterValue(entry));
  }
  return total;
};

// The Hub's idle asset plus each group: tracking groups on the old adapters, Centrifuge as it reports itself
const oldHubTotalAssets = async (hub: string, assetAddress: string) => {
  const asset = new Contract(assetAddress, ERC20_ABI, ethers.provider);
  let total: BigNumber = await asset.balanceOf(hub);
  for (const group of await new Contract(hub, HUB_ABI, ethers.provider).registeredYieldGroups()) {
    const groupTotal = TRACKING_GROUPS.includes(group)
      ? await oldGroupTotalAssets(group, asset)
      : await new Contract(group, YIELD_GROUP_ABI, ethers.provider).totalAssets();
    total = total.add(groupTotal);
  }
  return total;
};

const expectEveryCountToMatchItsWallet = async () => {
  for (const { group, resource, adapter } of RESOURCES) {
    const yieldGroup = new Contract(group, YIELD_GROUP_ABI, ethers.provider);
    const fresh = new Contract(ADAPTERS[adapter].new, ADAPTER_ABI, ethers.provider);
    expect(await yieldGroup.trackedReceipt(resource), resource).to.equal(await fresh.receiptBalance(resource, group));
  }
};

forking(BLOCK_NUMBER, async () => {
  let hubTotalAssetsBefore: BigNumber[];
  let allezUsdcBefore: BigNumber;
  let treasuryVhusdcBefore: BigNumber;
  let storedStateBefore: Awaited<ReturnType<typeof storedState>>;

  describe("Pre-VIP behavior", () => {
    it("beacons point at the current implementations", async () => {
      expect(await implementations()).to.deep.equal(BEACONS.map(({ old }) => old));
    });

    it("every resource uses its current adapter", async () => {
      expect(await adaptersInUse()).to.deep.equal(RESOURCES.map(({ adapter }) => ADAPTERS[adapter].old));
    });

    it("every Hub, yield group and resource in the HubRegistry, except Centrifuge, is in the VIP", async () => {
      const hubs: string[] = await new Contract(HUB_REGISTRY, REGISTRY_ABI, ethers.provider).getHubs();
      expect(hubs).to.have.members(HUBS.map(({ hub }) => hub));

      const groups: string[] = [];
      const registered: string[] = [];
      for (const hub of hubs) {
        for (const group of await new Contract(hub, HUB_ABI, ethers.provider).registeredYieldGroups()) {
          if (CENTRIFUGE_GROUPS.includes(group)) continue;
          groups.push(group);
          const resources: string[] = await new Contract(group, YIELD_GROUP_ABI, ethers.provider).resources();
          registered.push(...resources.map(resource => `${group} ${resource}`));
        }
      }
      expect(groups).to.have.members(TRACKING_GROUPS);
      expect(registered).to.have.members(RESOURCES.map(({ group, resource }) => `${group} ${resource}`));
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

    it("both the Normal Timelock and the Guardian can repoint adapters on every group", async () => {
      expect(await updateResourceAdapterGrants(NORMAL_TIMELOCK)).to.not.include(false);
      expect(await updateResourceAdapterGrants(GUARDIAN)).to.not.include(false);
    });

    it("records each Hub's total assets", async () => {
      hubTotalAssetsBefore = await Promise.all(
        HUBS.map(({ hub }) => new Contract(hub, HUB_ABI, ethers.provider).totalAssets()),
      );
      hubTotalAssetsBefore.forEach((totalAssets, i) => expect(totalAssets, HUBS[i].hub).to.be.gt(0));
    });

    it("records the Allez Labs USDC and Treasury vhUSDC balances; the Normal Timelock holds no vhUSDC", async () => {
      allezUsdcBefore = await new Contract(USDC, ERC20_ABI, ethers.provider).balanceOf(ALLEZ_LABS);
      const vhUSDC = new Contract(HUB_USDC, HUB_ABI, ethers.provider);
      treasuryVhusdcBefore = await vhUSDC.balanceOf(VTREASURY);
      expect(treasuryVhusdcBefore).to.be.gte(VHUSDC_WITHDRAW_AMOUNT);
      expect(await vhUSDC.balanceOf(NORMAL_TIMELOCK)).to.equal(0);
    });

    it("FLOKI is priced at the VIP-679 direct price", async () => {
      const chainlink = new Contract(CHAINLINK_ORACLE, ORACLE_ABI, ethers.provider);
      expect(await chainlink.prices(FLOKI)).to.equal(FLOKI_PRICE_VIP_679);
      const resilient = new Contract(RESILIENT_ORACLE, ORACLE_ABI, ethers.provider);
      expect(await resilient.getPrice(FLOKI)).to.equal(FLOKI_PRICE_VIP_679.mul(10 ** 9)); // FLOKI has 9 decimals
    });

    it("records what each group stores", async () => {
      storedStateBefore = await storedState();
    });

    it("the Centrifuge groups run behind the Centrifuge beacon, on its implementation and adapter", async () => {
      await expectCentrifugeUntouched();
    });
  });

  testVip("VIP-681 Liquidity Hub receipt tracking upgrade and PancakeSwapOracle ownership", await vip681(), {
    callbackAfterExecution: async txResponse => {
      // one remote proposal each for Ethereum, Arbitrum One and Base
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [1, 0]);
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

    it("the new code reads every group's stored state unchanged", async () => {
      expect(await storedState()).to.deep.equal(storedStateBefore);
    });

    it("Centrifuge is untouched: same beacon implementation and adapters", async () => {
      await expectCentrifugeUntouched();
    });

    it("every tracked count equals the receipts its group holds", async () => {
      await expectEveryCountToMatchItsWallet();
    });

    it("every resource is worth the same on its new adapter as on its old one, at the same block", async () => {
      for (const entry of RESOURCES) {
        expect(await newAdapterValue(entry), entry.resource).to.equal(await oldAdapterValue(entry));
      }
    });

    it("every Hub reports the same total assets as the old code gives, at the same block", async () => {
      for (const { hub, asset } of HUBS) {
        const reported = await new Contract(hub, HUB_ABI, ethers.provider).totalAssets();
        expect(reported, hub).to.equal(await oldHubTotalAssets(hub, asset));
      }
    });

    it("no Hub's total assets fall, apart from the USDC paid out of the USDC Hub to Allez Labs", async () => {
      for (const [i, { hub }] of HUBS.entries()) {
        const paidOut = hub === HUB_USDC ? ALLEZ_LABS_USDC_AMOUNT : 0;
        const totalAssets: BigNumber = await new Contract(hub, HUB_ABI, ethers.provider).totalAssets();
        expect(totalAssets.add(paidOut), hub).to.be.gte(hubTotalAssetsBefore[i]);
      }
    });

    it("Allez Labs receives exactly 105,000 USDC, paid from the Treasury's vhUSDC", async () => {
      const usdc = new Contract(USDC, ERC20_ABI, ethers.provider);
      expect((await usdc.balanceOf(ALLEZ_LABS)).sub(allezUsdcBefore)).to.equal(ALLEZ_LABS_USDC_AMOUNT);
      const vhUSDC = new Contract(HUB_USDC, HUB_ABI, ethers.provider);
      expect(await vhUSDC.balanceOf(VTREASURY)).to.equal(treasuryVhusdcBefore.sub(VHUSDC_WITHDRAW_AMOUNT));
    });

    it("FLOKI has no price: the direct price is cleared and the ResilientOracle reverts", async () => {
      const chainlink = new Contract(CHAINLINK_ORACLE, ORACLE_ABI, ethers.provider);
      expect(await chainlink.prices(FLOKI)).to.equal(0);
      const resilient = new Contract(RESILIENT_ORACLE, ORACLE_ABI, ethers.provider);
      await expect(resilient.getPrice(FLOKI)).to.be.reverted;
    });

    it("the unused vhUSDC stays with the Normal Timelock and is under 1% of the withdrawal", async () => {
      const left: BigNumber = await new Contract(HUB_USDC, HUB_ABI, ethers.provider).balanceOf(NORMAL_TIMELOCK);
      expect(left).to.be.gt(0);
      expect(left).to.be.lt(VHUSDC_WITHDRAW_AMOUNT.div(100));
    });

    it("the Normal Timelock holds syncReceipt on every group, and the Guardian does not", async () => {
      expect(await syncReceiptGrants(NORMAL_TIMELOCK)).to.deep.equal(TRACKING_GROUPS.map(() => true));
      expect(await syncReceiptGrants(GUARDIAN)).to.deep.equal(TRACKING_GROUPS.map(() => false));
    });

    it("both the Normal Timelock and the Guardian can still repoint adapters on every group", async () => {
      expect(await updateResourceAdapterGrants(NORMAL_TIMELOCK)).to.not.include(false);
      expect(await updateResourceAdapterGrants(GUARDIAN)).to.not.include(false);
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

      // Read after the mint, which accrues vUSDT interest, so the transfer is the only change before the next read
      const coreSource = new Contract(CORE_SOURCE_USDT, YIELD_GROUP_ABI, ethers.provider);
      const trackedBefore = await coreSource.trackedReceipt(VUSDT);
      const groupAssetsBefore = await coreSource.totalAssets();

      await vToken.transfer(CORE_SOURCE_USDT, donated);
      expect(await coreSource.trackedReceipt(VUSDT)).to.equal(trackedBefore);
      expect(await coreSource.totalAssets()).to.equal(groupAssetsBefore);

      // A cap one below the donation leaves exactly one donated vToken uncounted
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await expect(coreSource.connect(timelock).syncReceipt(VUSDT, donated.sub(1)))
        .to.emit(coreSource, "ReceiptSynced")
        .withArgs(VUSDT, trackedBefore, trackedBefore.add(donated).sub(1));
      expect(await vToken.balanceOf(CORE_SOURCE_USDT)).to.equal(trackedBefore.add(donated));

      // The sync admits what the added vTokens are worth, within 1 wei: pricing the position in one
      // piece can round differently from pricing the two parts apart
      const coreAdapter = new Contract(ADAPTERS.CORE.new, ADAPTER_ABI, ethers.provider);
      const admitted = (await coreSource.totalAssets()).sub(groupAssetsBefore);
      expect(admitted).to.be.closeTo(await coreAdapter.receiptValue(VUSDT, donated.sub(1)), 1);
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
