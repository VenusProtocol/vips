import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_REGISTRY,
  HUB_USDT,
  NORMAL_TIMELOCK,
} from "../../vips/vip-680/addresses/bsctestnet";
import vip680 from "../../vips/vip-680/bsctestnet";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-680/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import HUB_ABI from "./abi/Hub.json";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";

// bsctestnet block after the Liquidity Hub (USDT) redeployment and the FRV vault creation.
const BLOCK_NUMBER = 119474506;

// The exact ACM role id giveCallPermission(contract, sig, account) grants:
// keccak256(abi.encodePacked(contract, functionSig)). Asserting hasRole on this specific role is immune
// to the isAllowedToCall wildcard fallback, so pre-VIP "not granted" checks cannot be masked.
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// Every (contract, sig) pair this proposal grants to the Normal Timelock: 18 Hub + 11 Core + 9 FRV +
// 11 Flux + 2 Registry = 51.
const GOV_GRANTS: [string, string][] = [
  ...HUB_GOVERNANCE.map((s): [string, string] => [HUB_USDT, s]),
  ...CORE_FLUX_GOVERNANCE.map((s): [string, string] => [CORE_SOURCE_USDT, s]),
  ...FRV_GOVERNANCE.map((s): [string, string] => [FRV_SOURCE_USDT, s]),
  ...CORE_FLUX_GOVERNANCE.map((s): [string, string] => [FLUX_SOURCE_USDT, s]),
  ...HUB_REGISTRY_GOVERNANCE.map((s): [string, string] => [HUB_REGISTRY, s]),
];

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;
  let hub: Contract;
  let registry: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    hub = await ethers.getContractAt(HUB_ABI, HUB_USDT);
    registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
  });

  describe("Pre-VIP state", () => {
    it("GOV_GRANTS is the expected 51 (contract, sig) pairs", () => {
      expect(GOV_GRANTS.length).to.equal(51);
    });

    it("Hub and HubRegistry are pending-owned by the Normal Timelock (not yet accepted)", async () => {
      expect(await hub.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await registry.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await hub.owner()).to.not.equal(NORMAL_TIMELOCK);
      expect(await registry.owner()).to.not.equal(NORMAL_TIMELOCK);
    });

    it("Normal Timelock holds none of the governance roles this proposal grants", async () => {
      for (const [c, s] of GOV_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), NORMAL_TIMELOCK)).to.equal(false, `pre ${c} ${s}`);
      }
    });
  });

  testVip("VIP-680 [BNB Testnet] Liquidity Hub (USDT) Normal Timelock permissions", await vip680(), {
    callbackAfterExecution: async txResponse => {
      // 51 governance grants + 2 acceptOwnership (Hub + registry each emit OwnershipTransferred).
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [51]);
      await expectEvents(txResponse, [HUB_ABI], ["OwnershipTransferred"], [2]);
    },
  });

  describe("Post-VIP state", () => {
    it("Hub and HubRegistry are now owned by the Normal Timelock", async () => {
      expect(await hub.owner()).to.equal(NORMAL_TIMELOCK);
      expect(await registry.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Normal Timelock holds the full governance set across the stack", async () => {
      for (const [c, s] of GOV_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), NORMAL_TIMELOCK)).to.equal(true, `post ${c} ${s}`);
      }
    });

    it("Normal Timelock does NOT hold the operator-only reallocate role", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE), NORMAL_TIMELOCK)).to.equal(false);
    });

    it("Fast-Track, Critical and Guardian hold no governance role yet", async () => {
      for (const account of [FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN]) {
        for (const [c, s] of GOV_GRANTS) {
          expect(await acm.hasRole(roleId(c, s), account)).to.equal(false, `${account} ${c} ${s}`);
        }
      }
    });

    it("Hub still has no registered yield groups (wiring deferred to the wiring proposal)", async () => {
      expect(await hub.registeredYieldGroups()).to.deep.equal([]);
    });
  });
});
