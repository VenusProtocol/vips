import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
  ACM_AGGREGATOR,
  DEFAULT_ADMIN_ROLE,
  EXPECTED_PERMISSION_GRANTED_EVENTS,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_POSITION_TOKEN,
  LIQUIDATION_ADAPTER,
  LIQUIDATOR_WHITELIST,
  PERMISSION_ENTRIES,
  SETTLER_WHITELIST,
} from "../../vips/vip-664/bscmainnet";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import INSTITUTION_POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATION_ADAPTER_ABI from "./abi/LiquidationAdapter.json";

const {
  NORMAL_TIMELOCK: NORMAL,
  FAST_TRACK_TIMELOCK: FAST_TRACK,
  CRITICAL_TIMELOCK: CRITICAL,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bscmainnet;

const FORK_BLOCK = 96701105;

// To make test names readable.
const LABEL: Record<string, string> = {
  [NORMAL]: "Normal",
  [FAST_TRACK]: "FastTrack",
  [CRITICAL]: "Critical",
  [GUARDIAN]: "Guardian",
};

forking(FORK_BLOCK, async () => {
  let accessControlManager: Contract;
  let controller: Contract;
  let liquidationAdapter: Contract;
  let positionToken: Contract;

  before(async () => {
    accessControlManager = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    liquidationAdapter = new ethers.Contract(LIQUIDATION_ADAPTER, LIQUIDATION_ADAPTER_ABI, ethers.provider);
    positionToken = new ethers.Contract(INSTITUTION_POSITION_TOKEN, INSTITUTION_POSITION_TOKEN_ABI, ethers.provider);
  });

  // Contracts deployed and deploy-script state is in place.
  describe("Pre-VIP: verify deployments", () => {
    it("InstitutionalVaultController proxy should be deployed", async () => {
      expect(await ethers.provider.getCode(INSTITUTIONAL_VAULT_CONTROLLER)).to.not.equal("0x");
    });

    it("LiquidationAdapter proxy should be deployed", async () => {
      expect(await ethers.provider.getCode(LIQUIDATION_ADAPTER)).to.not.equal("0x");
    });

    it("InstitutionPositionToken should be deployed", async () => {
      expect(await ethers.provider.getCode(INSTITUTION_POSITION_TOKEN)).to.not.equal("0x");
    });

    it("InstitutionPositionToken pendingOwner should be the controller proxy", async () => {
      expect(await positionToken.pendingOwner()).to.equal(INSTITUTIONAL_VAULT_CONTROLLER);
    });

    it("controller pendingOwner should be Normal timelock", async () => {
      expect(await controller.pendingOwner()).to.equal(NORMAL);
    });

    it("liquidationAdapter pendingOwner should be Normal timelock", async () => {
      expect(await liquidationAdapter.pendingOwner()).to.equal(NORMAL);
    });

    it("liquidationAdapter protocolLiquidationShare should be 0.5e18", async () => {
      expect(await liquidationAdapter.protocolLiquidationShare()).to.equal(parseEther("0.5"));
    });

    it("liquidationAdapter closeFactor should be 0.5e18", async () => {
      expect(await liquidationAdapter.closeFactor()).to.equal(parseEther("0.5"));
    });

    it("controller liquidationAdapter should be address(0) before VIP", async () => {
      expect(await controller.liquidationAdapter()).to.equal(ethers.constants.AddressZero);
    });
  });

  // None of the planned grants exist yet.
  describe("Pre-VIP: ACM permissions not yet granted", () => {
    for (const { target, fn, callers } of PERMISSION_ENTRIES) {
      for (const account of callers) {
        it(`${LABEL[account]} should NOT yet have permission: ${fn} on ${target}`, async () => {
          expect(await accessControlManager.hasPermission(account, target, fn)).to.be.false;
        });
      }
    }
  });

  testVip("VIP-664 [BNB Chain] Configure Institutional Fixed Rate Vault System", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted", "RoleGranted", "RoleRevoked"],
        [EXPECTED_PERMISSION_GRANTED_EVENTS, EXPECTED_PERMISSION_GRANTED_EVENTS + 1, 1],
      );
      await expectEvents(
        txResponse,
        [ACM_AGGREGATOR_ABI],
        ["GrantPermissionsAdded", "GrantPermissionsExecuted"],
        [1, 1],
      );
    },
  });

  // Every planned grant is now active.
  describe("Post-VIP: ACM permissions granted", () => {
    for (const { target, fn, callers } of PERMISSION_ENTRIES) {
      for (const account of callers) {
        it(`${LABEL[account]} should have permission: ${fn} on ${target}`, async () => {
          expect(await accessControlManager.hasPermission(account, target, fn)).to.be.true;
        });
      }
    }
  });

  // Ownership accepted, adapter wired, admin role revoked.
  describe("Post-VIP: ownership and wiring", () => {
    it("controller owner should be Normal timelock", async () => {
      expect(await controller.owner()).to.equal(NORMAL);
    });

    it("liquidationAdapter owner should be Normal timelock", async () => {
      expect(await liquidationAdapter.owner()).to.equal(NORMAL);
    });

    it("InstitutionPositionToken owner should be the controller proxy", async () => {
      expect(await positionToken.owner()).to.equal(INSTITUTIONAL_VAULT_CONTROLLER);
    });

    it("controller liquidationAdapter should be set to the adapter proxy", async () => {
      expect(await controller.liquidationAdapter()).to.equal(LIQUIDATION_ADAPTER);
    });

    it("DEFAULT_ADMIN_ROLE should be revoked from ACM Aggregator", async () => {
      expect(await accessControlManager.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
    });
  });

  // Dedicated operator addresses whitelisted; Guardian explicitly is not.
  describe("Post-VIP: liquidator/settler whitelists", () => {
    for (const account of LIQUIDATOR_WHITELIST) {
      it(`${account} should be a whitelisted liquidator`, async () => {
        expect(await liquidationAdapter.liquidatorWhitelist(account)).to.be.true;
      });
    }
    it("GUARDIAN should NOT be a whitelisted liquidator", async () => {
      expect(await liquidationAdapter.liquidatorWhitelist(GUARDIAN)).to.be.false;
    });

    for (const account of SETTLER_WHITELIST) {
      it(`${account} should be a whitelisted settler`, async () => {
        expect(await liquidationAdapter.settlerWhitelist(account)).to.be.true;
      });
    }
    it("GUARDIAN should NOT be a whitelisted settler", async () => {
      expect(await liquidationAdapter.settlerWhitelist(GUARDIAN)).to.be.false;
    });
  });
});
