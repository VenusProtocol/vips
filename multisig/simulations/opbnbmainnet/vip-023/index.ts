import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { NEW_VTOKEN_IMPLEMENTATION, VTOKEN_BEACON, vip023 } from "../../../proposals/opbnbmainnet/vip-023";
import VTOKEN_BEACON_ABI from "./abis/upgradableBeacon.json";

forking(35934024, async () => {
  let vTokenBeacon: Contract;

  before(async () => {
    vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal("0x6218d22aE20004e77aDd203699A5477697F945c6");
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip023());
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
