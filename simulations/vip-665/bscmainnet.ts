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
  Permission,
  REVOKE_INDICES,
  bscRevokeBatches,
  buildGrantPermissions,
  legacyWildcardRole,
} from "../../vips/vip-665/utils/commands";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import { SCANNED_CRITICAL } from "./data/scannedCritical";

const { bscmainnet } = NETWORK_ADDRESSES;
// Post-seed BSC block: the ACMCommandsAggregator is already seeded on-chain (127+127 revokes at indices
// [0,1])
const FORK_BLOCK = 110304228;
// PROPOSER: a Gnosis Safe holding >1M votes with no live proposal at FORK_BLOCK, so propose() succeeds.
const PROPOSER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";
const SUPPORTER = "0x34221485302f6F2029660a000908B5FCABB9BC6e";

// A long-listed core-pool market, used to check the CriticalTimelock lost its forced-liquidation power.
const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

const REDUNDANT = REDUNDANT_REVOKES.bscmainnet;
const SCANNED = SCANNED_CRITICAL.bscmainnet;
const ZERO = "0x0000000000000000000000000000000000000000";
// On the BNB v1 ACM, wildcard roles hash a 32-byte zero prefix (legacyWildcardRole);
// the scanned data marks wildcards with a zero-address target.
const scannedRole = (r: { target: string; signature: string }) =>
  r.target === ZERO ? legacyWildcardRole(r.signature) : role(r.target, r.signature);

const assertSeededBatch = async (
  aggregator: Contract,
  kind: "grant" | "revoke",
  index: number,
  expected: Permission[],
) => {
  const read = (i: number) =>
    kind === "grant" ? aggregator.grantPermissions(index, i) : aggregator.revokePermissions(index, i);
  for (let i = 0; i < expected.length; i++) {
    const got = await read(i);
    const at = `${kind}[${index}][${i}]`;
    expect(got.contractAddress.toLowerCase(), `${at} contractAddress`).to.equal(
      expected[i].contractAddress.toLowerCase(),
    );
    expect(got.functionSig, `${at} functionSig`).to.equal(expected[i].functionSig);
    expect(got.account.toLowerCase(), `${at} account`).to.equal(expected[i].account.toLowerCase());
  }
  // Reading one past the end reverts (out-of-bounds public-array access) → confirms no trailing entries.
  await expect(read(expected.length), `${kind} batch ${index} has unexpected trailing entries`).to.be.reverted;
};

forking(FORK_BLOCK, async () => {
  const acm = () => new Contract(ACM.bscmainnet, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

  describe("VIP-665 Aggregator seeding — before execution (bscmainnet)", () => {
    it("the batches the VIP executes match the intended permissions exactly", async () => {
      const aggregator = new Contract(AGGREGATOR.bscmainnet, ACM_COMMANDS_AGGREGATOR_ABI, ethers.provider);
      // BNB seeds only revoke batches; the grant batch is empty so the VIP skips executeGrantPermissions.
      expect(buildGrantPermissions("bscmainnet").length, "no grant batch on BNB").to.equal(0);
      // BNB's revokes are split into two batches (Osaka per-tx gas cap); assert each lands at its index.
      const batches = bscRevokeBatches();
      const indices = REVOKE_INDICES.bscmainnet;
      expect(batches.length, "two revoke batches on BNB").to.equal(indices.length);
      for (let b = 0; b < batches.length; b++) await assertSeededBatch(aggregator, "revoke", indices[b], batches[b]);
    });
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

    it("the VIP revoke set equals the independently scanned Critical permission set", () => {
      const key = (r: { target: string; signature: string }) => `${r.target.toLowerCase()}|${r.signature}`;
      const vipKeys = new Set([
        ...CRITICAL_REVOKES.bscmainnet.map(key),
        ...BNB_CRITICAL_WILDCARD_SIGS.map(sig => `${ZERO}|${sig}`),
      ]);
      const scannedKeys = new Set(SCANNED.map(key));
      const missing = SCANNED.filter(r => !vipKeys.has(key(r))); // Critical would KEEP these
      const extra = [...vipKeys].filter(k => !scannedKeys.has(k)); // no-op revokes, break event counts
      expect(missing.map(key), "scanned Critical permissions missing from the VIP").to.be.empty;
      expect(extra, "VIP revokes not present in the scanned Critical set").to.be.empty;
    });

    it("Critical holds every independently scanned permission at the fork block", async () => {
      for (const row of SCANNED)
        expect(await acm().hasRole(scannedRole(row), BNB_CRITICAL), `scan before: ${row.signature}@${row.target}`).to.be
          .true;
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
    proposer: PROPOSER,
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [events.granted, events.revoked],
      );
      // BNB grants nothing and its revokes are split into two batches, so two RevokePermissionsExecuted fire.
      await expectEvents(
        txResponse,
        [ACM_COMMANDS_AGGREGATOR_ABI],
        ["GrantPermissionsExecuted", "RevokePermissionsExecuted"],
        [0, 2],
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

    it("Critical holds none of the independently scanned permissions", async () => {
      for (const row of SCANNED)
        expect(await acm().hasRole(scannedRole(row), BNB_CRITICAL), `scan after: ${row.signature}@${row.target}`).to.be
          .false;
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
