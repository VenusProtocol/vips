import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_SOURCE_USDT,
  CRITICAL_TIMELOCK,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  HUB_REGISTRY,
  HUB_USDT,
} from "../../vips/vip-680/addresses/bsctestnet";
import vip680Critical from "../../vips/vip-680/bsctestnet-critical";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_GOVERNANCE,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-680/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

// bsctestnet block after the Liquidity Hub (USDT) redeployment and the FRV vault creation.
const BLOCK_NUMBER = 119474506;

const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// The 51 (contract, sig) pairs granted to the Critical timelock: 18 Hub + 11 Core + 9 FRV + 11 Flux +
// 2 Registry.
const GOV_GRANTS: [string, string][] = [
  ...HUB_GOVERNANCE.map((s): [string, string] => [HUB_USDT, s]),
  ...CORE_FLUX_GOVERNANCE.map((s): [string, string] => [CORE_SOURCE_USDT, s]),
  ...FRV_GOVERNANCE.map((s): [string, string] => [FRV_SOURCE_USDT, s]),
  ...CORE_FLUX_GOVERNANCE.map((s): [string, string] => [FLUX_SOURCE_USDT, s]),
  ...HUB_REGISTRY_GOVERNANCE.map((s): [string, string] => [HUB_REGISTRY, s]),
];

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
  });

  describe("Pre-VIP state", () => {
    it("Critical timelock holds none of the governance roles this proposal grants", async () => {
      for (const [c, s] of GOV_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), CRITICAL_TIMELOCK)).to.equal(false, `pre ${c} ${s}`);
      }
    });
  });

  testVip("VIP-680 [BNB Testnet] Liquidity Hub (USDT) Critical timelock permissions", await vip680Critical(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [51]);
    },
  });

  describe("Post-VIP state", () => {
    it("Critical timelock holds the full governance set across the stack", async () => {
      for (const [c, s] of GOV_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), CRITICAL_TIMELOCK)).to.equal(true, `post ${c} ${s}`);
      }
    });

    it("Critical timelock does NOT hold the operator-only reallocate role", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE), CRITICAL_TIMELOCK)).to.equal(false);
    });
  });
});
