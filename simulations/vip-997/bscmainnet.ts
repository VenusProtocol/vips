import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip997, {
  ACM,
  ACM_AGGREGATOR,
  ACM_AGGREGATOR_INDEX,
  ADAPTER_CENTRIFUGE,
  CENTRIFUGE_ABSOLUTE_CAP,
  CENTRIFUGE_BASE_MANAGER,
  CENTRIFUGE_BEACON,
  CENTRIFUGE_PERCENTAGE_CAP_BPS,
  CENTRIFUGE_RESOURCES,
  CENTRIFUGE_SOURCE_USDC,
  CORE_SOURCE_USDC,
  CRITICAL_TIMELOCK,
  DEFAULT_ADMIN_ROLE,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDC,
  FRV_SOURCE_USDC,
  GUARDIAN,
  HUB_USDC,
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
  NAV_GUARD_INTERVAL,
  NORMAL_TIMELOCK,
  OPERATOR,
  OUTER_WITHDRAW_QUEUE,
  SPOT_APY_BPS,
  USDC,
  YIELD_GROUP_CENTRIFUGE_IMPL,
} from "../../vips/vip-997/bscmainnet";
import {
  CENTRIFUGE_CLAIMS,
  CENTRIFUGE_GOVERNANCE,
  CENTRIFUGE_GUARDIAN,
  CENTRIFUGE_NAV_GUARD,
  CENTRIFUGE_OPERATOR,
  EMERGENCY,
} from "../../vips/vip-997/permissions-bscmainnet";
import { ACM_AGGREGATOR_ABI, buildPermissions } from "../../vips/vip-997/scripts/acmPermissions";
import ACM_ABI from "./abi/AccessControlManager.json";
import ADAPTER_ABI from "./abi/AdapterCentrifuge.json";
import MANAGER_ABI from "./abi/CentrifugeAsyncRequestManager.json";
import VAULT_ABI from "./abi/CentrifugeAsyncVault.json";
import HOOK_ABI from "./abi/CentrifugeFullRestrictions.json";
import SHARE_ABI from "./abi/CentrifugeShare.json";
import SPOKE_ABI from "./abi/CentrifugeSpoke.json";
import ERC20_ABI from "./abi/ERC20.json";
import HUB_ABI from "./abi/Hub.json";
import BEACON_ABI from "./abi/UpgradeableBeacon.json";
import SOURCE_ABI from "./abi/YieldGroupCentrifuge.json";

const BLOCK_NUMBER = 124693000;

// ACM role hashing.
const roleOf = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// The two funds, each paired with the band the VIP configures for it and its USDT twin — the vault of
// the same share class already on the USDT Hub.
const bandFor = (vault: string) => {
  const band = NAV_GUARDS.find(b => b.resource === vault);
  if (!band) throw new Error(`no NAV band configured for ${vault}`);
  return band;
};

const FUNDS = [
  {
    name: "JTRSY",
    vault: JTRSY_VAULT,
    usdtVault: "0x6e6B8498415083a4386BE83DD59Edd4366402FFa",
    share: JTRSY_SHARE,
    poolId: JTRSY_POOL_ID,
    scId: JTRSY_SHARE_CLASS_ID,
    // BalanceSheet.escrow(poolId): where Centrifuge holds a pool's assets and unclaimed shares.
    escrow: "0x0665FDe254598e307b63f3aAe3cCd881a62d4bE3",
    band: bandFor(JTRSY_VAULT),
  },
  {
    name: "JAAA",
    vault: JAAA_VAULT,
    usdtVault: "0xcbAfe61d84C6Fb88252a6Adf1C9CB0B9D029cb99",
    share: JAAA_SHARE,
    poolId: JAAA_POOL_ID,
    scId: JAAA_SHARE_CLASS_ID,
    escrow: "0x040170aA9AAa916c2e8135777a31f17C440BA52a",
    band: bandFor(JAAA_VAULT),
  },
];
const [JTRSY, JAAA] = FUNDS;

// The three groups already on Hub_USDC.
const EXISTING_GROUPS = [CORE_SOURCE_USDC, FLUX_SOURCE_USDC, FRV_SOURCE_USDC];

// Centrifuge's Spoke, a ward of both share-class hooks and of the AsyncRequestManager: the account
// that onboards a holder and relays each settlement into the request manager.
const CENTRIFUGE_SPOKE = "0xEC3582fcDc34078a4B7a8c75a5a3AE46f48525aB";
// Centrifuge's Root, a ward of the Spoke and so the account that can publish a share price.
const CENTRIFUGE_ROOT = "0x7Ed48C31f2fdC40d37407cBaBf0870B2b688368f";
// The vToken behind the Core group, the leg a reallocation pulls from and returns to.
const CORE_VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
// 30,000 USDC per fund: both fit inside the group cap, which the percentage dimension binds near 77,000.
const TRANCHE = ethers.utils.parseUnits("30000", 18);
// One whole share, in the 6-decimal share token's units.
const ONE_SHARE = BigNumber.from(10).pow(6);
const EIP1967_BEACON_SLOT = "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50";

forking(BLOCK_NUMBER, async () => {
  let hub: Contract;
  let beacon: Contract;
  let source: Contract;
  let adapter: Contract;
  let acm: Contract;
  let usdc: Contract;

  let aggregator: Contract;
  let permissions: ReturnType<typeof buildPermissions>;

  let depositQueueBefore: string[];
  let withdrawQueueBefore: string[];
  let hubTotalBefore: BigNumber;

  before(async () => {
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDC);
    beacon = await ethers.getContractAt(BEACON_ABI, CENTRIFUGE_BEACON);
    source = await ethers.getContractAt(SOURCE_ABI, CENTRIFUGE_SOURCE_USDC);
    adapter = await ethers.getContractAt(ADAPTER_ABI, ADAPTER_CENTRIFUGE);
    acm = await ethers.getContractAt(ACM_ABI, ACM);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);

    depositQueueBefore = await hub.outerDepositQueue();
    withdrawQueueBefore = await hub.outerWithdrawQueue();
    hubTotalBefore = await hub.totalAssets();

    aggregator = await ethers.getContractAt(ACM_AGGREGATOR_ABI, ACM_AGGREGATOR);
    permissions = buildPermissions();
    // Until the batch is seeded on chain, seed it here. The VIP replays a fixed slot, so it has to
    // land in exactly that one; the pre-VIP check below asserts the slot's contents either way.
    const seeded = await aggregator.grantPermissions(ACM_AGGREGATOR_INDEX, 0).then(
      () => true,
      () => false,
    );
    if (!seeded) {
      await expect(aggregator.addGrantPermissions(permissions))
        .to.emit(aggregator, "GrantPermissionsAdded")
        .withArgs(ACM_AGGREGATOR_INDEX);
    }
  });

  describe("Pre-VIP state", () => {
    it("share tokens are 6-decimal, USDC is 18", async () => {
      expect(await usdc.decimals()).to.equal(18);
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(ERC20_ABI, fund.share);
        expect(await share.decimals(), fund.name).to.equal(6);
        expect(await share.symbol(), fund.name).to.equal(fund.name);
      }
    });

    it("both USDC vaults are live and share one request manager", async () => {
      for (const fund of FUNDS) {
        const vault = await ethers.getContractAt(VAULT_ABI, fund.vault);
        expect(await vault.asset(), fund.name).to.equal(USDC);
        expect(await vault.share(), fund.name).to.equal(fund.share);
        expect(await vault.baseManager(), fund.name).to.equal(CENTRIFUGE_BASE_MANAGER);
        expect((await vault.poolId()).toString(), fund.name).to.equal(fund.poolId);
        expect(await vault.scId(), fund.name).to.equal(fund.scId);
        expect(await vault.pricePerShare(), fund.name).to.be.gt(0);
      }
    });

    it("each USDC vault is the same share class, at the same NAV, as its USDT twin", async () => {
      // The premise of reusing the USDT source's configuration: one fund, two deposit currencies.
      for (const fund of FUNDS) {
        const vault = await ethers.getContractAt(VAULT_ABI, fund.vault);
        const twin = await ethers.getContractAt(VAULT_ABI, fund.usdtVault);
        expect(await twin.share(), fund.name).to.equal(fund.share);
        expect(await twin.baseManager(), fund.name).to.equal(CENTRIFUGE_BASE_MANAGER);
        expect(await vault.pricePerShare(), fund.name).to.equal(await twin.pricePerShare());
        expect(await vault.priceLastUpdated(), fund.name).to.equal(await twin.priceLastUpdated());
      }
    });

    it("the source is not a member of either share class", async () => {
      // Both share classes run a `FullRestrictions` hook, which only lets a member hold the share.
      // Membership is Centrifuge's to grant, not this proposal's.
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDC);
        expect(isMember, fund.name).to.equal(false);
        expect(await hook.wards(CENTRIFUGE_SPOKE), fund.name).to.equal(1);
      }
    });

    it("the Hub is live and carries the three existing groups", async () => {
      expect(await hub.asset()).to.equal(USDC);
      expect(await hub.accessControlManager()).to.equal(ACM);
      expect(await hub.hubPaused()).to.equal(false);
      expect(await hub.registeredYieldGroups()).to.deep.equal(EXISTING_GROUPS);
      expect((await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDC)).registered).to.equal(false);
    });

    it("the source is a beacon proxy over the Centrifuge beacon, bound to the Hub, and empty", async () => {
      const beaconSlot = await ethers.provider.getStorageAt(CENTRIFUGE_SOURCE_USDC, EIP1967_BEACON_SLOT);
      expect(ethers.utils.getAddress("0x" + beaconSlot.slice(26))).to.equal(CENTRIFUGE_BEACON);
      expect(await source.hub()).to.equal(HUB_USDC);
      expect(await source.asset()).to.equal(USDC);
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

    it("the adapter accepts both USDC vaults", async () => {
      for (const fund of FUNDS) {
        await adapter.validateRegistration(fund.vault);
        expect(await adapter.asset(fund.vault), fund.name).to.equal(USDC);
        expect(await adapter.pricePerShare(fund.vault), fund.name).to.be.gt(0);
        expect(await adapter.receiptBalance(fund.vault, CENTRIFUGE_SOURCE_USDC), fund.name).to.equal(0);
      }
    });

    it("nobody holds a role on the source", async () => {
      for (const holder of [NORMAL_TIMELOCK, OPERATOR, KEEPER, GUARDIAN, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDC, sig), holder), `${holder} ${sig}`).to.equal(false);
        }
      }
    });

    it("no grantee already holds a wildcard on any of the source's signatures", async () => {
      for (const holder of [NORMAL_TIMELOCK, OPERATOR, KEEPER, GUARDIAN, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK]) {
        for (const sig of CENTRIFUGE_GOVERNANCE) {
          const wildcard = ethers.utils.solidityKeccak256(["bytes32", "string"], [ethers.constants.HashZero, sig]);
          expect(await acm.hasRole(wildcard, holder), `wildcard ${holder} ${sig}`).to.equal(false);
          const shortWildcard = ethers.utils.solidityKeccak256(
            ["address", "string"],
            [ethers.constants.AddressZero, sig],
          );
          expect(await acm.hasRole(shortWildcard, holder), `20-byte wildcard ${holder} ${sig}`).to.equal(false);
        }
      }
    });

    it("the operator and the guardian already hold the emergency pair on the live USDC sources", async () => {
      // Why the batch grants nothing on the Core, Flux and FRV sources.
      for (const group of EXISTING_GROUPS) {
        for (const sig of EMERGENCY) {
          for (const holder of [NORMAL_TIMELOCK, OPERATOR, GUARDIAN]) {
            expect(await acm.hasRole(roleOf(group, sig), holder), `${holder} ${group} ${sig}`).to.equal(true);
          }
        }
      }
    });

    it("the aggregator slot holds exactly these grants", async () => {
      expect(permissions.length, "the description's grant count").to.equal(48);
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
      // Nothing past the last one: the slot is these grants and no more.
      await expect(aggregator.grantPermissions(ACM_AGGREGATOR_INDEX, permissions.length)).to.be.reverted;

      for (const p of permissions) {
        const where = `${p.contractAddress} ${p.functionSig} -> ${p.account}`;
        expect(await acm.hasRole(roleOf(p.contractAddress, p.functionSig), p.account), where).to.equal(false);
      }
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.equal(false);
    });
  });

  // Explicit proposer and supporters known to satisfy the governance thresholds.
  testVip("VIP-997 [BNB Chain] Liquidity Hub (USDC) — onboard the Centrifuge YieldGroup", await vip997(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: ["0x5176671de05380379399b669ed276feec99d59cb"],
    callbackAfterExecution: async txResponse => {
      // Every replayed grant, plus DEFAULT_ADMIN_ROLE lent to the aggregator and handed back.
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted", "RoleRevoked"], [permissions.length + 1, 1]);
      await expectEvents(
        txResponse,
        [SOURCE_ABI],
        ["ResourceAdded", "NavGuardConfigured", "SpotAPYBpsSet", "InnerDepositQueueSet", "InnerWithdrawQueueSet"],
        [FUNDS.length, FUNDS.length, FUNDS.length, 0, 1],
      );
      await expectEvents(
        txResponse,
        [HUB_ABI],
        ["YieldGroupAdded", "OuterWithdrawQueueSet", "OuterDepositQueueSet"],
        [1, 1, 0],
      );
    },
  });

  describe("Post-VIP: configuration", () => {
    it("both USDC vaults are registered and unpaused", async () => {
      expect(await source.resources()).to.deep.equal(CENTRIFUGE_RESOURCES);
      for (const fund of FUNDS) {
        const cfg = await source.resourceConfig(fund.vault);
        expect(cfg.registered, fund.name).to.equal(true);
        expect(cfg.paused, fund.name).to.equal(false);
        expect(cfg.adapter, fund.name).to.equal(ADAPTER_CENTRIFUGE);
      }
    });

    it("the inner withdraw queue is both funds, JTRSY first, and the deposit side is unset", async () => {
      expect(await source.innerWithdrawQueue()).to.deep.equal([JTRSY_VAULT, JAAA_VAULT]);
      expect(await source.innerWithdrawQueue()).to.deep.equal(await source.resources());
      expect(await source.innerDepositQueue()).to.deep.equal([]);
      expect(await source.maxWithdraw()).to.equal(0);
    });

    it("the group is registered at the intended caps", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDC);
      expect(cfg.registered).to.equal(true);
      expect(cfg.paused).to.equal(false);
      expect(cfg.absoluteCap).to.equal(CENTRIFUGE_ABSOLUTE_CAP);
      expect(cfg.percentageCapBps).to.equal(CENTRIFUGE_PERCENTAGE_CAP_BPS);
      expect(await hub.registeredYieldGroups()).to.deep.equal([...EXISTING_GROUPS, CENTRIFUGE_SOURCE_USDC]);
    });

    it("Centrifuge is appended last to the withdraw queue and the deposit queue is untouched", async () => {
      expect(await hub.outerWithdrawQueue()).to.deep.equal(OUTER_WITHDRAW_QUEUE);
      expect(OUTER_WITHDRAW_QUEUE.slice(0, -1)).to.deep.equal(withdrawQueueBefore);
      expect(await hub.outerDepositQueue()).to.deep.equal(depositQueueBefore);
      expect(await hub.outerDepositQueue()).to.not.include(CENTRIFUGE_SOURCE_USDC);
    });

    it("no capital moved, and the Hub's total still sums its groups", async () => {
      expect(await source.totalAssets()).to.equal(0);
      expect(await usdc.balanceOf(CENTRIFUGE_SOURCE_USDC)).to.equal(0);
      let sum = BigNumber.from(0);
      for (const group of await hub.registeredYieldGroups()) {
        sum = sum.add(await (await ethers.getContractAt(SOURCE_ABI, group)).totalAssets());
      }
      expect(await hub.totalAssets()).to.equal(sum.add(await usdc.balanceOf(HUB_USDC)));
      expect(await hub.totalAssets()).to.be.gte(hubTotalBefore);
      expect(await hub.totalAssets()).to.be.closeTo(hubTotalBefore, hubTotalBefore.div(1000));
    });

    it("the NAV band is configured on each fund with both sides armed, anchored at zero", async () => {
      for (const fund of FUNDS) {
        const band = await source.navGuard(fund.vault);
        expect(band.driftBps, fund.name).to.equal(fund.band.driftBps);
        expect(band.upGapBps, fund.name).to.equal(fund.band.upGapBps);
        expect(band.downGapBps, fund.name).to.equal(fund.band.downGapBps);
        expect(band.interval, fund.name).to.equal(NAV_GUARD_INTERVAL);
        expect(band.capEnabled, fund.name).to.equal(true);
        expect(band.floorEnabled, fund.name).to.equal(true);
        expect(band.anchor, fund.name).to.equal(0);
        expect(band.centre, fund.name).to.equal(0);
      }
    });

    it("each fund publishes the same rate as on the USDT Hub", async () => {
      for (const fund of FUNDS) {
        const published = SPOT_APY_BPS.find(a => a.resource === fund.vault);
        expect(await source.resourceSpotAPYBps(fund.vault), fund.name).to.equal(published?.apyBps);
      }
      expect(await source.spotAPYBps()).to.equal(0);
    });
  });

  describe("Post-VIP: permissions", () => {
    it("every grant this VIP makes has landed and the borrowed ACM admin is gone", async () => {
      for (const p of permissions) {
        const where = `${p.contractAddress} ${p.functionSig} -> ${p.account}`;
        expect(await acm.hasRole(roleOf(p.contractAddress, p.functionSig), p.account), where).to.equal(true);
      }
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.equal(false);
    });

    it("each account holds exactly its surface", async () => {
      for (const sig of CENTRIFUGE_GOVERNANCE) {
        const held = async (holder: string) => acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDC, sig), holder);
        expect(await held(NORMAL_TIMELOCK), `timelock ${sig}`).to.equal(true);
        expect(await held(OPERATOR), `operator ${sig}`).to.equal(CENTRIFUGE_OPERATOR.includes(sig));
        expect(await held(KEEPER), `keeper ${sig}`).to.equal(CENTRIFUGE_CLAIMS.includes(sig));
        expect(await held(GUARDIAN), `guardian ${sig}`).to.equal(CENTRIFUGE_GUARDIAN.includes(sig));
        expect(await held(FAST_TRACK_TIMELOCK), `fast-track ${sig}`).to.equal(false);
        expect(await held(CRITICAL_TIMELOCK), `critical ${sig}`).to.equal(false);
      }
    });

    it("only the normal timelock holds sweep, and the keeper holds nothing that moves value out", async () => {
      for (const holder of [OPERATOR, KEEPER, GUARDIAN]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDC, "sweep(address,address)"), holder)).to.equal(false);
      }
      for (const sig of ["removeResource(address)", "requestRedeem(address,uint256)", ...CENTRIFUGE_NAV_GUARD]) {
        expect(await acm.hasRole(roleOf(CENTRIFUGE_SOURCE_USDC, sig), KEEPER), sig).to.equal(false);
      }
    });

    it("the keeper cannot pause a fund; the guardian can pause and lift it", async () => {
      const keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      await expect(source.connect(keeper).pauseResource(JAAA_VAULT)).to.be.revertedWithCustomError(
        source,
        "Unauthorized",
      );
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      await source.connect(guardian).pauseResource(JAAA_VAULT);
      expect((await source.resourceConfig(JAAA_VAULT)).paused).to.equal(true);
      await source.connect(guardian).unpauseResource(JAAA_VAULT);
      expect((await source.resourceConfig(JAAA_VAULT)).paused).to.equal(false);
    });
  });

  describe("Post-VIP: rebalancing USDC through Centrifuge", () => {
    let operator: SignerWithAddress;
    let keeper: SignerWithAddress;
    let spoke: SignerWithAddress;
    let manager: Contract;
    let core: Contract;
    let sharePriceBefore: BigNumber;
    const sharesOf: Record<string, BigNumber> = {};

    const leg = (yieldGroup: string, resource: string, amount: BigNumber) => ({ yieldGroup, resource, amount });

    // What the Hub's shares are worth, in USDC per whole share.
    const hubSharePrice = async () => hub.convertToAssets(ethers.utils.parseUnits("1", await hub.decimals()));

    // Centrifuge's settlement messages, as its Spoke relays them into the request manager. Each starts
    // with its `RequestCallbackType`; an investor is the address left-aligned in a bytes32.
    const investor = CENTRIFUGE_SOURCE_USDC.toLowerCase() + "0".repeat(24);
    const settle = async (fund: (typeof FUNDS)[number], types: string[], values: unknown[]) => {
      const assetId = await (await ethers.getContractAt(SPOKE_ABI, CENTRIFUGE_SPOKE)).assetToId(USDC, 0);
      await manager
        .connect(spoke)
        .callback(fund.poolId, fund.scId, assetId, ethers.utils.solidityPack(["uint8", ...types], values));
    };

    before(async () => {
      operator = await initMainnetUser(OPERATOR, ethers.utils.parseEther("1"));
      keeper = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      spoke = await initMainnetUser(CENTRIFUGE_SPOKE, ethers.utils.parseEther("1"));
      manager = await ethers.getContractAt(MANAGER_ABI, CENTRIFUGE_BASE_MANAGER);
      core = await ethers.getContractAt(SOURCE_ABI, CORE_SOURCE_USDC);

      // Centrifuge onboards the Venus source to both share classes — its action, not the proposal's.
      for (const fund of FUNDS) {
        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        const hook = await ethers.getContractAt(HOOK_ABI, await share.hook());
        // type(uint64).max: a membership that never lapses.
        await hook.connect(spoke).updateMember(fund.share, CENTRIFUGE_SOURCE_USDC, "18446744073709551615");
        const [isMember] = await hook.isMember(fund.share, CENTRIFUGE_SOURCE_USDC);
        expect(isMember, fund.name).to.equal(true);
      }
    });

    it("a reallocation moves USDC from Core into both funds without moving the Hub's NAV", async () => {
      // Settle Core's interest first, so the comparison below sees the reallocation alone.
      await hub.accrueFees();
      const hubTotal = await hub.totalAssets();
      sharePriceBefore = await hubSharePrice();
      const coreBefore = await core.totalAssets();
      const escrowsBefore = await Promise.all(FUNDS.map(fund => usdc.balanceOf(fund.escrow)));

      await hub
        .connect(operator)
        .reallocate(
          [leg(CORE_SOURCE_USDC, CORE_VUSDC, TRANCHE.mul(2))],
          [leg(CENTRIFUGE_SOURCE_USDC, JTRSY_VAULT, TRANCHE), leg(CENTRIFUGE_SOURCE_USDC, JAAA_VAULT, TRANCHE)],
        );

      // The USDC reached Centrifuge's pool escrows, and each fund books a pending subscription.
      for (const [i, fund] of FUNDS.entries()) {
        expect((await usdc.balanceOf(fund.escrow)).sub(escrowsBefore[i]), fund.name).to.equal(TRANCHE);
        const state = await manager.investments(fund.vault, CENTRIFUGE_SOURCE_USDC);
        expect(state.pendingDepositRequest, fund.name).to.equal(TRANCHE);
        expect(state.maxMint, fund.name).to.equal(0);
      }
      // Pending requests are valued at face, and none of it is liquid.
      expect(await source.totalAssets()).to.equal(TRANCHE.mul(2));
      expect(await source.maxWithdraw()).to.equal(0);
      expect(await usdc.balanceOf(CENTRIFUGE_SOURCE_USDC)).to.equal(0);

      // Capital moved rather than appeared: Core is down by the two tranches, give or take a block
      // of interest, and the Hub's total and share price are unchanged to within that.
      expect(coreBefore.sub(await core.totalAssets())).to.be.closeTo(TRANCHE.mul(2), TRANCHE.div(1_000_000));
      expect(await hub.totalAssets()).to.be.closeTo(hubTotal, hubTotal.div(1_000_000));
      expect(await hubSharePrice()).to.be.closeTo(sharePriceBefore, sharePriceBefore.div(1_000_000));
    });

    it("the group cap still binds a further allocation", async () => {
      const cfg = await hub.yieldGroupConfig(CENTRIFUGE_SOURCE_USDC);
      const cap = (await hub.totalAssets()).mul(cfg.percentageCapBps).div(10_000);
      expect(cap).to.be.lt(cfg.absoluteCap);
      const room = cap.sub(await source.totalAssets());
      const tooMuch = room.add(ethers.utils.parseUnits("1", 18));
      await expect(
        hub
          .connect(operator)
          .reallocate(
            [leg(CORE_SOURCE_USDC, CORE_VUSDC, tooMuch)],
            [leg(CENTRIFUGE_SOURCE_USDC, JTRSY_VAULT, tooMuch)],
          ),
      ).to.be.revertedWithCustomError(hub, "HubCapacityExceeded");
    });

    it("Centrifuge settles both subscriptions at NAV and the keeper claims the shares", async () => {
      for (const fund of FUNDS) {
        const price = await adapter.pricePerShare(fund.vault);
        // At NAV and with no ramp fee, the tranche buys exactly TRANCHE / price shares, rounded down.
        const shares = TRANCHE.mul(ONE_SHARE).div(price);
        sharesOf[fund.name] = shares;

        await settle(fund, ["uint128", "uint128"], [1, TRANCHE, ethers.utils.parseUnits("1", 18)]); // ApprovedDeposits
        await settle(fund, ["uint128", "uint128"], [2, shares, price]); // IssuedShares
        await settle(fund, ["bytes32", "uint128", "uint128", "uint128"], [4, investor, TRANCHE, shares, 0]); // FulfilledDepositRequest

        const settled = await manager.investments(fund.vault, CENTRIFUGE_SOURCE_USDC);
        expect(settled.pendingDepositRequest, fund.name).to.equal(0);
        expect(settled.maxMint, fund.name).to.equal(shares);

        await expect(source.connect(keeper).claimDeposit(fund.vault))
          .to.emit(source, "DepositClaimed")
          .withArgs(fund.vault, shares);

        const share = await ethers.getContractAt(SHARE_ABI, fund.share);
        expect(await share.balanceOf(CENTRIFUGE_SOURCE_USDC), fund.name).to.equal(shares);
        expect((await manager.investments(fund.vault, CENTRIFUGE_SOURCE_USDC)).maxMint, fund.name).to.equal(0);
      }
    });

    it("each position is valued at shares x NAV, within one share-unit of what was paid", async () => {
      for (const fund of FUNDS) {
        const price = await adapter.pricePerShare(fund.vault);
        const nav = sharesOf[fund.name].mul(price).div(ONE_SHARE);
        expect(await adapter.totalAssets(fund.vault, CENTRIFUGE_SOURCE_USDC), fund.name).to.equal(nav);
        // Rounding the share count down is the only loss: less than the value of one share-unit.
        expect(nav, fund.name).to.be.lte(TRANCHE);
        expect(TRANCHE.sub(nav), fund.name).to.be.lt(price.div(ONE_SHARE));
      }
    });

    it("until the band's first re-anchor, the Hub is told what was paid", async () => {
      // Armed on an empty position, the band's anchor is zero and its centre is what was routed in, so
      // it is zero-width: the reading, a hair under cost, is clamped up to the drifted cost basis.
      for (const fund of FUNDS) {
        const status = await source.navGuardStatus(fund.vault);
        expect(status.minAllowedValue, fund.name).to.equal(status.maxAllowedValue);
        expect(status.clampedValue, fund.name).to.be.gte(TRANCHE);
        expect(status.clampedValue, fund.name).to.be.lt(TRANCHE.mul(10_001).div(10_000));
      }
    });

    it("one interval later the band re-anchors, and the Hub reports the funds' own NAV", async () => {
      await ethers.provider.send("evm_increaseTime", [NAV_GUARD_INTERVAL + 1]);
      await ethers.provider.send("evm_mine", []);
      await hub.accrueFees();

      let expected = BigNumber.from(0);
      for (const fund of FUNDS) {
        const band = await source.navGuard(fund.vault);
        const status = await source.navGuardStatus(fund.vault);
        expect(status.maxAllowedValue, fund.name).to.equal(
          band.anchor.add(band.anchor.mul(fund.band.upGapBps).div(10_000)),
        );
        expect(status.minAllowedValue, fund.name).to.equal(
          band.anchor.sub(band.anchor.mul(fund.band.downGapBps).div(10_000)),
        );
        expect(status.isClamped, fund.name).to.equal(false);
        expected = expected.add(sharesOf[fund.name].mul(await adapter.pricePerShare(fund.vault)).div(ONE_SHARE));
      }
      expect(await source.totalAssets()).to.equal(expected);

      let sum = BigNumber.from(0);
      for (const group of await hub.registeredYieldGroups()) {
        sum = sum.add(await (await ethers.getContractAt(SOURCE_ABI, group)).totalAssets());
      }
      expect(await hub.totalAssets()).to.equal(sum.add(await usdc.balanceOf(HUB_USDC)));
      // A day of Core interest, and nothing lost to the Centrifuge leg beyond share rounding.
      expect(await hubSharePrice()).to.be.gte(sharePriceBefore);
      // The group now reports a blended rate between its two funds' published rates.
      const spot = await source.spotAPYBps();
      expect(spot).to.be.gt(SPOT_APY_BPS[0].apyBps);
      expect(spot).to.be.lt(SPOT_APY_BPS[1].apyBps);
    });

    it("the Hub's NAV follows a new fund price, and a mispriced NAV is held to the band", async () => {
      const root = await initMainnetUser(CENTRIFUGE_ROOT, ethers.utils.parseEther("1"));
      const centrifugeSpoke = await ethers.getContractAt(SPOKE_ABI, CENTRIFUGE_SPOKE);
      const publish = async (price: BigNumber) => {
        const now = (await ethers.provider.getBlock("latest")).timestamp;
        await centrifugeSpoke.connect(root).updatePricePoolPerShare(JAAA.poolId, JAAA.scId, price, now);
        expect(await adapter.pricePerShare(JAAA_VAULT)).to.equal(price);
      };
      const price = await adapter.pricePerShare(JAAA_VAULT);
      const jtrsyValue = sharesOf.JTRSY.mul(await adapter.pricePerShare(JTRSY_VAULT)).div(ONE_SHARE);

      // A 0.1% NAV move, inside the band, reaches the Hub exactly: shares x the new price.
      const up = price.mul(10_010).div(10_000);
      await publish(up);
      const jaaaValue = sharesOf.JAAA.mul(up).div(ONE_SHARE);
      expect((await source.navGuardStatus(JAAA_VAULT)).isClamped).to.equal(false);
      expect(await source.totalAssets()).to.equal(jtrsyValue.add(jaaaValue));

      // A 10% jump is past the 2% cap: the Hub is told the top of the band, not Centrifuge's number.
      await publish(price.mul(11_000).div(10_000));
      const status = await source.navGuardStatus(JAAA_VAULT);
      expect(status.isClamped).to.equal(true);
      expect(status.clampedValue).to.equal(status.maxAllowedValue);
      expect(await source.totalAssets()).to.equal(jtrsyValue.add(status.maxAllowedValue));

      await publish(up);
      expect(await source.totalAssets()).to.equal(jtrsyValue.add(jaaaValue));
    });

    it("a settled redemption rebalances JTRSY back into Core", async () => {
      const shares = sharesOf.JTRSY;
      const price = await adapter.pricePerShare(JTRSY_VAULT);
      const assets = shares.mul(price).div(ONE_SHARE);

      await expect(source.connect(operator).requestRedeem(JTRSY_VAULT, shares))
        .to.emit(source, "RedeemRequested")
        .withArgs(JTRSY_VAULT, shares);
      expect((await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDC)).pendingRedeemRequest).to.equal(shares);
      // A pending redemption is still valued at NAV, and still not liquid.
      expect(await adapter.totalAssets(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDC)).to.equal(assets);
      expect(await source.maxWithdraw()).to.equal(0);

      await settle(JTRSY, ["uint128", "uint128", "uint128"], [3, assets, shares, price]); // RevokedShares
      await settle(JTRSY, ["bytes32", "uint128", "uint128", "uint128"], [5, investor, assets, shares, 0]); // FulfilledRedeemRequest
      expect((await manager.investments(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDC)).maxWithdraw).to.equal(assets);
      expect(await source.maxWithdraw()).to.equal(assets);

      const coreBefore = await core.totalAssets();
      const hubTotal = await hub.totalAssets();
      await hub
        .connect(operator)
        .reallocate([leg(CENTRIFUGE_SOURCE_USDC, JTRSY_VAULT, assets)], [leg(CORE_SOURCE_USDC, CORE_VUSDC, assets)]);

      // JTRSY is empty on every bucket, and the band was told, so it reports nothing rather than a
      // floor over a position that has gone.
      expect(await adapter.receiptBalance(JTRSY_VAULT, CENTRIFUGE_SOURCE_USDC)).to.equal(0);
      expect(await (await ethers.getContractAt(SHARE_ABI, JTRSY_SHARE)).balanceOf(CENTRIFUGE_SOURCE_USDC)).to.equal(0);
      expect((await source.navGuardStatus(JTRSY_VAULT)).clampedValue).to.equal(0);
      expect(await usdc.balanceOf(CENTRIFUGE_SOURCE_USDC)).to.equal(0);

      // The USDC landed back in Core, and a round trip through JTRSY at NAV cost only share rounding.
      expect((await core.totalAssets()).sub(coreBefore)).to.be.closeTo(assets, TRANCHE.div(1_000_000));
      expect(TRANCHE.sub(assets)).to.be.lt(price.div(ONE_SHARE));
      expect(await hub.totalAssets()).to.be.closeTo(hubTotal, hubTotal.div(1_000_000));
      expect(await hubSharePrice()).to.be.gte(sharePriceBefore);
    });
  });
});
