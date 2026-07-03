import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip665, {
  AUTHORIZED_CALLERS,
  CREATE_VAULT_OLD,
  INSTITUTIONAL_VAULT_CONTROLLER,
  LEGACY_VAULT,
  LEGACY_VAULT_INSTITUTION_NAME,
  NEW_CONTROLLER_IMPLEMENTATION,
  NEW_PERMISSIONS,
  NEW_VAULT_IMPLEMENTATION,
  OLD_CONTROLLER_IMPLEMENTATION,
  OLD_VAULT_IMPLEMENTATION,
  PROXY_ADMIN,
} from "../../vips/vip-665/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import INSTITUTIONAL_LOAN_VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

const { NORMAL_TIMELOCK, CRITICAL_GUARDIAN, ACCESS_CONTROL_MANAGER, BINANCE_ORACLE } = NETWORK_ADDRESSES.bscmainnet;

const FORK_BLOCK = 107803362;

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// testVip advances the fork clock past the USDT/USDC feed stale windows, so createVault's oracle check
// would revert. Extend the stale period on every enabled leg of each asset so their prices stay valid.
const bumpStalePeriods = async (resilientOracleAddress: string, admin: string, assets: string[]) => {
  const RESILIENT_ORACLE_ABI = [
    "function getTokenConfig(address) view returns (tuple(address asset, address[3] oracles, bool[3] enableFlagsForOracles))",
  ];
  const ERC20_SYMBOL_ABI = ["function symbol() view returns (string)"];
  const resilientOracle = new ethers.Contract(resilientOracleAddress, RESILIENT_ORACLE_ABI, ethers.provider);
  for (const asset of assets) {
    const cfg = await resilientOracle.getTokenConfig(asset);
    for (let i = 0; i < 3; i++) {
      const leg = cfg.oracles[i];
      if (!cfg.enableFlagsForOracles[i] || leg === ethers.constants.AddressZero) continue;
      if (leg.toLowerCase() === BINANCE_ORACLE.toLowerCase()) {
        // Binance oracle keys by symbol.
        const symbol = await new ethers.Contract(asset, ERC20_SYMBOL_ABI, ethers.provider).symbol();
        await setMaxStalePeriodInBinanceOracle(leg, symbol);
      } else {
        // Chainlink-interface oracles (Chainlink, RedStone, ...) key by asset address.
        await setMaxStalePeriodInChainlinkOracle(leg, asset, ethers.constants.AddressZero, admin);
      }
    }
  }
};

forking(FORK_BLOCK, async () => {
  let controller: Contract;
  let proxyAdmin: Contract;
  let accessControlManager: Contract;

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

    it("controller should be owned by the Normal timelock (VIP-627 executed)", async () => {
      expect(await controller.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("there should be exactly one existing vault, and it should be the legacy vault to be overridden", async () => {
      expect((await controller.allVaultsLength()).toString()).to.equal("1");
      expect(await controller.allVaults(0)).to.equal(LEGACY_VAULT);
      expect(await controller.isRegistered(LEGACY_VAULT)).to.be.true;
    });

    it("the legacy vault predates the on-chain institutionName field (its own getter reverts)", async () => {
      const legacyVault = new ethers.Contract(LEGACY_VAULT, INSTITUTIONAL_LOAN_VAULT_ABI, ethers.provider);
      await expect(legacyVault.institutionName()).to.be.reverted;
    });

    it("all callers should hold the OLD createVault permission (to be revoked by this VIP)", async () => {
      for (const caller of AUTHORIZED_CALLERS) {
        expect(
          await accessControlManager.isAllowedToCall(caller, CREATE_VAULT_OLD, {
            from: INSTITUTIONAL_VAULT_CONTROLLER,
          }),
        ).to.be.true;
      }
    });

    it("no caller should yet hold the new createVault / setInstitutionName / override permissions", async () => {
      for (const fn of NEW_PERMISSIONS) {
        for (const caller of AUTHORIZED_CALLERS) {
          expect(await accessControlManager.isAllowedToCall(caller, fn, { from: INSTITUTIONAL_VAULT_CONTROLLER })).to.be
            .false;
        }
      }
    });

    it("both new implementations should be deployed", async () => {
      expect(await ethers.provider.getCode(NEW_CONTROLLER_IMPLEMENTATION)).to.not.equal("0x");
      expect(await ethers.provider.getCode(NEW_VAULT_IMPLEMENTATION)).to.not.equal("0x");
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
      };
    });
  });

  testVip("VIP-665 [BNB Chain] Upgrade Institutional Fixed Rate Vault implementations", await vip665(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [INSTITUTIONAL_VAULT_CONTROLLER_ABI],
        ["VaultImplementationUpdated", "InstitutionNameOverrideUpdated"],
        [1, 1],
      );
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [NEW_PERMISSIONS.length * AUTHORIZED_CALLERS.length, AUTHORIZED_CALLERS.length],
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
      expect(await controller.isRegistered(LEGACY_VAULT)).to.be.true;
    });
  });

  describe("Post-VIP: ACM permissions updated", () => {
    it("every caller now holds the new createVault / setInstitutionName / setInstitutionNameOverride permissions", async () => {
      for (const fn of NEW_PERMISSIONS) {
        for (const caller of AUTHORIZED_CALLERS) {
          expect(await accessControlManager.isAllowedToCall(caller, fn, { from: INSTITUTIONAL_VAULT_CONTROLLER })).to.be
            .true;
        }
      }
    });

    it("the old createVault permission is revoked for every caller", async () => {
      for (const caller of AUTHORIZED_CALLERS) {
        expect(
          await accessControlManager.isAllowedToCall(caller, CREATE_VAULT_OLD, {
            from: INSTITUTIONAL_VAULT_CONTROLLER,
          }),
        ).to.be.false;
      }
    });
  });

  describe("Post-VIP: legacy vault no longer breaks getAggregatedVaultStates()", () => {
    it("the legacy vault's own institutionName() still reverts (immutable old clone)", async () => {
      const legacyVault = new ethers.Contract(LEGACY_VAULT, INSTITUTIONAL_LOAN_VAULT_ABI, ethers.provider);
      await expect(legacyVault.institutionName()).to.be.reverted;
    });

    it("this VIP set the legacy vault's institutionNameOverride", async () => {
      expect(await controller.institutionNameOverride(LEGACY_VAULT)).to.equal(LEGACY_VAULT_INSTITUTION_NAME);
    });

    it("getAggregatedVaultStates() succeeds and returns the override name for the legacy vault", async () => {
      const states = await controller.getAggregatedVaultStates();
      const legacyState = states.find((s: { vault: string }) => s.vault.toLowerCase() === LEGACY_VAULT.toLowerCase());
      expect(legacyState.institutionName).to.equal(LEGACY_VAULT_INSTITUTION_NAME);
    });

    it("clearing the override makes getAggregatedVaultStates() revert again — proving the override is what keeps the legacy vault from breaking it", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await controller.connect(timelock).setInstitutionNameOverride(LEGACY_VAULT, "");
      await expect(controller.getAggregatedVaultStates()).to.be.reverted;

      // Restore the override so later tests see the VIP's end state.
      await controller.connect(timelock).setInstitutionNameOverride(LEGACY_VAULT, LEGACY_VAULT_INSTITUTION_NAME);
      expect(await controller.institutionNameOverride(LEGACY_VAULT)).to.equal(LEGACY_VAULT_INSTITUTION_NAME);
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
      guardian = await initMainnetUser(CRITICAL_GUARDIAN, parseEther("1"));

      // Refresh stale periods for the supply + collateral assets so createVault's oracle check passes
      // despite the time advanced by testVip's voting/timelock.
      await bumpStalePeriods(await controller.oracle(), NORMAL_TIMELOCK, [USDT, USDC]);

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

    it("Critical Guardian can rename the institution via setInstitutionName (permission granted by this VIP)", async () => {
      await controller.connect(guardian).setInstitutionName(vaultAddress, RENAMED);
      const vault = new ethers.Contract(vaultAddress, INSTITUTIONAL_LOAN_VAULT_ABI, ethers.provider);
      expect(await vault.institutionName()).to.equal(RENAMED);
    });

    it("getAggregatedVaultStates() resolves both the overridden legacy vault and the new vault's own name", async () => {
      const states = await controller.getAggregatedVaultStates();
      const legacyState = states.find((s: { vault: string }) => s.vault.toLowerCase() === LEGACY_VAULT.toLowerCase());
      const newState = states.find((s: { vault: string }) => s.vault.toLowerCase() === vaultAddress.toLowerCase());
      expect(legacyState.institutionName).to.equal(LEGACY_VAULT_INSTITUTION_NAME);
      expect(newState.institutionName).to.equal(RENAMED);
    });
  });
});
