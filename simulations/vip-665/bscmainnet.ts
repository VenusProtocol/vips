import { expect } from "chai";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, pinResilientOraclePriceViaRedstone } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip665, {
  ACM_BATCH_INDEX,
  AUTHORIZED_CALLERS,
  COMMANDS_AGGREGATOR,
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
  buildAcmBatch,
} from "../../vips/vip-665/bscmainnet";
import {
  ACCESS_CONTROL_MANAGER,
  EXECUTOR,
  PROXY_ADMIN as EXECUTOR_PROXY_ADMIN,
  FACETS,
  LEVERAGE_PROXY_ADMIN,
  LEVERAGE_STRATEGIES_MANAGER,
  LIQUIDATOR,
  LIQUIDATOR_PROXY_ADMIN,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_EXECUTOR_IMPL,
  NEW_LEVERAGE_IMPL,
  NEW_LIQUIDATOR_IMPL,
  NEW_VTOKEN_DELEGATE,
  SEIZE_VENUS_FILTERED_SIGNATURE,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "../../vips/vip-665/utils/data.bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import AGGREGATOR_ABI from "./abi/AuxiliaryCommandsAggregator.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import INSTITUTIONAL_LOAN_VAULT_ABI from "./abi/InstitutionalLoanVault.json";
import INSTITUTIONAL_VAULT_CONTROLLER_ABI from "./abi/InstitutionalVaultController.json";
import LEVERAGE_ABI from "./abi/LeverageStrategiesManager.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import TRANSPARENT_PROXY_ABI from "./abi/TransparentUpgradeableProxy.json";
import UNITROLLER_ABI from "./abi/Unitroller.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20Delegator.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, CRITICAL_GUARDIAN } = bscmainnet;

// Recent block, after the ACM batch was seeded on-chain so the fork includes the real batch.
const FORK_BLOCK = 108350000;

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// ── Reaudit (Core Pool) constants ───────────────────────────────────────────
const XVS_VTOKEN = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D"; // vXVS
const NEW_CLAIM_AS_COLLATERAL_SELECTOR = "0xc2dbfc50"; // claimVenusAsCollateral(address,address[])
const NEW_SEIZE_SELECTOR = "0xf74c8f31"; // seizeVenus(address[],address,address[])
const REWARD_FACET_NEW_ABI = [
  "function seizeVenus(address[],address,address[]) returns (uint256)",
  "function claimVenusAsCollateral(address,address[])",
];
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT_WHALE = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"; // BTCB — collateral for the lifecycle e2e
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B"; // vBTC (CF 0.8)
const VAI = "0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7"; // VAI — read by the new Liquidator's force-VAI gate
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address,uint256) returns (bool)",
];
const SWAP_BACKEND_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
let saltCounter = 0;
const RELATIVE_POSITION_MANAGER = "0x1525D804DFff218DcC8B9359940F423209356C42";

const markets = Object.values(VTOKENS_TO_UPGRADE);

// ── Reaudit helpers ──────────────────────────────────────────────────────────
const normalizeSelectors = (arr: string[]): string[] => [...arr].map(s => s.toLowerCase()).sort();

const facetOf = async (comptroller: Contract, selector: string): Promise<string> => {
  return (await comptroller.facetAddress(selector)).facetAddress;
};

// On-chain selector set bound to a facet, normalized for a deep-equals against our data arrays.
const facetSelectorsOf = async (comptroller: Contract, facet: string): Promise<string[]> => {
  return normalizeSelectors(await comptroller.facetFunctionSelectors(facet));
};

// Snapshot a handful of RelativePositionManager storage-backed values via its public getters.
const readRpmSnapshot = async (rpm: Contract) => ({
  proportionalCloseTolerance: (await rpm.proportionalCloseTolerance()).toString(),
  isPartiallyPaused: await rpm.isPartiallyPaused(),
  isCompletelyPaused: await rpm.isCompletelyPaused(),
  dsaVTokenIndexCounter: (await rpm.dsaVTokenIndexCounter()).toString(),
  isPositionAccountImplementationLocked: await rpm.isPositionAccountImplementationLocked(),
});

const readStorageSnapshot = async (c: Contract) => {
  const globals = {
    closeFactor: (await c.closeFactorMantissa()).toString(),
    pauseGuardian: await c.pauseGuardian(),
    vaiController: await c.vaiController(),
    vaiMintRate: (await c.vaiMintRate()).toString(),
    xvsAddress: await c.getXVSAddress(),
    xvsVToken: await c.getXVSVTokenAddress(),
    allMarkets: (await c.getAllMarkets()).join(","),
  };
  const perMarket: Record<string, unknown> = {};
  for (const market of markets.slice(0, 5)) {
    const m = await c.markets(market);
    perMarket[market] = {
      isListed: m.isListed,
      collateralFactor: m.collateralFactorMantissa.toString(),
      isVenus: m.isVenus,
      supplyCap: (await c.supplyCaps(market)).toString(),
      borrowCap: (await c.borrowCaps(market)).toString(),
      supplySpeed: (await c.venusSupplySpeeds(market)).toString(),
      borrowSpeed: (await c.venusBorrowSpeeds(market)).toString(),
    };
  }
  return { globals, perMarket };
};

const pinPriceFeeds = async () => {
  const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
  const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
  const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

  for (const asset of [USDT, USDC, WBNB, ETH, XVS, BTCB, VAI, USDC, USDT]) {
    const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    await pinResilientOraclePriceViaRedstone(resilientOracle, asset);
  }
};

forking(FORK_BLOCK, async () => {
  // Vault contracts
  let controller: Contract;
  let proxyAdmin: Contract;
  let accessControlManager: Contract;
  let aggregator: Contract;
  let pre: Record<string, unknown>;

  // Reaudit contracts / state
  let comptroller: Contract;
  let liquidator: Contract;
  let liquidatorProxyAdmin: Contract;
  let leverageProxyAdmin: Contract;
  let leverageManager: Contract;
  let executorProxyAdmin: Contract;
  let rpm: Contract;
  let acm: Contract;
  let comptrollerSigner: Signer;
  let user: Signer;
  let userAddress: string;
  let leverageOwnerBefore: string;
  let storageBefore: any;
  let rpmStorageBefore: any;
  let originalBtcSpot: BigNumber;

  before(async () => {
    // Vault side
    controller = new ethers.Contract(
      INSTITUTIONAL_VAULT_CONTROLLER,
      INSTITUTIONAL_VAULT_CONTROLLER_ABI,
      ethers.provider,
    );
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    accessControlManager = new ethers.Contract(ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);

    // Reaudit side
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
    liquidator = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);
    liquidatorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LIQUIDATOR_PROXY_ADMIN);
    leverageProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, LEVERAGE_PROXY_ADMIN);
    leverageManager = await ethers.getContractAt(LEVERAGE_ABI, LEVERAGE_STRATEGIES_MANAGER);
    executorProxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, EXECUTOR_PROXY_ADMIN);
    rpm = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
    acm = accessControlManager; // same on-chain ACM
    comptrollerSigner = await initMainnetUser(UNITROLLER, parseEther("1"));
    [user] = await ethers.getSigners();
    userAddress = await user.getAddress();

    leverageOwnerBefore = await leverageManager.owner();
    // Snapshot Core Pool storage pre-VIP so we can assert the diamond recut leaves every slot intact.
    storageBefore = await readStorageSnapshot(comptroller);
    // Snapshot RPM storage pre-VIP (RPM is not upgraded; this must survive the VIP unchanged).
    rpmStorageBefore = await readRpmSnapshot(rpm);

    await pinPriceFeeds();

    // Snapshot the (now-pinned) BTC spot for the liquidation e2e.
    const resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
    originalBtcSpot = await resilientOracle.getPrice(BTCB);

    // The ACM permission batch is already seeded on-chain at index ACM_BATCH_INDEX (via
    // utils/seed-acm-batch.bscmainnet.ts); this fork block includes that tx, so the sim reads the real batch.
    aggregator = new ethers.Contract(COMMANDS_AGGREGATOR, AGGREGATOR_ABI, ethers.provider);
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-VIP — Block 1: Institutional Fixed Rate Vault
  // ══════════════════════════════════════════════════════════════════════════
  describe("Pre-VIP: Vault — implementations not yet upgraded", () => {
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

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-VIP — Block 2: Certik VPD-1241 reaudit (Core Pool)
  // ══════════════════════════════════════════════════════════════════════════
  describe("Pre-VIP: Core reaudit — implementations not yet wired", () => {
    it("the Diamond implementation is not yet the newly deployed one", async () => {
      expect(await comptroller.comptrollerImplementation()).to.not.equal(NEW_DIAMOND);
    });

    it("maxAssets() is currently served (the Diamond's inherited public getter still exists)", async () => {
      expect(await comptroller.maxAssets()).to.equal(100);
    });

    // The recompiled facets are not wired into the diamond yet — none of the selectors point at them.
    for (const { name, newFacet, selectors } of FACETS) {
      it(`${name}: its selectors are not bound to the new facet yet`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.not.equal(newFacet);
        }
      });
    }

    // … and the brand-new overloads do not exist on the diamond at all yet.
    it("the new RewardFacet overloads are not yet registered", async () => {
      expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(ethers.constants.AddressZero);
      expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(ethers.constants.AddressZero);
    });

    // Each existing selector is bound to the expected old facet, and that facet's on-chain selector
    // set deep-equals our data array exactly.
    for (const { name, oldFacet, selectors } of FACETS) {
      it(`${name}: the existing (old) facet matches our selector data exactly`, async () => {
        for (const selector of selectors) {
          expect(await facetOf(comptroller, selector)).to.equal(oldFacet);
        }
        expect(await facetSelectorsOf(comptroller, oldFacet)).to.deep.equal(normalizeSelectors(selectors));
      });
    }

    it("ComptrollerLens, Liquidator, LeverageStrategiesManager and Executor are not yet upgraded", async () => {
      expect(await comptroller.comptrollerLens()).to.not.equal(NEW_COMPTROLLER_LENS);
      expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.not.equal(NEW_LIQUIDATOR_IMPL);
      expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.not.equal(
        NEW_LEVERAGE_IMPL,
      );
      expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.not.equal(NEW_EXECUTOR_IMPL);
    });

    it("Core Pool markets are not yet on the newly deployed VBep20Delegate", async () => {
      for (const market of markets) {
        const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
        expect(await vToken.implementation()).to.not.equal(NEW_VTOKEN_DELEGATE);
      }
    });

    it("no grantee can call the new market-filtered seizeVenus overload yet", async () => {
      for (const account of AUTHORIZED_CALLERS) {
        expect(await acm.connect(comptrollerSigner).isAllowedToCall(account, SEIZE_VENUS_FILTERED_SIGNATURE)).to.equal(
          false,
        );
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PRE-VIP — the ACM batch pre-seeded on the aggregator matches the VIP's ACM commands
  // ══════════════════════════════════════════════════════════════════════════
  describe("Aggregator: seeded ACM batch matches the VIP's ACM commands", () => {
    it("batch #ACM_BATCH_INDEX stores exactly the VIP's ACM give/revoke calls (target + calldata)", async () => {
      const stored = await aggregator.getBatch(ACM_BATCH_INDEX);
      const expected = buildAcmBatch().map(cmd => ({
        target: cmd.target,
        data: new ethers.utils.Interface([`function ${cmd.signature}`]).encodeFunctionData(cmd.signature, cmd.params),
      }));
      expect(stored.length).to.equal(expected.length);
      expected.forEach((cmd, i) => {
        expect(stored[i].target.toLowerCase()).to.equal(cmd.target.toLowerCase());
        expect(stored[i].data.toLowerCase()).to.equal(cmd.data.toLowerCase());
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EXECUTE — merged proposal (vault block + reaudit block)
  // ══════════════════════════════════════════════════════════════════════════
  testVip("VIP-665 [BNB Chain] Vault upgrade + Certik VPD-1241 reaudit", await vip665(), {
    callbackAfterExecution: async txResponse => {
      // Vault block events
      await expectEvents(
        txResponse,
        [INSTITUTIONAL_VAULT_CONTROLLER_ABI],
        ["VaultImplementationUpdated", "InstitutionNameOverrideUpdated"],
        [1, 1],
      );
      // Reaudit block events
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["DiamondCut", "NewComptrollerLens"], [1, 1]);
      // 3 reaudit proxy upgrades (Liquidator, LeverageStrategiesManager, Executor) + 1 vault controller proxy upgrade.
      await expectEvents(txResponse, [TRANSPARENT_PROXY_ABI], ["Upgraded"], [4]);
      // One NewImplementation per repointed market plus one for the Diamond implementation swap.
      await expectEvents(txResponse, [UNITROLLER_ABI], ["NewImplementation"], [markets.length + 1]);
      // ACM (run through the aggregator batch): 16 giveCallPermission + 4 revokeCallPermission from the batch,
      // plus the transient grantRole/revokeRole of DEFAULT_ADMIN_ROLE on the aggregator itself (+1 each).
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI],
        ["RoleGranted", "RoleRevoked"],
        [
          NEW_PERMISSIONS.length * AUTHORIZED_CALLERS.length + AUTHORIZED_CALLERS.length + 1,
          AUTHORIZED_CALLERS.length + 1,
        ],
      );
      // The aggregator ran exactly one batch.
      await expectEvents(txResponse, [AGGREGATOR_ABI], ["BatchExecuted"], [1]);
    },
  });

  // ══════════════════════════════════════════════════════════════════════════
  // POST-VIP — Block 1: Institutional Fixed Rate Vault
  // ══════════════════════════════════════════════════════════════════════════
  describe("Post-VIP: Vault", () => {
    describe("implementations upgraded", () => {
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

    describe("controller storage layout preserved across the upgrade", () => {
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

    describe("ACM permissions updated", () => {
      it("every caller now holds the new createVault / setInstitutionName / setInstitutionNameOverride permissions", async () => {
        for (const fn of NEW_PERMISSIONS) {
          for (const caller of AUTHORIZED_CALLERS) {
            expect(await accessControlManager.isAllowedToCall(caller, fn, { from: INSTITUTIONAL_VAULT_CONTROLLER })).to
              .be.true;
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

    describe("legacy vault no longer breaks getAggregatedVaultStates()", () => {
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

    describe("new vault implementation stores a standalone institutionName", () => {
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

  // ══════════════════════════════════════════════════════════════════════════
  // POST-VIP — Block 2: Certik VPD-1241 reaudit (Core Pool)
  // ══════════════════════════════════════════════════════════════════════════
  describe("Post-VIP: Core reaudit", () => {
    describe("facet mapping preserved, everything repointed", () => {
      for (const { name, oldFacet, newFacet, selectors, newSelectors } of FACETS) {
        it(`every ${name} selector now resolves to the recompiled ${name}, no longer the old facet`, async () => {
          for (const selector of selectors) {
            const fa = await facetOf(comptroller, selector);
            expect(fa).to.equal(newFacet);
            expect(fa).to.not.equal(oldFacet);
          }
          // The recompiled facet's on-chain selector set deep-equals our existing selectors plus any
          // brand-new selectors the facet gained (RewardFacet's two market-filtered overloads).
          expect(await facetSelectorsOf(comptroller, newFacet)).to.deep.equal(
            normalizeSelectors([...selectors, ...newSelectors]),
          );
        });
      }

      it("the two new RewardFacet overloads are registered on the recompiled RewardFacet", async () => {
        const rewardFacet = FACETS.find(f => f.name === "RewardFacet")!.newFacet;
        expect(await facetOf(comptroller, NEW_CLAIM_AS_COLLATERAL_SELECTOR)).to.equal(rewardFacet);
        expect(await facetOf(comptroller, NEW_SEIZE_SELECTOR)).to.equal(rewardFacet);
      });

      it("the Diamond implementation is swapped", async () => {
        expect(await comptroller.comptrollerImplementation()).to.equal(NEW_DIAMOND);
      });

      it("Core Pool storage is preserved across the diamond recut (slots read identically)", async () => {
        expect(await readStorageSnapshot(comptroller)).to.deep.equal(storageBefore);
      });

      it("maxAssets() is dropped by the storage-visibility change (public -> private)", async () => {
        await expect(comptroller.maxAssets()).to.be.reverted;
      });

      it("ComptrollerLens is updated", async () => {
        expect(await comptroller.comptrollerLens()).to.equal(NEW_COMPTROLLER_LENS);
      });

      it("Liquidator, LeverageStrategiesManager and Executor are upgraded", async () => {
        expect(await liquidatorProxyAdmin.getProxyImplementation(LIQUIDATOR)).to.equal(NEW_LIQUIDATOR_IMPL);
        expect(await leverageProxyAdmin.getProxyImplementation(LEVERAGE_STRATEGIES_MANAGER)).to.equal(
          NEW_LEVERAGE_IMPL,
        );
        expect(await executorProxyAdmin.getProxyImplementation(EXECUTOR)).to.equal(NEW_EXECUTOR_IMPL);
      });

      it("RelativePositionManager storage is preserved across the VIP (it is not upgraded)", async () => {
        expect(await readRpmSnapshot(rpm)).to.deep.equal(rpmStorageBefore);
      });

      it("every upgraded Core Pool market points at the new VBep20Delegate", async () => {
        for (const market of markets) {
          const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, market);
          expect(await vToken.implementation()).to.equal(NEW_VTOKEN_DELEGATE);
        }
      });

      it("every grantee is permitted to call the new market-filtered seizeVenus overload", async () => {
        for (const account of AUTHORIZED_CALLERS) {
          expect(
            await acm.connect(comptrollerSigner).isAllowedToCall(account, SEIZE_VENUS_FILTERED_SIGNATURE),
          ).to.equal(true);
        }
      });
    });

    describe("functional checks (recut diamond and upgraded proxies still work)", () => {
      it("the recut diamond still serves RewardFacet selectors", async () => {
        expect(await comptroller.getXVSVTokenAddress()).to.equal(XVS_VTOKEN);
      });

      it("the upgraded Liquidator proxy remains functional", async () => {
        expect((await liquidator.comptroller()).toLowerCase()).to.equal(UNITROLLER.toLowerCase());
      });

      it("the upgraded LeverageStrategiesManager preserves its state", async () => {
        expect(await leverageManager.owner()).to.equal(leverageOwnerBefore);
      });
    });

    describe("e2e — real deployed implementations", () => {
      it("market: a user can mint and redeem on the upgraded VBep20Delegate", async () => {
        const token = await ethers.getContractAt(ERC20_ABI, USDT);
        const vToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, VUSDT);
        const whale = await initMainnetUser(USDT_WHALE, parseEther("1"));
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
        await comptroller.connect(timelock)._setMarketSupplyCaps([VUSDT], [ethers.constants.MaxUint256]);

        const amount = ethers.utils.parseUnits("1000", await token.decimals());
        await token.connect(whale).transfer(userAddress, amount);
        await token.connect(user).approve(VUSDT, amount);
        await vToken.connect(user).mint(amount);

        // The full amount was supplied and the minted vTokens are worth ~that amount.
        expect(await token.balanceOf(userAddress)).to.equal(0);
        const vBalance = await vToken.balanceOf(userAddress);
        expect(await vToken.callStatic.balanceOfUnderlying(userAddress)).to.be.closeTo(amount, amount.div(1000));

        await vToken.connect(user).redeem(vBalance);
        // Fully redeemed back to the underlying.
        expect(await vToken.balanceOf(userAddress)).to.equal(0);
        expect(await token.balanceOf(userAddress)).to.be.closeTo(amount, amount.div(1000));
      });

      it("comptroller: a user can enter a market on the recut diamond", async () => {
        await comptroller.connect(user).enterMarkets([VUSDT]);
        expect(await comptroller.checkMembership(userAddress, VUSDT)).to.equal(true);
      });

      it("comptroller: the timelock can call the new market-filtered seizeVenus overload", async () => {
        const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
        const [, freshHolder] = await ethers.getSigners();
        const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, timelock);
        await expect(rewardFacet.seizeVenus([await freshHolder.getAddress()], NORMAL_TIMELOCK, [XVS_VTOKEN])).to.not.be
          .reverted;
      });

      it("comptroller: the new market-filtered seizeVenus overload reverts for an unauthorized caller", async () => {
        const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, user);
        await expect(rewardFacet.seizeVenus([userAddress], userAddress, [XVS_VTOKEN])).to.be.revertedWith(
          "access denied",
        );
      });

      it("comptroller: a user can call the new market-filtered claimVenusAsCollateral overload", async () => {
        const rewardFacet = new ethers.Contract(UNITROLLER, REWARD_FACET_NEW_ABI, user);
        await expect(rewardFacet.claimVenusAsCollateral(userAddress, [VUSDT])).to.not.be.reverted;
      });

      it("LSM: the owner is the Normal Timelock and can sweep tokens from the upgraded manager", async () => {
        const ownerAddress = await leverageManager.owner();
        expect(ownerAddress).to.equal(NORMAL_TIMELOCK);

        const token = await ethers.getContractAt(ERC20_ABI, USDT);
        const amount = ethers.utils.parseUnits("100", await token.decimals());
        const whale = await initMainnetUser(USDT_WHALE, parseEther("1"));
        await token.connect(whale).transfer(LEVERAGE_STRATEGIES_MANAGER, amount);
        const owner = await initMainnetUser(ownerAddress, parseEther("1"));
        const before = await token.balanceOf(ownerAddress);
        await expect(leverageManager.connect(owner).sweepToken(USDT)).to.emit(leverageManager, "TokensSwept");
        expect(await token.balanceOf(ownerAddress)).to.equal(before.add(amount));
      });

      it("LSM: sweepToken reverts for a non-owner", async () => {
        await expect(leverageManager.connect(user).sweepToken(USDT)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });
    });

    // Cross-asset leverage round-trip driven through the RelativePositionManager, which opens and
    // unwinds the position via the upgraded LeverageStrategiesManager. DSA = USDC, long = WBNB, short = ETH.
    describe("e2e: cross-asset leverage via RelativePositionManager", function () {
      const DSA = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"; // USDC
      const LONG = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
      const vLONG = VTOKENS_TO_UPGRADE.vWBNB;
      const SHORT = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"; // ETH
      const vSHORT = VTOKENS_TO_UPGRADE.vETH;
      const USDC_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury
      const ETH_WHALE = "0xf322942f644a996a617bd29c16bd7d231d9f35e9"; // Venus Treasury
      const WBNB_WHALE = vLONG; // vWBNB holds the underlying WBNB

      // A full close adds the 2% proportional-close tolerance plus a 0.2% interest-accrual buffer.
      const FULL_CLOSE_BUFFER_BPS = 1022;

      let rpm: Contract;
      let swapHelper: Contract;
      let dsa: Contract;
      let shortVToken: Contract;
      let alice: Signer;
      let aliceAddress: string;
      let domain: { name: string; version: string; chainId: number; verifyingContract: string };

      // Deterministic swap: fund the SwapHelper with the output token from a whale and sign a multicall
      // that transfers exactly amountOut to the recipient.
      const manipulatedSwap = async (
        tokenOut: string,
        amountOut: BigNumber,
        recipient: string,
        whale: string,
      ): Promise<string> => {
        const whaleSigner = await initMainnetUser(whale, parseEther("1"));
        await new ethers.Contract(tokenOut, ERC20_ABI, whaleSigner).transfer(swapHelper.address, amountOut);

        const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);
        const transferData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
          recipient,
          amountOut,
        ]);
        const calls = [swapHelperIface.encodeFunctionData("genericCall", [tokenOut, transferData])];
        const deadline = Math.floor(Date.now() / 1000) + 20 * 365 * 24 * 60 * 60;
        const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));
        const types = {
          Multicall: [
            { name: "caller", type: "address" },
            { name: "calls", type: "bytes[]" },
            { name: "deadline", type: "uint256" },
            { name: "salt", type: "bytes32" },
          ],
        };
        const signature = await new Wallet(SWAP_BACKEND_PK, ethers.provider)._signTypedData(domain, types, {
          caller: recipient,
          calls,
          deadline,
          salt,
        });
        return swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);
      };

      before(async () => {
        [, alice] = await ethers.getSigners();
        aliceAddress = await alice.getAddress();

        rpm = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
        dsa = await ethers.getContractAt(ERC20_ABI, DSA);
        shortVToken = await ethers.getContractAt(VBEP20_DELEGATOR_ABI, vSHORT);

        swapHelper = await ethers.getContractAt(SWAP_HELPER_ABI, await leverageManager.swapHelper());
        const eip712 = await swapHelper.eip712Domain();
        const { chainId } = await ethers.provider.getNetwork();
        domain = { name: eip712.name, version: eip712.version, chainId, verifyingContract: swapHelper.address };
        const swapHelperOwner = await initMainnetUser(await swapHelper.owner(), parseEther("1"));
        await swapHelper.connect(swapHelperOwner).setBackendSigner(new Wallet(SWAP_BACKEND_PK).address);
      });

      it("opens a leveraged position and fully closes it with profit", async () => {
        const INITIAL_PRINCIPAL = ethers.utils.parseUnits("9000", 18);
        const SHORT_AMOUNT = ethers.utils.parseUnits("4", 18); // 4 ETH flash-borrowed
        const LONG_AMOUNT = ethers.utils.parseUnits("30", 18); // 30 WBNB collateral
        const leverage = ethers.utils.parseUnits("1.5", 18);

        const usdcWhale = await initMainnetUser(USDC_WHALE, parseEther("1"));
        await dsa.connect(usdcWhale).transfer(aliceAddress, INITIAL_PRINCIPAL);
        await dsa.connect(alice).approve(RELATIVE_POSITION_MANAGER, INITIAL_PRINCIPAL);

        // Open: the flash-borrowed ETH is swapped into WBNB collateral.
        const minLong = LONG_AMOUNT.mul(98).div(100);
        const openSwapData = await manipulatedSwap(LONG, LONG_AMOUNT, LEVERAGE_STRATEGIES_MANAGER, WBNB_WHALE);
        await rpm
          .connect(alice)
          .activateAndOpenPosition(vLONG, vSHORT, 0, INITIAL_PRINCIPAL, leverage, SHORT_AMOUNT, minLong, openSwapData);

        const position = await rpm.getPosition(aliceAddress, vLONG, vSHORT);
        expect(position.isActive).to.equal(true);
        const positionAccount = position.positionAccount;

        const shortDebtAfterOpen = await shortVToken.callStatic.borrowBalanceCurrent(positionAccount);
        const longBalanceAfterOpen = await rpm.callStatic.getLongCollateralBalance(aliceAddress, vLONG, vSHORT);
        expect(shortDebtAfterOpen).to.be.closeTo(SHORT_AMOUNT, SHORT_AMOUNT.div(1000));
        expect(longBalanceAfterOpen).to.be.gte(minLong);

        // Full close with profit: 75% of the WBNB repays the ETH debt, the remaining 25% is taken as USDC profit.
        const longForRepay = longBalanceAfterOpen.mul(75).div(100);
        const longForProfit = longBalanceAfterOpen.sub(longForRepay);
        const shortRepayAmount = shortDebtAfterOpen.mul(FULL_CLOSE_BUFFER_BPS).div(1000);
        const estimatedProfit = longForProfit.mul(500); // ~1 WBNB ≈ 500 USDC

        const repaySwapData = await manipulatedSwap(SHORT, shortRepayAmount, LEVERAGE_STRATEGIES_MANAGER, ETH_WHALE);
        const profitSwapData = await manipulatedSwap(DSA, estimatedProfit, RELATIVE_POSITION_MANAGER, USDC_WHALE);

        await rpm
          .connect(alice)
          .closeWithProfit(
            vLONG,
            vSHORT,
            10000,
            longForRepay,
            shortRepayAmount,
            repaySwapData,
            longForProfit,
            estimatedProfit.mul(98).div(100),
            profitSwapData,
          );

        // The position is fully unwound: no remaining ETH debt and no remaining WBNB collateral.
        expect(await shortVToken.callStatic.borrowBalanceCurrent(positionAccount)).to.equal(0);
        expect(await rpm.callStatic.getLongCollateralBalance(aliceAddress, vLONG, vSHORT)).to.equal(0);
      });
    });

    // Full Core Pool lifecycle exercising the recut diamond and the newly deployed VBep20Delegate end to end:
    // supply → borrow → liquidate → repay → redeem. BTCB is the collateral (CF 0.8); USDT is the borrowed asset.
    describe("e2e: Core Pool supply → borrow → liquidate → repay → redeem", () => {
      const WHALE = bscmainnet.GENERIC_TEST_USER_ACCOUNT;
      let BORROWER!: string;
      let LIQ!: string;

      let resilient: Contract;
      let redstone: Contract;
      let vBtc: Contract;
      let vUsdt: Contract;
      let btcb: Contract;
      let usdtToken: Contract;
      let liquidatorContract: Contract;
      let timelock: Signer;
      let whale: Signer;
      let borrower: Signer;
      let liquidatorUser: Signer;
      let snapshotId: string;
      let borrowAmount: BigNumber;

      before(async () => {
        snapshotId = await ethers.provider.send("evm_snapshot", []);

        resilient = await ethers.getContractAt(RESILIENT_ORACLE_ABI, bscmainnet.RESILIENT_ORACLE);
        redstone = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
        vBtc = await ethers.getContractAt(VTOKEN_ABI, VBTC);
        vUsdt = await ethers.getContractAt(VTOKEN_ABI, VUSDT);
        btcb = await ethers.getContractAt(ERC20_ABI, BTCB);
        usdtToken = await ethers.getContractAt(ERC20_ABI, USDT);
        liquidatorContract = await ethers.getContractAt(LIQUIDATOR_ABI, LIQUIDATOR);

        timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
        whale = await initMainnetUser(WHALE, parseEther("1"));
        // Fresh actors: Hardhat's pre-funded local signers (indices 0/1 are used by other tests).
        [, , borrower, liquidatorUser] = await ethers.getSigners();
        BORROWER = await borrower.getAddress();
        LIQ = await liquidatorUser.getAddress();

        // BTC was pinned to a single Redstone feed.
        // Lift caps so neither leg is gated by a supply/borrow cap.
        await comptroller.connect(timelock)._setMarketSupplyCaps([VBTC], [ethers.constants.MaxUint256]);
        await comptroller.connect(timelock)._setMarketBorrowCaps([VUSDT], [ethers.constants.MaxUint256]);

        // Fund the fresh accounts from the whale.
        await btcb.connect(whale).transfer(BORROWER, parseEther("1"));
        await usdtToken.connect(whale).transfer(LIQ, ethers.utils.parseUnits("50000", 18));
      });

      after(async () => {
        await ethers.provider.send("evm_revert", [snapshotId]);
      });

      it("supply: borrower mints vBTC on the new delegate and enters the market", async () => {
        const amount = parseEther("1");
        await btcb.connect(borrower).approve(VBTC, amount);
        await vBtc.connect(borrower).mint(amount);
        await comptroller.connect(borrower).enterMarkets([VBTC]);

        expect(await vBtc.balanceOf(BORROWER)).to.be.gt(0);
        expect(await comptroller.checkMembership(BORROWER, VBTC)).to.equal(true);
      });

      it("borrow: borrower draws USDT (~70% of capacity) against the BTC collateral", async () => {
        const [err, liquidity] = await comptroller.getAccountLiquidity(BORROWER);
        expect(err).to.equal(0);
        expect(liquidity).to.be.gt(0);

        const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
        borrowAmount = liquidity.mul(70).div(100).mul(ethers.constants.WeiPerEther).div(usdtPrice);

        const before = await usdtToken.balanceOf(BORROWER);
        await vUsdt.connect(borrower).borrow(borrowAmount);
        expect((await usdtToken.balanceOf(BORROWER)).sub(before)).to.equal(borrowAmount);
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.closeTo(
          borrowAmount,
          borrowAmount.div(1000),
        );
      });

      it("liquidate: a 50% BTC crash flips the borrower into shortfall and a liquidator seizes vBTC", async () => {
        await redstone.connect(timelock).setDirectPrice(BTCB, originalBtcSpot.div(2));
        expect(await resilient.getPrice(BTCB)).to.equal(originalBtcSpot.div(2));

        const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        expect(shortfall).to.be.gt(0);

        const repayAmount = ethers.utils.parseUnits("1000", 18); // well under closeFactor (50%) of the debt
        await usdtToken.connect(liquidatorUser).approve(LIQUIDATOR, repayAmount);

        const liqVBtcBefore = await vBtc.balanceOf(LIQ);
        const debtBefore = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
        await expect(
          liquidatorContract.connect(liquidatorUser).liquidateBorrow(VUSDT, BORROWER, repayAmount, VBTC),
        ).to.emit(vUsdt, "LiquidateBorrow");

        expect(await vBtc.balanceOf(LIQ)).to.be.gt(liqVBtcBefore); // seized vBTC collateral
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.be.lt(debtBefore); // debt reduced
      });

      it("repay: borrower fully repays the remaining USDT debt", async () => {
        await usdtToken.connect(whale).transfer(BORROWER, ethers.utils.parseUnits("50000", 18));
        await usdtToken.connect(borrower).approve(VUSDT, ethers.constants.MaxUint256);
        await vUsdt.connect(borrower).repayBorrow(ethers.constants.MaxUint256);
        expect(await vUsdt.callStatic.borrowBalanceCurrent(BORROWER)).to.equal(0);
      });

      it("redeem: borrower redeems the remaining vBTC back to BTCB on the new delegate", async () => {
        await redstone.connect(timelock).setDirectPrice(BTCB, originalBtcSpot); // restore price
        const vBtcBalance = await vBtc.balanceOf(BORROWER);
        expect(vBtcBalance).to.be.gt(0);

        const btcBefore = await btcb.balanceOf(BORROWER);
        await vBtc.connect(borrower).redeem(vBtcBalance);
        expect(await vBtc.balanceOf(BORROWER)).to.equal(0);
        expect(await btcb.balanceOf(BORROWER)).to.be.gt(btcBefore);
      });
    });
  });
});
