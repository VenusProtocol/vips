import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665 from "../../vips/vip-665/bscmainnet";
import { BNB_ACM, BNB_CRITICAL, BNB_GUARDIANS, BNB_ROWS, ZERO } from "../../vips/vip-665/data/bnb";
import { STALE_ROWS } from "../../vips/vip-665/data/staleness";
import { AGGREGATOR, grantPermissions, revokePermissions, roleChangeCounts } from "../../vips/vip-665/utils/commands";
import { seedAggregator } from "../../vips/vip-665/utils/seed";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;
// Recent BSC block where the ACMCommandsAggregator batch lengths match GRANT_INDEX / REVOKE_INDEX.
const FORK_BLOCK = 109924798;

// A long-listed core-pool market, used to exercise the swapped _setForcedLiquidation permission.
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

// One row bucket per action so every category (no-change / revoke / swap / grant / stale) is asserted
// explicitly. Each bucket is guarded to be non-empty so a data regression that empties a category fails
// loudly instead of passing vacuously.
const NO_CHANGE = BNB_ROWS.filter(r => r.action === "none");
const REVOKE = BNB_ROWS.filter(r => r.action === "revoke");
const SWAP = BNB_ROWS.filter(r => r.action === "swap");
const GRANT = BNB_ROWS.filter(r => r.action === "grant");
const STALE = BNB_ROWS.filter(r => r.action === "stale");

forking(FORK_BLOCK, async () => {
  const acm = () => new Contract(BNB_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
  const holds = (who: string, r: { target: string; signature: string }) =>
    acm().hasRole(role(r.target, r.signature), who);
  const guardianAddr = (r: { grantTo?: "guardian1" | "guardian2" | "guardian3" }) =>
    BNB_GUARDIANS[r.grantTo ?? "guardian1"];

  before(async () => {
    const signer = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await seedAggregator(
      signer,
      AGGREGATOR.bscmainnet,
      grantPermissions("bscmainnet"),
      revokePermissions("bscmainnet"),
    );
  });

  describe("VIP-665 pre-execution permissions (bscmainnet)", () => {
    it("the action plan covers every category (no-change / revoke / swap / grant / stale)", () => {
      expect(NO_CHANGE.length, "no-change rows").to.be.greaterThan(0);
      expect(REVOKE.length, "revoke rows").to.be.greaterThan(0);
      expect(SWAP.length, "swap rows").to.be.greaterThan(0);
      expect(GRANT.length, "grant rows").to.be.greaterThan(0);
      expect(STALE.length, "stale (BNB) rows").to.be.greaterThan(0);
      expect(STALE_ROWS.length, "stale (dangling cleanup) rows").to.be.greaterThan(0);
    });

    it("no-change: Critical holds each one and Guardian flags match the plan", async () => {
      for (const r of NO_CHANGE) {
        expect(await holds(BNB_CRITICAL, r), `pre critical ${r.signature}@${r.target}`).to.equal(r.critical);
        expect(await holds(BNB_GUARDIANS.guardian1, r), `pre g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `pre g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `pre g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("revoke: Critical currently holds every permission to be revoked", async () => {
      for (const r of REVOKE) {
        expect(await holds(BNB_CRITICAL, r), `pre critical ${r.signature}@${r.target}`).to.be.true;
        expect(await holds(BNB_GUARDIANS.guardian1, r), `pre g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `pre g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `pre g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("swap: Critical holds each one and the target Guardian does not yet", async () => {
      for (const r of SWAP) {
        expect(await holds(BNB_CRITICAL, r), `pre critical ${r.signature}@${r.target}`).to.be.true;
        expect(await holds(guardianAddr(r), r), `pre guardian ${r.signature}@${r.target}`).to.be.false;
      }
    });

    it("grant: Critical holds each one and the target Guardian does not yet", async () => {
      for (const r of GRANT) {
        expect(await holds(BNB_CRITICAL, r), `pre critical ${r.signature}@${r.target}`).to.be.true;
        expect(await holds(guardianAddr(r), r), `pre guardian ${r.signature}@${r.target}`).to.be.false;
      }
    });

    it("stale (BNB rows): Critical currently holds each dangling permission", async () => {
      for (const r of STALE) {
        expect(await holds(BNB_CRITICAL, r), `pre critical ${r.signature}@${r.target}`).to.be.true;
        expect(await holds(BNB_GUARDIANS.guardian1, r), `pre g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `pre g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `pre g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("stale (dangling cleanup): every listed grantee currently holds the dangling permission", async () => {
      for (const s of STALE_ROWS)
        for (const who of s.revokeFrom)
          expect(await holds(who, s), `pre stale ${s.signature}@${s.target} ${who}`).to.be.true;
    });
  });

  const counts = roleChangeCounts("bscmainnet");
  // The BNB ACM (legacy) emits only the OZ Role events, not PermissionGranted/Revoked. Each giveCallPermission
  // grants a role and each revokeCallPermission revokes one; the aggregator wrapper adds exactly one more of
  // each (grant/revoke of DEFAULT_ADMIN_ROLE to the aggregator). So counts = batch counts + 1.
  testVip("VIP-665 Reduce CriticalTimelock privileges — BNB Chain", await vip665(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [counts.granted + 1, counts.revoked + 1],
      );
      await expectEvents(
        txResponse,
        [ACM_COMMANDS_AGGREGATOR_ABI],
        ["GrantPermissionsExecuted", "RevokePermissionsExecuted"],
        [1, 1],
      );
    },
  });

  describe("VIP-665 post-execution permissions (bscmainnet)", () => {
    it("no-change: holders are untouched (Critical and every Guardian flag unchanged)", async () => {
      for (const r of NO_CHANGE) {
        expect(await holds(BNB_CRITICAL, r), `post critical ${r.signature}@${r.target}`).to.equal(r.critical);
        expect(await holds(BNB_GUARDIANS.guardian1, r), `post g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `post g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `post g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("revoke: Critical lost each one; Guardian flags unchanged", async () => {
      for (const r of REVOKE) {
        expect(await holds(BNB_CRITICAL, r), `post critical ${r.signature}@${r.target}`).to.be.false;
        expect(await holds(BNB_GUARDIANS.guardian1, r), `post g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `post g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `post g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("swap: Critical lost each one and the target Guardian gained it", async () => {
      for (const r of SWAP) {
        expect(await holds(BNB_CRITICAL, r), `post critical ${r.signature}@${r.target}`).to.be.false;
        expect(await holds(guardianAddr(r), r), `post guardian ${r.signature}@${r.target}`).to.be.true;
      }
    });

    it("grant: the target Guardian gained each one while Critical kept it", async () => {
      for (const r of GRANT) {
        expect(await holds(BNB_CRITICAL, r), `post critical ${r.signature}@${r.target}`).to.be.true;
        expect(await holds(guardianAddr(r), r), `post guardian ${r.signature}@${r.target}`).to.be.true;
      }
    });

    it("stale (BNB rows): Critical lost each dangling permission; Guardian flags unchanged", async () => {
      for (const r of STALE) {
        expect(await holds(BNB_CRITICAL, r), `post critical ${r.signature}@${r.target}`).to.be.false;
        expect(await holds(BNB_GUARDIANS.guardian1, r), `post g1 ${r.signature}@${r.target}`).to.equal(r.guardian1);
        expect(await holds(BNB_GUARDIANS.guardian2, r), `post g2 ${r.signature}@${r.target}`).to.equal(r.guardian2);
        expect(await holds(BNB_GUARDIANS.guardian3, r), `post g3 ${r.signature}@${r.target}`).to.equal(r.guardian3);
      }
    });

    it("stale (dangling cleanup): every listed grantee lost the dangling permission", async () => {
      for (const s of STALE_ROWS)
        for (const who of s.revokeFrom)
          expect(await holds(who, s), `post stale ${s.signature}@${s.target} ${who}`).to.be.false;
    });
  });

  describe("Post-VIP behavioral: swapped permissions follow the ACM authorization checks", () => {
    it("every swapped function is allowed for the target Guardian and denied for Critical", async () => {
      for (const r of SWAP.filter(x => x.target !== ZERO)) {
        expect(
          await acm().isAllowedToCall(BNB_CRITICAL, r.signature, { from: r.target }),
          `crit !allowed ${r.signature}`,
        ).to.be.false;
        expect(
          await acm().isAllowedToCall(guardianAddr(r), r.signature, { from: r.target }),
          `guardian allowed ${r.signature}`,
        ).to.be.true;
      }
    });

    it("Guardian 1 can call Unitroller._setForcedLiquidation; the CriticalTimelock can no longer", async () => {
      const guardianSigner = await initMainnetUser(BNB_GUARDIANS.guardian1, ethers.utils.parseEther("1"));
      const criticalSigner = await initMainnetUser(bscmainnet.CRITICAL_TIMELOCK, ethers.utils.parseEther("1"));
      const asGuardian = new Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, guardianSigner);
      const asCritical = new Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, criticalSigner);

      await expect(asGuardian._setForcedLiquidation(vUSDT, true)).to.not.be.reverted;
      await expect(asCritical._setForcedLiquidation(vUSDT, true)).to.be.reverted;
    });
  });
});
