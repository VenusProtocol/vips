import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

// Prefer vip-620/bscmainnet-part-1 for anything it exports; fall back to the
// frozen vip-618 only for what vip-620 does not re-export (legacy converters
// and the 9 swap routers).
import {
  BTCB_PRIME_CONVERTER,
  ETH_PRIME_CONVERTER,
  ONEINCH_ROUTER,
  PANCAKE_ROUTER,
  PANCAKE_SMART_ROUTER,
  PANCAKE_UNIVERSAL_ROUTER,
  PANCAKE_V3_ROUTER,
  RISK_FUND_CONVERTER,
  UNIV2_SWAP_ROUTER_02,
  UNIV3_SWAP_ROUTER_02,
  UNIV4_SWAP_ROUTER,
  UNI_UNIVERSAL_ROUTER,
  USDC_PRIME_CONVERTER,
  USDT_PRIME_CONVERTER,
  XVS_VAULT_CONVERTER,
} from "../../vips/vip-618/bscmainnet";
import vip620, {
  BUYBACKS,
  CORE_TOKENS,
  MIGRATION_HELPER_V2,
  RISK_FUND_BUYBACK,
  TIMELOCK_OWNED_CONVERTERS,
  U_PRIME_BUYBACK,
  XVS_BUYBACK,
} from "../../vips/vip-620/bscmainnet-part-1";
import vip621 from "../../vips/vip-620/bscmainnet-part-2";
import ACM_ABI from "../vip-618/abi/AccessControlManager.json";
import ERC20_ABI from "../vip-618/abi/ERC20.json";
import TOKEN_BUYBACK_MIGRATION_HELPER_ABI from "./abi/TokenBuybackMigrationHelper.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// Match part-1 sim's FORK_BLOCK. Must be past the latest helper redeploy
// (block 98038965, commit 746fe99) and the PR #162 buyback redeploys
// (97999686 – 98000650).
const FORK_BLOCK = 98045598;

const BUYBACK_ROUTERS_ABI = ["function allowedRouters(address) view returns (bool)"];
const OWNABLE_MIN_ABI = ["function owner() view returns (address)", "function pendingOwner() view returns (address)"];
const DEFAULT_ADMIN_ROLE = ethers.constants.HashZero;

const ALL_ROUTERS = [
  PANCAKE_ROUTER,
  PANCAKE_V3_ROUTER,
  PANCAKE_SMART_ROUTER,
  PANCAKE_UNIVERSAL_ROUTER,
  ONEINCH_ROUTER,
  UNIV2_SWAP_ROUTER_02,
  UNIV3_SWAP_ROUTER_02,
  UNIV4_SWAP_ROUTER,
  UNI_UNIVERSAL_ROUTER,
];

const DRAIN_BY_CONVERTER: { converter: string; recipient: string }[] = [
  { converter: RISK_FUND_CONVERTER, recipient: RISK_FUND_BUYBACK },
  { converter: USDT_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: USDC_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: BTCB_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: ETH_PRIME_CONVERTER, recipient: U_PRIME_BUYBACK },
  { converter: XVS_VAULT_CONVERTER, recipient: XVS_BUYBACK },
];

forking(FORK_BLOCK, async () => {
  const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACM_ABI, ethers.provider);
  const helper = new ethers.Contract(MIGRATION_HELPER_V2, TOKEN_BUYBACK_MIGRATION_HELPER_ABI, ethers.provider);

  const erc20 = (token: string) => new ethers.Contract(token, ERC20_ABI, ethers.provider);
  const ownable = (a: string) => new ethers.Contract(a, OWNABLE_MIN_ABI, ethers.provider);
  const buybackRouters = (b: string) => new ethers.Contract(b, BUYBACK_ROUTERS_ABI, ethers.provider);

  // Per-(token, recipient) snapshot taken AFTER part-1 executes (which leaves
  // converter balances untouched) so that the post-part-2 delta isolates the
  // drain.
  const recipientBalanceAfterPart1 = new Map<string, BigNumber>();
  const converterBalanceAfterPart1 = new Map<string, BigNumber>();

  before(async () => {
    // Production pre-condition (enforced — no fork-only impersonation patch):
    // every buyback proxy's pendingOwner must already point at
    // MIGRATION_HELPER_V2. Mirrored here because part-1 (run below via testVip)
    // re-enters helper.execute1() which calls acceptOwnership() on every buyback.
    for (const b of BUYBACKS) {
      const buybackOwnable = new ethers.Contract(b, OWNABLE_MIN_ABI, ethers.provider);
      const pending: string = await buybackOwnable.pendingOwner();
      if (pending.toLowerCase() !== MIGRATION_HELPER_V2.toLowerCase()) {
        throw new Error(
          `pre-condition unmet: buyback ${b} pendingOwner=${pending}, expected ${MIGRATION_HELPER_V2}. ` +
            `The buyback deploy script (protocol-reserve PR #162) must call ` +
            `transferOwnership(${MIGRATION_HELPER_V2}) on every proxy before VIP-620 is queued.`,
        );
      }
    }
  });

  // Apply part-1 via the full governance flow so part-2 runs against the same
  // post-part-1 state that mainnet will see. testVip(part1) state persists into
  // testVip(part2) because each testVip uses its own loadFixture function — the
  // part-2 fixture's first snapshot is taken AFTER part-1 has executed.
  // Capture post-part-1 balances in callbackAfterExecution so the post-part-2
  // delta isolates the drain.
  testVip("VIP-620 (setup for part-2 sim)", await vip620(), {
    callbackAfterExecution: async () => {
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          const recipientKey = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
          if (!recipientBalanceAfterPart1.has(recipientKey)) {
            recipientBalanceAfterPart1.set(recipientKey, await erc20(t).balanceOf(d.recipient));
          }
          const converterKey = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
          converterBalanceAfterPart1.set(converterKey, await erc20(t).balanceOf(d.converter));
        }
      }
    },
  });

  describe("Pre-VIP state (part 2, after part-1 has executed)", () => {
    it("helper.executed1 and helper.executedSwap are true; executed2 is false", async () => {
      expect(await helper.executed1()).to.be.true;
      expect(await helper.executedSwap()).to.be.true;
      expect(await helper.executed2()).to.be.false;
    });

    it("helper still owns every buyback and every timelock-owned converter", async () => {
      for (const a of [...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS]) {
        expect((await ownable(a).owner()).toLowerCase(), a).to.equal(MIGRATION_HELPER_V2.toLowerCase());
      }
    });

    it("no router is allowlisted on any buyback yet (allowlist deferred to execute2)", async () => {
      for (const b of BUYBACKS) {
        for (const r of ALL_ROUTERS) {
          expect(await buybackRouters(b).allowedRouters(r), `${b}/${r}`).to.be.false;
        }
      }
    });

    it("helper does NOT hold DEFAULT_ADMIN_ROLE on the ACM", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, MIGRATION_HELPER_V2)).to.be.false;
    });

    it("helper holds zero balance of every core-pool token and zero native BNB", async () => {
      // After part-1's executeSwap, any leftover USDC has been forwarded back
      // to NormalTimelock — helper should be empty heading into part-2's drain.
      for (const t of CORE_TOKENS) {
        expect(await erc20(t).balanceOf(MIGRATION_HELPER_V2), t).to.equal(0);
      }
      expect(await ethers.provider.getBalance(MIGRATION_HELPER_V2), "native BNB").to.equal(0);
    });
  });

  testVip("VIP-621 — router allowlist, drain, and hand back ownership", await vip621());

  describe("Post-VIP state (part 2)", () => {
    it("helper.executed2 is true; second execute2() reverts", async () => {
      expect(await helper.executed2()).to.be.true;
      const helperWithExecute2 = new ethers.Contract(MIGRATION_HELPER_V2, ["function execute2()"], ethers.provider);
      const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(helperWithExecute2.connect(timelockSigner).execute2()).to.be.reverted;
    });

    it("all three helper entrypoints revert on re-entry (AlreadyExecuted)", async () => {
      const helperAllEntrypoints = new ethers.Contract(
        MIGRATION_HELPER_V2,
        ["function execute1()", "function executeSwap()"],
        ethers.provider,
      );
      const timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(helperAllEntrypoints.connect(timelockSigner).execute1(), "execute1").to.be.reverted;
      await expect(helperAllEntrypoints.connect(timelockSigner).executeSwap(), "executeSwap").to.be.reverted;
    });

    it("every router is allowlisted on every buyback", async () => {
      for (const b of BUYBACKS) {
        for (const r of ALL_ROUTERS) {
          expect(await buybackRouters(b).allowedRouters(r), `${b}/${r}`).to.be.true;
        }
      }
    });

    it("each timelock-owned converter has zero residual balance for every core-pool token", async () => {
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          expect(await erc20(t).balanceOf(d.converter), `${d.converter}/${t}`).to.equal(0);
        }
      }
    });

    it("recipient buybacks received the drained balances (delta >= pre-part-2 converter balance)", async () => {
      // Aggregate expected inflow per (token, recipient) by summing every
      // converter that maps to the same recipient (four PrimeConverters all
      // flow to U_PRIME_BUYBACK).
      const expectedInflow = new Map<string, BigNumber>();
      for (const d of DRAIN_BY_CONVERTER) {
        for (const t of CORE_TOKENS) {
          const k = `${t.toLowerCase()}:${d.recipient.toLowerCase()}`;
          const converterKey = `${d.converter.toLowerCase()}:${t.toLowerCase()}`;
          const fromConverter = converterBalanceAfterPart1.get(converterKey) ?? BigNumber.from(0);
          expectedInflow.set(k, (expectedInflow.get(k) ?? BigNumber.from(0)).add(fromConverter));
        }
      }

      for (const [k, expected] of expectedInflow.entries()) {
        const [token, recipient] = k.split(":");
        const before = recipientBalanceAfterPart1.get(k) ?? BigNumber.from(0);
        const after = await erc20(token).balanceOf(recipient);
        expect(after.sub(before), k).to.be.gte(expected);
      }
    });

    it("NormalTimelock owns each buyback and each timelock-owned converter", async () => {
      for (const a of [...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS]) {
        expect((await ownable(a).owner()).toLowerCase()).to.equal(bscmainnet.NORMAL_TIMELOCK.toLowerCase());
      }
    });

    it("helper is neither owner nor pendingOwner of any of the 16 migrated contracts", async () => {
      for (const t of [...BUYBACKS, ...TIMELOCK_OWNED_CONVERTERS]) {
        expect((await ownable(t).owner()).toLowerCase(), `${t} owner`).to.not.equal(MIGRATION_HELPER_V2.toLowerCase());
        expect((await ownable(t).pendingOwner()).toLowerCase(), `${t} pendingOwner`).to.not.equal(
          MIGRATION_HELPER_V2.toLowerCase(),
        );
      }
    });

    it("helper holds zero balance of every core-pool token", async () => {
      for (const t of CORE_TOKENS) {
        expect(await erc20(t).balanceOf(MIGRATION_HELPER_V2), t).to.equal(0);
      }
    });

    it("helper holds zero native BNB", async () => {
      expect(await ethers.provider.getBalance(MIGRATION_HELPER_V2)).to.equal(0);
    });
  });
});
