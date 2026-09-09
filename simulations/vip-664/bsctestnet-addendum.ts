import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664Addendum, {
  ACM,
  CENTRIFUGE_BEACON,
  CENTRIFUGE_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  MOCK_CENTRIFUGE_VAULT_USDT,
  NEW_ADAPTER_CENTRIFUGE,
  NEW_NAV_GUARD_SIGS,
  NEW_YIELD_GROUP_CENTRIFUGE_IMPL,
  NORMAL_TIMELOCK,
  OLD_ADAPTER_CENTRIFUGE,
  OLD_PRICE_GUARD_SIGS,
  OLD_YIELD_GROUP_CENTRIFUGE_IMPL,
} from "../../vips/vip-664/bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import HUB_ABI from "./abi/Hub.json";
import VAULT_ABI from "./abi/TestnetCentrifugeVault.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import OLD_SOURCE_ABI from "./abi/YieldGroupCentrifuge.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifugeLatest.json";

// After both new contracts were deployed at block 129,978,386.
const BLOCK_NUMBER = 129979800;

const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const CORE_SOURCE_USDT = "0x11e39DC7b8b16BBDA8D9C2903dF741Ae9341Ec88";

// The rest of the source's gated surface, granted by the onboarding proposal and left alone here.
const KEPT_SIGS = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
  "forceRemoveResource(address)",
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
  "disablePriceAgeGuard(address)",
];
// Held by the Guardian as address(0) wildcards on this network, so it was never granted them per contract.
const GUARDIAN_WILDCARDS = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
  "forceRemoveResource(address)",
];

// The group's position at the fork block: 1.00 USDT of claimed shares at a NAV of 1.00.
const POSITION = ethers.utils.parseUnits("1", 6);
const PAR = ethers.utils.parseUnits("1", 6);
// The Hub's `maxWithdrawalSize`, and so the largest tranche the e2e can round-trip in one withdrawal.
const TRANCHE = ethers.utils.parseUnits("10", 6);

// A selector the implementation does not have falls through the proxy and reverts with no data. Sent
// as a transaction, so a `view` with no return value cannot be mistaken for a successful empty call.
const expectNoSuchFunction = async (contract: Contract, fn: string, args: unknown[]) => {
  const [caller] = await ethers.getSigners();
  await expect(caller.sendTransaction({ to: contract.address, data: contract.interface.encodeFunctionData(fn, args) }))
    .to.be.reverted;
};

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let beacon: Contract;
  let source: Contract;
  let sourceOld: Contract;
  let newAdapter: Contract;
  let acm: Contract;
  let vault: Contract;
  let usdt: Contract;
  let shareToken: Contract;

  let hubConfigBefore: { registered: boolean; paused: boolean; absoluteCap: BigNumber; percentageCapBps: number };
  let outerQueuesBefore: string[][];

  // Every group's own reading plus the Hub's idle balance is what `Hub.totalAssets()` sums, so this is
  // the exact figure the Hub sees.
  const expectHubToSumItsGroups = async () => {
    const groups: string[] = await hub.registeredYieldGroups();
    let sum = BigNumber.from(0);
    for (const group of groups) {
      sum = sum.add(await (await ethers.getContractAt(SOURCE_ABI, group)).totalAssets());
    }
    sum = sum.add(await usdt.balanceOf(HUB_USDT));
    expect(await hub.totalAssets()).to.equal(sum);
  };

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    beacon = await ethers.getContractAt(BEACON_ABI, CENTRIFUGE_BEACON);
    source = await ethers.getContractAt(SOURCE_ABI, CENTRIFUGE_SOURCE_USDT);
    sourceOld = await ethers.getContractAt(OLD_SOURCE_ABI, CENTRIFUGE_SOURCE_USDT);
    newAdapter = await ethers.getContractAt(ADAPTER_ABI, NEW_ADAPTER_CENTRIFUGE);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    vault = await ethers.getContractAt(VAULT_ABI, MOCK_CENTRIFUGE_VAULT_USDT);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    shareToken = await ethers.getContractAt(ERC20_ABI, await vault.share());

    hubConfigBefore = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
    outerQueuesBefore = [await hub.outerDepositQueue(), await hub.outerWithdrawQueue()];
  });

  describe("Pre-VIP state", () => {
    it("the beacon is owned by the normal timelock and still serves the old implementation", async () => {
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await beacon.implementation()).to.equal(OLD_YIELD_GROUP_CENTRIFUGE_IMPL);
    });

    it("the new implementation and adapter are deployed, and the adapter accepts the registered fund", async () => {
      expect(await ethers.provider.getCode(NEW_YIELD_GROUP_CENTRIFUGE_IMPL)).to.not.equal("0x");
      expect(await ethers.provider.getCode(NEW_ADAPTER_CENTRIFUGE)).to.not.equal("0x");
      await newAdapter.validateRegistration(MOCK_CENTRIFUGE_VAULT_USDT);
      const ids = await newAdapter.priceConfigIds(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(ids.assetToken).to.equal(USDT);
      expect(ids.poolId).to.equal(await vault.poolId());
      expect(await newAdapter.pricePerShare(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(PAR);
    });

    it("the source is bound to Hub_USDT, USDT and the ACM, and routes the fund through the old adapter", async () => {
      expect(await source.hub()).to.equal(HUB_USDT);
      expect(await source.asset()).to.equal(USDT);
      expect(await source.accessControlManager()).to.equal(ACM);
      expect(await source.resources()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      const cfg = await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.adapter).to.equal(OLD_ADAPTER_CENTRIFUGE);
    });

    it("the group is registered on the Hub and leads the withdraw queue", async () => {
      expect(hubConfigBefore.registered).to.equal(true);
      expect(hubConfigBefore.paused).to.equal(false);
      expect(outerQueuesBefore[1][0]).to.equal(CENTRIFUGE_SOURCE_USDT);
      expect(outerQueuesBefore[0]).to.not.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("the position is 1.00 USDT of claimed shares valued at par", async () => {
      expect(await vault.pricePerShare()).to.equal(PAR);
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(POSITION);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.totalAssets()).to.equal(POSITION);
      expect(await source.maxWithdraw()).to.equal(0);
      await expectHubToSumItsGroups();
    });

    it("the old guards are all off, with a disabled drop-guard record left behind", async () => {
      expect((await sourceOld.growthGuard(MOCK_CENTRIFUGE_VAULT_USDT)).interval).to.equal(0);
      const drop = await sourceOld.dropGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(drop.interval).to.equal(0);
      // Leftover of a drop guard configured and then disabled on testnet; the upgrade orphans it.
      expect(drop.minSnapshotPrice).to.equal(990_000);
      expect((await sourceOld.priceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT)).enabled).to.equal(false);
    });

    it("the audited surface does not exist on the proxy yet", async () => {
      for (const fn of ["navGuard", "navGuardStatus", "checkPriceAge"]) {
        await expectNoSuchFunction(source, fn, [MOCK_CENTRIFUGE_VAULT_USDT]);
      }
    });

    it("both holders carry the old price guard roles and none of the new ones", async () => {
      for (const holder of [NORMAL_TIMELOCK, GUARDIAN]) {
        for (const sig of OLD_PRICE_GUARD_SIGS) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(true);
        }
        for (const sig of NEW_NAV_GUARD_SIGS) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(false);
          expect(await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), holder), sig).to.equal(false);
        }
      }
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(true);
    });
  });

  testVip("VIP-667 [BNB Testnet] Liquidity Hub (USDT) — upgrade the Centrifuge YieldGroup", await vip664Addendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [SOURCE_ABI], ["ResourceAdapterUpdated"], [1]);
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted", "RoleRevoked"],
        // Two holders. Revokes: five retired roles each, plus `pauseHub()` on the Hub from the source.
        [2 * NEW_NAV_GUARD_SIGS.length, 2 * OLD_PRICE_GUARD_SIGS.length + 1],
      );
    },
  });

  describe("Post-VIP state", () => {
    it("the beacon serves the new implementation and keeps its owner", async () => {
      expect(await beacon.implementation()).to.equal(NEW_YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the fund is routed through the new adapter, still registered and unpaused", async () => {
      const cfg = await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.adapter).to.equal(NEW_ADAPTER_CENTRIFUGE);
    });

    it("every piece of pre-existing state survived the upgrade", async () => {
      expect(await source.hub()).to.equal(HUB_USDT);
      expect(await source.asset()).to.equal(USDT);
      expect(await source.accessControlManager()).to.equal(ACM);
      expect(await source.resources()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      expect(await source.innerDepositQueue()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);

      const hubConfig = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(hubConfig.registered).to.equal(hubConfigBefore.registered);
      expect(hubConfig.paused).to.equal(hubConfigBefore.paused);
      expect(hubConfig.absoluteCap).to.equal(hubConfigBefore.absoluteCap);
      expect(hubConfig.percentageCapBps).to.equal(hubConfigBefore.percentageCapBps);
      expect(await hub.outerDepositQueue()).to.deep.equal(outerQueuesBefore[0]);
      expect(await hub.outerWithdrawQueue()).to.deep.equal(outerQueuesBefore[1]);
    });

    it("the position is valued exactly as before, through the new adapter", async () => {
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(POSITION);
      expect(await source.totalAssets()).to.equal(POSITION);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await hub.hubPaused()).to.equal(false);
      await expectHubToSumItsGroups();
    });

    it("neither new guard is configured, and the orphaned drop record is unreadable", async () => {
      const band = await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(band.interval).to.equal(0);
      expect(band.snapshot).to.equal(0);
      expect(band.capEnabled).to.equal(false);
      expect(band.floorEnabled).to.equal(false);
      const status = await source.navGuardStatus(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(status.observedValue).to.equal(0);
      expect(status.isClamped).to.equal(false);

      const guard = await source.priceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(guard.shareLegEnabled).to.equal(false);
      expect(guard.assetLegEnabled).to.equal(false);
      expect(guard.spoke).to.equal(ethers.constants.AddressZero);
      await source.checkPriceAge(MOCK_CENTRIFUGE_VAULT_USDT);

      for (const fn of ["growthGuard", "dropGuard", "enforceDropGuard"]) {
        await expectNoSuchFunction(sourceOld, fn, [MOCK_CENTRIFUGE_VAULT_USDT]);
      }
    });

    it("the retired setters are gone from the proxy even for the timelock", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(sourceOld.connect(timelock).setGrowthGuardRate(MOCK_CENTRIFUGE_VAULT_USDT, 500, 0, 86_400)).to.be
        .reverted;
      await expect(sourceOld.connect(timelock).setDropGuardRate(MOCK_CENTRIFUGE_VAULT_USDT, 0, 100, 86_400)).to.be
        .reverted;
      await expect(
        sourceOld
          .connect(timelock)
          .setPriceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT, MOCK_CENTRIFUGE_VAULT_USDT, 86_400, 86_400),
      ).to.be.reverted;
    });

    it("both holders now carry the new nav guard roles and none of the old price guard ones", async () => {
      for (const holder of [NORMAL_TIMELOCK, GUARDIAN]) {
        for (const sig of NEW_NAV_GUARD_SIGS) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(true);
        }
        for (const sig of OLD_PRICE_GUARD_SIGS) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(false);
        }
      }
    });

    it("the rest of the surface is untouched: the timelock granted, the guardian granted or wildcarded", async () => {
      for (const sig of KEPT_SIGS) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
        const granted = await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN);
        const wildcarded = await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), GUARDIAN);
        expect(granted || wildcarded, sig).to.equal(true);
        expect(granted, sig).to.equal(!GUARDIAN_WILDCARDS.includes(sig));
      }
    });

    it("nobody else holds the new roles, and the source can no longer pause the Hub", async () => {
      for (const holder of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of NEW_NAV_GUARD_SIGS) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), sig).to.equal(false);
          expect(await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), holder), sig).to.equal(false);
        }
      }
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(false);
    });

    it("the new setters reject anyone without the role", async () => {
      const [stranger] = await ethers.getSigners();
      await expect(
        source.connect(stranger).setNavGuardRate(MOCK_CENTRIFUGE_VAULT_USDT, 500, 200, 200, 86_400),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setNavGuardEnabled(MOCK_CENTRIFUGE_VAULT_USDT, false, false),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setNavGuardSnapshot(MOCK_CENTRIFUGE_VAULT_USDT, POSITION, 1),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setPriceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT, MOCK_CENTRIFUGE_VAULT_USDT, true, true),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).disablePriceAgeGuard(MOCK_CENTRIFUGE_VAULT_USDT),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
    });
  });

  describe("Post-VIP end-to-end: fund the Centrifuge group, then redeem it back", () => {
    let operator: SignerWithAddress;
    let vusdt: string;

    before(async () => {
      // The Guardian is the Operator and the Keeper on this network, and already holds `reallocate`.
      operator = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      vusdt = (await (await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDT)).resources())[0];
    });

    it("an operator reallocation puts capital into the fund", async () => {
      const leg = (yieldGroup: string, resource: string, amount: BigNumber) => ({ yieldGroup, resource, amount });
      await hub
        .connect(operator)
        .reallocate(
          [leg(CORE_SOURCE_USDT, vusdt, TRANCHE)],
          [leg(CENTRIFUGE_SOURCE_USDT, MOCK_CENTRIFUGE_VAULT_USDT, TRANCHE)],
        );

      expect(await source.totalAssets()).to.equal(POSITION.add(TRANCHE));
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      await expectHubToSumItsGroups();
    });

    it("the keeper claims the settled subscription, and the group takes custody of the shares", async () => {
      await source.connect(operator).claimDeposit(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(POSITION.add(TRANCHE));
      expect(await source.totalAssets()).to.equal(POSITION.add(TRANCHE));
    });

    it("a redeem request burns the shares and reserves the assets for the group", async () => {
      await source.connect(operator).requestRedeem(MOCK_CENTRIFUGE_VAULT_USDT, TRANCHE);
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(POSITION);
      expect(await source.maxWithdraw()).to.equal(TRANCHE);
      expect(await source.totalAssets()).to.equal(POSITION.add(TRANCHE));
    });

    it("the keeper claims the redemption, leaving the assets idle on the group", async () => {
      await expect(source.connect(operator).claimRedeem(MOCK_CENTRIFUGE_VAULT_USDT))
        .to.emit(source, "RedeemClaimed")
        .withArgs(MOCK_CENTRIFUGE_VAULT_USDT, TRANCHE);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(TRANCHE);
      expect(await source.maxWithdraw()).to.equal(TRANCHE);
      expect(await source.totalAssets()).to.equal(POSITION.add(TRANCHE));
    });

    it("a Hub withdrawal drains Centrifuge first, leaving the original position untouched", async () => {
      await expect(hub.connect(operator).withdraw(TRANCHE, GUARDIAN, GUARDIAN))
        .to.emit(hub, "WithdrawRouted")
        .withArgs(CENTRIFUGE_SOURCE_USDT, TRANCHE);

      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await shareToken.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(POSITION);
      expect(await source.totalAssets()).to.equal(POSITION);
      expect(await source.maxWithdraw()).to.equal(0);
      await expectHubToSumItsGroups();
    });
  });
});
