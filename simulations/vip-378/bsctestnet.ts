import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import vip378, { NEW_VTOKEN_IMPLEMENTATION, VTOKEN_BEACON } from "../../vips/vip-378/bsctestnet";
import VTOKEN_BEACON_ABI from "./abis/upgradableBeacon.json";

forking(44348818, async () => {
  let vTokenBeacon: Contract;
  before(async () => {
    vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal("0xa60b28FDDaAB87240C3AF319892e7A4ad6FbF41F");
    });
  });

  testVip("VIP-378", await vip378(), {});

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal(NEW_VTOKEN_IMPLEMENTATION);
    });

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
