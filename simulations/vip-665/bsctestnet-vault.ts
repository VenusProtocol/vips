import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, {
  CALLERS,
  CREATE_VAULT_OLD,
  INSTITUTIONAL_VAULT_CONTROLLER,
  NEW_CONTROLLER_IMPLEMENTATION,
  NEW_PERMISSIONS,
  NEW_VAULT_IMPLEMENTATION,
  OLD_CONTROLLER_IMPLEMENTATION,
  OLD_VAULT_IMPLEMENTATION,
  PROXY_ADMIN,
} from "../../vips/vip-665/bsctestnet-vault";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import INSTITUTIONAL_LOAN_VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { NORMAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } = NETWORK_ADDRESSES.bsctestnet;

// After both VPD-1488 implementations were deployed on testnet; VIP-665 not executed yet.
const FORK_BLOCK = 116582000;

const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

const LEGACY_INSTITUTION = "0x000000000000000000000000000000000000beef";

// Pre-VPD-1488 createVault (5 params, no institutionName), for seeding a legacy clone.
const OLD_CONTROLLER_ABI = [
  "function createVault((address,uint256,uint256,uint256,uint256,uint256,uint40,uint40,uint40),(address,uint256,uint256,address,uint256),(uint256,uint256,uint256),string,string) returns (address)",
];

forking(FORK_BLOCK, async () => {
  let controller: Contract;
  let proxyAdmin: Contract;
  let accessControlManager: Contract;

  let legacyVault: string;
  let pre: Record<string, unknown>;

  before(async () => {
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    accessControlManager = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
  });

  describe("Pre-VIP: system under governance, implementations not yet upgraded", () => {
    it("controller proxy should still point to the old implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
        OLD_CONTROLLER_IMPLEMENTATION,
      );
    });

    it("controller vaultImplementation should still be the old vault impl", async () => {
      expect(await controller.vaultImplementation()).to.equal(OLD_VAULT_IMPLEMENTATION);
    });

    it("controller should be owned by the Normal timelock (VIP-627 addendum executed)", async () => {
      expect(await controller.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("all callers should hold the OLD createVault permission (to be revoked by this VIP)", async () => {
      for (const caller of CALLERS) {
        expect(await accessControlManager.hasPermission(caller, INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD)).to.be
          .true;
      }
    });

    it("no caller should yet hold the new createVault / setInstitutionName / override permissions", async () => {
      for (const fn of NEW_PERMISSIONS) {
        for (const caller of CALLERS) {
          expect(await accessControlManager.hasPermission(caller, INSTITUTIONAL_VAULT_CONTROLLER, fn)).to.be.false;
        }
      }
    });

    it("both new implementations should be deployed", async () => {
      expect(await ethers.provider.getCode(NEW_CONTROLLER_IMPLEMENTATION)).to.not.equal("0x");
      expect(await ethers.provider.getCode(NEW_VAULT_IMPLEMENTATION)).to.not.equal("0x");
    });
  });

  // This legacy clone is reused post-upgrade to check backward compatibility with old-impl vaults.
  describe("Pre-VIP: seed a legacy (old-impl) vault clone and snapshot controller storage", () => {
    it("Guardian can create a vault on the OLD controller/vault implementation", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      const legacyController = new ethers.Contract(INSTITUTIONAL_VAULT_CONTROLLER, OLD_CONTROLLER_ABI, ethers.provider);

      const ONE_DAY = 24 * 60 * 60;
      // prettier-ignore
      const vaultConfig = [
        USDT, 500, parseEther("0.1"), parseEther("1000"), parseEther("10000000"),
        parseEther("100"), 7 * ONE_DAY, 30 * ONE_DAY, ONE_DAY,
      ];
      // OLD 5-field InstitutionalConfig — no institutionName.
      const oldInstConfig = [USDC, parseEther("100000"), parseEther("0.8"), LEGACY_INSTITUTION, 0];
      const riskConfig = [parseEther("0.85"), parseEther("1.08"), parseEther("1.15")];

      legacyVault = await legacyController
        .connect(guardian)
        .callStatic.createVault(vaultConfig, oldInstConfig, riskConfig, "Legacy Vault Share", "lvUSDT");
      await (
        await legacyController
          .connect(guardian)
          .createVault(vaultConfig, oldInstConfig, riskConfig, "Legacy Vault Share", "lvUSDT")
      ).wait();

      expect(await ethers.provider.getCode(legacyVault)).to.not.equal("0x");
      expect(await controller.isRegistered(legacyVault)).to.be.true;
      expect((await ethers.provider.getCode(legacyVault)).toLowerCase()).to.contain(
        OLD_VAULT_IMPLEMENTATION.slice(2).toLowerCase(),
      );
    });

    it("snapshots the controller's persistent storage before the upgrade", async () => {
      pre = {
        liquidationAdapter: await controller.liquidationAdapter(),
        oracle: await controller.oracle(),
        protocolShareReserve: await controller.protocolShareReserve(),
        comptroller: await controller.comptroller(),
        treasury: await controller.treasury(),
        owner: await controller.owner(),
        allVaultsLength: (await controller.allVaultsLength()).toString(),
        firstVault: await controller.allVaults(0),
        institutionNonce: (await controller.institutionNonce(LEGACY_INSTITUTION)).toString(),
      };
      expect(pre.firstVault).to.equal(legacyVault);
    });
  });

  testVip("VIP-665 [BNB Chain Testnet] Upgrade Institutional Fixed Rate Vault implementations", await vip665(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [INSTITUTIONAL_VAULT_CONTROLLER_ABI], ["VaultImplementationUpdated"], [1]);
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["PermissionGranted", "PermissionRevoked"],
        [NEW_PERMISSIONS.length * CALLERS.length, CALLERS.length],
      );
    },
  });

  describe("Post-VIP: implementations upgraded", () => {
    it("controller proxy should point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(INSTITUTIONAL_VAULT_CONTROLLER)).to.equal(
        NEW_CONTROLLER_IMPLEMENTATION,
      );
    });

    it("controller vaultImplementation should be the new vault impl", async () => {
      expect(await controller.vaultImplementation()).to.equal(NEW_VAULT_IMPLEMENTATION);
    });

    it("controller state should be preserved (owner = Normal timelock)", async () => {
      expect(await controller.owner()).to.equal(NORMAL_TIMELOCK);
    });
  });

  describe("Post-VIP: controller storage layout preserved across the upgrade", () => {
    it("every persistent controller slot is unchanged after the upgrade", async () => {
      expect(await controller.liquidationAdapter()).to.equal(pre.liquidationAdapter);
      expect(await controller.oracle()).to.equal(pre.oracle);
      expect(await controller.protocolShareReserve()).to.equal(pre.protocolShareReserve);
      expect(await controller.comptroller()).to.equal(pre.comptroller);
      expect(await controller.treasury()).to.equal(pre.treasury);
      expect(await controller.owner()).to.equal(pre.owner);
      expect((await controller.allVaultsLength()).toString()).to.equal(pre.allVaultsLength);
      expect(await controller.allVaults(0)).to.equal(pre.firstVault);
      expect((await controller.institutionNonce(LEGACY_INSTITUTION)).toString()).to.equal(pre.institutionNonce);
      expect(await controller.isRegistered(legacyVault)).to.be.true;
    });
  });

  describe("Post-VIP: ACM permissions updated", () => {
    it("every caller now holds the new createVault / setInstitutionName / setInstitutionNameOverride permissions", async () => {
      for (const fn of NEW_PERMISSIONS) {
        for (const caller of CALLERS) {
          expect(await accessControlManager.hasPermission(caller, INSTITUTIONAL_VAULT_CONTROLLER, fn)).to.be.true;
        }
      }
    });

    it("the old createVault permission is revoked for every caller", async () => {
      for (const caller of CALLERS) {
        expect(await accessControlManager.hasPermission(caller, INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD)).to.be
          .false;
      }
    });
  });

  describe("Post-VIP: upgraded controller vs the legacy (old-impl) clone", () => {
    it("getAggregatedVaultStates() reverts while the legacy clone has no name override", async () => {
      await expect(controller.getAggregatedVaultStates()).to.be.reverted;
    });

    it("setInstitutionName() on a legacy clone reverts (no on-chain institutionName field)", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      await expect(controller.connect(guardian).setInstitutionName(legacyVault, "Legacy Renamed")).to.be.reverted;
    });

    it("Guardian can set an institutionNameOverride for the legacy clone", async () => {
      const guardian = await initMainnetUser(GUARDIAN, parseEther("1"));
      await controller.connect(guardian).setInstitutionNameOverride(legacyVault, "Legacy Institution");
      expect(await controller.institutionNameOverride(legacyVault)).to.equal("Legacy Institution");
    });

    it("getAggregatedVaultStates() works once the override is set, returning the override name", async () => {
      const states = await controller.getAggregatedVaultStates();
      const legacyState = states.find((s: { vault: string }) => s.vault.toLowerCase() === legacyVault.toLowerCase());
      expect(legacyState.institutionName).to.equal("Legacy Institution");
    });
  });

  describe("Post-VIP: new vault implementation stores a standalone institutionName", () => {
    const TEST_INSTITUTION = "0x000000000000000000000000000000000000D00d";
    const INSTITUTION_NAME = "Acme Capital Test Vault";
    const RENAMED = "Acme Capital (Renamed)";
    const ONE_DAY = 24 * 60 * 60;

    const vaultConfig = {
      supplyAsset: USDT,
      fixedAPY: 500, // 5% expressed in BPS (MAX_APY_BPS = 10000)
      reserveFactor: parseEther("0.1"),
      minBorrowCap: parseEther("1000"),
      maxBorrowCap: parseEther("10000000"),
      minSupplierDeposit: parseEther("100"),
      openDuration: 7 * ONE_DAY,
      lockDuration: 30 * ONE_DAY,
      settlementWindow: ONE_DAY,
    };
    // InstitutionalConfig is now 5 fields — institutionName is passed separately to createVault.
    const instConfig = {
      collateralAsset: USDC,
      idealCollateralAmount: parseEther("100000"),
      marginRate: parseEther("0.8"), // must be <= MANTISSA_ONE
      institutionOperator: TEST_INSTITUTION,
      positionTokenId: 0, // assigned by the controller on creation
    };
    const riskConfig = {
      liquidationThreshold: parseEther("0.85"),
      liquidationIncentive: parseEther("1.08"),
      latePenaltyRate: parseEther("1.15"),
    };

    let guardian: Signer;
    let vaultAddress: string;

    before(async () => {
      guardian = await initMainnetUser(GUARDIAN, parseEther("1"));

      // Predict the clone address (callStatic doesn't advance the nonce), then create it.
      vaultAddress = await controller
        .connect(guardian)
        .callStatic.createVault(vaultConfig, instConfig, riskConfig, "Acme Vault Share", "avUSDT", INSTITUTION_NAME);
      await (
        await controller
          .connect(guardian)
          .createVault(vaultConfig, instConfig, riskConfig, "Acme Vault Share", "avUSDT", INSTITUTION_NAME)
      ).wait();
    });

    it("createVault (new signature) should deploy a registered vault clone", async () => {
      expect(await ethers.provider.getCode(vaultAddress)).to.not.equal("0x");
      expect(await controller.isRegistered(vaultAddress)).to.be.true;
    });

    it("the new vault should expose the standalone institutionName() set at creation", async () => {
      const vault = new ethers.Contract(vaultAddress, INSTITUTIONAL_LOAN_VAULT_ABI, ethers.provider);
      expect(await vault.institutionName()).to.equal(INSTITUTION_NAME);
    });

    it("Guardian can rename the institution via setInstitutionName (permission granted by this VIP)", async () => {
      await controller.connect(guardian).setInstitutionName(vaultAddress, RENAMED);
      const vault = new ethers.Contract(vaultAddress, INSTITUTIONAL_LOAN_VAULT_ABI, ethers.provider);
      expect(await vault.institutionName()).to.equal(RENAMED);
    });

    it("getAggregatedVaultStates() resolves the new vault's own name (no override needed)", async () => {
      const states = await controller.getAggregatedVaultStates();
      const newState = states.find((s: { vault: string }) => s.vault.toLowerCase() === vaultAddress.toLowerCase());
      expect(newState.institutionName).to.equal(RENAMED);
    });
  });
});
