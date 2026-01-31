import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ACM, DEVIATION_SENTINEL, KEEPER_ADDRESS, SENTINEL_ORACLE, vip900Testnet } from "../../vips/vip-900/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import SENTINEL_ORACLE_ABI from "./abi/SentinelOracle.json";

forking(82830213, async () => {
  let accessControlManager: Contract;
  let deviationSentinel: Contract;
  let sentinelOracle: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
    sentinelOracle = await ethers.getContractAt(SENTINEL_ORACLE_ABI, SENTINEL_ORACLE);
  });

  describe("Pre-VIP behavior", () => {
    it("DeviationSentinel should have pending owner", async () => {
      expect(await deviationSentinel.pendingOwner()).to.equal(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
    });

    it("SentinelOracle should have pending owner", async () => {
      expect(await sentinelOracle.pendingOwner()).to.equal(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
    });

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

  testVip("VIP-900 Configure DeviationSentinel and SentinelOracle", await vip900Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [DEVIATION_SENTINEL_ABI], ["OwnershipTransferred"], [2]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [9]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("DeviationSentinel should have Normal Timelock as owner", async () => {
      expect(await deviationSentinel.owner()).to.equal(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
    });

    it("SentinelOracle should have Normal Timelock as owner", async () => {
      expect(await sentinelOracle.owner()).to.equal(NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK);
    });

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

    it("DeviationSentinel should have permissions on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "setCollateralFactor(address,uint256,uint256)",
        ),
      ).to.equal(true);
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
