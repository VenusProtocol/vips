import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { ACM, DEVIATION_SENTINEL, vip590TestnetAddendum } from "../../vips/vip-590/bsctestnet-addendum";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(80138518, async () => {
  let accessControlManager: Contract;

  before(async () => {
    accessControlManager = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
  });

  describe("Pre-VIP behavior", () => {
    it("DeviationSentinel should not have _setActionsPaused permission on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(false);
    });
  });

  testVip("VIP-590 Addendum: Grant _setActionsPaused permission", await vip590TestnetAddendum(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("DeviationSentinel should have _setActionsPaused permission on any comptroller", async () => {
      expect(
        await accessControlManager.hasPermission(
          DEVIATION_SENTINEL,
          ethers.constants.AddressZero,
          "_setActionsPaused(address[],uint8[],bool)",
        ),
      ).to.equal(true);
    });
  });
});
