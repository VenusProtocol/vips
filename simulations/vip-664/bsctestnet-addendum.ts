import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664Addendum, {
  ABSOLUTE_CAP_UNBOUNDED,
  ACM,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_BEACON,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  MOCK_CENTRIFUGE_SHARE_USDT,
  MOCK_CENTRIFUGE_VAULT_USDT,
  NORMAL_TIMELOCK,
  OLD_ADAPTER_CENTRIFUGE,
  OLD_CENTRIFUGE_BEACON,
  OLD_CENTRIFUGE_SOURCE_USDT,
  OLD_MOCK_CENTRIFUGE_VAULT_USDT,
  OUTER_WITHDRAW_QUEUE,
  PERCENTAGE_CAP_DISABLED,
  USDT,
  YIELD_GROUP_CENTRIFUGE_IMPL,
} from "../../vips/vip-664/bsctestnet-addendum";
import {
  CENTRIFUGE_NEW_SURFACE,
  GUARDIAN_WILDCARDS,
  NEW_GUARDIAN_GRANTS,
  NEW_TIMELOCK_GRANTS,
} from "../../vips/vip-664/permissions-bsctestnet-addendum";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import VAULT_ABI from "./abi/TestnetCentrifugeVault.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import OLD_SOURCE_ABI from "./abi/YieldGroupCentrifuge.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifugeLatest.json";

const BLOCK_NUMBER = 131149000;

const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK } = NETWORK_ADDRESSES.bsctestnet;
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// ERC-1967 beacon slot: bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1).
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

const OLD_YIELD_GROUP_CENTRIFUGE_IMPL = "0x07B13f1A527Be4777678c7B8F17e9bd1729D55cF";
const OLD_MOCK_CENTRIFUGE_SHARE_USDT = "0x9b6e0AdEbE5cE92BAD399A44DCeEcf370eAc9fB2";
const FRV_SOURCE_USDT = "0xA0Fb0fFeBdcB7F45A3Ec841cCE7F78B7CeBD0f82";
const FLUX_SOURCE_USDT = "0x044E572144bc08ed2D90E081EeEd7b5b6Cb01016";
const DEPLOYER = "0x4cD6300F5cb8D6BbA5E646131c3522664C10dF11";

// The stranded position on the retired fund: 1.00 USDT of claimed shares at a NAV of 1.00.
const WRITTEN_OFF = ethers.utils.parseUnits("1", 6);
const PAR = ethers.utils.parseUnits("1", 6);
// Liquidity seeded into the new fund so a redemption can be paid.
const SEEDED = ethers.utils.parseUnits("1000", 6);
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
  let oldBeacon: Contract;
  let source: Contract;
  let sourceRetired: Contract;
  let adapter: Contract;
  let acm: Contract;
  let oldVault: Contract;
  let vault: Contract;
  let usdt: Contract;
  let oldShare: Contract;
  let share: Contract;

  let outerQueuesBefore: string[][];
  let hubTotalBefore: BigNumber;
  let groupsBefore: string[];

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
    oldBeacon = await ethers.getContractAt(BEACON_ABI, OLD_CENTRIFUGE_BEACON);
    source = await ethers.getContractAt(SOURCE_ABI, CENTRIFUGE_SOURCE_USDT);
    sourceRetired = await ethers.getContractAt(OLD_SOURCE_ABI, OLD_CENTRIFUGE_SOURCE_USDT);
    adapter = await ethers.getContractAt(ADAPTER_ABI, ADAPTER_CENTRIFUGE);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    oldVault = await ethers.getContractAt(VAULT_ABI, OLD_MOCK_CENTRIFUGE_VAULT_USDT);
    vault = await ethers.getContractAt(VAULT_ABI, MOCK_CENTRIFUGE_VAULT_USDT);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    oldShare = await ethers.getContractAt(ERC20_ABI, OLD_MOCK_CENTRIFUGE_SHARE_USDT);
    share = await ethers.getContractAt(ERC20_ABI, MOCK_CENTRIFUGE_SHARE_USDT);

    outerQueuesBefore = [await hub.outerDepositQueue(), await hub.outerWithdrawQueue()];
    hubTotalBefore = await hub.totalAssets();
    groupsBefore = await hub.registeredYieldGroups();
  });

  describe("Pre-VIP: the retired stack", () => {
    it("the retired source runs the pre-audit implementation on its own beacon", async () => {
      expect(await oldBeacon.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await oldBeacon.implementation()).to.equal(OLD_YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(
        ethers.utils.getAddress(
          ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(OLD_CENTRIFUGE_SOURCE_USDT, BEACON_SLOT), 12),
        ),
      ).to.equal(OLD_CENTRIFUGE_BEACON);
    });

    it("it is registered on the Hub, leads the withdraw queue, and is worth 1.00 USDT", async () => {
      const cfg = await hub.yieldGroupConfig(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(groupsBefore).to.include(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(outerQueuesBefore[1][0]).to.equal(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(outerQueuesBefore[0]).to.not.include(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(await hub.hubPaused()).to.equal(false);
      expect(await sourceRetired.totalAssets()).to.equal(WRITTEN_OFF);
      expect(await usdt.balanceOf(OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      await expectHubToSumItsGroups();
    });

    it("its fund holds nothing, so the position cannot be redeemed and has to be written off", async () => {
      expect(await usdt.balanceOf(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(0);
      expect(await oldShare.balanceOf(OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(WRITTEN_OFF);
      expect(await oldVault.maxWithdraw(OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      await expectNoSuchFunction(oldVault, "priceLastUpdated", []);
    });

    it("it still exposes the retired guards, and holds the pauseHub role on the live Hub", async () => {
      expect((await sourceRetired.growthGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).interval).to.equal(0);
      const drop = await sourceRetired.dropGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT);
      expect(drop.interval).to.equal(0);
      // A drop guard configured then disabled on testnet. Disabled is what makes `enforceDropGuard`
      // return early, which is what makes the pauseHub role below unreachable.
      expect(drop.minSnapshotPrice).to.equal(990_000);
      expect((await sourceRetired.priceAgeGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).enabled).to.equal(false);
      expect(await sourceRetired.callStatic.enforceDropGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(false);
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(true);
    });
  });

  describe("Pre-VIP: the replacement stack", () => {
    it("is a separate beacon and implementation, so nothing is upgraded in place", async () => {
      expect(CENTRIFUGE_BEACON).to.not.equal(OLD_CENTRIFUGE_BEACON);
      expect(YIELD_GROUP_CENTRIFUGE_IMPL).to.not.equal(OLD_YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(ADAPTER_CENTRIFUGE).to.not.equal(OLD_ADAPTER_CENTRIFUGE);
      expect(CENTRIFUGE_SOURCE_USDT).to.not.equal(OLD_CENTRIFUGE_SOURCE_USDT);

      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await beacon.implementation()).to.equal(YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(
        ethers.utils.getAddress(
          ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(CENTRIFUGE_SOURCE_USDT, BEACON_SLOT), 12),
        ),
      ).to.equal(CENTRIFUGE_BEACON);
      for (const address of [
        CENTRIFUGE_BEACON,
        YIELD_GROUP_CENTRIFUGE_IMPL,
        ADAPTER_CENTRIFUGE,
        MOCK_CENTRIFUGE_VAULT_USDT,
      ]) {
        expect(await ethers.provider.getCode(address)).to.not.equal("0x");
      }
    });

    it("is initialized and bound to Hub_USDT, USDT and the ACM, but wired to nothing", async () => {
      expect(await source.hub()).to.equal(HUB_USDT);
      expect(await source.asset()).to.equal(USDT);
      expect(await source.accessControlManager()).to.equal(ACM);
      expect(await source.resources()).to.deep.equal([]);
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([]);
      expect(await source.totalAssets()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).registered).to.equal(false);
      expect(groupsBefore).to.not.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("carries the new surface and none of the retired one", async () => {
      expect(await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT)).to.be.an("array");
      expect(await source.resourceSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(0);
      for (const fn of ["growthGuard", "dropGuard", "priceAgeGuard", "enforceDropGuard"]) {
        await expectNoSuchFunction(sourceRetired.attach(CENTRIFUGE_SOURCE_USDT), fn, [MOCK_CENTRIFUGE_VAULT_USDT]);
      }
    });

    it("starts with virgin guard storage, which is the whole point of replacing rather than upgrading", async () => {
      // The new code puts `_navGuard` on slot 100 and `_spotAPYBps` on slot 120, the slots the
      // retired code used for `_growthGuard` and `_priceAgeGuard`. On a fresh contract there is
      // nothing for them to inherit, for this fund or the retired one.
      for (const resource of [MOCK_CENTRIFUGE_VAULT_USDT, OLD_MOCK_CENTRIFUGE_VAULT_USDT]) {
        const band = await source.navGuard(resource);
        expect(band.anchor).to.equal(0);
        expect(band.centre).to.equal(0);
        expect(band.anchoredAt).to.equal(0);
        expect(band.interval).to.equal(0);
        expect(band.driftBps).to.equal(0);
        expect(band.upGapBps).to.equal(0);
        expect(band.downGapBps).to.equal(0);
        expect(band.capEnabled).to.equal(false);
        expect(band.floorEnabled).to.equal(false);
        expect(await source.resourceSpotAPYBps(resource)).to.equal(0);
      }
      expect(await source.spotAPYBps()).to.equal(0);
    });

    it("the new adapter accepts the new fund and prices it at par", async () => {
      await adapter.validateRegistration(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(await adapter.asset(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(USDT);
      expect(await adapter.pricePerShare(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(PAR);
      expect(await adapter.receiptBalance(MOCK_CENTRIFUGE_VAULT_USDT, CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("the new fund is seeded and reports the timestamp monitoring reads", async () => {
      expect(await usdt.balanceOf(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(SEEDED);
      expect(await vault.owner()).to.equal(DEPLOYER);
      expect(await vault.pricePerShare()).to.equal(PAR);
      expect(await vault.autoFulfill()).to.equal(true);
      expect(await vault.share()).to.equal(MOCK_CENTRIFUGE_SHARE_USDT);
      expect(await vault.priceLastUpdated()).to.be.gt(0);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("nobody holds any role on it yet, by grant or by wildcard", async () => {
      for (const holder of [NORMAL_TIMELOCK, GUARDIAN, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_NEW_SURFACE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
        }
      }
      // The Guardian's wildcards are exactly the shared yield-group surface, which is why the
      // proposal grants it 11 signatures and the timelock 20.
      for (const sig of CENTRIFUGE_NEW_SURFACE) {
        expect(await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), GUARDIAN), sig).to.equal(
          GUARDIAN_WILDCARDS.includes(sig),
        );
        expect(await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), NORMAL_TIMELOCK), sig).to.equal(false);
      }
      expect(NEW_TIMELOCK_GRANTS.length).to.equal(20);
      expect(NEW_GUARDIAN_GRANTS.length).to.equal(11);
    });
  });

  testVip(
    "VIP-667 [BNB Testnet] Liquidity Hub (USDT) — replace the Centrifuge YieldGroup with the new release",
    await vip664Addendum(),
    {
      callbackAfterExecution: async txResponse => {
        // Paused for the write-off, unpaused at the end. No `Upgraded`: no beacon is retargeted.
        await expectEvents(txResponse, [HUB_ABI], ["HubPauseToggled"], [2]);
        await expectEvents(
          txResponse,
          [HUB_ABI],
          ["YieldGroupRemoved", "YieldGroupAdded", "OuterWithdrawQueueSet", "OuterDepositQueueSet"],
          [1, 1, 1, 0],
        );
        await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [0]);
        await expectEvents(
          txResponse,
          [SOURCE_ABI],
          ["ResourceForceRemoved", "ResourceAdded", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
          [1, 1, 1, 1],
        );
        await expectEvents(
          txResponse,
          [ACM_ABI],
          ["RoleGranted", "RoleRevoked"],
          [NEW_TIMELOCK_GRANTS.length + NEW_GUARDIAN_GRANTS.length, 1],
        );
      },
    },
  );

  describe("Post-VIP: the retired stack is abandoned", () => {
    it("is deregistered from the Hub and stripped from both outer queues", async () => {
      expect((await hub.yieldGroupConfig(OLD_CENTRIFUGE_SOURCE_USDT)).registered).to.equal(false);
      expect(await hub.registeredYieldGroups()).to.not.include(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(await hub.outerWithdrawQueue()).to.not.include(OLD_CENTRIFUGE_SOURCE_USDT);
      expect(await hub.outerDepositQueue()).to.not.include(OLD_CENTRIFUGE_SOURCE_USDT);
    });

    it("holds no resource and reports nothing, with the written-off shares still on it", async () => {
      expect(await sourceRetired.resources()).to.deep.equal([]);
      expect(await sourceRetired.totalAssets()).to.equal(0);
      expect((await sourceRetired.resourceConfig(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).registered).to.equal(false);
      expect(await oldShare.balanceOf(OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(WRITTEN_OFF);
      expect(await usdt.balanceOf(OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("keeps running the pre-release code: its beacon was never retargeted", async () => {
      expect(await oldBeacon.implementation()).to.equal(OLD_YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(await oldBeacon.owner()).to.equal(NORMAL_TIMELOCK);

      // The retired guard views still answer, and the new implementation has no selector for any of
      // them — so a reply at all is the proof this proxy was never moved onto the new code. The
      // values are zero because the write-off clears both guard records as it removes the resource.
      expect((await sourceRetired.dropGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).minSnapshotPrice).to.equal(0);
      expect((await sourceRetired.growthGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).interval).to.equal(0);
      expect((await sourceRetired.priceAgeGuard(OLD_MOCK_CENTRIFUGE_VAULT_USDT)).enabled).to.equal(false);

      // And the new surface never appeared on it.
      for (const fn of ["navGuard", "resourceSpotAPYBps"]) {
        await expectNoSuchFunction(source.attach(OLD_CENTRIFUGE_SOURCE_USDT), fn, [OLD_MOCK_CENTRIFUGE_VAULT_USDT]);
      }
    });

    it("keeps its own ACM roles, which are keyed to a contract wired to nothing", async () => {
      for (const sig of ["addResource(address,address)", "forceRemoveResource(address)", "sweep(address,address)"]) {
        expect(await acm.hasRole(roleOf(OLD_CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("loses the one role whose target stays in production, and can no longer pause the Hub", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), OLD_CENTRIFUGE_SOURCE_USDT)).to.equal(false);
      const retired = await initMainnetUser(OLD_CENTRIFUGE_SOURCE_USDT, ethers.utils.parseEther("1"));
      await expect(hub.connect(retired).pauseHub()).to.be.reverted;
      expect(await hub.hubPaused()).to.equal(false);
    });
  });

  describe("Post-VIP: the replacement is live", () => {
    it("the Hub is left unpaused and the group is registered uncapped", async () => {
      expect(await hub.hubPaused()).to.equal(false);
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap).to.equal(ABSOLUTE_CAP_UNBOUNDED);
      expect(cfg.percentageCapBps).to.equal(PERCENTAGE_CAP_DISABLED);
      expect(await hub.registeredYieldGroups()).to.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("leads the withdraw queue, and the deposit queue is untouched", async () => {
      expect(await hub.outerWithdrawQueue()).to.deep.equal(OUTER_WITHDRAW_QUEUE);
      expect(await hub.outerWithdrawQueue()).to.deep.equal([
        CENTRIFUGE_SOURCE_USDT,
        FRV_SOURCE_USDT,
        FLUX_SOURCE_USDT,
        CORE_SOURCE_USDT,
      ]);
      expect(await hub.outerDepositQueue()).to.deep.equal(outerQueuesBefore[0]);
      expect(await hub.outerDepositQueue()).to.not.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("routes the new fund through the new adapter on both inner queues", async () => {
      expect(await source.resources()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      expect(await source.innerDepositQueue()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([MOCK_CENTRIFUGE_VAULT_USDT]);
      const cfg = await source.resourceConfig(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.adapter).to.equal(ADAPTER_CENTRIFUGE);
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
    });

    it("the Hub's total drops by exactly the written-off position and still sums its groups", async () => {
      expect(await hub.totalAssets()).to.equal(hubTotalBefore.sub(WRITTEN_OFF));
      await expectHubToSumItsGroups();
      const groups = await hub.registeredYieldGroups();
      expect(groups.length).to.equal(groupsBefore.length);
    });

    it("the timelock holds all 20 signatures and the guardian the 11 its wildcards miss", async () => {
      for (const sig of CENTRIFUGE_NEW_SURFACE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);

        const granted = await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN);
        const wildcarded = await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), GUARDIAN);
        expect(granted || wildcarded, sig).to.equal(true);
        expect(granted, sig).to.equal(!GUARDIAN_WILDCARDS.includes(sig));
      }
    });

    it("nobody else holds anything on it", async () => {
      for (const holder of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_NEW_SURFACE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
          expect(await acm.hasRole(roleOf(ethers.constants.AddressZero, sig), holder), `${holder} ${sig}`).to.equal(
            false,
          );
        }
      }
      // The new code never pauses the Hub, so the source is not granted that role back.
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(false);
    });

    it("no guard is armed and no APY is published", async () => {
      const band = await source.navGuard(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(band.anchor).to.equal(0);
      expect(band.centre).to.equal(0);
      expect(band.interval).to.equal(0);
      expect(band.driftBps).to.equal(0);
      expect(band.capEnabled).to.equal(false);
      expect(band.floorEnabled).to.equal(false);

      const status = await source.navGuardStatus(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(status.isClamped).to.equal(false);

      expect(await source.resourceSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(0);
      expect(await source.spotAPYBps()).to.equal(0);
    });

    it("the gated setters reject anyone without the role", async () => {
      const [stranger] = await ethers.getSigners();
      await expect(
        source.connect(stranger).setNavGuardRate(MOCK_CENTRIFUGE_VAULT_USDT, 500, 200, 200, 86_400, true, true),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setNavGuardSnapshot(MOCK_CENTRIFUGE_VAULT_USDT, PAR, 1),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setNavGuardEnabled(MOCK_CENTRIFUGE_VAULT_USDT, false, false),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(
        source.connect(stranger).setSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT, 500),
      ).to.be.revertedWithCustomError(source, "Unauthorized");
      await expect(source.connect(stranger).addResource(USDT, ADAPTER_CENTRIFUGE)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
    });

    it("the timelock can publish the APY the new code added", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(source.connect(timelock).setSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT, 500))
        .to.emit(source, "SpotAPYBpsSet")
        .withArgs(MOCK_CENTRIFUGE_VAULT_USDT, 0, 500);
      expect(await source.resourceSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT)).to.equal(500);
      await source.connect(timelock).setSpotAPYBps(MOCK_CENTRIFUGE_VAULT_USDT, 0);
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

      expect(await source.totalAssets()).to.equal(TRANCHE);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      await expectHubToSumItsGroups();
    });

    it("the keeper claims the settled subscription, and the group takes custody of the shares", async () => {
      await source.connect(operator).claimDeposit(MOCK_CENTRIFUGE_VAULT_USDT);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(TRANCHE);
      expect(await source.totalAssets()).to.equal(TRANCHE);
    });

    it("a redeem request burns the shares and reserves the assets for the group", async () => {
      await source.connect(operator).requestRedeem(MOCK_CENTRIFUGE_VAULT_USDT, TRANCHE);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(TRANCHE);
      expect(await source.totalAssets()).to.equal(TRANCHE);
    });

    it("the keeper claims the redemption, leaving the assets idle on the group", async () => {
      await expect(source.connect(operator).claimRedeem(MOCK_CENTRIFUGE_VAULT_USDT))
        .to.emit(source, "RedeemClaimed")
        .withArgs(MOCK_CENTRIFUGE_VAULT_USDT, TRANCHE);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(TRANCHE);
      expect(await source.maxWithdraw()).to.equal(TRANCHE);
      expect(await source.totalAssets()).to.equal(TRANCHE);
    });

    it("a Hub withdrawal drains Centrifuge first and empties the group", async () => {
      await expect(hub.connect(operator).withdraw(TRANCHE, GUARDIAN, GUARDIAN))
        .to.emit(hub, "WithdrawRouted")
        .withArgs(CENTRIFUGE_SOURCE_USDT, TRANCHE);

      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      await expectHubToSumItsGroups();
    });
  });
});
