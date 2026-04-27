import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  ACM_AGGREGATOR,
  ACM_AGGREGATOR_INDEX,
  ADAPTER_FUNCTIONS,
  ADAPTER_GUARDIAN_FUNCTIONS,
  CONTROLLER_FUNCTIONS,
  CONTROLLER_GUARDIAN_FUNCTIONS,
  DEFAULT_ADMIN_ROLE,
  EXPECTED_PERMISSION_GRANTED_EVENTS,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_POSITION_TOKEN,
  LIQUIDATION_ADAPTER,
  PERMISSIONS,
} from "../../vips/vip-664/bsctestnet";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import INSTITUTION_POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATION_ADAPTER_ABI from "./abi/LiquidationAdapter.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } = bsctestnet;

const FORK_BLOCK = 102151520;

forking(FORK_BLOCK, async () => {
  let accessControlManager: Contract;
  let controller: Contract;
  let liquidationAdapter: Contract;
  let positionToken: Contract;
  let acmAggregator: Contract;

  before(async () => {
    accessControlManager = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    liquidationAdapter = new ethers.Contract(LIQUIDATION_ADAPTER, LIQUIDATION_ADAPTER_ABI, ethers.provider);
    positionToken = new ethers.Contract(INSTITUTION_POSITION_TOKEN, INSTITUTION_POSITION_TOKEN_ABI, ethers.provider);
    acmAggregator = new ethers.Contract(ACM_AGGREGATOR, ACM_AGGREGATOR_ABI, ethers.provider);
  });

  // ──────────────────────────────────────────────────────────────────────
  // Pre-VIP: verify deployments
  // ──────────────────────────────────────────────────────────────────────
  // These checks confirm that all three contracts are deployed and that the
  // ownership transfer initiation (transferOwnership in the deploy script) has
  // been executed before the VIP runs.
  describe("Pre-VIP: verify deployments", () => {
    it("InstitutionalVaultController proxy should be deployed", async () => {
      const code = await ethers.provider.getCode(INSTITUTIONAL_VAULT_CONTROLLER);
      expect(code).to.not.equal("0x");
    });

    it("LiquidationAdapter proxy should be deployed", async () => {
      const code = await ethers.provider.getCode(LIQUIDATION_ADAPTER);
      expect(code).to.not.equal("0x");
    });

    it("InstitutionPositionToken should be deployed", async () => {
      const code = await ethers.provider.getCode(INSTITUTION_POSITION_TOKEN);
      expect(code).to.not.equal("0x");
    });

    it("InstitutionPositionToken pending owner should be the controller proxy (transferOwnership was called in deploy script)", async () => {
      const pendingOwner = await positionToken.pendingOwner();
      expect(pendingOwner).to.equal(INSTITUTIONAL_VAULT_CONTROLLER);
    });

    it("NORMAL_TIMELOCK should not yet have setLiquidationAdapter permission on controller", async () => {
      const allowed = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        INSTITUTIONAL_VAULT_CONTROLLER,
        "setLiquidationAdapter(address)",
      );
      expect(allowed).to.be.false;
    });

    it("NORMAL_TIMELOCK should not yet have acceptPositionTokenOwnership permission on controller", async () => {
      const allowed = await accessControlManager.hasPermission(
        NORMAL_TIMELOCK,
        INSTITUTIONAL_VAULT_CONTROLLER,
        "acceptPositionTokenOwnership()",
      );
      expect(allowed).to.be.false;
    });

    it("controller pendingOwner should be NORMAL_TIMELOCK (transferOwnership was called in deploy script)", async () => {
      const pendingOwner = await controller.pendingOwner();
      expect(pendingOwner).to.equal(NORMAL_TIMELOCK);
    });

    it("liquidationAdapter pendingOwner should be NORMAL_TIMELOCK (transferOwnership was called in deploy script)", async () => {
      const pendingOwner = await liquidationAdapter.pendingOwner();
      expect(pendingOwner).to.equal(NORMAL_TIMELOCK);
    });

    it("liquidationAdapter protocolLiquidationShare should be 0.5e18", async () => {
      const share = await liquidationAdapter.protocolLiquidationShare();
      expect(share).to.equal(parseEther("0.5"));
    });

    it("liquidationAdapter closeFactor should be 0.5e18", async () => {
      const factor = await liquidationAdapter.closeFactor();
      expect(factor).to.equal(parseEther("0.5"));
    });

    it("controller liquidationAdapter should be address(0) before VIP", async () => {
      const adapter = await controller.liquidationAdapter();
      expect(adapter).to.equal(ethers.constants.AddressZero);
    });

    it("ACM Aggregator stored permissions should match PERMISSIONS array", async () => {
      for (let i = 0; i < PERMISSIONS.length; i++) {
        const stored = await acmAggregator.grantPermissions(ACM_AGGREGATOR_INDEX, i);
        expect(stored.contractAddress.toLowerCase()).to.equal(
          PERMISSIONS[i][0].toLowerCase(),
          `Permission ${i} contractAddress mismatch`,
        );
        expect(stored.functionSig).to.equal(PERMISSIONS[i][1], `Permission ${i} functionSig mismatch`);
        expect(stored.account.toLowerCase()).to.equal(
          PERMISSIONS[i][2].toLowerCase(),
          `Permission ${i} account mismatch`,
        );
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────
  // VIP execution
  // ──────────────────────────────────────────────────────────────────────
  testVip("VIP-664 [BNB Chain Testnet] Configure Institutional Fixed Rate Vault System", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted", "RoleGranted", "RoleRevoked"],
        [EXPECTED_PERMISSION_GRANTED_EVENTS, EXPECTED_PERMISSION_GRANTED_EVENTS + 1, 1],
      );
      await expectEvents(txResponse, [ACM_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  // ──────────────────────────────────────────────────────────────────────
  // Post-VIP: ACM permission and system wiring checks
  // ──────────────────────────────────────────────────────────────────────

  describe("Post-VIP: verify setup", () => {
    describe("InstitutionalVaultController — NORMAL_TIMELOCK permissions", () => {
      for (const funcSig of CONTROLLER_FUNCTIONS) {
        it(`NORMAL_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(
            NORMAL_TIMELOCK,
            INSTITUTIONAL_VAULT_CONTROLLER,
            funcSig,
          );
          expect(allowed).to.be.true;
        });
      }
    });

    describe("InstitutionalVaultController — FAST_TRACK_TIMELOCK permissions", () => {
      for (const funcSig of CONTROLLER_FUNCTIONS) {
        it(`FAST_TRACK_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(
            FAST_TRACK_TIMELOCK,
            INSTITUTIONAL_VAULT_CONTROLLER,
            funcSig,
          );
          expect(allowed).to.be.true;
        });
      }
    });

    describe("InstitutionalVaultController — CRITICAL_TIMELOCK permissions", () => {
      for (const funcSig of CONTROLLER_FUNCTIONS) {
        it(`CRITICAL_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(
            CRITICAL_TIMELOCK,
            INSTITUTIONAL_VAULT_CONTROLLER,
            funcSig,
          );
          expect(allowed).to.be.true;
        });
      }
    });

    describe("InstitutionalVaultController — GUARDIAN permissions", () => {
      for (const funcSig of CONTROLLER_GUARDIAN_FUNCTIONS) {
        it(`GUARDIAN should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(GUARDIAN, INSTITUTIONAL_VAULT_CONTROLLER, funcSig);
          expect(allowed).to.be.true;
        });
      }
    });

    describe("LiquidationAdapter — NORMAL_TIMELOCK permissions", () => {
      for (const funcSig of ADAPTER_FUNCTIONS) {
        it(`NORMAL_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(NORMAL_TIMELOCK, LIQUIDATION_ADAPTER, funcSig);
          expect(allowed).to.be.true;
        });
      }
    });

    describe("LiquidationAdapter — CRITICAL_TIMELOCK permissions", () => {
      for (const funcSig of ADAPTER_FUNCTIONS) {
        it(`CRITICAL_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(CRITICAL_TIMELOCK, LIQUIDATION_ADAPTER, funcSig);
          expect(allowed).to.be.true;
        });
      }
    });

    describe("LiquidationAdapter — FAST_TRACK_TIMELOCK permissions", () => {
      for (const funcSig of ADAPTER_FUNCTIONS) {
        it(`FAST_TRACK_TIMELOCK should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(FAST_TRACK_TIMELOCK, LIQUIDATION_ADAPTER, funcSig);
          expect(allowed).to.be.true;
        });
      }
    });

    describe("LiquidationAdapter — GUARDIAN permissions", () => {
      for (const funcSig of ADAPTER_GUARDIAN_FUNCTIONS) {
        it(`GUARDIAN should have permission: ${funcSig}`, async () => {
          const allowed = await accessControlManager.hasPermission(GUARDIAN, LIQUIDATION_ADAPTER, funcSig);
          expect(allowed).to.be.true;
        });
      }
    });

    describe("Ownership acceptance", () => {
      it("controller owner should be NORMAL_TIMELOCK", async () => {
        const owner = await controller.owner();
        expect(owner).to.equal(NORMAL_TIMELOCK);
      });

      it("liquidationAdapter owner should be NORMAL_TIMELOCK", async () => {
        const owner = await liquidationAdapter.owner();
        expect(owner).to.equal(NORMAL_TIMELOCK);
      });
    });

    describe("ACM Aggregator cleanup", () => {
      it("DEFAULT_ADMIN_ROLE should be revoked from ACM Aggregator", async () => {
        expect(await accessControlManager.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
      });
    });

    describe("System wiring", () => {
      it("controller liquidationAdapter should be set to the adapter proxy", async () => {
        const adapter = await controller.liquidationAdapter();
        expect(adapter).to.equal(LIQUIDATION_ADAPTER);
      });

      it("InstitutionPositionToken owner should be the controller proxy (ownership accepted)", async () => {
        const owner = await positionToken.owner();
        expect(owner).to.equal(INSTITUTIONAL_VAULT_CONTROLLER);
      });
    });
  });
});
