import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665 from "../../vips/vip-665/bscmainnet";
import { BNB_ACM, BNB_CRITICAL, BNB_GUARDIANS, BNB_ROWS, ZERO } from "../../vips/vip-665/data/bnb";
import { EXPECTED_ROLE_EVENTS } from "../../vips/vip-665/data/remote";
import { STALE_ROWS } from "../../vips/vip-665/data/staleness";
import { AGGREGATOR, grantPermissions, revokePermissions } from "../../vips/vip-665/utils/commands";
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
const NO_CHANGE = BNB_ROWS.filter(row => row.action === "none");
const REVOKE = BNB_ROWS.filter(row => row.action === "revoke");
const SWAP = BNB_ROWS.filter(row => row.action === "swap");
const GRANT = BNB_ROWS.filter(row => row.action === "grant");
const STALE = BNB_ROWS.filter(row => row.action === "stale");

forking(FORK_BLOCK, async () => {
  const acm = () => new Contract(BNB_ACM, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
  const holds = (who: string, row: { target: string; signature: string }) =>
    acm().hasRole(role(row.target, row.signature), who);
  const guardianAddr = (row: { grantTo?: "guardian1" | "guardian2" | "guardian3" }) =>
    BNB_GUARDIANS[row.grantTo ?? "guardian1"];

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
    it("the action plan covers every category with the expected row counts", () => {
      expect(NO_CHANGE.length, "no-change rows").to.equal(185);
      expect(REVOKE.length, "revoke rows").to.equal(26);
      expect(SWAP.length, "swap rows").to.equal(4);
      expect(GRANT.length, "grant rows").to.equal(1);
      expect(STALE.length, "stale (BNB) rows").to.equal(1);
      expect(STALE_ROWS.length, "stale (dangling cleanup) rows").to.equal(8);
    });

    it("no-change: Critical holds each one and Guardian flags match the plan", async () => {
      for (const row of NO_CHANGE) {
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.equal(row.critical);
        expect(await holds(BNB_GUARDIANS.guardian1, row), `pre g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `pre g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `pre g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("revoke: Critical currently holds every permission to be revoked", async () => {
      for (const row of REVOKE) {
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.be.true;
        expect(await holds(BNB_GUARDIANS.guardian1, row), `pre g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `pre g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `pre g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("swap: Critical holds each one and the target Guardian does not yet", async () => {
      for (const row of SWAP) {
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.be.true;
        expect(await holds(guardianAddr(row), row), `pre guardian ${row.signature}@${row.target}`).to.be.false;
      }
    });

    it("grant: Critical holds each one and the target Guardian does not yet", async () => {
      for (const row of GRANT) {
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.be.true;
        expect(await holds(guardianAddr(row), row), `pre guardian ${row.signature}@${row.target}`).to.be.false;
      }
    });

    it("stale (BNB rows): Critical currently holds each dangling permission", async () => {
      for (const row of STALE) {
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.be.true;
        expect(await holds(BNB_GUARDIANS.guardian1, row), `pre g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `pre g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `pre g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("stale (dangling cleanup): every listed grantee currently holds the dangling permission", async () => {
      for (const staleRow of STALE_ROWS)
        for (const who of staleRow.revokeFrom)
          expect(await holds(who, staleRow), `pre stale ${staleRow.signature}@${staleRow.target} ${who}`).to.be.true;
    });
  });

  const events = EXPECTED_ROLE_EVENTS.bscmainnet;
  testVip("VIP-665 Reduce CriticalTimelock privileges — BNB Chain", await vip665(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [events.granted, events.revoked],
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
      for (const row of NO_CHANGE) {
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.equal(row.critical);
        expect(await holds(BNB_GUARDIANS.guardian1, row), `post g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `post g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `post g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("revoke: Critical lost each one; Guardian flags unchanged", async () => {
      for (const row of REVOKE) {
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.be.false;
        expect(await holds(BNB_GUARDIANS.guardian1, row), `post g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `post g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `post g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("swap: Critical lost each one and the target Guardian gained it", async () => {
      for (const row of SWAP) {
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.be.false;
        expect(await holds(guardianAddr(row), row), `post guardian ${row.signature}@${row.target}`).to.be.true;
      }
    });

    it("grant: the target Guardian gained each one while Critical kept it", async () => {
      for (const row of GRANT) {
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.be.true;
        expect(await holds(guardianAddr(row), row), `post guardian ${row.signature}@${row.target}`).to.be.true;
      }
    });

    it("stale (BNB rows): Critical lost each dangling permission; Guardian flags unchanged", async () => {
      for (const row of STALE) {
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.be.false;
        expect(await holds(BNB_GUARDIANS.guardian1, row), `post g1 ${row.signature}@${row.target}`).to.equal(
          row.guardian1,
        );
        expect(await holds(BNB_GUARDIANS.guardian2, row), `post g2 ${row.signature}@${row.target}`).to.equal(
          row.guardian2,
        );
        expect(await holds(BNB_GUARDIANS.guardian3, row), `post g3 ${row.signature}@${row.target}`).to.equal(
          row.guardian3,
        );
      }
    });

    it("stale (dangling cleanup): every listed grantee lost the dangling permission", async () => {
      for (const staleRow of STALE_ROWS)
        for (const who of staleRow.revokeFrom)
          expect(await holds(who, staleRow), `post stale ${staleRow.signature}@${staleRow.target} ${who}`).to.be.false;
    });
  });

  describe("Post-VIP behavioral: swapped permissions follow the ACM authorization checks", () => {
    it("every swapped function is allowed for the target Guardian and denied for Critical", async () => {
      for (const row of SWAP.filter(swapRow => swapRow.target !== ZERO)) {
        expect(
          await acm().isAllowedToCall(BNB_CRITICAL, row.signature, { from: row.target }),
          `crit !allowed ${row.signature}`,
        ).to.be.false;
        expect(
          await acm().isAllowedToCall(guardianAddr(row), row.signature, { from: row.target }),
          `guardian allowed ${row.signature}`,
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
