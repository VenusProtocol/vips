import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { NEW_VTOKEN_IMPLEMENTATION, VTOKEN_BEACON, vip063 } from "../../../proposals/sepolia/vip-063";
import VTOKEN_BEACON_ABI from "./abis/upgradableBeacon.json";

forking(6793317, async () => {
  let vTokenBeacon: Contract;

  before(async () => {
    vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal("0x558083c8Ca93e42F5c0FE7e8c5FC49e9c0d94E14");
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip063());
    });

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
