import { TransactionResponse } from "@ethersproject/abstract-provider";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip665 from "../../../vips/vip-665/bscmainnet";
import { ZERO } from "../../../vips/vip-665/data/bnb";
import { REMOTE_ACM, remoteRowsFor } from "../../../vips/vip-665/data/remote";
import { SYNC_CASH_MARKETS, SYNC_CASH_SIG } from "../../../vips/vip-665/data/syncCash";
import {
  AGGREGATOR,
  Chain,
  grantPermissions,
  revokePermissions,
  roleChangeCounts,
} from "../../../vips/vip-665/utils/commands";
import { seedAggregator } from "../../../vips/vip-665/utils/seed";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager.json";

type RemoteChain = Exclude<Chain, "bscmainnet">;

const role = (at: string, fn: string) => ethers.utils.solidityKeccak256(["address", "string"], [at, fn]);

// RoleGranted / RoleRevoked are emitted by every ACM version. On remotes the grants are the wrapper
// grantRole(DEFAULT_ADMIN_ROLE) plus the single wildcard syncCash() grant; RoleRevoked = the Critical
// revokes + the per-market syncCash() revokes + the wrapper revokeRole. Event counts derive from
// roleChangeCounts, so they track the batch contents automatically.

// Shared body for the 7 remote-chain simulations. Run each with its matching --fork.
export const runRemoteSim = (chain: RemoteChain, forkBlock: number) => {
  const critical = NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;
  const guardian = NETWORK_ADDRESSES[chain].GUARDIAN;
  const normal = NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK;
  const syncCashMarkets = SYNC_CASH_MARKETS[chain];

  forking(forkBlock, async () => {
    before(async () => {
      const signer = await initMainnetUser(NETWORK_ADDRESSES[chain].NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
      await seedAggregator(signer, AGGREGATOR[chain], grantPermissions(chain), revokePermissions(chain));
    });

    const rows = remoteRowsFor(chain);

    describe(`VIP-665 pre-execution permissions (${chain})`, () => {
      it("the plan has at least one revoke row for this chain", () => {
        expect(rows.length, `revoke rows for ${chain}`).to.be.greaterThan(0);
      });

      it("revoke: Critical currently holds every permission to be revoked", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const r of rows)
          expect(await acm.hasRole(role(r.target, r.signature), critical), `pre critical ${r.signature}@${r.target}`).to
            .be.true;
      });

      it("no-change: the Guardian flag matches the plan for every row", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const r of rows)
          expect(
            await acm.hasRole(role(r.target, r.signature), guardian),
            `pre guardian ${r.signature}@${r.target}`,
          ).to.equal(r.guardian);
      });

      it("syncCash: NormalTimelock holds every per-market grant and no wildcard grant yet", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        expect(syncCashMarkets.length, `syncCash markets for ${chain}`).to.be.greaterThan(0);
        expect(await acm.hasRole(role(ZERO, SYNC_CASH_SIG), normal), "pre wildcard syncCash").to.be.false;
        for (const m of syncCashMarkets)
          expect(await acm.hasRole(role(m, SYNC_CASH_SIG), normal), `pre normal syncCash@${m}`).to.be.true;
      });
    });

    const counts = roleChangeCounts(chain);
    testForkedNetworkVipCommands(`VIP-665 ${chain}`, await vip665(), {
      callbackAfterExecution: async (txResponse: TransactionResponse) => {
        await expectEvents(
          txResponse,
          [ACCESS_CONTROL_MANAGER_ABI],
          ["RoleGranted", "RoleRevoked"],
          [counts.granted + 1, counts.revoked + 1],
        );
      },
    });

    describe(`VIP-665 post-execution permissions (${chain})`, () => {
      it("revoke: Critical lost every revoked permission", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const r of rows)
          expect(await acm.hasRole(role(r.target, r.signature), critical), `post critical ${r.signature}@${r.target}`)
            .to.be.false;
      });

      it("no-change: the Guardian flag is unchanged for every row", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const r of rows)
          expect(
            await acm.hasRole(role(r.target, r.signature), guardian),
            `post guardian ${r.signature}@${r.target}`,
          ).to.equal(r.guardian);
      });

      it("behavioral: Critical is no longer allowed to call any revoked function", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const r of rows)
          if (r.target !== ZERO)
            expect(await acm.isAllowedToCall(critical, r.signature, { from: r.target }), `crit !allowed ${r.signature}`)
              .to.be.false;
      });

      it("syncCash: NormalTimelock gained the wildcard grant and lost every per-market grant", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        expect(await acm.hasRole(role(ZERO, SYNC_CASH_SIG), normal), "post wildcard syncCash").to.be.true;
        for (const m of syncCashMarkets)
          expect(await acm.hasRole(role(m, SYNC_CASH_SIG), normal), `post normal syncCash@${m}`).to.be.false;
      });

      it("syncCash behavioral: NormalTimelock is still allowed to call syncCash on every market via wildcard", async () => {
        const acm = new Contract(REMOTE_ACM[chain], ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
        for (const m of syncCashMarkets)
          expect(await acm.isAllowedToCall(normal, SYNC_CASH_SIG, { from: m }), `normal allowed syncCash@${m}`).to.be
            .true;
      });
    });
  });
};
