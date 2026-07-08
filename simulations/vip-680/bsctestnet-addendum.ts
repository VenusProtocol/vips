import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_SOURCE_GOVERNANCE_SIGS,
  CORE_SOURCE_USDT,
  HUB_GOVERNANCE_SIGS,
  HUB_USDT,
} from "../../vips/vip-680/bsctestnet";
import vip680Addendum from "../../vips/vip-680/bsctestnet-addendum";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bsctestnet;

const FAST_LANE_TIMELOCKS = [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK];

// bsctestnet block after the Liquidity Hub (USDT) deployment (deploy block ~117918419).
const BLOCK_NUMBER = 117930000;

const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// reallocate is the Operator-only role — it is NOT part of the Governance set this addendum grants, so
// the fast-lane timelocks must never receive it.
const REALLOCATE_SIG = "reallocate((address,address,uint256)[],(address,address,uint256)[])";

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACCESS_CONTROL_MANAGER);
  });

  describe("Pre-VIP state", () => {
    it("Fast-Track and Critical timelocks hold no governance role on Hub or Core source", async () => {
      for (const timelock of FAST_LANE_TIMELOCKS) {
        for (const sig of HUB_GOVERNANCE_SIGS) {
          expect(await acm.hasRole(roleId(HUB_USDT, sig), timelock)).to.equal(
            false,
            `pre Hub gov ${sig} @ ${timelock}`,
          );
        }
        for (const sig of CORE_SOURCE_GOVERNANCE_SIGS) {
          expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), timelock)).to.equal(
            false,
            `pre Core gov ${sig} @ ${timelock}`,
          );
        }
      }
    });
  });

  testVip(
    "VIP-680 [BNB Testnet] Liquidity Hub (USDT) Fast-Track/Critical permissions (addendum)",
    await vip680Addendum(),
    {
      callbackAfterExecution: async txResponse => {
        // Governance set (18 Hub + 11 Core = 29) granted to 2 timelocks = 58 RoleGranted events.
        await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [58]);
      },
    },
  );

  describe("Post-VIP permissions", () => {
    it("Fast-Track and Critical timelocks hold the full governance role set on Hub and Core source", async () => {
      for (const timelock of FAST_LANE_TIMELOCKS) {
        for (const sig of HUB_GOVERNANCE_SIGS) {
          expect(await acm.hasRole(roleId(HUB_USDT, sig), timelock)).to.equal(
            true,
            `post Hub gov ${sig} @ ${timelock}`,
          );
        }
        for (const sig of CORE_SOURCE_GOVERNANCE_SIGS) {
          expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), timelock)).to.equal(
            true,
            `post Core gov ${sig} @ ${timelock}`,
          );
        }
      }
    });

    it("Fast-Track and Critical timelocks do NOT hold the operator-only reallocate role", async () => {
      for (const timelock of FAST_LANE_TIMELOCKS) {
        expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE_SIG), timelock)).to.equal(
          false,
          `reallocate @ ${timelock}`,
        );
      }
    });
  });
});
