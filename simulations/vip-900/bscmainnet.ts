import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip900, {
  ACM,
  DEVIATION_SENTINEL,
  GOVERNANCE_TIMELOCKS,
  KEEPER_ADDRESS,
  PANCAKESWAP_ORACLE,
  SENTINEL_ORACLE,
  UNISWAP_ORACLE,
} from "../../vips/vip-900/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import DEX_ORACLE_ABI from "./abi/DexOracle.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(45000000, async () => {
  // TODO: Replace with correct block number
  let accessControlManager: Contract;
  let deviationSentinel: Contract;
  let sentinelOracle: Contract;
  let uniswapOracle: Contract;
  let pancakeSwapOracle: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, SENTINEL_ORACLE);
    uniswapOracle = await ethers.getContractAt(DEX_ORACLE_ABI, UNISWAP_ORACLE);
    pancakeSwapOracle = await ethers.getContractAt(DEX_ORACLE_ABI, PANCAKESWAP_ORACLE);
  });

  describe("Pre-VIP behavior", () => {
    // ========================================
    // Pending ownership checks
    // ========================================

    it("DeviationSentinel should have pending owner", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SentinelOracle should have pending owner", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("UniswapOracle should have pending owner", async () => {
      expect(await uniswapOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PancakeSwapOracle should have pending owner", async () => {
      expect(await pancakeSwapOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    // ========================================
    // Keeper should not have permissions
    // ========================================

    it("Keeper should not have permissions on DeviationSentinel", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)"),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          DEVIATION_SENTINEL,
          "setTokenConfig(address,(uint8,bool))",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          DEVIATION_SENTINEL,
          "setTokenMonitoringEnabled(address,bool)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, DEVIATION_SENTINEL, "resetMarketState(address)"),
      ).to.equal(false);
    });

    it("Keeper should not have permissions on SentinelOracle", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          SENTINEL_ORACLE,
          "setTokenOracleConfig(address,address)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, SENTINEL_ORACLE, "setDirectPrice(address,uint256)"),
      ).to.equal(false);
    });

    it("Keeper should not have permissions on UniswapOracle", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, UNISWAP_ORACLE, "setPoolConfig(address,address)"),
      ).to.equal(false);
    });

    it("Keeper should not have permissions on PancakeSwapOracle", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, PANCAKESWAP_ORACLE, "setPoolConfig(address,address)"),
      ).to.equal(false);
    });

    // ========================================
    // Governance timelocks should not have permissions
    // ========================================

    it("Governance timelocks should not have permissions on DeviationSentinel", async () => {
      for (const timelock of GOVERNANCE_TIMELOCKS) {
        expect(
          await accessControlManager.hasPermission(timelock, DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)"),
        ).to.equal(false);
        expect(
          await accessControlManager.hasPermission(
            timelock,
            DEVIATION_SENTINEL,
            "setTokenMonitoringEnabled(address,bool)",
          ),
        ).to.equal(false);
        expect(
          await accessControlManager.hasPermission(timelock, DEVIATION_SENTINEL, "resetMarketState(address)"),
        ).to.equal(false);
      }
    });

    // ========================================
    // DeviationSentinel should not have comptroller permissions
    // ========================================

    it("DeviationSentinel should not have permissions on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(false);
    });
  });

  testVip("VIP-900 Configure DeviationSentinel, SentinelOracle, UniswapOracle, and PancakeSwapOracle", await vip900(), {
    callbackAfterExecution: async txResponse => {
      // 4 contracts accept ownership
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [4]);
      // Count all PermissionGranted events:
      //   - setTokenConfig: 1 (keeper only)
      //   - setTrustedKeeper: 4 (keeper + 3 timelocks)
      //   - setTokenMonitoringEnabled: 4 (keeper + 3 timelocks)
      //   - resetMarketState: 4 (keeper + 3 timelocks)
      //   - setTokenOracleConfig: 1 (keeper on SentinelOracle)
      //   - setDirectPrice: 1 (keeper on SentinelOracle)
      //   - setPoolConfig on Uniswap: 1 (keeper)
      //   - setPoolConfig on PancakeSwap: 1 (keeper)
      //   - setActionsPaused: 1 (sentinel)
      //   - setCollateralFactor (isolated): 1 (sentinel)
      //   - setCollateralFactor (core): 1 (sentinel)
      //   Total: 1 + 4 + 4 + 4 + 1 + 1 + 1 + 1 + 1 + 1 + 1 = 20
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [20]);
      // 3 timelocks whitelisted as trusted keepers on DeviationSentinel
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [3]);
    },
  });

  describe("Post-VIP behavior", () => {
    // ========================================
    // Ownership checks
    // ========================================

    it("DeviationSentinel should have Normal Timelock as owner", async () => {
      expect(await deviationSentinel.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SentinelOracle should have Normal Timelock as owner", async () => {
      expect(await sentinelOracle.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("UniswapOracle should have Normal Timelock as owner", async () => {
      expect(await uniswapOracle.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PancakeSwapOracle should have Normal Timelock as owner", async () => {
      expect(await pancakeSwapOracle.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("All contracts should have AddressZero as pending owner", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await sentinelOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await uniswapOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await pancakeSwapOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    // ========================================
    // Keeper permissions on DeviationSentinel
    // ========================================

    it("Keeper should have all required permissions on DeviationSentinel", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)"),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          DEVIATION_SENTINEL,
          "setTokenConfig(address,(uint8,bool))",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          DEVIATION_SENTINEL,
          "setTokenMonitoringEnabled(address,bool)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, DEVIATION_SENTINEL, "resetMarketState(address)"),
      ).to.equal(true);
    });

    // ============================================
    // Governance permissions on DeviationSentinel
    // ============================================

    it("Governance timelocks should have setTrustedKeeper permission on DeviationSentinel", async () => {
      for (const timelock of GOVERNANCE_TIMELOCKS) {
        expect(
          await accessControlManager.hasPermission(timelock, DEVIATION_SENTINEL, "setTrustedKeeper(address,bool)"),
        ).to.equal(true);
      }
    });

    it("Governance timelocks should have setTokenMonitoringEnabled permission on DeviationSentinel", async () => {
      for (const timelock of GOVERNANCE_TIMELOCKS) {
        expect(
          await accessControlManager.hasPermission(
            timelock,
            DEVIATION_SENTINEL,
            "setTokenMonitoringEnabled(address,bool)",
          ),
        ).to.equal(true);
      }
    });

    it("Governance timelocks should have resetMarketState permission on DeviationSentinel", async () => {
      for (const timelock of GOVERNANCE_TIMELOCKS) {
        expect(
          await accessControlManager.hasPermission(timelock, DEVIATION_SENTINEL, "resetMarketState(address)"),
        ).to.equal(true);
      }
    });

    // ============================================
    // Governance timelocks whitelisted as keepers
    // ============================================

    it("Governance timelocks should be whitelisted as trusted keepers on DeviationSentinel", async () => {
      for (const timelock of GOVERNANCE_TIMELOCKS) {
        expect(await deviationSentinel.trustedKeepers(timelock)).to.equal(true);
      }
    });

    // ====================================
    // Keeper permissions on SentinelOracle
    // ====================================

    it("Keeper should have all required permissions on SentinelOracle", async () => {
      expect(
        await accessControlManager.hasPermission(
          KEEPER_ADDRESS,
          SENTINEL_ORACLE,
          "setTokenOracleConfig(address,address)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, SENTINEL_ORACLE, "setDirectPrice(address,uint256)"),
      ).to.equal(true);
    });

    // ====================================
    // Keeper permissions on UniswapOracle
    // ====================================

    it("Keeper should have setPoolConfig permission on UniswapOracle", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, UNISWAP_ORACLE, "setPoolConfig(address,address)"),
      ).to.equal(true);
    });

    // ========================================
    // Keeper permissions on PancakeSwapOracle
    // ========================================

    it("Keeper should have setPoolConfig permission on PancakeSwapOracle", async () => {
      expect(
        await accessControlManager.hasPermission(KEEPER_ADDRESS, PANCAKESWAP_ORACLE, "setPoolConfig(address,address)"),
      ).to.equal(true);
    });

    // ============================================
    // DeviationSentinel permissions on Comptrollers
    // ============================================

    it("DeviationSentinel should have setActionsPaused permission on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(true);
    });

    it("DeviationSentinel should have setCollateralFactor (isolated) permission on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(true);
    });

    it("DeviationSentinel should have setCollateralFactor (core pool) permission on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(true);
    });
  });
});
