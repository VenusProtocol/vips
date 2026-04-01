import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACM,
  DEVIATION_SENTINEL,
  EBRAKE,
  NEW_DEVIATION_SENTINEL_IMPL,
  PROXY_ADMIN,
  vip661Testnet,
} from "../../vips/vip-661/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import DEVIATION_SENTINEL_ABI from "./abi/DeviationSentinel.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

forking(99131750, async () => {
  let accessControlManager: Contract;
  let proxyAdmin: Contract;
  let deviationSentinel: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
    proxyAdmin = new ethers.Contract(PROXY_ADMIN, PROXY_ADMIN_ABI, ethers.provider);
    deviationSentinel = await ethers.getContractAt(DEVIATION_SENTINEL_ABI, DEVIATION_SENTINEL);
  });

  describe("Pre-VIP behavior", () => {
    it("DeviationSentinel proxy should not point to new implementation", async () => {
      const impl = await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL);
      expect(impl).to.not.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("EBrake should not have comptroller permissions", async () => {
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setMarketBorrowCaps(address[],uint256[])",
        ),
      ).to.equal(false);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setMarketSupplyCaps(address[],uint256[])",
        ),
      ).to.equal(false);
    });

    it("DeviationSentinel should not have permissions on EBrake", async () => {
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "pauseBorrow(address)")).to.equal(
        false,
      );
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "pauseSupply(address)")).to.equal(
        false,
      );
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "setCFZero(address)")).to.equal(
        false,
      );
    });

    it("DeviationSentinel should have old direct comptroller permissions", async () => {
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
          "_setActionsPaused(address[],uint8[],bool)",
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

  testVip("VIP-661 Configure EBrake-integrated DeviationSentinel", await vip661Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [7]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [4]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("DeviationSentinel proxy should point to new implementation", async () => {
      const impl = await proxyAdmin.getProxyImplementation(DEVIATION_SENTINEL);
      expect(impl).to.equal(NEW_DEVIATION_SENTINEL_IMPL);
    });

    it("DeviationSentinel should return correct EBrake address", async () => {
      expect(await deviationSentinel.EBRAKE()).to.equal(EBRAKE);
    });

    it("EBrake should have comptroller permissions", async () => {
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "setCollateralFactor(uint96,address,uint256,uint256)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setMarketBorrowCaps(address[],uint256[])",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.hasPermission(
          EBRAKE,
          ethers.constants.AddressZero,
          "_setMarketSupplyCaps(address[],uint256[])",
        ),
      ).to.equal(true);
    });

    it("DeviationSentinel should have permissions on EBrake", async () => {
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "pauseBorrow(address)")).to.equal(
        true,
      );
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "pauseSupply(address)")).to.equal(
        true,
      );
      expect(await accessControlManager.hasPermission(DEVIATION_SENTINEL, EBRAKE, "setCFZero(address)")).to.equal(true);
    });

    it("DeviationSentinel should no longer have direct comptroller permissions", async () => {
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
          "_setActionsPaused(address[],uint8[],bool)",
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
});
