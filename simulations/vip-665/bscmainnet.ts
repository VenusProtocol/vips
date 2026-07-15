import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, { EXPECTED_ROLE_EVENTS } from "../../vips/vip-665/bscmainnet";
import { ACM, BNB_CRITICAL } from "../../vips/vip-665/data/addresses";
import { CLEANUP_LEGACY_WILDCARD_REVOKES, REDUNDANT_REVOKES, STALE_ROWS } from "../../vips/vip-665/data/cleanup";
import { BNB_CRITICAL_WILDCARD_SIGS, CRITICAL_REVOKES } from "../../vips/vip-665/data/criticalRevokes";
import {
  AGGREGATOR,
  DEFAULT_ADMIN_ROLE,
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

// A long-listed core-pool market, used to check the CriticalTimelock lost its forced-liquidation power.
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

const REDUNDANT = REDUNDANT_REVOKES.bscmainnet;

forking(FORK_BLOCK, async () => {
  const acm = () => new Contract(ACM.bscmainnet, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  before(async () => {
    const signer = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    await seedAggregator(
      signer,
      AGGREGATOR.bscmainnet,
      buildGrantPermissions("bscmainnet"),
      buildRevokePermissions("bscmainnet"),
    );
  });

  describe("VIP-665 Critical permissions — before execution (bscmainnet)", () => {
    it("revokes the expected number of grants and grants nothing", () => {
      expect(CRITICAL_REVOKES.bscmainnet.length, "per-contract grants").to.equal(223);
      expect(BNB_CRITICAL_WILDCARD_SIGS.length, "wildcard grants").to.equal(17);
      expect(buildGrantPermissions("bscmainnet").length, "no grants on BNB").to.equal(0);
    });

    it("Critical holds every per-contract grant the VIP revokes", async () => {
      for (const row of CRITICAL_REVOKES.bscmainnet)
        expect(
          await acm().hasRole(role(row.target, row.signature), BNB_CRITICAL),
          `before: ${row.signature}@${row.target}`,
        ).to.be.true;
    });

    it("Critical holds every wildcard grant the VIP revokes", async () => {
      for (const sig of BNB_CRITICAL_WILDCARD_SIGS)
        expect(await acm().hasRole(legacyWildcardRole(sig), BNB_CRITICAL), `before wildcard: ${sig}`).to.be.true;
    });
  });

  describe("VIP-665 Cleanup — before execution (bscmainnet)", () => {
    describe("stale grants", () => {
      it("lists the expected number of stale grants", () => expect(STALE_ROWS.length).to.equal(9));

      it("every grantee still holds its stale grant", async () => {
        for (const staleRow of STALE_ROWS)
          for (const who of staleRow.revokeFrom)
            expect(
              await acm().hasRole(role(staleRow.target, staleRow.signature), who),
              `before stale: ${staleRow.signature}@${staleRow.target} ${who}`,
            ).to.be.true;
      });
    });

    describe("redundant grants", () => {
      it("lists the expected number of redundant grants", () => expect(REDUNDANT.length).to.equal(15));

      it("every account still holds its redundant grant", async () => {
        for (const r of REDUNDANT)
          expect(
            await acm().hasRole(role(r.contract, r.signature), r.account),
            `before redundant: ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.true;
      });
    });

    describe("legacy wildcard grants", () => {
      it("lists the expected number of legacy wildcard grants", () =>
        expect(CLEANUP_LEGACY_WILDCARD_REVOKES.length).to.equal(7));

      it("every grantee still holds its legacy wildcard grant", async () => {
        for (const r of CLEANUP_LEGACY_WILDCARD_REVOKES)
          expect(
            await acm().hasRole(legacyWildcardRole(r.signature), r.account),
            `before legacy wildcard: ${r.signature} ${r.account}`,
          ).to.be.true;
      });
    });
  });

  const events = EXPECTED_ROLE_EVENTS.bscmainnet;
  testVip("VIP-665 Remove all CriticalTimelock privileges — BNB Chain", await vip665(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [events.granted, events.revoked],
      );
      // BNB grants nothing, so only the revoke batch executes.
      await expectEvents(
        txResponse,
        [ACM_COMMANDS_AGGREGATOR_ABI],
        ["GrantPermissionsExecuted", "RevokePermissionsExecuted"],
        [0, 1],
      );
    },
  });

  describe("VIP-665 Critical permissions — after execution (bscmainnet)", () => {
    it("Critical lost every per-contract grant", async () => {
      for (const row of CRITICAL_REVOKES.bscmainnet)
        expect(
          await acm().hasRole(role(row.target, row.signature), BNB_CRITICAL),
          `after: ${row.signature}@${row.target}`,
        ).to.be.false;
    });

    it("Critical lost every wildcard grant", async () => {
      for (const sig of BNB_CRITICAL_WILDCARD_SIGS)
        expect(await acm().hasRole(legacyWildcardRole(sig), BNB_CRITICAL), `after wildcard: ${sig}`).to.be.false;
    });

    it("Critical can no longer call any revoked function", async () => {
      for (const row of CRITICAL_REVOKES.bscmainnet)
        expect(
          await acm().isAllowedToCall(BNB_CRITICAL, row.signature, { from: row.target }),
          `still allowed: ${row.signature}@${row.target}`,
        ).to.be.false;
    });

    it("a revoked call from Critical now reverts (_setForcedLiquidation on the Unitroller)", async () => {
      const criticalSigner = await initMainnetUser(bscmainnet.CRITICAL_TIMELOCK, ethers.utils.parseEther("1"));
      const asCritical = new Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, criticalSigner);
      await expect(asCritical._setForcedLiquidation(vUSDT, true)).to.be.reverted;
    });

    it("the aggregator no longer holds the ACM DEFAULT_ADMIN_ROLE", async () => {
      expect(await acm().hasRole(DEFAULT_ADMIN_ROLE, AGGREGATOR.bscmainnet), "aggregator retains admin").to.be.false;
    });
  });

  describe("VIP-665 Cleanup — after execution (bscmainnet)", () => {
    describe("stale grants", () => {
      it("every grantee lost its stale grant", async () => {
        for (const staleRow of STALE_ROWS)
          for (const who of staleRow.revokeFrom)
            expect(
              await acm().hasRole(role(staleRow.target, staleRow.signature), who),
              `after stale: ${staleRow.signature}@${staleRow.target} ${who}`,
            ).to.be.false;
      });
    });

    describe("redundant grants", () => {
      it("every redundant grant was revoked", async () => {
        for (const r of REDUNDANT)
          expect(
            await acm().hasRole(role(r.contract, r.signature), r.account),
            `after redundant: ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.false;
      });

      it("each account can still make the call via the surviving wildcard", async () => {
        for (const r of REDUNDANT) {
          // Critical's own wildcards are revoked too, so its power is fully gone (asserted above). Every other
          // account keeps its wildcard, so the call is still allowed.
          if (r.account.toLowerCase() === BNB_CRITICAL.toLowerCase()) continue;
          expect(
            await acm().isAllowedToCall(r.account, r.signature, { from: r.contract }),
            `still callable: ${r.signature}@${r.contract} ${r.account}`,
          ).to.be.true;
        }
      });
    });

    describe("legacy wildcard grants", () => {
      it("every grantee lost its legacy wildcard grant", async () => {
        for (const r of CLEANUP_LEGACY_WILDCARD_REVOKES)
          expect(
            await acm().hasRole(legacyWildcardRole(r.signature), r.account),
            `after legacy wildcard: ${r.signature} ${r.account}`,
          ).to.be.false;
      });
    });
  });
});
