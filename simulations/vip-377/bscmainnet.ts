import { forking, testVip } from "src/vip-framework";

import vip377, {VTOKEN_BEACON, NEW_VTOKEN_IMPLEMENTATION} from "../../vips/vip-377/bscmainnet";
import VTOKEN_BEACON_ABI from "./abis/upgradableBeacon.json";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";

forking(42702813, async () => {
  let vTokenBeacon: Contract;
  before(async () => {
    vTokenBeacon = new ethers.Contract(VTOKEN_BEACON, VTOKEN_BEACON_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal("0x1EC822383805FfDb9dC2Ae456DF8C0Ca2Bf14d7d");
    })
  });

  testVip("VIP-377", await vip377(), {});

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await vTokenBeacon.implementation()).to.be.equal(NEW_VTOKEN_IMPLEMENTATION);
    })

    describe("generic tests", async () => {
      it("Isolated pools generic tests", async () => {
        checkIsolatedPoolsComptrollers();
      });
    });
  });
});
