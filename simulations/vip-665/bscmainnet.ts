import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, { EXPECTED_ROLE_EVENTS } from "../../vips/vip-665/bscmainnet";
import { BNB_ACM, BNB_CRITICAL, BNB_GUARDIANS, ZERO } from "../../vips/vip-665/data/addresses";
import { CLEANUP_LEGACY_WILDCARD_REVOKES, REDUNDANT_REVOKES, STALE_ROWS } from "../../vips/vip-665/data/cleanup";
import { BNB_ACTIONS, BNB_ACTION_LEGACY_WILDCARD_REVOKES } from "../../vips/vip-665/data/criticalChanges";
import {
  AGGREGATOR,
  buildGrantPermissions,
  buildRevokePermissions,
  legacyWildcardRole,
} from "../../vips/vip-665/utils/commands";
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

// Critical maintenance rows, bucketed per action so each category is asserted explicitly and guarded
// non-empty (a data regression that empties a category fails loudly instead of passing vacuously).
const REVOKE = BNB_ACTIONS.filter(row => row.action === "revoke");
const SWAP = BNB_ACTIONS.filter(row => row.action === "swap");
const GRANT = BNB_ACTIONS.filter(row => row.action === "grant");
// Cleanup: redundant (wildcard-shadowed) target-specific grants revoked as behavior-preserving cleanup.
const REDUNDANT = REDUNDANT_REVOKES.bscmainnet;

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
      buildGrantPermissions("bscmainnet"),
      buildRevokePermissions("bscmainnet"),
    );
  });

  // ==================================================================================================
  // Critical maintenance — reduce CriticalTimelock privileges (revoke / swap / grant + legacy wildcard).
  // ==================================================================================================
  describe("VIP-665 Critical maintenance — pre-execution (bscmainnet)", () => {
    it("covers the expected revoke / swap / grant counts", () => {
      expect(REVOKE.length, "revoke rows").to.equal(26);
      expect(SWAP.length, "swap rows").to.equal(4);
      expect(GRANT.length, "grant rows").to.equal(1);
      expect(BNB_ACTION_LEGACY_WILDCARD_REVOKES.length, "critical legacy wildcard revokes").to.equal(1);
    });

    it("revoke: Critical currently holds every permission to be revoked", async () => {
      for (const row of REVOKE)
        expect(await holds(BNB_CRITICAL, row), `pre critical ${row.signature}@${row.target}`).to.be.true;
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

    it("legacy wildcard: Critical currently holds the 32-byte wildcard role", async () => {
      for (const r of BNB_ACTION_LEGACY_WILDCARD_REVOKES)
        expect(
          await acm().hasRole(legacyWildcardRole(r.signature), r.account),
          `pre legacy wildcard ${r.signature} ${r.account}`,
        ).to.be.true;
    });
  });

  // ==================================================================================================
  // Cleanup — ACM maintenance: stale/dangling grants, redundant wildcard-shadowed grants, and the retired
  // risk-steward legacy-wildcard cap powers. (BNB has no syncCash normalization — that is remotes only.)
  // ==================================================================================================
  describe("VIP-665 Cleanup — pre-execution (bscmainnet)", () => {
    describe("stale (dangling grants)", () => {
      it("covers the expected count", () => expect(STALE_ROWS.length, "stale rows").to.equal(8));

      it("every listed grantee currently holds the dangling permission", async () => {
        for (const staleRow of STALE_ROWS)
          for (const who of staleRow.revokeFrom)
            expect(await holds(who, staleRow), `pre stale ${staleRow.signature}@${staleRow.target} ${who}`).to.be.true;
      });
    });

    describe("redundant (wildcard-shadowed grants)", () => {
      it("covers the expected count", () => expect(REDUNDANT.length, "redundant rows").to.equal(15));

      it("each target-specific grant is currently held by its account", async () => {
        for (const r of REDUNDANT)
          expect(
            await acm().hasRole(role(r.contract, r.signature), r.account),
            `pre redundant ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.true;
      });
    });

    describe("legacy wildcard (retired risk-steward caps)", () => {
      it("covers the expected count", () =>
        expect(CLEANUP_LEGACY_WILDCARD_REVOKES.length, "cleanup legacy wildcard revokes").to.equal(2));

      it("each grantee currently holds the 32-byte wildcard role", async () => {
        for (const r of CLEANUP_LEGACY_WILDCARD_REVOKES)
          expect(
            await acm().hasRole(legacyWildcardRole(r.signature), r.account),
            `pre legacy wildcard ${r.signature} ${r.account}`,
          ).to.be.true;
      });
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

  // ==================================================================================================
  // Critical maintenance — post-execution.
  // ==================================================================================================
  describe("VIP-665 Critical maintenance — post-execution (bscmainnet)", () => {
    it("revoke: the CriticalTimelock lost each target-specific grant", async () => {
      for (const row of REVOKE)
        expect(await holds(BNB_CRITICAL, row), `post critical ${row.signature}@${row.target}`).to.be.false;
    });

    it("revoke behavioral: the CriticalTimelock can no longer call any revoked function", async () => {
      for (const row of REVOKE)
        expect(
          await acm().isAllowedToCall(BNB_CRITICAL, row.signature, { from: row.target }),
          `crit still allowed ${row.signature}@${row.target}`,
        ).to.be.false;
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

    it("legacy wildcard: Critical lost the 32-byte wildcard role", async () => {
      for (const r of BNB_ACTION_LEGACY_WILDCARD_REVOKES)
        expect(
          await acm().hasRole(legacyWildcardRole(r.signature), r.account),
          `post legacy wildcard ${r.signature} ${r.account}`,
        ).to.be.false;
    });

    it("swap behavioral: every swapped function is allowed for the target Guardian and denied for Critical", async () => {
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

  // ==================================================================================================
  // Cleanup — post-execution.
  // ==================================================================================================
  describe("VIP-665 Cleanup — post-execution (bscmainnet)", () => {
    describe("stale (dangling grants)", () => {
      it("every listed grantee lost the dangling permission", async () => {
        for (const staleRow of STALE_ROWS)
          for (const who of staleRow.revokeFrom)
            expect(await holds(who, staleRow), `post stale ${staleRow.signature}@${staleRow.target} ${who}`).to.be
              .false;
      });
    });

    describe("redundant (wildcard-shadowed grants)", () => {
      it("each target-specific grant was revoked", async () => {
        for (const r of REDUNDANT)
          expect(
            await acm().hasRole(role(r.contract, r.signature), r.account),
            `post redundant ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.false;
      });

      it("behavioral: each account can still call its function via the surviving wildcard", async () => {
        for (const r of REDUNDANT) {
          // setCollateralFactor from Critical is the single case whose wildcard is also revoked, so its power
          // is fully removed (asserted in the critical revoke test). Every other redundant revoke preserves it.
          if (r.signature === "setCollateralFactor(address,uint256,uint256)" && r.account === BNB_CRITICAL) continue;
          expect(
            await acm().isAllowedToCall(r.account, r.signature, { from: r.contract }),
            `still callable ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.true;
        }
      });
    });

    describe("legacy wildcard (retired risk-steward caps)", () => {
      it("each grantee lost the 32-byte wildcard role", async () => {
        for (const r of CLEANUP_LEGACY_WILDCARD_REVOKES)
          expect(
            await acm().hasRole(legacyWildcardRole(r.signature), r.account),
            `post legacy wildcard ${r.signature} ${r.account}`,
          ).to.be.false;
      });
    });
  });
});
