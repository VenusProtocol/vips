import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  POSITION_ACCOUNT,
  RELATIVE_POSITION_MANAGER,
  TIMELOCKS_AND_GUARDIAN,
  vip610,
} from "../../vips/vip-610/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import RELATIVE_POSITION_MANAGER_ABI from "./abi/RelativePositionManager.json";

const { bscmainnet } = NETWORK_ADDRESSES;

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

forking(87147067, async () => {
  let accessControlManager: Contract;
  let relativePositionManager: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, bscmainnet.ACCESS_CONTROL_MANAGER);
    relativePositionManager = await ethers.getContractAt(RELATIVE_POSITION_MANAGER_ABI, RELATIVE_POSITION_MANAGER);
  });

  describe("Pre-VIP behavior", () => {
    it("RelativePositionManager should have NORMAL_TIMELOCK as pending owner and not yet as owner", async () => {
      expect(await relativePositionManager.owner()).not.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("RPM should not have Position Account implementation set", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equal(ethers.constants.AddressZero);
    });

    it("Timelocks/Guardian should not have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          const role = ethers.utils.solidityPack(["address", "string"], [RELATIVE_POSITION_MANAGER, fnSignature]);
          const roleHash = ethers.utils.keccak256(role);
          expect(await accessControlManager.hasRole(roleHash, timelockOrGuardian)).to.equal(false);
        }
      }
    });
  });

  testVip("VIP-610 [BNB Chain] Configure Relative Position Manager", await vip610());

  describe("Post-VIP behavior", () => {
    it("RelativePositionManager should have NORMAL_TIMELOCK as owner and no pending owner", async () => {
      expect(await relativePositionManager.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(await relativePositionManager.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Timelocks/Guardian should have ACM permissions on RelativePositionManager", async () => {
      for (const timelockOrGuardian of TIMELOCKS_AND_GUARDIAN) {
        for (const fnSignature of ACM_FUNCTION_SIGNATURES) {
          const role = ethers.utils.solidityPack(["address", "string"], [RELATIVE_POSITION_MANAGER, fnSignature]);
          const roleHash = ethers.utils.keccak256(role);
          expect(await accessControlManager.hasRole(roleHash, timelockOrGuardian)).to.equal(true);
        }
      }
    });

    it("RPM should have Position Account implementation stored in the state", async () => {
      expect(await relativePositionManager.POSITION_ACCOUNT_IMPLEMENTATION()).to.equals(POSITION_ACCOUNT);
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
      });
    }
  });
});
