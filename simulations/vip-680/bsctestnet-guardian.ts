import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_SOURCE_OPERATOR_SIGS,
  CORE_SOURCE_USDT,
  FLUX_SOURCE_USDT,
  FRV_SOURCE_GOVERNANCE_SIGS,
  FRV_SOURCE_USDT,
  HUB_OPERATOR_SIGS,
  HUB_USDT,
} from "../../vips/vip-680/bsctestnet";
import vip680Guardian, {
  CORE_SOURCE_GOVERNANCE_ONLY_SIGS,
  FLUX_SOURCE_GOVERNANCE_SIGS,
  HUB_GOVERNANCE_ONLY_SIGS,
} from "../../vips/vip-680/bsctestnet-guardian";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { GUARDIAN, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bsctestnet;

// bsctestnet block after the Liquidity Hub (USDT) deployment (deploy block ~117918419).
const BLOCK_NUMBER = 117930000;

// The exact ACM role id `giveCallPermission(contract, sig, account)` grants:
// keccak256(abi.encodePacked(contract, functionSig)). Asserting `hasRole` on this specific role is
// immune to the `isAllowedToCall` wildcard fallback (a role granted against address(0)), so pre-VIP
// "not granted" checks cannot be masked by an unrelated wildcard permission.
const roleId = (contract: string, sig: string) =>
  ethers.utils.solidityKeccak256(["address", "string"], [contract, sig]);

// Every (contract, sig) pair this proposal grants to the Guardian. 12 + 7 + 9 + 11 = 39.
const GUARDIAN_GRANTS: [string, string][] = [
  ...HUB_GOVERNANCE_ONLY_SIGS.map((sig): [string, string] => [HUB_USDT, sig]),
  ...CORE_SOURCE_GOVERNANCE_ONLY_SIGS.map((sig): [string, string] => [CORE_SOURCE_USDT, sig]),
  ...FRV_SOURCE_GOVERNANCE_SIGS.map((sig): [string, string] => [FRV_SOURCE_USDT, sig]),
  ...FLUX_SOURCE_GOVERNANCE_SIGS.map((sig): [string, string] => [FLUX_SOURCE_USDT, sig]),
];

forking(BLOCK_NUMBER, async () => {
  let acm: Contract;

  before(async () => {
    acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACCESS_CONTROL_MANAGER);
  });

  describe("Pre-VIP state", () => {
    it("this proposal grants exactly 39 (contract, sig) pairs to the Guardian", () => {
      // 12 Hub gov-only + 7 Core gov-only + 9 FRV + 11 Flux.
      expect(GUARDIAN_GRANTS.length).to.equal(39);
    });

    it("Guardian holds none of the governance roles this proposal grants", async () => {
      for (const [contract, sig] of GUARDIAN_GRANTS) {
        expect(await acm.hasRole(roleId(contract, sig), GUARDIAN)).to.equal(false, `pre ${contract} ${sig}`);
      }
    });

    it("Guardian holds no role on the FRV or Flux sources yet", async () => {
      for (const sig of FRV_SOURCE_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(FRV_SOURCE_USDT, sig), GUARDIAN)).to.equal(false, `pre FRV ${sig}`);
      }
      for (const sig of FLUX_SOURCE_GOVERNANCE_SIGS) {
        expect(await acm.hasRole(roleId(FLUX_SOURCE_USDT, sig), GUARDIAN)).to.equal(false, `pre Flux ${sig}`);
      }
    });
  });

  testVip("VIP-680 [BNB Testnet] Liquidity Hub (USDT) Guardian full permissions", await vip680Guardian(), {
    callbackAfterExecution: async txResponse => {
      // 12 Hub gov-only + 7 Core gov-only + 9 FRV + 11 Flux = 39 RoleGranted events.
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleGranted"], [39]);
    },
  });

  describe("Post-VIP permissions", () => {
    it("Guardian now holds every governance role this proposal grants", async () => {
      for (const [contract, sig] of GUARDIAN_GRANTS) {
        expect(await acm.hasRole(roleId(contract, sig), GUARDIAN)).to.equal(true, `post ${contract} ${sig}`);
      }
    });

    it("Guardian can now add resources / yield groups (loosening) on every target", async () => {
      // The whole point of this testnet proposal: the Guardian holds the route-creating (governance)
      // roles the mainnet asymmetric model reserves for the timelocks.
      expect(await acm.hasRole(roleId(HUB_USDT, "addYieldGroup(address,uint256,uint16)"), GUARDIAN)).to.equal(true);
      for (const source of [CORE_SOURCE_USDT, FRV_SOURCE_USDT, FLUX_SOURCE_USDT]) {
        expect(await acm.hasRole(roleId(source, "addResource(address,address)"), GUARDIAN)).to.equal(
          true,
          `addResource @ ${source}`,
        );
      }
    });

    it("does not grant the operator-only Hub roles (those come from the main VIP-680 proposal)", async () => {
      // This file grants only the Governance(-only) signatures. The Operator/tighten set — including
      // the operator-only `reallocate` and the shared queue/pause signatures — is granted to the
      // Guardian by the main VIP-680 proposal, so on this standalone fork it stays ungranted here.
      for (const sig of HUB_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(HUB_USDT, sig), GUARDIAN)).to.equal(false, `Hub op not granted here: ${sig}`);
      }
      for (const sig of CORE_SOURCE_OPERATOR_SIGS) {
        expect(await acm.hasRole(roleId(CORE_SOURCE_USDT, sig), GUARDIAN)).to.equal(
          false,
          `Core op not granted here: ${sig}`,
        );
      }
    });
  });
});
