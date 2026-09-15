import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999Mainnet, {
  ACM,
  ACM_AGGREGATOR,
  ACM_AGGREGATOR_INDEX,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_ABSOLUTE_CAP,
  CENTRIFUGE_BASE_MANAGER,
  CENTRIFUGE_BEACON,
  CENTRIFUGE_PERCENTAGE_CAP_BPS,
  CENTRIFUGE_RESOURCES,
  CENTRIFUGE_SOURCE_USDT,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_USDT,
  JAAA_POOL_ID,
  JAAA_SHARE,
  JAAA_SHARE_CLASS_ID,
  JAAA_VAULT,
  JTRSY_POOL_ID,
  JTRSY_SHARE,
  JTRSY_SHARE_CLASS_ID,
  JTRSY_VAULT,
  KEEPER,
  NAV_GUARDS,
  NAV_GUARD_CAP_ENABLED,
  NAV_GUARD_FLOOR_ENABLED,
  NAV_GUARD_INTERVAL,
  NORMAL_TIMELOCK,
  OPERATOR,
  OUTER_WITHDRAW_QUEUE,
  USDT,
  YIELD_GROUP_CENTRIFUGE_IMPL,
} from "../../vips/vip-999/bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_NAV_GUARD,
  CENTRIFUGE_OPERATOR,
} from "../../vips/vip-999/permissions-bscmainnet";
import { ACM_AGGREGATOR_ABI, buildPermissions } from "../../vips/vip-999/scripts/acmPermissions";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import MANAGER_ABI from "./abi/CentrifugeAsyncRequestManager.json";
import VAULT_ABI from "./abi/CentrifugeAsyncVault.json";
import HOOK_ABI from "./abi/CentrifugeFullRestrictions.json";
import SHARE_ABI from "./abi/CentrifugeShare.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifugeLatest.json";

const BLOCK_NUMBER = 122007400;

const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// A wildcard grant on the BSC ACM lives under `keccak(DEFAULT_ADMIN_ROLE, sig)` — a 32-byte zero
// prefix. The 20-byte address form is a different hash entirely and never matches one.
const wildcardOf = (sig: string) =>
  ethers.utils.solidityKeccak256(["bytes32", "string"], [ethers.constants.HashZero, sig]);

const bandFor = (vault: string) => {
  const band = NAV_GUARDS.find(b => b.resource === vault);
  if (!band) throw new Error(`no NAV band configured for ${vault}`);
  return band;
};

const FUNDS = [
  {
    name: "JTRSY",
    vault: JTRSY_VAULT,
    share: JTRSY_SHARE,
    poolId: JTRSY_POOL_ID,
    scId: JTRSY_SHARE_CLASS_ID,
    band: bandFor(JTRSY_VAULT),
  },
  {
    name: "JAAA",
    vault: JAAA_VAULT,
    share: JAAA_SHARE,
    poolId: JAAA_POOL_ID,
    scId: JAAA_SHARE_CLASS_ID,
    band: bandFor(JAAA_VAULT),
  },
];

// The three groups already on Hub_USDT, and the queues as they stand.
const EXISTING_GROUPS = [CORE_SOURCE_USDT, FLUX_SOURCE_USDT, FRV_SOURCE_USDT];

// Centrifuge's Spoke, a ward of both share-class hooks and so the account that onboards a holder.
const CENTRIFUGE_SPOKE = "0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB";
// The vToken behind the Core group, the leg a reallocation pulls from.
const CORE_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
// 100,000 USDT: comfortably inside the group cap, which the percentage dimension binds at ~850,000.
const TRANCHE = ethers.utils.parseUnits("100000", 18);
const NEVER_EXPIRES = "18446744073709551615"; // type(uint64).max

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let beacon: Contract;
  let source: Contract;
  let adapter: Contract;
  let acm: Contract;
  let usdt: Contract;

  let aggregator: Contract;
  let permissions: ReturnType<typeof buildPermissions>;

  let outerQueuesBefore: string[][];
  let hubTotalBefore: BigNumber;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    beacon = await ethers.getContractAt(BEACON_ABI, CENTRIFUGE_BEACON);
    source = await ethers.getContractAt(SOURCE_ABI, CENTRIFUGE_SOURCE_USDT);
    adapter = await ethers.getContractAt(ADAPTER_ABI, ADAPTER_CENTRIFUGE);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);

    outerQueuesBefore = [await hub.outerDepositQueue(), await hub.outerWithdrawQueue()];
    hubTotalBefore = await hub.totalAssets();

    aggregator = await ethers.getContractAt(ACM_AGGREGATOR_ABI, ACM_AGGREGATOR);
    permissions = buildPermissions();
    await aggregator.addGrantPermissions(permissions);
  });

  describe("Pre-VIP state", () => {
    it("share tokens are 6-decimal, USDT is 18", async () => {
      expect(await usdt.decimals()).to.equal(18);
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(ERC20_ABI, fund.share);
        expect(await share.decimals(), fund.name).to.equal(6);
        expect(await share.symbol(), fund.name).to.equal(fund.name);
      }
    });

    it("both funds are live and share one request manager", async () => {
      for (const fund of FUNDS) {
        const vault = await ethers.getContractAt(VAULT_ABI, fund.vault);
        expect(await vault.asset(), fund.name).to.equal(USDT);
        expect(await vault.share(), fund.name).to.equal(fund.share);
        expect(await vault.baseManager(), fund.name).to.equal(CENTRIFUGE_BASE_MANAGER);
        expect((await vault.poolId()).toString(), fund.name).to.equal(fund.poolId);
        expect(await vault.scId(), fund.name).to.equal(fund.scId);
        expect(await vault.pricePerShare(), fund.name).to.be.gt(0);
      }
    });

    it("the source is not a member of either share class", async () => {
      // Both share classes run a `FullRestrictions` hook, which only lets a member hold the share.
      // The source is on neither memberlist, so the first reallocation into a fund
      // cannot settle until Centrifuge adds it. That is an operational prerequisite this proposal
      // cannot satisfy — it grants roles and registers funds; it does not make Venus a member.
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDT);
        expect(isMember, fund.name).to.equal(false);
        // The Spoke is the ward that can change that.
        expect(await hook.wards(CENTRIFUGE_SPOKE), fund.name).to.equal(1);
      }
    });

    it("the Hub is live and carries the three existing groups", async () => {
      expect(await hub.asset()).to.equal(USDT);
      expect(await hub.accessControlManager()).to.equal(ACM);
      expect(await hub.hubPaused()).to.equal(false);
      expect(await hub.registeredYieldGroups()).to.deep.equal(EXISTING_GROUPS);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT)).registered).to.equal(false);
    });

    it("the source is deployed, bound to the Hub, and empty", async () => {
      expect(await ethers.provider.getCode(CENTRIFUGE_SOURCE_USDT)).to.not.equal("0x");
      expect(await source.hub()).to.equal(HUB_USDT);
      expect(await source.asset()).to.equal(USDT);
      expect(await source.accessControlManager()).to.equal(ACM);
      expect(await source.resources()).to.deep.equal([]);
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([]);
      expect(await source.totalAssets()).to.equal(0);
    });

    it("the beacon serves the recorded implementation", async () => {
      expect(await beacon.implementation()).to.equal(YIELD_GROUP_CENTRIFUGE_IMPL);
      expect(await beacon.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("the adapter accepts both funds", async () => {
      expect(await ethers.provider.getCode(ADAPTER_CENTRIFUGE)).to.not.equal("0x");
      for (const fund of FUNDS) {
        await adapter.validateRegistration(fund.vault);
        expect(await adapter.asset(fund.vault), fund.name).to.equal(USDT);
        expect(await adapter.pricePerShare(fund.vault), fund.name).to.be.gt(0);
        expect(await adapter.receiptBalance(fund.vault, CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
      }
    });

    it("nobody holds a role or a wildcard on the source", async () => {
      for (const holder of [NORMAL_TIMELOCK, OPERATOR, KEEPER, GUARDIAN, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
          expect(await acm.hasRole(wildcardOf(sig), holder), `wildcard ${holder} ${sig}`).to.equal(false);
        }
      }
    });

    it("the aggregator slot holds exactly these grants", async () => {
      expect(permissions.length).to.equal(
        CENTRIFUGE_GOVERNANCE.length +
          CENTRIFUGE_OPERATOR.length +
          CENTRIFUGE_CLAIMS.length +
          CENTRIFUGE_GUARDIAN.length,
      );

      for (const [i, expected] of permissions.entries()) {
        const [contractAddress, functionSig, account] = await aggregator.grantPermissions(ACM_AGGREGATOR_INDEX, i);
        const where = `entry ${i} (${expected.functionSig} -> ${expected.account})`;
        expect(ethers.utils.getAddress(contractAddress), `${where} contract`).to.equal(
          ethers.utils.getAddress(expected.contractAddress),
        );
        expect(functionSig, `${where} signature`).to.equal(expected.functionSig);
        expect(ethers.utils.getAddress(account), `${where} account`).to.equal(
          ethers.utils.getAddress(expected.account),
        );
      }
    });
  });

  testVip("VIP-999 [BNB Chain] Liquidity Hub (USDT) — onboard the Centrifuge YieldGroup", await vip999Mainnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACM_ABI],
        ["RoleGranted"],
        [
          // The 41 replayed grants, plus DEFAULT_ADMIN_ROLE lent to the aggregator.
          CENTRIFUGE_GOVERNANCE.length +
            CENTRIFUGE_OPERATOR.length +
            CENTRIFUGE_CLAIMS.length +
            CENTRIFUGE_GUARDIAN.length +
            1,
        ],
      );
      // The admin role is handed back in the same transaction.
      await expectEvents(txResponse, [ACM_ABI], ["RoleRevoked"], [1]);
      await expectEvents(
        txResponse,
        [SOURCE_ABI],
        ["ResourceAdded", "NavGuardConfigured", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [FUNDS.length, FUNDS.length, 0, 0],
      );
      await expectEvents(txResponse, [HUB_ABI], ["YieldGroupAdded", "OuterWithdrawQueueSet"], [1, 1]);
      await expectEvents(txResponse, [HUB_ABI], ["OuterDepositQueueSet"], [0]);
    },
  });

  describe("Post-VIP state", () => {
    it("both funds are registered and unpaused", async () => {
      expect(await source.resources()).to.deep.equal(CENTRIFUGE_RESOURCES);
      for (const fund of FUNDS) {
        const cfg = await source.resourceConfig(fund.vault);
        expect(cfg.registered, fund.name).to.equal(true);
        expect(cfg.paused, fund.name).to.equal(false);
        expect(cfg.adapter, fund.name).to.equal(ADAPTER_CENTRIFUGE);
      }
    });

    it("both inner queues are empty", async () => {
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.innerWithdrawQueue()).to.deep.equal([]);
      // With no queue to walk, `withdraw` can only ever spend idle, and there is none.
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
    });

    it("the group is registered at the intended caps", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDT);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap).to.equal(CENTRIFUGE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(CENTRIFUGE_PERCENTAGE_CAP_BPS);
      expect(await hub.registeredYieldGroups()).to.deep.equal([...EXISTING_GROUPS, CENTRIFUGE_SOURCE_USDT]);
    });

    it("Centrifuge is appended last to the withdraw queue", async () => {
      const withdrawQueue: string[] = await hub.outerWithdrawQueue();
      expect(withdrawQueue).to.deep.equal(OUTER_WITHDRAW_QUEUE);
      expect(withdrawQueue[withdrawQueue.length - 1]).to.equal(CENTRIFUGE_SOURCE_USDT);
      // The pre-existing order is preserved ahead of it, not reshuffled.
      expect(withdrawQueue.slice(0, -1)).to.deep.equal(outerQueuesBefore[1]);
    });

    it("the deposit queue is untouched", async () => {
      expect(await hub.outerDepositQueue()).to.deep.equal(outerQueuesBefore[0]);
      expect(await hub.outerDepositQueue()).to.not.include(CENTRIFUGE_SOURCE_USDT);
    });

    it("no capital moved into the group", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      for (const fund of FUNDS) {
        expect(await adapter.receiptBalance(fund.vault, CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
        const share = await ethers.getContractAt(ERC20_ABI, fund.share);
        expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT), fund.name).to.equal(0);
      }
    });

    it("the Hub's total still sums its groups", async () => {
      let sum = BigNumber.from(0);
      for (const group of await hub.registeredYieldGroups()) {
        sum = sum.add(await (await ethers.getContractAt(SOURCE_ABI, group)).totalAssets());
      }
      expect(await hub.totalAssets()).to.equal(sum.add(await usdt.balanceOf(HUB_USDT)));
      expect(await source.totalAssets()).to.equal(0);
      expect(await hub.totalAssets()).to.be.gte(hubTotalBefore);
    });

    it("the NAV band is configured on each fund with both sides armed", async () => {
      for (const fund of FUNDS) {
        const band = await source.navGuard(fund.vault);
        expect(band.driftBps, fund.name).to.equal(fund.band.driftBps);
        expect(band.upGapBps, fund.name).to.equal(fund.band.upGapBps);
        expect(band.downGapBps, fund.name).to.equal(fund.band.downGapBps);
        expect(band.interval, fund.name).to.equal(NAV_GUARD_INTERVAL);
        expect(band.capEnabled, fund.name).to.equal(NAV_GUARD_CAP_ENABLED);
        expect(band.floorEnabled, fund.name).to.equal(NAV_GUARD_FLOOR_ENABLED);
        expect(band.anchoredAt, fund.name).to.be.gt(0);
      }
    });

    it("the anchor starts at zero", async () => {
      // `setNavGuardRate` seeds anchor and centre from `_observedNav`, which is zero here. Until the
      // first re-anchor a funded position therefore reports at cost basis — covered in the e2e below.
      for (const fund of FUNDS) {
        const band = await source.navGuard(fund.vault);
        expect(band.anchor, fund.name).to.equal(0);
        expect(band.centre, fund.name).to.equal(0);
        // Both bounds collapse onto the centre, because the gaps are sized to the anchor.
        const status = await source.navGuardStatus(fund.vault);
        expect(status.minAllowedValue, fund.name).to.equal(0);
        expect(status.maxAllowedValue, fund.name).to.equal(0);
      }
    });

    it("no APY is published", async () => {
      for (const fund of FUNDS) {
        expect(await source.resourceSpotAPYBps(fund.vault), fund.name).to.equal(0);
      }
      expect(await source.spotAPYBps()).to.equal(0);
    });

    it("the normal timelock holds the whole surface", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), NORMAL_TIMELOCK), sig).to.equal(true);
      }
    });

    it("the operator holds its surface and nothing more", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), OPERATOR), sig).to.equal(
          CENTRIFUGE_OPERATOR.includes(sig),
        );
      }
    });

    it("the keeper holds only the four claim functions", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER), sig).to.equal(
          CENTRIFUGE_CLAIMS.includes(sig),
        );
      }
      // Sweeping claims must not imply moving value out of the group.
      for (const sig of ["sweep(address,address)", "removeResource(address)", "requestRedeem(address,uint256)"]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER), sig).to.equal(false);
      }
    });

    it("the guardian holds containment and the band, but cannot unpause", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), GUARDIAN), sig).to.equal(
          CENTRIFUGE_GUARDIAN.includes(sig),
        );
      }
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, "unpauseResource(address)"), GUARDIAN)).to.equal(false);
    });

    it("the NAV band never reaches the operator or keeper", async () => {
      for (const sig of CENTRIFUGE_NAV_GUARD) {
        for (const holder of [NORMAL_TIMELOCK, GUARDIAN]) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(true);
        }
        // The account that moves the capital does not decide what its value may be reported as.
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), OPERATOR), sig).to.equal(false);
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER), sig).to.equal(false);
      }
    });

    it("neither the fast-track nor the critical timelock holds anything", async () => {
      // Matching the rest of the Hub stack, where both hold nothing on any Hub, source or the registry.
      for (const holder of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder} ${sig}`).to.equal(false);
        }
      }
    });

    it("only the normal timelock holds sweep, which could move a whole fund position out", async () => {
      const sweep = "sweep(address,address)";
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sweep), NORMAL_TIMELOCK)).to.equal(true);
      for (const holder of [OPERATOR, KEEPER, GUARDIAN]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sweep), holder), `${holder}`).to.equal(false);
      }
      // The share token is neither `asset()` nor a registered resource, so `sweep` would not refuse it.
      for (const fund of FUNDS) {
        expect(await source.asset(), fund.name).to.not.equal(fund.share);
        expect((await source.resourceConfig(fund.share)).registered, fund.name).to.equal(false);
      }
    });

    it("the operator and the guardian can publish the APY, the keeper cannot", async () => {
      const sig = "setSpotAPYBps(address,uint64)";
      for (const holder of [NORMAL_TIMELOCK, OPERATOR, GUARDIAN]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), holder), `${holder}`).to.equal(true);
      }
      expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDT, sig), KEEPER)).to.equal(false);

      const operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      await expect(source.connect(operator).setSpotAPYBps(JTRSY_VAULT, 340))
        .to.emit(source, "SpotAPYBpsSet")
        .withArgs(JTRSY_VAULT, 0, 340);
      await source.connect(operator).setSpotAPYBps(JTRSY_VAULT, 0);
    });

    it("the source cannot pause the Hub", async () => {
      expect(await acm.hasRole(roleOf(HUB_USDT, "pauseHub()"), CENTRIFUGE_SOURCE_USDT)).to.equal(false);
    });
  });
  describe("Post-VIP: routing capital into Centrifuge", () => {
    let operator: SignerWithAddress;
    let manager: Contract;

    const leg = (yieldGroup: string, resource: string, amount: BigNumber) => ({ yieldGroup, resource, amount });

    before(async () => {
      operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      manager = await ethers.getContractAt(MANAGER_ABI, CENTRIFUGE_BASE_MANAGER);

      // Centrifuge onboards the Venus source to both share classes. Modelled by impersonating the
      // Spoke, the ward of both hooks, because it is Centrifuge's action and not the proposal's.
      const spoke = await initMainnetUser(CENTRIFUGE_SPOKE, ethers.utils.parseEther("1"));
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        await hook.connect(spoke).updateMember(fund.share, CENTRIFUGE_SOURCE_USDT, NEVER_EXPIRES);
      }
    });

    it("the source is a member of both share classes", async () => {
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDT);
        expect(isMember, fund.name).to.equal(true);
      }
    });

    it("a reallocation moves capital from Core into JTRSY", async () => {
      const hubTotalBeforeMove = await hub.totalAssets();
      const coreBefore = await (await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDT)).totalAssets();

      await hub
        .connect(operator)
        .reallocate([leg(CORE_SOURCE_USDT, CORE_VUSDT, TRANCHE)], [leg(CENTRIFUGE_SOURCE_USDT, JTRSY_VAULT, TRANCHE)]);

      // The request is pending, so the position is valued at cost and none of it is liquid.
      expect(await source.totalAssets()).to.equal(TRANCHE);
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdt.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);

      // Capital moved rather than appeared. Core is down by the tranche less the interest it books
      // in the same transaction — the reallocation accrues it, catching up every block skipped over
      // the timelock delay — so the net drop is slightly under the tranche and never over it.
      const coreAfter = await (await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDT)).totalAssets();
      const coreDrop = coreBefore.sub(coreAfter);
      expect(coreDrop).to.be.lte(TRANCHE);
      expect(coreDrop).to.be.gte(TRANCHE.mul(99).div(100));
      expect(await hub.totalAssets()).to.be.gte(hubTotalBeforeMove);
    });

    it("Centrifuge records a pending deposit request", async () => {
      const state = await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT);
      expect(state.pendingDepositRequest).to.equal(TRANCHE);
      expect(state.maxMint).to.equal(0);
      expect(state.maxWithdraw).to.equal(0);
      expect(state.pendingCancelDepositRequest).to.equal(false);

      // No shares yet, but the position is not empty: `receiptBalance` counts the pending request,
      // which is exactly what stops `removeResource` from dropping a fund with capital in flight.
      const share = await ethers.getContractAt(SHARE_ABI, JTRSY_SHARE);
      expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDT)).to.equal(0);
      expect(await adapter.receiptBalance(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT)).to.equal(TRANCHE);
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(source.connect(timelock).removeResource(JTRSY_VAULT))
        .to.be.revertedWithCustomError(source, "ResourceHasBalance")
        .withArgs(JTRSY_VAULT, TRANCHE);
    });

    it("armed on an empty position, the band pins the deposit to cost", async () => {
      // `setNavGuardRate` seeded anchor and centre from `_observedNav`, which was zero on an empty
      // position. The gaps are sized to the anchor, so `_currentBand` returns floor == cap == centre:
      // a band with no width at all.
      const band = await source.navGuard(JTRSY_VAULT);
      expect(band.anchor).to.equal(0);
      expect(band.centre).to.equal(TRANCHE);
      expect(band.capEnabled).to.equal(true);
      expect(band.floorEnabled).to.equal(true);

      const status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.minAllowedValue).to.equal(status.maxAllowedValue);
      expect(status.minAllowedValue).to.be.gte(TRANCHE);
      expect(status.minAllowedValue).to.be.lt(TRANCHE.mul(10_001).div(10_000));
      expect(await source.totalAssets()).to.be.gte(TRANCHE);

      // Armed against a zero-width band, anything Centrifuge reports is replaced by the drifted cost
      // basis — including a real loss. Until the second re-anchor gives the band width, the Hub is
      // told this position is worth what was paid for it whatever happens to the fund.
      await setCentrifugeReportedValue(TRANCHE.div(2));
      const halved = await source.navGuardStatus(JTRSY_VAULT);
      expect(halved.observedValue).to.equal(TRANCHE.div(2));
      expect(halved.isClamped).to.equal(true);
      expect(halved.clampedValue).to.equal(halved.minAllowedValue);
      expect(await source.totalAssets()).to.be.gte(TRANCHE);

      await setCentrifugeReportedValue(TRANCHE);
    });

    it("one interval later the band re-anchors and gains width", async () => {
      await ethers.provider.send("evm_increaseTime", [NAV_GUARD_INTERVAL + 1]);
      await ethers.provider.send("evm_mine", []);

      // `_updateNavGuard` runs from the group's `accrue()`, which the Hub drives on every accrual.
      // It re-anchors even with both sides off, which is the point of shipping it configured.
      const before = await source.navGuardStatus(JTRSY_VAULT);
      await hub.accrueFees();

      // `_reanchor` stores the observed value held inside the band in force — and that band was
      // zero-width, so this first one adopts the drifted centre rather than what the fund reports.
      const band = await source.navGuard(JTRSY_VAULT);
      const status = await source.navGuardStatus(JTRSY_VAULT);
      expect(band.anchor).to.be.gt(status.observedValue);
      expect(band.anchor).to.be.gte(before.maxAllowedValue);
      // A day of drift at 350 bps a year and nothing more: the fund's own number had no say.
      expect(band.anchor).to.be.lt(TRANCHE.mul(10_002).div(10_000));

      // Gaps are sized to the anchor, so the bounds are now genuinely two-sided. They are reported
      // even while switched off, so monitoring can see where an armed side would bind.
      const anchor = band.anchor;
      const jtrsyBand = bandFor(JTRSY_VAULT);
      expect(status.maxAllowedValue).to.equal(anchor.add(anchor.mul(jtrsyBand.upGapBps).div(10_000)));
      expect(status.minAllowedValue).to.equal(anchor.sub(anchor.mul(jtrsyBand.downGapBps).div(10_000)));
      expect(status.maxAllowedValue).to.be.gt(status.minAllowedValue);
      expect(status.isClamped).to.equal(false);
    });

    it("the guardian can arm the band, the operator cannot", async () => {
      await expect(source.connect(operator).setNavGuardEnabled(JTRSY_VAULT, true, true)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );

      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, false, false);
      await expect(source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, true, true))
        .to.emit(source, "NavGuardEnabledSet")
        .withArgs(JTRSY_VAULT, true, true);

      const band = await source.navGuard(JTRSY_VAULT);
      expect(band.capEnabled).to.equal(true);
      expect(band.floorEnabled).to.equal(true);

      // Armed against a real anchor, the live reading sits inside the band rather than on its edge.
      const status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.isClamped).to.equal(false);
      expect(status.observedValue).to.be.gt(status.minAllowedValue);
      expect(status.observedValue).to.be.lt(status.maxAllowedValue);

      // And the Guardian can take it back off without a proposal.
      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, false, false);
      expect((await source.navGuard(JTRSY_VAULT)).capEnabled).to.equal(false);
    });

    it("an armed cap clamps a reading above the band and under-reports it", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const observed = (await source.navGuardStatus(JTRSY_VAULT)).observedValue;
      const now = (await ethers.provider.getBlock("latest")).timestamp;

      // Anchor at half the position, so the fund's reading sits far above the cap.
      await source.connect(guardian).setNavGuardSnapshot(JTRSY_VAULT, observed.div(2), now);
      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, true, false);

      const status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.observedValue).to.equal(observed);
      expect(status.observedValue).to.be.gt(status.maxAllowedValue);
      expect(status.isClamped).to.equal(true);
      expect(status.clampedValue).to.equal(status.maxAllowedValue);

      // The Hub is told the bound, not the fund's number. A cap clamp under-reports — the safe side.
      expect(await source.totalAssets()).to.equal(status.maxAllowedValue);
      expect(await source.totalAssets()).to.be.lt(observed);
    });

    it("an armed floor clamps a reading below the band and over-reports it into the Hub's NAV", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const observed = (await source.navGuardStatus(JTRSY_VAULT)).observedValue;
      const hubTotal = await hub.totalAssets();
      const now = (await ethers.provider.getBlock("latest")).timestamp;

      // Anchor at twice the position, so the fund's reading sits below the floor.
      await source.connect(guardian).setNavGuardSnapshot(JTRSY_VAULT, observed.mul(2), now);
      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, false, true);

      const status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.observedValue).to.be.lt(status.minAllowedValue);
      expect(status.isClamped).to.equal(true);
      expect(status.clampedValue).to.equal(status.minAllowedValue);

      // A floor clamp reports the position above what the fund says it is worth, and that number is
      // the Hub's NAV. Two Guardian calls, no timelock, move what a Hub share is worth.
      expect(await source.totalAssets()).to.equal(status.minAllowedValue);
      expect(await source.totalAssets()).to.be.gt(observed);
      expect(await hub.totalAssets()).to.be.gt(hubTotal);

      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, false, false);
      expect(await source.totalAssets()).to.equal(observed);
    });

    const setCentrifugeReportedValue = async (value: BigNumber) => {
      // `mapping(address vault => mapping(address controller => AsyncInvestmentState))`. Two uint128
      // fields per slot puts `pendingDepositRequest` in the low half of the struct's third slot.
      // The mapping's own slot is found by scanning rather than hardcoded, so a Centrifuge layout
      // change fails loudly here instead of silently writing the wrong field.
      for (let i = 0; i < 40; i++) {
        const inner = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [JTRSY_VAULT, i]),
        );
        const base = ethers.utils.keccak256(
          ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [CENTRIFUGE_SOURCE_USDT, inner]),
        );
        const slot = BigNumber.from(base).add(2);
        const word = await ethers.provider.getStorageAt(CENTRIFUGE_BASE_MANAGER, slot);
        const low = BigNumber.from("0x" + word.slice(34));
        if (!low.eq((await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT)).pendingDepositRequest)) continue;

        // Keep `pendingRedeemRequest`, the high half of the same word, untouched.
        const packed = word.slice(0, 34) + ethers.utils.hexZeroPad(value.toHexString(), 16).slice(2);
        await ethers.provider.send("hardhat_setStorageAt", [CENTRIFUGE_BASE_MANAGER, slot.toHexString(), packed]);
        expect((await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT)).pendingDepositRequest).to.equal(value);
        return;
      }
      throw new Error("pendingDepositRequest slot not found — Centrifuge storage layout changed");
    };

    it("clamps a value Centrifuge reports far outside the band, either way", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const real = (await source.navGuardStatus(JTRSY_VAULT)).observedValue;
      const { upGapBps, downGapBps } = bandFor(JTRSY_VAULT);

      // Anchor the band on the position as it really stands, and arm both sides.
      const now = (await ethers.provider.getBlock("latest")).timestamp;
      await source.connect(guardian).setNavGuardSnapshot(JTRSY_VAULT, real, now);
      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, true, true);
      expect((await source.navGuardStatus(JTRSY_VAULT)).isClamped).to.equal(false);
      expect(await source.totalAssets()).to.equal(real);

      // Centrifuge now claims the position is worth ten times what was put in.
      await setCentrifugeReportedValue(real.mul(10));
      expect(await adapter.totalAssets(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDT)).to.equal(real.mul(10));

      let status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.observedValue).to.equal(real.mul(10));
      expect(status.isClamped).to.equal(true);
      expect(status.clampedValue).to.equal(status.maxAllowedValue);
      // The Hub is told the top of the band, roughly one gap over the real position — not 10x it.
      expect(await source.totalAssets()).to.equal(status.maxAllowedValue);
      expect(await source.totalAssets()).to.be.closeTo(real.add(real.mul(upGapBps).div(10_000)), real.div(1000));

      // And the other way: Centrifuge claims the position has all but evaporated.
      await setCentrifugeReportedValue(real.div(10));
      status = await source.navGuardStatus(JTRSY_VAULT);
      expect(status.observedValue).to.equal(real.div(10));
      expect(status.isClamped).to.equal(true);
      expect(status.clampedValue).to.equal(status.minAllowedValue);
      expect(await source.totalAssets()).to.equal(status.minAllowedValue);
      expect(await source.totalAssets()).to.be.closeTo(real.sub(real.mul(downGapBps).div(10_000)), real.div(1000));

      // A reading back inside the band passes through untouched.
      await setCentrifugeReportedValue(real);
      expect((await source.navGuardStatus(JTRSY_VAULT)).isClamped).to.equal(false);
      expect(await source.totalAssets()).to.equal(real);

      await source.connect(guardian).setNavGuardEnabled(JTRSY_VAULT, false, false);
    });

    it("the guardian can pause a fund, but not unpause it", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await source.connect(guardian).pauseResource(JAAA_VAULT);
      expect((await source.resourceConfig(JAAA_VAULT)).paused).to.equal(true);

      await expect(
        hub
          .connect(operator)
          .reallocate([leg(CORE_SOURCE_USDT, CORE_VUSDT, TRANCHE)], [leg(CENTRIFUGE_SOURCE_USDT, JAAA_VAULT, TRANCHE)]),
      )
        .to.be.revertedWithCustomError(source, "ResourceIsPaused")
        .withArgs(JAAA_VAULT);

      // And the guardian cannot undo its own pause: only governance can.
      await expect(source.connect(guardian).unpauseResource(JAAA_VAULT)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
    });
  });
});
