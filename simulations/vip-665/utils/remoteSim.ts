import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip665, { EXPECTED_ROLE_EVENTS } from "../../../vips/vip-665/bscmainnet";
import { REMOTE_ACM, SYNC_CASH_MARKETS, ZERO } from "../../../vips/vip-665/data/addresses";
import { REDUNDANT_REVOKES, SYNC_CASH_SIG } from "../../../vips/vip-665/data/cleanup";
import { remoteRowsFor } from "../../../vips/vip-665/data/criticalChanges";
import { AGGREGATOR, Chain, buildGrantPermissions, buildRevokePermissions } from "../../../vips/vip-665/utils/commands";
import { seedAggregator } from "../../../vips/vip-665/utils/seed";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager.json";

type RemoteChain = Exclude<Chain, "bscmainnet">;

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

// RoleGranted / RoleRevoked are emitted by every ACM version. On remotes the grants are the wrapper
// grantRole(DEFAULT_ADMIN_ROLE) plus the single wildcard syncCash() grant; RoleRevoked = the Critical
// revokes + the per-market syncCash() revokes + the wrapper revokeRole. Expected counts come from the
// hardcoded EXPECTED_ROLE_EVENTS oracle.

// Shared body for the 7 remote-chain simulations. Run each with its matching --fork.
export const runRemoteSim = (chain: RemoteChain, forkBlock: number) => {
  const critical = NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;
  const normal = NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK;
  const syncCashMarkets = SYNC_CASH_MARKETS[chain];

  forking(forkBlock, async () => {
    before(async () => {
      const signer = await initMainnetUser(NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      await seedAggregator(signer, AGGREGATOR[chain], buildGrantPermissions(chain), buildRevokePermissions(chain));
    });

    const acm = () => new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    const rows = remoteRowsFor(chain);
    const redundant = REDUNDANT_REVOKES[chain];

    // ================================================================================================
    // Critical maintenance — reduce CriticalTimelock privileges (remotes revoke only, no grants/swaps).
    // ================================================================================================
    describe(`VIP-665 Critical maintenance — pre-execution (${chain})`, () => {
      it("the plan has at least one revoke row for this chain", () => {
        expect(rows.length, `revoke rows for ${chain}`).to.be.greaterThan(0);
      });

      it("revoke: Critical currently holds every permission to be revoked", async () => {
        for (const row of rows)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `pre critical ${row.signature}@${row.target}`,
          ).to.be.true;
      });
    });

    // ================================================================================================
    // Cleanup — ACM maintenance: syncCash() wildcard normalization and redundant wildcard-shadowed grants.
    // (No stale/dangling grants on remotes — that is BNB only.)
    // ================================================================================================
    describe(`VIP-665 Cleanup — pre-execution (${chain})`, () => {
      describe("syncCash (wildcard normalization)", () => {
        it("NormalTimelock holds every per-market grant and no wildcard grant yet", async () => {
          expect(syncCashMarkets.length, `syncCash markets for ${chain}`).to.be.greaterThan(0);
          expect(await acm().hasRole(role(ZERO, SYNC_CASH_SIG), normal), "pre wildcard syncCash").to.be.false;
          for (const market of syncCashMarkets)
            expect(await acm().hasRole(role(market, SYNC_CASH_SIG), normal), `pre normal syncCash@${market}`).to.be
              .true;
        });
      });

      describe("redundant (wildcard-shadowed grants)", () => {
        it("each target-specific grant is currently held by its account", async () => {
          for (const r of redundant)
            expect(
              await acm().hasRole(role(r.contract, r.signature), r.account),
              `pre redundant ${r.signature}@${r.contract} ${r.account}`,
            ).to.be.true;
        });
      });
    });

    const events = EXPECTED_ROLE_EVENTS[chain];
    testForkedNetworkVipCommands(`VIP-665 ${chain}`, await vip665(), {
      callbackAfterExecution: async (txResponse: TransactionResponse) => {
        await expectEvents(
          txResponse,
          [ACCESS_CONTROL_MANAGER_ABI],
          ["RoleGranted", "RoleRevoked"],
          [events.granted, events.revoked],
        );
      },
    });

    // ================================================================================================
    // Critical maintenance — post-execution.
    // ================================================================================================
    describe(`VIP-665 Critical maintenance — post-execution (${chain})`, () => {
      it("revoke: Critical lost every revoked permission", async () => {
        for (const row of rows)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `post critical ${row.signature}@${row.target}`,
          ).to.be.false;
      });

      it("revoke behavioral: Critical is no longer allowed to call any revoked function", async () => {
        for (const row of rows)
          if (row.target !== ZERO)
            expect(
              await acm().isAllowedToCall(critical, row.signature, { from: row.target }),
              `crit !allowed ${row.signature}`,
            ).to.be.false;
      });
    });

    // ================================================================================================
    // Cleanup — post-execution.
    // ================================================================================================
    describe(`VIP-665 Cleanup — post-execution (${chain})`, () => {
      describe("syncCash (wildcard normalization)", () => {
        it("NormalTimelock gained the wildcard grant and lost every per-market grant", async () => {
          expect(await acm().hasRole(role(ZERO, SYNC_CASH_SIG), normal), "post wildcard syncCash").to.be.true;
          for (const market of syncCashMarkets)
            expect(await acm().hasRole(role(market, SYNC_CASH_SIG), normal), `post normal syncCash@${market}`).to.be
              .false;
        });

        it("behavioral: NormalTimelock is still allowed to call syncCash on every market via wildcard", async () => {
          for (const market of syncCashMarkets)
            expect(
              await acm().isAllowedToCall(normal, SYNC_CASH_SIG, { from: market }),
              `normal allowed syncCash@${market}`,
            ).to.be.true;
        });
      });

      describe("redundant (wildcard-shadowed grants)", () => {
        it("each target-specific grant was revoked", async () => {
          for (const r of redundant)
            expect(
              await acm().hasRole(role(r.contract, r.signature), r.account),
              `post redundant ${r.signature}@${r.contract} ${r.account}`,
            ).to.be.false;
        });

        it("behavioral: each account can still call the function via the surviving wildcard", async () => {
          for (const r of redundant)
            expect(
              await acm().isAllowedToCall(r.account, r.signature, { from: r.contract }),
              `post callable ${r.signature}@${r.contract} ${r.account}`,
            ).to.be.true;
        });
      });
    });
  });
};
