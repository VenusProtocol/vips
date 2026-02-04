import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip900, {
  ACM,
  CAKE,
  CAKE_PCS_POOL,
  DEVIATION_SENTINEL,
  GOVERNANCE_TIMELOCKS,
  GUARDIAN,
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

// Accounts that should have ACM permissions (GUARDIAN + governance timelocks)
const PERMISSION_ACCOUNTS = [GUARDIAN, ...GOVERNANCE_TIMELOCKS];

// Accounts that should be whitelisted as trusted keepers (keeper + GUARDIAN + governance timelocks)
const TRUSTED_KEEPER_ACCOUNTS = [KEEPER_ADDRESS, GUARDIAN, ...GOVERNANCE_TIMELOCKS];

forking(78835203, async () => {
  let accessControlManager: Contract;
  let deviationSentinel: Contract;
  let sentinelOracle: Contract;
  let uniswapOracle: Contract;
  let pancakeSwapOracle: Contract;

  let impersonatedDeviationSentinel: SignerWithAddress;
  let impersonatedSentinelOracle: SignerWithAddress;
  let impersonatedUniswapOracle: SignerWithAddress;
  let impersonatedPancakeSwapOracle: SignerWithAddress;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, SENTINEL_ORACLE);
    uniswapOracle = await ethers.getContractAt(DEX_ORACLE_ABI, UNISWAP_ORACLE);
    pancakeSwapOracle = await ethers.getContractAt(DEX_ORACLE_ABI, PANCAKESWAP_ORACLE);

    impersonatedDeviationSentinel = await initMainnetUser(DEVIATION_SENTINEL, ethers.utils.parseEther("1"));
    impersonatedSentinelOracle = await initMainnetUser(SENTINEL_ORACLE, ethers.utils.parseEther("1"));
    impersonatedUniswapOracle = await initMainnetUser(UNISWAP_ORACLE, ethers.utils.parseEther("1"));
    impersonatedPancakeSwapOracle = await initMainnetUser(PANCAKESWAP_ORACLE, ethers.utils.parseEther("1"));
  });

  describe("Pre-VIP behavior", () => {
    // ========================================
    // Pending ownership checks
    // ========================================

    it("DeviationSentinel should have timelock as pending owner", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SentinelOracle should have timelock as pending owner", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("UniswapOracle should have timelock as pending owner", async () => {
      expect(await uniswapOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("PancakeSwapOracle should have timelock as pending owner", async () => {
      expect(await pancakeSwapOracle.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    // ========================================
    // GUARDIAN and timelocks should not have permissions
    // ========================================

    it("GUARDIAN and governance timelocks should not have permissions on DeviationSentinel", async () => {
      const acm = accessControlManager.connect(impersonatedDeviationSentinel);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setTrustedKeeper(address,bool)")).to.equal(false);
        expect(await acm.isAllowedToCall(account, "setTokenConfig(address,(uint8,bool))")).to.equal(false);
        expect(await acm.isAllowedToCall(account, "setTokenMonitoringEnabled(address,bool)")).to.equal(false);
        expect(await acm.isAllowedToCall(account, "resetMarketState(address)")).to.equal(false);
      }
    });

    it("GUARDIAN and governance timelocks should not have permissions on SentinelOracle", async () => {
      const acm = accessControlManager.connect(impersonatedSentinelOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setTokenOracleConfig(address,address)")).to.equal(false);
        expect(await acm.isAllowedToCall(account, "setDirectPrice(address,uint256)")).to.equal(false);
      }
    });

    it("GUARDIAN and governance timelocks should not have permissions on UniswapOracle", async () => {
      const acm = accessControlManager.connect(impersonatedUniswapOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setPoolConfig(address,address)")).to.equal(false);
      }
    });

    it("GUARDIAN and governance timelocks should not have permissions on PancakeSwapOracle", async () => {
      const acm = accessControlManager.connect(impersonatedPancakeSwapOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setPoolConfig(address,address)")).to.equal(false);
      }
    });

    // ========================================
    // DeviationSentinel should not have comptroller permissions
    // ========================================

    it("DeviationSentinel should not have permissions on any comptroller", async () => {
      expect(
        await accessControlManager.isAllowedToCall(DEVIATION_SENTINEL, "setActionsPaused(address[],uint8[],bool)"),
      ).to.equal(false);
      expect(
        await accessControlManager.isAllowedToCall(DEVIATION_SENTINEL, "setCollateralFactor(address,uint256,uint256)"),
      ).to.equal(false);
      expect(
        await accessControlManager.isAllowedToCall(
          DEVIATION_SENTINEL,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(false);
    });
  });

  testVip("VIP-900", await vip900(), {
    callbackAfterExecution: async txResponse => {
      // 4 contracts accept ownership
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [4]);
      // Note: BSC mainnet ACM does not emit PermissionGranted events parseable via the standard ABI.
      // Permission correctness is verified in the Post-VIP behavior tests below.
      // 5 accounts (keeper, GUARDIAN, and 3 timelocks) whitelisted as trusted keepers on DeviationSentinel
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["TrustedKeeperUpdated"], [5]);
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
    // GUARDIAN and timelocks permissions on DeviationSentinel
    // ========================================

    it("GUARDIAN and governance timelocks should have all required permissions on DeviationSentinel", async () => {
      const acm = accessControlManager.connect(impersonatedDeviationSentinel);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setTrustedKeeper(address,bool)")).to.equal(true);
        expect(await acm.isAllowedToCall(account, "setTokenConfig(address,(uint8,bool))")).to.equal(true);
        expect(await acm.isAllowedToCall(account, "setTokenMonitoringEnabled(address,bool)")).to.equal(true);
        expect(await acm.isAllowedToCall(account, "resetMarketState(address)")).to.equal(true);
      }
    });

    // ============================================
    // Trusted keepers whitelisted
    // ============================================

    it("Keeper, GUARDIAN, and governance timelocks should be whitelisted as trusted keepers on DeviationSentinel", async () => {
      for (const account of TRUSTED_KEEPER_ACCOUNTS) {
        expect(await deviationSentinel.trustedKeepers(account)).to.equal(true);
      }
    });

    // ====================================
    // GUARDIAN and timelocks permissions on SentinelOracle
    // ====================================

    it("GUARDIAN and governance timelocks should have all required permissions on SentinelOracle", async () => {
      const acm = accessControlManager.connect(impersonatedSentinelOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setTokenOracleConfig(address,address)")).to.equal(true);
        expect(await acm.isAllowedToCall(account, "setDirectPrice(address,uint256)")).to.equal(true);
      }
    });

    // ====================================
    // GUARDIAN and timelocks permissions on UniswapOracle
    // ====================================

    it("GUARDIAN and governance timelocks should have setPoolConfig permission on UniswapOracle", async () => {
      const acm = accessControlManager.connect(impersonatedUniswapOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setPoolConfig(address,address)")).to.equal(true);
      }
    });

    // ========================================
    // GUARDIAN and timelocks permissions on PancakeSwapOracle
    // ========================================

    it("GUARDIAN and governance timelocks should have setPoolConfig permission on PancakeSwapOracle", async () => {
      const acm = accessControlManager.connect(impersonatedPancakeSwapOracle);
      for (const account of PERMISSION_ACCOUNTS) {
        expect(await acm.isAllowedToCall(account, "setPoolConfig(address,address)")).to.equal(true);
      }
    });

    // ============================================
    // DeviationSentinel permissions on Comptrollers
    // ============================================

    it("DeviationSentinel should have setActionsPaused permission on any comptroller", async () => {
      expect(
        await accessControlManager.isAllowedToCall(DEVIATION_SENTINEL, "setActionsPaused(address[],uint8[],bool)"),
      ).to.equal(true);
      expect(
        await accessControlManager.isAllowedToCall(DEVIATION_SENTINEL, "_setActionsPaused(address[],uint8[],bool)"),
      ).to.equal(true);
    });

    it("DeviationSentinel should have setCollateralFactor (isolated) permission on any comptroller", async () => {
      expect(
        await accessControlManager.isAllowedToCall(DEVIATION_SENTINEL, "setCollateralFactor(address,uint256,uint256)"),
      ).to.equal(true);
    });

    it("DeviationSentinel should have setCollateralFactor (core pool) permission on any comptroller", async () => {
      expect(
        await accessControlManager.isAllowedToCall(
          DEVIATION_SENTINEL,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(true);
    });

    // ============================================
    // CAKE token configuration
    // ============================================

    it("CAKE pool should be configured on PancakeSwapOracle", async () => {
      const pool = await pancakeSwapOracle.tokenPools(CAKE);
      expect(pool).to.equal(CAKE_PCS_POOL);
    });

    it("CAKE deviation threshold should be configured on DeviationSentinel", async () => {
      const tokenConfig = await deviationSentinel.tokenConfigs(CAKE);
      expect(tokenConfig.deviation).to.equal(20);
      expect(tokenConfig.enabled).to.equal(true);
    });
  });
});
