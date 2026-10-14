import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  ADAPTER_FLUX,
  ADAPTER_FLUX_LIVE,
  ADAPTER_SWAPS,
  AUX_COMMANDS_AGGREGATOR,
  CRITICAL_GUARDIAN,
  CRITICAL_TIMELOCK,
  DEFAULT_ADMIN_ROLE,
  FAST_TRACK_TIMELOCK,
  FLUID_LENDING_RESOLVER,
  HUB_BEACON,
  HUB_IMPL,
  HUB_LIVE_IMPL,
  HUB_STACKS,
  NORMAL_TIMELOCK,
  OPERATOR,
  ORACLE_GUARDIAN,
  PAUSE_GUARDIAN,
  SPOKE_ABSOLUTE_CAP,
  SPOKE_BEACON,
  SPOKE_PERCENTAGE_CAP_BPS,
  SPOKE_SOURCE_GRANTS_BATCH_INDEX,
  SPOKE_SOURCE_IMPL,
} from "../../vips/vip-671/addresses/bscmainnet";
import vip671Part2Bscmainnet, {
  buildSpokeSourceGrantsBatch,
  encodeAcmBatch,
  pendingDeployments,
} from "../../vips/vip-671/bscmainnet-part-2";
import { SPOKE_SOURCE_ROLES } from "../../vips/vip-671/permissions";
import {
  HUB_ROLES_CALLED,
  SPOKE_SOURCE_GRANTS,
  YIELD_GROUP_ROLES_CALLED,
} from "../../vips/vip-671/permissions-bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterSpokeV1.json";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import YIELD_GROUP_ABI from "./abi/YieldGroup.json";

/// TODO(deploy): move past the block that deploys the Hub implementation and the Spoke family, so the gated
/// assertions below run against the real deployment. Until then this block only checks what VIP-B relies on
/// from the live chain.
const FORK_BLOCK = 127532000;

/// EIP-1967 beacon slot, `bytes32(uint256(keccak256("eip1967.proxy.beacon")) - 1)`.
const BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

/// A `msg.sender` that holds no grant of its own, so `isAllowedToCall` asked from here answers only for the
/// address(0) wildcard. Asked from the target contract it answers "wildcard OR a grant against this contract",
/// which is what a real call sees.
const UNRELATED = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 unrelated sender"), 12));

/// A fresh account for the post-VIP deposit. The default hardhat signer carries EIP-7702 code on BNB Chain.
const DEPOSITOR = ethers.utils.getAddress(ethers.utils.hexDataSlice(ethers.utils.id("vip-671 hub depositor"), 12));

/// The accounts every role check covers.
const KNOWN_ACCOUNTS = [
  NORMAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  CRITICAL_TIMELOCK,
  CRITICAL_GUARDIAN,
  PAUSE_GUARDIAN,
  OPERATOR,
  ORACLE_GUARDIAN,
];

/// The six live Core and Flux sources, which run the same generic `YieldGroup` as Spoke. VIP-B copies their grants.
const LIVE_GENERIC_SOURCES = [
  ...new Set(ADAPTER_SWAPS.filter(s => s.name.match(/^(Core|Flux)/)).map(s => s.yieldGroup)),
];

/// Each Core market holds its underlying as cash, so it funds the post-VIP deposit.
const UNDERLYING_HOLDER: Record<string, string> = Object.fromEntries(
  HUB_STACKS.map(({ hub, name }) => [
    hub,
    ADAPTER_SWAPS.find(s => s.name.startsWith(`CoreSource_${name.replace("Hub_", "")}:`))!.resource,
  ]),
);

const DEPOSIT = ethers.utils.parseUnits("1000", 18);

const ACM_IFACE = new ethers.utils.Interface(["function isAllowedToCall(address,string) view returns (bool)"]);
const mayCall = async (onBehalfOf: string, account: string, signature: string): Promise<boolean> => {
  const data = ACM_IFACE.encodeFunctionData("isAllowedToCall", [account, signature]);
  const result = await ethers.provider.call({ to: ACM, data, from: onBehalfOf });
  return ACM_IFACE.decodeFunctionResult("isAllowedToCall", result)[0];
};

const sameAddress = (a: string, b: string) => ethers.utils.getAddress(a) === ethers.utils.getAddress(b);
const normalize = (list: string[]) => list.map(a => ethers.utils.getAddress(a));

const expectAddress = (actual: string, expected: string, label?: string) =>
  expect(ethers.utils.getAddress(actual), label).to.equal(ethers.utils.getAddress(expected));

const readSlotAddress = async (proxy: string, slot: string): Promise<string> =>
  ethers.utils.getAddress(ethers.utils.hexDataSlice(await ethers.provider.getStorageAt(proxy, slot), 12));

/// Storage-backed Hub state the upgrade must not touch. `totalAssets` is left out: Flux, FRV and Centrifuge
/// value their positions by time, so it moves across the voting and timelock delay on its own.
type HubSnapshot = {
  totalSupply: BigNumber;
  highWaterMarkPerShare: BigNumber;
  feeBps: [number, number];
  redeemFeeBps: number;
  feeRecipient: string;
  maxWithdrawalSize: BigNumber;
  hubPaused: boolean;
  outerDepositQueue: string[];
  yieldGroups: { yieldGroup: string; config: [BigNumber, number, boolean, boolean] }[];
};

forking(FORK_BLOCK, async () => {
  const missing = pendingDeployments();

  const beacon = new ethers.Contract(HUB_BEACON, BEACON_ABI, ethers.provider);
  const aggregator = new ethers.Contract(AUX_COMMANDS_AGGREGATOR, AGGREGATOR_ABI, ethers.provider);
  const acm = new ethers.Contract(ACM, ACM_ABI, ethers.provider);
  const hubOf = (address: string) => new ethers.Contract(address, HUB_ABI, ethers.provider);
  const groupOf = (address: string) => new ethers.Contract(address, YIELD_GROUP_ABI, ethers.provider);

  const snapshot = async (hubAddress: string): Promise<HubSnapshot> => {
    const hub = hubOf(hubAddress);
    const registered: string[] = await hub.registeredYieldGroups();
    const [management, performance] = await hub.feeBps();
    return {
      totalSupply: await hub.totalSupply(),
      highWaterMarkPerShare: await hub.highWaterMarkPerShare(),
      feeBps: [management, performance],
      redeemFeeBps: await hub.redeemFeeBps(),
      feeRecipient: ethers.utils.getAddress(await hub.feeRecipient()),
      maxWithdrawalSize: await hub.maxWithdrawalSize(),
      hubPaused: await hub.hubPaused(),
      outerDepositQueue: normalize(await hub.outerDepositQueue()),
      yieldGroups: await Promise.all(
        registered.map(async yieldGroup => {
          const c = await hub.yieldGroupConfig(yieldGroup);
          return {
            yieldGroup: ethers.utils.getAddress(yieldGroup),
            config: [c.absoluteCap, c.percentageCapBps, c.paused, c.registered] as [
              BigNumber,
              number,
              boolean,
              boolean,
            ],
          };
        }),
      ),
    };
  };

  /// Captured before the proposal runs and compared after it.
  const snapshotsBefore: Record<string, HubSnapshot> = {};
  const resourcePausedBefore: Record<string, boolean> = {};

  // What VIP-B relies on, read from the live chain. Needs no new deployment, so it runs on every fork block.
  describe("Pre-VIP: what VIP-B relies on, on the live chain", () => {
    it("runs all three Hubs on the live implementation, behind the Normal Timelock's beacon", async () => {
      expectAddress(await beacon.implementation(), HUB_LIVE_IMPL);
      expectAddress(await beacon.owner(), NORMAL_TIMELOCK);
      for (const { name, hub, asset } of HUB_STACKS) {
        expectAddress(await readSlotAddress(hub, BEACON_SLOT), HUB_BEACON, `${name} beacon`);
        expectAddress(await hubOf(hub).asset(), asset, `${name} asset`);
        expect(await hubOf(hub).hubPaused(), `${name} paused`).to.be.false;
      }
    });

    it("has the queues VIP-B was built against, with every registered group in the withdraw queue", async () => {
      // The Operator holds both queue setters, so either can move before execution.
      for (const { name, hub, withdrawQueueBefore, depositQueue } of HUB_STACKS) {
        const h = hubOf(hub);
        expect(normalize(await h.outerWithdrawQueue()), `${name} withdraw queue`).to.deep.equal(
          normalize(withdrawQueueBefore),
        );
        expect(normalize(await h.outerDepositQueue()), `${name} deposit queue`).to.deep.equal(normalize(depositQueue));
        // `setOuterWithdrawQueue` rejects a queue that omits a funded group, so VIP-B's queue keeps them all.
        expect(normalize(await h.registeredYieldGroups()).sort(), `${name} registered`).to.deep.equal(
          normalize(withdrawQueueBefore).sort(),
        );
      }
    });

    it("lists every resource of every registered yield group in the adapter swap, on its live adapter", async () => {
      const seen: string[] = [];
      for (const { hub } of HUB_STACKS) {
        for (const yieldGroup of await hubOf(hub).registeredYieldGroups()) {
          for (const resource of await groupOf(yieldGroup).resources()) {
            const swap = ADAPTER_SWAPS.find(
              s => sameAddress(s.yieldGroup, yieldGroup) && sameAddress(s.resource, resource),
            );
            expect(swap, `${yieldGroup}: ${resource} missing from ADAPTER_SWAPS`).to.not.equal(undefined);
            const [registered, paused, adapter] = await groupOf(yieldGroup).resourceConfig(resource);
            expect(registered, swap!.name).to.be.true;
            expectAddress(adapter, swap!.liveAdapter, swap!.name);
            resourcePausedBefore[swap!.name] = paused;
            seen.push(swap!.name);
          }
        }
      }
      expect(seen.sort()).to.deep.equal(ADAPTER_SWAPS.map(s => s.name).sort());
    });

    it("has every new adapter deployed, and the Flux one bound to the live Fluid resolver", async () => {
      for (const { name, liveAdapter, newAdapter } of ADAPTER_SWAPS) {
        expect(await ethers.provider.getCode(newAdapter), name).to.not.equal("0x");
        expect(sameAddress(newAdapter, liveAdapter), `${name} swaps to itself`).to.be.false;
      }
      const resolverAbi = ["function LENDING_RESOLVER() view returns (address)"];
      for (const adapter of [ADAPTER_FLUX, ADAPTER_FLUX_LIVE]) {
        const resolver = await new ethers.Contract(adapter, resolverAbi, ethers.provider).LENDING_RESOLVER();
        expectAddress(resolver, FLUID_LENDING_RESOLVER, adapter);
      }
    });

    it("gives the Normal Timelock every role VIP-B calls with, as exact grants", async () => {
      for (const { name, hub } of HUB_STACKS) {
        for (const role of HUB_ROLES_CALLED) {
          expect(await mayCall(hub, NORMAL_TIMELOCK, role), `${name}: ${role}`).to.be.true;
        }
      }
      for (const yieldGroup of new Set(ADAPTER_SWAPS.map(s => s.yieldGroup))) {
        for (const role of YIELD_GROUP_ROLES_CALLED) {
          expect(await mayCall(yieldGroup, NORMAL_TIMELOCK, role), `${yieldGroup}: ${role}`).to.be.true;
        }
      }
      for (const role of [...HUB_ROLES_CALLED, ...YIELD_GROUP_ROLES_CALLED]) {
        expect(await mayCall(UNRELATED, NORMAL_TIMELOCK, role), `${role} as a wildcard`).to.be.false;
      }
    });

    it("grants the live Core and Flux sources exactly the role set VIP-B copies to each Spoke source", async () => {
      expect(LIVE_GENERIC_SOURCES).to.have.lengthOf(6);
      for (const source of LIVE_GENERIC_SOURCES) {
        for (const role of SPOKE_SOURCE_ROLES) {
          for (const account of KNOWN_ACCOUNTS) {
            const expected = SPOKE_SOURCE_GRANTS.some(g => g.role === role && sameAddress(g.account, account));
            expect(await mayCall(source, account, role), `${source}: ${account} may ${role}`).to.equal(expected);
          }
        }
      }
    });

    it("holds none of the Spoke source roles as a wildcard, so each grant is a real change", async () => {
      for (const role of SPOKE_SOURCE_ROLES) {
        for (const account of KNOWN_ACCOUNTS) {
          expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
        }
      }
    });

    it("lets the Normal Timelock run the aggregator sandwich, with the aggregator holding no admin role", async () => {
      expectAddress(await aggregator.owner(), NORMAL_TIMELOCK);
      expectAddress(await aggregator.accessControlManager(), ACM);
      expect(await mayCall(AUX_COMMANDS_AGGREGATOR, NORMAL_TIMELOCK, "executeBatch(uint256)")).to.be.true;
      // `grantRole` and `revokeRole` need the admin of DEFAULT_ADMIN_ROLE, which is DEFAULT_ADMIN_ROLE itself.
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.be.false;
    });
  });

  if (missing.length > 0) {
    describe("VIP-671 [bscmainnet] VIP-B Liquidity Hub infrastructure", () => {
      // Mocha reports an `it` without a body as pending, so the run stays green and says what is missing.
      it(`is not simulated until these are deployed: ${missing.join(", ")}`);
    });
    return;
  }

  describe("Pre-VIP: the deployed Hub implementation and Spoke family", () => {
    it("deploys a new Hub implementation", async () => {
      expect(sameAddress(HUB_IMPL, HUB_LIVE_IMPL), "same as live").to.be.false;
      expect(await ethers.provider.getCode(HUB_IMPL)).to.not.equal("0x");
    });

    it("hands SpokeBeacon to the Normal Timelock, serving the recorded implementation", async () => {
      const spokeBeacon = new ethers.Contract(SPOKE_BEACON, BEACON_ABI, ethers.provider);
      expectAddress(await spokeBeacon.owner(), NORMAL_TIMELOCK);
      expectAddress(await spokeBeacon.implementation(), SPOKE_SOURCE_IMPL);
    });

    it("binds each Spoke source to its Hub, that Hub's asset and the ACM, with no resource", async () => {
      // `addYieldGroup` checks only the asset. `hub` and the ACM have no setter, so a wrong value means a new source.
      for (const { name, hub, asset, spokeSource } of HUB_STACKS) {
        const source = groupOf(spokeSource);
        expectAddress(await readSlotAddress(spokeSource, BEACON_SLOT), SPOKE_BEACON, `${name} source beacon`);
        expectAddress(await source.hub(), hub, `${name} source hub`);
        expectAddress(await source.asset(), asset, `${name} source asset`);
        expectAddress(await source.accessControlManager(), ACM, `${name} source ACM`);
        expect(await source.blocksPerYear(), `${name} blocksPerYear`).to.equal(0);
        expect(await source.resources(), `${name} resources`).to.have.lengthOf(0);
        expect((await hubOf(hub).yieldGroupConfig(spokeSource)).registered, `${name} registered`).to.be.false;
      }
    });

    it("gives no account any Spoke source role yet", async () => {
      for (const { spokeSource } of HUB_STACKS) {
        for (const role of SPOKE_SOURCE_ROLES) {
          for (const account of KNOWN_ACCOUNTS) {
            expect(await mayCall(spokeSource, account, role), `${spokeSource}: ${account} may ${role}`).to.be.false;
          }
        }
      }
    });

    it("records the Hub state the upgrade must leave alone", async () => {
      for (const { hub } of HUB_STACKS) {
        snapshotsBefore[hub] = await snapshot(hub);
      }
    });
  });

  const batch = buildSpokeSourceGrantsBatch();
  let storedOnFork = false;

  describe("Pre-VIP: the Spoke source grants batch", () => {
    before(async () => {
      const batchCount: number = (await aggregator.batchCount()).toNumber();
      if (batchCount > SPOKE_SOURCE_GRANTS_BATCH_INDEX) {
        return;
      }
      // TODO(ops): delete this fallback once provisionAcmBatches.ts has stored the batch on mainnet and FORK_BLOCK
      // is past it. Until then the Normal Timelock (an authorized batcher) stores it on the fork, and the
      // comparison below only checks the builder against itself.
      if (batchCount < SPOKE_SOURCE_GRANTS_BATCH_INDEX) {
        throw new Error(
          `aggregator holds ${batchCount} batches, so index ${SPOKE_SOURCE_GRANTS_BATCH_INDEX} cannot be stored next`,
        );
      }
      const batcher = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const tx = await aggregator
        .connect(batcher)
        ["addBatch((address,bytes)[],uint256)"](encodeAcmBatch(batch), SPOKE_SOURCE_GRANTS_BATCH_INDEX);
      const { gasUsed } = await tx.wait();
      storedOnFork = true;
      // The real `addBatch` is its own transaction under the same per-tx cap.
      console.warn(
        `[vip-671] grants batch stored on the fork at index ${SPOKE_SOURCE_GRANTS_BATCH_INDEX}, gasUsed=${gasUsed}`,
      );
    });

    it("reads the batch stored on mainnet, not one this simulation stored", function () {
      if (storedOnFork) {
        this.skip();
      }
    });

    it("stores exactly the builder's 60 grants, call for call, every one against the ACM", async () => {
      expect(batch).to.have.lengthOf(SPOKE_SOURCE_GRANTS.length * HUB_STACKS.length);
      const expected = encodeAcmBatch(batch);
      const stored: { target: string; data: string }[] = await aggregator.getBatch(SPOKE_SOURCE_GRANTS_BATCH_INDEX);
      expect(stored).to.have.lengthOf(expected.length);
      for (let i = 0; i < expected.length; i++) {
        expectAddress(stored[i].target, ACM, `call ${i} target`);
        expect(stored[i].data, `call ${i} calldata`).to.equal(expected[i].data);
      }
    });
  });

  testVip("VIP-671 [bscmainnet] VIP-B Liquidity Hub infrastructure", await vip671Part2Bscmainnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
      await expectEvents(txResponse, [YIELD_GROUP_ABI], ["ResourceAdapterUpdated"], [ADAPTER_SWAPS.length]);
      // The mainnet ACM emits no PermissionGranted, so RoleGranted is the count: one per grant, plus the
      // aggregator's DEFAULT_ADMIN_ROLE, which RoleRevoked takes back.
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted", "RoleRevoked"],
        [SPOKE_SOURCE_GRANTS.length * HUB_STACKS.length + 1, 1],
      );
      await expectEvents(txResponse, [AGGREGATOR_ABI], ["BatchExecuted"], [1]);
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterWithdrawQueueSet", "OuterDepositQueueSet"],
        [HUB_STACKS.length, HUB_STACKS.length, 0],
      );
    },
  });

  describe("Post-VIP", () => {
    it("runs all three Hubs on the new implementation", async () => {
      expectAddress(await beacon.implementation(), HUB_IMPL);
      for (const { name, hub } of HUB_STACKS) {
        expectAddress(await readSlotAddress(hub, BEACON_SLOT), HUB_BEACON, `${name} beacon`);
        // The live implementation solves the caps here; the new one inherits OpenZeppelin's unbounded value.
        expect(await hubOf(hub).maxDeposit(UNRELATED), `${name} maxDeposit`).to.equal(ethers.constants.MaxUint256);
      }
    });

    it("keeps every Hub's stored state, and every existing group's config, across the upgrade", async () => {
      for (const { name, hub, spokeSource } of HUB_STACKS) {
        const after = await snapshot(hub);
        const before = snapshotsBefore[hub];
        expect(
          after.yieldGroups.filter(g => !sameAddress(g.yieldGroup, spokeSource)),
          `${name} existing groups`,
        ).to.deep.equal(before.yieldGroups);
        expect({ ...after, yieldGroups: [] }, name).to.deep.equal({ ...before, yieldGroups: [] });
      }
    });

    it("moves every resource to its new adapter, with its pause flag unchanged", async () => {
      for (const { name, yieldGroup, resource, newAdapter } of ADAPTER_SWAPS) {
        const [registered, paused, adapter] = await groupOf(yieldGroup).resourceConfig(resource);
        expect(registered, name).to.be.true;
        expect(paused, `${name} paused`).to.equal(resourcePausedBefore[name]);
        expectAddress(adapter, newAdapter, name);
        // `resourceName` is what the old adapters lacked and `HubLens` reads.
        const resourceName = await new ethers.Contract(adapter, ADAPTER_ABI, ethers.provider).resourceName(resource);
        expect(resourceName, `${name} resourceName`).to.not.equal("");
      }
    });

    it("grants all 20 roles on each Spoke source, to the named accounts only", async () => {
      for (const { name, spokeSource } of HUB_STACKS) {
        for (const role of SPOKE_SOURCE_ROLES) {
          for (const account of KNOWN_ACCOUNTS) {
            const expected = SPOKE_SOURCE_GRANTS.some(g => g.role === role && sameAddress(g.account, account));
            expect(await mayCall(spokeSource, account, role), `${name}: ${account} may ${role}`).to.equal(expected);
          }
        }
      }
    });

    it("grants none of them as a wildcard", async () => {
      for (const { role, account } of SPOKE_SOURCE_GRANTS) {
        expect(await mayCall(UNRELATED, account, role), `${account} holds ${role} as a wildcard`).to.be.false;
      }
    });

    it("takes the admin role back from the aggregator", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, AUX_COMMANDS_AGGREGATOR)).to.be.false;
    });

    it("registers each Spoke source unpaused with both caps at 0, so its effective cap is 0", async () => {
      for (const { name, hub, spokeSource } of HUB_STACKS) {
        const h = hubOf(hub);
        const config = await h.yieldGroupConfig(spokeSource);
        expect(config.absoluteCap, `${name} absoluteCap`).to.equal(SPOKE_ABSOLUTE_CAP);
        expect(config.percentageCapBps, `${name} percentageCapBps`).to.equal(SPOKE_PERCENTAGE_CAP_BPS);
        expect(config.paused, `${name} paused`).to.be.false;
        expect(config.registered, `${name} registered`).to.be.true;
        expect(await h.yieldGroupEffectiveCap(spokeSource), `${name} effective cap`).to.equal(0);
      }
    });

    it("puts each Spoke source last in its withdraw queue, and leaves the deposit queue alone", async () => {
      for (const { name, hub, spokeSource, withdrawQueueBefore, depositQueue } of HUB_STACKS) {
        const h = hubOf(hub);
        expect(normalize(await h.outerWithdrawQueue()), `${name} withdraw queue`).to.deep.equal(
          normalize([...withdrawQueueBefore, spokeSource]),
        );
        expect(normalize(await h.outerDepositQueue()), `${name} deposit queue`).to.deep.equal(normalize(depositQueue));
      }
    });

    it("still takes a deposit and pays a redemption on each Hub, with nothing reaching the Spoke source", async () => {
      const depositor = await initMainnetUser(DEPOSITOR, ethers.utils.parseEther("1"));
      for (const { name, hub, asset, spokeSource } of HUB_STACKS) {
        const h = hubOf(hub).connect(depositor);
        const token = new ethers.Contract(asset, ERC20_ABI, depositor);

        const holder = await initMainnetUser(UNDERLYING_HOLDER[hub], ethers.utils.parseEther("1"));
        await token.connect(holder).transfer(depositor.address, DEPOSIT);
        await token.approve(hub, DEPOSIT);

        await h.deposit(DEPOSIT, depositor.address);
        const shares = await h.balanceOf(depositor.address);
        expect(shares, `${name} shares`).to.be.gt(0);
        expect(await groupOf(spokeSource).totalAssets(), `${name} Spoke source`).to.equal(0);

        const balanceBefore = await token.balanceOf(depositor.address);
        await h.redeem(shares, depositor.address, depositor.address);
        const received = (await token.balanceOf(depositor.address)).sub(balanceBefore);
        expect(received, `${name} redeemed`).to.be.closeTo(DEPOSIT, DEPOSIT.div(1000));
        expect(await groupOf(spokeSource).totalAssets(), `${name} Spoke source`).to.equal(0);
      }
    });
  });
});
