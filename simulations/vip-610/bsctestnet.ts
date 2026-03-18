import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  LEVERAGE_STRATEGIES_MANAGER,
  POSITION_ACCOUNT,
  RELATIVE_POSITION_MANAGER,
  SWAP_HELPER,
  TIMELOCKS_AND_GUARDIAN,
  vUSDC,
  vUSDT,
  vip610 as vip610Testnet,
} from "../../vips/vip-610/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import FLASHLOAN_FACET_ABI from "./abi/FlashLoanFacet.json";
import LEVERAGE_MANAGER_ABI from "./abi/LeverageStrategiesManager.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";
import SWAP_HELPER_ABI from "./abi/SwapHelperAbi.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const ACM_FUNCTION_SIGNATURES = [
  "partialPause()",
  "partialUnpause()",
  "completePause()",
  "completeUnpause()",
  "setPositionAccountImplementation(address)",
  "setProportionalCloseTolerance(uint256)",
  "addDSAVToken(address)",
  "setDSAVTokenActive(uint8,bool)",
  "executePositionAccountCall(address,address[],bytes[])",
] as const;

forking(96276916, async () => {
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

    it("SwapHelper should have NORMAL_TIMELOCK as pending owner and not yet as owner", async () => {
      expect(await swapHelper.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await swapHelper.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("LeverageStrategiesManager should have NORMAL_TIMELOCK as pending owner and not yet as owner", async () => {
      expect(await leverageStrategiesManager.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await leverageStrategiesManager.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("RelativePositionManager should have NORMAL_TIMELOCK as pending owner and not yet as owner", async () => {
      expect(await relativePositionManager.owner()).not.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("RPM should not have Position Account implementation set", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equal(ethers.constants.AddressZero);
    });

    it("vUSDC should not be an active DSA vToken", async () => {
      expect(await relativePositionManager.isDsaVTokenActive(vUSDC)).to.equal(false);
    });

    it("vUSDT should not be an active DSA vToken", async () => {
      expect(await relativePositionManager.isDsaVTokenActive(vUSDT)).to.equal(false);
    });

    it("Timelocks/Guardian should not have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          expect(
            await accessControlManager.hasPermission(timelockOrGuardian, RELATIVE_POSITION_MANAGER, fnSignature),
          ).to.equal(false);
        }
      }
    });
  });

  testVip("VIP-610 [BNB Chain] Testnet", await vip610Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["OwnershipTransferred"], [3]);
      await expectEvents(txResponse, [FLASHLOAN_FACET_ABI], ["IsAccountFlashLoanWhitelisted"], [1]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [36]);
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["PositionAccountImplementationSet"], [1]);
      await expectEvents(txResponse, [RELATIVE_POSITION_MANAGER_ABI], ["DSAVTokenAdded"], [2]);
    },
  });

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
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
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

    it("vUSDC should be an active DSA vToken at index 0", async () => {
      expect(await relativePositionManager.dsaVTokens(0)).to.equal(vUSDC);
      expect(await relativePositionManager.isDsaVTokenActive(vUSDC)).to.equal(true);
    });

    it("vUSDT should be an active DSA vToken at index 1", async () => {
      expect(await relativePositionManager.dsaVTokens(1)).to.equal(vUSDT);
      expect(await relativePositionManager.isDsaVTokenActive(vUSDT)).to.equal(true);
    });

    it("Setting Position Account implementation again should revert", async () => {
      const signer = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      await expect(
        relativePositionManager.connect(signer).setPositionAccountImplementation(POSITION_ACCOUNT),
      ).to.be.revertedWithCustomError(relativePositionManager, "PositionAccountImplementationLocked");
    });

    for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
      describe(`ACM-gated functions should be callable by ${timelockOrGuardian}`, () => {
        let rpmAsCaller: Contract;

        before(async () => {
          const signer = await initMainnetUser(timelockOrGuardian, ethers.utils.parseEther("1"));
          rpmAsCaller = relativePositionManager.connect(signer);
        });

        it("partialPause and partialUnpause", async () => {
          await rpmAsCaller.partialPause();
          expect(await relativePositionManager.isPartiallyPaused()).to.equal(true);
          await rpmAsCaller.partialUnpause();
          expect(await relativePositionManager.isPartiallyPaused()).to.equal(false);
        });

        it("completePause and completeUnpause", async () => {
          await rpmAsCaller.completePause();
          expect(await relativePositionManager.isCompletelyPaused()).to.equal(true);
          await rpmAsCaller.completeUnpause();
          expect(await relativePositionManager.isCompletelyPaused()).to.equal(false);
        });

        it("setProportionalCloseTolerance", async () => {
          const current = await relativePositionManager.proportionalCloseTolerance();
          const newValue = current.add(1);
          await rpmAsCaller.setProportionalCloseTolerance(newValue);
          expect(await relativePositionManager.proportionalCloseTolerance()).to.equal(newValue);
        });

        it("executePositionAccountCall", async () => {
          // Reverts with InvalidCallsLength (not Unauthorized) — proves ACM permission passed
          await expect(rpmAsCaller.executePositionAccountCall(POSITION_ACCOUNT, [], [])).to.be.revertedWithCustomError(
            relativePositionManager,
            "InvalidCallsLength",
          );
        });
      });
    }
  });
});
