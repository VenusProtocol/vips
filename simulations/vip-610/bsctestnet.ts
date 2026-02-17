import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import {
  LEVERAGE_STRATEGIES_MANAGER,
  POSITION_ACCOUNT,
  RELATIVE_POSITION_MANAGER,
  SWAP_HELPER,
  TIMELOCKS_AND_GURDIAN,
  vip589 as vip610Testnet,
} from "../../vips/vip-610/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import FLASHLOAN_FACET_ABI from "./abi/FlashLoanFacet.json";
import LEVERAGE_MANAGER_ABI from "./abi/LeverageStrategiesManager.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM_FUNCTION_SIGNATURES = [
  "pause()",
  "unpause()",
  "setPositionAccountImplementation(address)",
  "addDSAVToken(address)",
  "setDSAVTokenActive(uint8,bool)",
  "executePositionAccountCall(address,address[],bytes[])",
] as const;

forking(90876709, async () => {
  let comptroller: Contract;
  let accessControlManager: Contract;
  let leverageStrategiesManager: Contract;
  let swapHelper: Contract;
  let relativePositionManager: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(FLASHLOAN_FACET_ABI, bsctestnet.UNITROLLER);
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, bsctestnet.ACCESS_CONTROL_MANAGER);
    leverageStrategiesManager = await ethers.getContractAt(LEVERAGE_MANAGER_ABI, LEVERAGE_STRATEGIES_MANAGER);
    swapHelper = await ethers.getContractAt(SWAP_HELPER_ABI, SWAP_HELPER);
    relativePositionManager = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
  });

  describe("Pre-VIP behavior", () => {
    it("LeverageStrategiesManager should not be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(LEVERAGE_STRATEGIES_MANAGER)).to.equal(false);
    });

    it("SwapHelper should have NORMAL_TIMELOCK as owner", async () => {
      expect(await swapHelper.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await leverageStrategiesManager.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("RelativePositionManager should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await relativePositionManager.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("Timelocks/Guardian should not have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GURDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          expect(
            await accessControlManager.hasPermission(timelockOrGuardian, RELATIVE_POSITION_MANAGER, fnSignature),
          ).to.equal(false);
        }
      }
    });
  });

  testVip("VIP-610 [BNB Chain] Testnet", await vip610Testnet());

  describe("Post-VIP behavior", () => {
    it("LeverageStrategiesManager should be whitelisted for flash loans", async () => {
      expect(await comptroller.authorizedFlashLoan(LEVERAGE_STRATEGIES_MANAGER)).to.equal(true);
    });

    it("SwapHelper should have NORMAL_TIMELOCK as owner and no pending owner", async () => {
      expect(await swapHelper.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await swapHelper.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as owner and no pending owner", async () => {
      expect(await leverageStrategiesManager.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await leverageStrategiesManager.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("RelativePositionManager should have NORMAL_TIMELOCK as owner and no pending owner", async () => {
      expect(await relativePositionManager.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Timelocks/Guardian should have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GURDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          expect(
            await accessControlManager.hasPermission(timelockOrGuardian, RELATIVE_POSITION_MANAGER, fnSignature),
          ).to.equal(true);
        }
      }
    });

    it("RPM should have Position account implementation stored in the state", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equals(POSITION_ACCOUNT);
    });
  });
});
