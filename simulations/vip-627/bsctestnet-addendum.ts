import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664TestnetAddendum, {
  ACM_AGGREGATOR,
  ACM_AGGREGATOR_INDEX,
  DEFAULT_ADMIN_ROLE,
  EXPECTED_PERMISSION_GRANTED_EVENTS,
  INSTITUTIONAL_VAULT_CONTROLLER,
  INSTITUTION_POSITION_TOKEN,
  LIQUIDATION_ADAPTER,
  LIQUIDATOR_WHITELIST,
  NEW_PSR_IMPLEMENTATION,
  PERMISSIONS,
  PERMISSION_ENTRIES,
  PROTOCOL_SHARE_RESERVE,
  PROXY_ADMIN,
  SETTLER_WHITELIST,
} from "../../vips/vip-627/bsctestnet-addendum";
import ACM_AGGREGATOR_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import INSTITUTION_POSITION_TOKEN_ABI from "./abi/InstitutionPositionToken.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LIQUIDATION_ADAPTER_ABI from "./abi/LiquidationAdapter.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const {
  NORMAL_TIMELOCK: NORMAL,
  FAST_TRACK_TIMELOCK: FAST_TRACK,
  CRITICAL_TIMELOCK: CRITICAL,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bsctestnet;

const FORK_BLOCK = 109840621;

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
  let acmAggregator: Contract;
  let proxyAdmin: Contract;

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
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
  });

  // Contracts redeployed and deploy-script state is in place.
  describe("Pre-VIP: verify redeployments", () => {
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

    it("ProtocolShareReserve should not yet point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE)).to.not.equal(NEW_PSR_IMPLEMENTATION);
    });
  });

  // Permissions are pre-loaded but not yet applied to the ACM.
  describe("Pre-VIP: ACM permissions not yet granted", () => {
    it("aggregator should hold the pre-loaded batch at ACM_AGGREGATOR_INDEX", async () => {
      for (let i = 0; i < PERMISSIONS.length; i++) {
        const stored = await acmAggregator.grantPermissions(ACM_AGGREGATOR_INDEX, i);
        expect(stored.contractAddress.toLowerCase()).to.equal(PERMISSIONS[i][0].toLowerCase());
        expect(stored.functionSig).to.equal(PERMISSIONS[i][1]);
        expect(stored.account.toLowerCase()).to.equal(PERMISSIONS[i][2].toLowerCase());
      }
    });

    for (const { target, fn, callers } of PERMISSION_ENTRIES) {
      for (const account of callers) {
        it(`${LABEL[account] ?? account} should NOT yet have permission: ${fn} on ${target}`, async () => {
          expect(await accessControlManager.hasPermission(account, target, fn)).to.be.false;
        });
      }
    }
  });

  testVip(
    "VIP-664 Addendum [BNB Chain Testnet] Configure redeployed Institutional Fixed Rate Vault System",
    await vip664TestnetAddendum(),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(
          txResponse,
          [ACCESS_CONTROL_MANAGER_ABI],
          ["PermissionGranted", "RoleGranted", "RoleRevoked"],
          [EXPECTED_PERMISSION_GRANTED_EVENTS, EXPECTED_PERMISSION_GRANTED_EVENTS + 1, 1],
        );
        await expectEvents(txResponse, [ACM_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
      },
    },
  );

  // Every planned grant is now active.
  describe("Post-VIP: ACM permissions granted", () => {
    for (const { target, fn, callers } of PERMISSION_ENTRIES) {
      for (const account of callers) {
        it(`${LABEL[account] ?? account} should have permission: ${fn} on ${target}`, async () => {
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

    it("ProtocolShareReserve should point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE)).to.equal(NEW_PSR_IMPLEMENTATION);
    });
  });

  // Dedicated operator addresses whitelisted.
  describe("Post-VIP: liquidator/settler whitelists", () => {
    for (const account of LIQUIDATOR_WHITELIST) {
      it(`${LABEL[account] ?? account} should be a whitelisted liquidator`, async () => {
        expect(await liquidationAdapter.isWhitelistedLiquidator(account)).to.be.true;
      });
    }

    for (const account of SETTLER_WHITELIST) {
      it(`${LABEL[account] ?? account} should be a whitelisted settler`, async () => {
        expect(await liquidationAdapter.isWhitelistedSettler(account)).to.be.true;
      });
    }
  });

  describe("Post-VIP: createVault ACM gating", () => {
    const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
    const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

    const ONE_DAY = 24 * 60 * 60;
    const vaultConfig = {
      supplyAsset: USDT,
      fixedAPY: parseEther("0.05"), // 5% APY
      reserveFactor: parseEther("0.1"), // 10%
      minBorrowCap: parseEther("1000"), // 1,000 USDT
      maxBorrowCap: parseEther("10000000"), // 10M USDT
      minSupplierDeposit: parseEther("100"), // 100 USDT
      openDuration: 7 * ONE_DAY, // 7 days
      lockDuration: 30 * ONE_DAY, // 30 days
      settlementWindow: ONE_DAY, // 1 day
    };
    const instConfig = {
      collateralAsset: USDC,
      idealCollateralAmount: parseEther("100000"), // 100k USDC
      marginRate: parseEther("1.5"),
      institutionOperator: GUARDIAN,
      positionTokenId: 1,
    };
    const riskConfig = {
      liquidationThreshold: parseEther("0.85"), // 85%
      liquidationIncentive: parseEther("1.08"), // 8% incentive
      latePenaltyRate: parseEther("1.15"), // 15% late penalty
    };

    it("unauthorized caller should revert when trying to create vault", async () => {
      const stranger = await initMainnetUser(
        "0x000000000000000000000000000000000000dEaD",
        ethers.utils.parseEther("1"),
      );
      await expect(
        controller.connect(stranger).createVault(vaultConfig, instConfig, riskConfig, "Test", "TEST"),
      ).to.be.revertedWithCustomError(controller, "Unauthorized");
    });

    it("Guardian should be able to create vault", async () => {
      const guardian = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      const call = controller.connect(guardian).createVault(vaultConfig, instConfig, riskConfig, "Test", "TEST");
      await expect(call).to.not.be.revertedWithCustomError(controller, "Unauthorized");
    });
  });
});
