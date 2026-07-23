import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_USDT,
  GUARDIAN,
  HUB_REGISTRY,
  HUB_USDT,
} from "../../vips/vip-680/addresses/bsctestnet";
import vip680Guardian from "../../vips/vip-680/bsctestnet-guardian";
import {
  CORE_FLUX_GOVERNANCE,
  FRV_GOVERNANCE,
  HUB_FULL,
  HUB_REGISTRY_GOVERNANCE,
  REALLOCATE,
} from "../../vips/vip-680/permissions";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

// bsctestnet block after the Liquidity Hub (USDT) redeployment and the FRV vault creation.
const BLOCK_NUMBER = 119474506;

const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// Every (contract, sig) pair this testnet-only proposal grants to the Guardian: 19 Hub (18 governance +
// operator-only reallocate) + 11 Core + 9 FRV + 11 Flux + 2 Registry = 52.
const GUARDIAN_GRANTS: [string, string][] = [
  ...HUB_FULL.map((s): [string, string] => [HUB_USDT, s]),
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
    it("this proposal grants exactly 52 (contract, sig) pairs to the Guardian", () => {
      expect(GUARDIAN_GRANTS.length).to.equal(52);
    });

    it("Guardian holds none of the roles this proposal grants", async () => {
      for (const [c, s] of GUARDIAN_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), GUARDIAN)).to.equal(false, `pre ${c} ${s}`);
      }
    });
  });

  testVip("VIP-680 [BNB Testnet] Liquidity Hub (USDT) Guardian full permissions", await vip680Guardian(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [52]);
    },
  });

  describe("Post-VIP state", () => {
    it("Guardian now holds every role this proposal grants", async () => {
      for (const [c, s] of GUARDIAN_GRANTS) {
        expect(await acm.hasRole(roleId(c, s), GUARDIAN)).to.equal(true, `post ${c} ${s}`);
      }
    });

    it("Guardian holds the operator-only reallocate role on the Hub (full set, testnet)", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, REALLOCATE), GUARDIAN)).to.equal(true);
    });

    it("Guardian can loosen on every target (the point of this testnet proposal)", async () => {
      expect(await acm.hasRole(roleId(HUB_USDT, "addYieldGroup(address,uint256,uint16)"), GUARDIAN)).to.equal(true);
      for (const source of [CORE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT]) {
        expect(await acm.hasRole(roleId(source, "addResource(address,address)"), GUARDIAN)).to.equal(
          true,
          `addResource @ ${source}`,
        );
      }
      expect(await acm.hasRole(roleId(HUB_REGISTRY, "addHub(address)"), GUARDIAN)).to.equal(true);
    });
  });
});
