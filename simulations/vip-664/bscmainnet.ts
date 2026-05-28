import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip664, {
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
} from "../../vips/vip-664/bscmainnet";
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
  CRITICAL_GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bscmainnet;

const FORK_BLOCK = 100701625;

// To make test names readable.
const LABEL: Record<string, string> = {
  [NORMAL]: "Normal",
  [FAST_TRACK]: "FastTrack",
  [CRITICAL]: "Critical",
  [CRITICAL_GUARDIAN]: "CriticalGuardian",
};

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";

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

    it("ProtocolShareReserve should not yet point to the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(PROTOCOL_SHARE_RESERVE)).to.not.equal(NEW_PSR_IMPLEMENTATION);
    });
  });

  // Permissions are pre-loaded in the Aggregator but not yet applied to the ACM.
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
        it(`${LABEL[account]} should NOT yet have permission: ${fn} on ${target}`, async () => {
          expect(await accessControlManager.isAllowedToCall(account, fn, { from: target })).to.be.false;
        });
      }
    }
  });

  testVip("VIP-664 [BNB Chain] Configure Institutional Fixed Rate Vault System", await vip664(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [EXPECTED_PERMISSION_GRANTED_EVENTS + 1, 1],
      );
      await expectEvents(txResponse, [ACM_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  // Every planned grant is now active.
  describe("Post-VIP: ACM permissions granted", () => {
    for (const { target, fn, callers } of PERMISSION_ENTRIES) {
      for (const account of callers) {
        it(`${LABEL[account]} should have permission: ${fn} on ${target}`, async () => {
          expect(await accessControlManager.isAllowedToCall(account, fn, { from: target })).to.be.true;
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

  describe("Post-VIP: liquidator/settler whitelists", () => {
    for (const account of LIQUIDATOR_WHITELIST) {
      it(`${account} should be a whitelisted liquidator`, async () => {
        expect(await liquidationAdapter.isWhitelistedLiquidator(account)).to.be.true;
      });
    }

    for (const account of SETTLER_WHITELIST) {
      it(`${account} should be a whitelisted settler`, async () => {
        expect(await liquidationAdapter.isWhitelistedSettler(account)).to.be.true;
      });
    }
  });

  describe("Post-VIP: createVault ACM gating", () => {
    const USDT = "0x55d398326f99059fF775485246999027B3197955";
    const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

    const ONE_DAY = 24 * 60 * 60;
    const vaultConfig = {
      supplyAsset: USDT,
      fixedAPY: parseEther("0.05"), // 5% APY
      reserveFactor: parseEther("0.1"), // 10%
      minBorrowCap: parseEther("1000"), // 1,000 USDT
      maxBorrowCap: parseEther("10000000"), // 10M USDT
      minSupplierDeposit: parseEther("100"), // 100 USDT
      openDuration: 7 * ONE_DAY,
      lockDuration: 30 * ONE_DAY,
      settlementWindow: ONE_DAY,
    };
    const instConfig = {
      collateralAsset: USDC,
      idealCollateralAmount: parseEther("100000"),
      marginRate: parseEther("1.5"),
      institutionOperator: CRITICAL_GUARDIAN,
      positionTokenId: 1,
    };
    const riskConfig = {
      liquidationThreshold: parseEther("0.85"),
      liquidationIncentive: parseEther("1.08"),
      latePenaltyRate: parseEther("1.15"),
    };

    it("random address should revert with Unauthorized when trying to create vault", async () => {
      const stranger = await initMainnetUser(
        "0x000000000000000000000000000000000000dEaD",
        ethers.utils.parseEther("1"),
      );
      await expect(
        controller.connect(stranger).createVault(vaultConfig, instConfig, riskConfig, "Test", "TEST"),
      ).to.be.revertedWithCustomError(controller, "Unauthorized");
    });

    it("CriticalGuardian should be able to create vault", async () => {
      const criticalGuardian = await initMainnetUser(CRITICAL_GUARDIAN, ethers.utils.parseEther("1"));
      const call = controller
        .connect(criticalGuardian)
        .createVault(vaultConfig, instConfig, riskConfig, "Test", "TEST");
      await expect(call).to.not.be.revertedWithCustomError(controller, "Unauthorized");
    });

    it("CriticalGuardian should successfully create a vault and register it", async () => {
      // testVip advances time past the timelock delay, which makes the real ResilientOracle's
      // underlying chainlink feeds stale. Deploy a minimal stub oracle that always returns 1e18
      // and swap it in via NT (which now holds setOracle on the controller).
      //
      // Stub source (compiled with solc 0.8.25, optimizer off):
      //   contract StubOracle {
      //       function getPrice(address) external pure returns (uint256) { return 1e18; }
      //   }
      const STUB_ORACLE_BYTECODE =
        "0x6080604052348015600e575f80fd5b5061015e8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c806341976e091461002d575b5f80fd5b610047600480360381019061004291906100cc565b61005d565b604051610054919061010f565b60405180910390f35b5f670de0b6b3a76400009050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009b82610072565b9050919050565b6100ab81610091565b81146100b5575f80fd5b50565b5f813590506100c6816100a2565b92915050565b5f602082840312156100e1576100e061006e565b5b5f6100ee848285016100b8565b91505092915050565b5f819050919050565b610109816100f7565b82525050565b5f6020820190506101225f830184610100565b9291505056fea26469706673582212209282f7f2d85233912d0088d6dc45ce2459097d2866597e41f0a286059758c12c64736f6c63430008190033";
      const STUB_ORACLE_ABI = ["function getPrice(address) external pure returns (uint256)"];
      const [deployer] = await ethers.getSigners();
      const stubFactory = new ethers.ContractFactory(STUB_ORACLE_ABI, STUB_ORACLE_BYTECODE, deployer);
      const stubOracle = await stubFactory.deploy();
      await stubOracle.deployed();

      const normalTimelock = await initMainnetUser(NORMAL, ethers.utils.parseEther("1"));
      await controller.connect(normalTimelock).setOracle(stubOracle.address);

      const criticalGuardian = await initMainnetUser(CRITICAL_GUARDIAN, ethers.utils.parseEther("1"));

      // Valid config — passes every check in InstitutionalVaultController._validateVaultConfig.
      const validVaultConfig = {
        supplyAsset: USDT,
        fixedAPY: 500, // 5% in basis points (cap is MAX_APY_BPS = 10_000)
        reserveFactor: parseEther("0.1"),
        minBorrowCap: parseEther("1000"),
        maxBorrowCap: parseEther("10000000"),
        minSupplierDeposit: parseEther("100"),
        openDuration: 7 * ONE_DAY,
        lockDuration: 30 * ONE_DAY,
        settlementWindow: ONE_DAY,
      };
      const validInstConfig = {
        collateralAsset: USDC,
        idealCollateralAmount: parseEther("100000"),
        marginRate: parseEther("0.5"), // 50% — must be ≤ MANTISSA_ONE (1e18)
        institutionOperator: CRITICAL_GUARDIAN,
        positionTokenId: 0, // overridden by controller with the freshly-minted tokenId
      };
      const validRiskConfig = {
        liquidationThreshold: parseEther("0.85"),
        liquidationIncentive: parseEther("1.08"),
        latePenaltyRate: parseEther("1.15"),
      };

      const vaultsBefore = await controller.allVaultsLength();

      await expect(
        controller
          .connect(criticalGuardian)
          .createVault(validVaultConfig, validInstConfig, validRiskConfig, "Test Vault", "TVAULT"),
      ).to.emit(controller, "VaultCreated");

      const vaultsAfter = await controller.allVaultsLength();
      expect(vaultsAfter).to.equal(vaultsBefore.add(1));

      const newVault = await controller.allVaults(vaultsAfter.sub(1));
      expect(await controller.isRegistered(newVault)).to.be.true;
    });
  });
});
