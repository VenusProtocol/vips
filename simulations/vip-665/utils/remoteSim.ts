import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip665, { EXPECTED_ROLE_EVENTS } from "../../../vips/vip-665/bscmainnet";
import { ACM, SYNC_CASH_MARKETS, ZERO } from "../../../vips/vip-665/data/addresses";
import { REDUNDANT_REVOKES, SYNC_CASH_SIG } from "../../../vips/vip-665/data/cleanup";
import { CRITICAL_REVOKES } from "../../../vips/vip-665/data/criticalRevokes";
import {
  AGGREGATOR,
  Chain,
  DEFAULT_ADMIN_ROLE,
  buildGrantPermissions,
  buildRevokePermissions,
} from "../../../vips/vip-665/utils/commands";
import { seedAggregator } from "../../../vips/vip-665/utils/seed";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager.json";
import { SCANNED_CRITICAL } from "../data/scannedCritical";

type RemoteChain = Exclude<Chain, "bscmainnet">;

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

// Shared body for the 7 remote-chain simulations.
export const runRemoteSim = (chain: RemoteChain, forkBlock: number) => {
  const critical = NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;
  const normal = NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK;
  const syncCashMarkets = SYNC_CASH_MARKETS[chain];

  forking(forkBlock, async () => {
    before(async () => {
      const signer = await initMainnetUser(NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      await seedAggregator(signer, AGGREGATOR[chain], buildGrantPermissions(chain), buildRevokePermissions(chain));
    });

    const acm = () => new Contract(ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    const rows = CRITICAL_REVOKES[chain];
    const redundant = REDUNDANT_REVOKES[chain];
    const scanned = SCANNED_CRITICAL[chain];

    describe(`VIP-665 Critical permissions — before execution (${chain})`, () => {
      it("the VIP revokes at least one grant on this chain", () => {
        expect(rows.length, `revokes for ${chain}`).to.be.greaterThan(0);
      });

      it("the VIP revoke set equals the independently scanned Critical permission set", () => {
        const key = (r: { target: string; signature: string }) => `${r.target.toLowerCase()}|${r.signature}`;
        const vipKeys = new Set(rows.map(key));
        const scannedKeys = new Set(scanned.map(key));
        const missing = scanned.filter(r => !vipKeys.has(key(r))); // Critical would KEEP these
        const extra = rows.filter(r => !scannedKeys.has(key(r))); // no-op revokes, break event counts
        expect(missing.map(key), "scanned Critical permissions missing from the VIP").to.be.empty;
        expect(extra.map(key), "VIP revokes not present in the scanned Critical set").to.be.empty;
      });

      it("Critical holds every independently scanned permission at the fork block", async () => {
        for (const row of scanned)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `scan before: ${row.signature}@${row.target}`,
          ).to.be.true;
      });

      it("Critical holds every grant the VIP revokes", async () => {
        for (const row of rows)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `before: ${row.signature}@${row.target}`,
          ).to.be.true;
      });
    });

    describe(`VIP-665 Cleanup — before execution (${chain})`, () => {
      describe("syncCash normalization", () => {
        it("NormalTimelock holds the per-market grants but not the wildcard yet", async () => {
          expect(syncCashMarkets.length, `syncCash markets for ${chain}`).to.be.greaterThan(0);
          expect(await acm().hasRole(role(ZERO, SYNC_CASH_SIG), normal), "before wildcard syncCash").to.be.false;
          for (const market of syncCashMarkets)
            expect(await acm().hasRole(role(market, SYNC_CASH_SIG), normal), `before syncCash@${market}`).to.be.true;
        });
      });

      describe("redundant grants", () => {
        it("every account still holds its redundant grant", async () => {
          for (const r of redundant)
            expect(
              await acm().hasRole(role(r.contract, r.signature), r.account),
              `before redundant: ${r.signature}@${r.contract} ${r.account}`,
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

    describe(`VIP-665 Critical permissions — after execution (${chain})`, () => {
      it("Critical lost every grant", async () => {
        for (const row of rows)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `after: ${row.signature}@${row.target}`,
          ).to.be.false;
      });

      it("Critical can no longer call any revoked function", async () => {
        for (const row of rows)
          if (row.target !== ZERO)
            expect(
              await acm().isAllowedToCall(critical, row.signature, { from: row.target }),
              `still allowed: ${row.signature}`,
            ).to.be.false;
      });

      it("Critical holds none of the independently scanned permissions", async () => {
        for (const row of scanned)
          expect(
            await acm().hasRole(role(row.target, row.signature), critical),
            `scan after: ${row.signature}@${row.target}`,
          ).to.be.false;
      });

      it("the aggregator no longer holds the ACM DEFAULT_ADMIN_ROLE", async () => {
        expect(await acm().hasRole(DEFAULT_ADMIN_ROLE, AGGREGATOR[chain]), "aggregator retains admin").to.be.false;
      });
    });

    describe(`VIP-665 Cleanup — after execution (${chain})`, () => {
      describe("syncCash normalization", () => {
        it("NormalTimelock gained the wildcard grant and lost the per-market grants", async () => {
          expect(await acm().hasRole(role(ZERO, SYNC_CASH_SIG), normal), "after wildcard syncCash").to.be.true;
          for (const market of syncCashMarkets)
            expect(await acm().hasRole(role(market, SYNC_CASH_SIG), normal), `after syncCash@${market}`).to.be.false;
        });

        it("NormalTimelock can still call syncCash on every market via the wildcard", async () => {
          for (const market of syncCashMarkets)
            expect(
              await acm().isAllowedToCall(normal, SYNC_CASH_SIG, { from: market }),
              `still callable syncCash@${market}`,
            ).to.be.true;
        });
      });

      describe("redundant grants", () => {
        it("every redundant grant was revoked", async () => {
          for (const r of redundant)
            expect(
              await acm().hasRole(role(r.contract, r.signature), r.account),
              `after redundant: ${r.signature}@${r.contract} ${r.account}`,
            ).to.be.false;
        });

        it("each account can still make the call via the surviving wildcard", async () => {
          for (const r of redundant)
            expect(
              await acm().isAllowedToCall(r.account, r.signature, { from: r.contract }),
              `still callable: ${r.signature}@${r.contract} ${r.account}`,
            ).to.be.true;
        });
      });
    });
  });
};
