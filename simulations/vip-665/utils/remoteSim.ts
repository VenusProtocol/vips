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

// RoleGranted / RoleRevoked are emitted by every ACM version. Remotes have no grants, so the only
// RoleGranted is the wrapper grantRole(DEFAULT_ADMIN_ROLE) and RoleRevoked = revokes + the wrapper
// revokeRole.

// Shared body for the 7 remote-chain simulations. Run each with its matching --fork.
export const runRemoteSim = (chain: RemoteChain, forkBlock: number) => {
  const critical = NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;
  const guardian = NETWORK_ADDRESSES[chain].GUARDIAN;

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
    });
  });
};
