import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipComptrollerBeaconUpgrade } from "../../../vips/vip-comptroller-beacon-upgrade/vip-comptroller-beacon-upgrade-testnet";
import COMPTROLLER_BEACON_ABI from "./abi/comptroller-beacon.json";

const OLD_COMPTROLLER_IMPLEMENTATION = "0x80691DaD6dAb8a028FFE68bb8045f2547d210f9D";
const NEW_COMPTROLLER_IMPLEMENTATION = "0x9290A138A6c01Ce086baEE90d373d6f4746C9572";
const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";

forking(32267119, () => {
  const provider = ethers.provider;
  let comptrollerBeacon: ethers.Contract;

  beforeEach(async () => {
    comptrollerBeacon = new ethers.Contract(COMPTROLLER_BEACON, COMPTROLLER_BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Comptroller beacon proxy should have old implementation", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(OLD_COMPTROLLER_IMPLEMENTATION);
    });
  });

  testVip("VIPComptrollerBeaconUpgrade", vipComptrollerBeaconUpgrade(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("Comptroller beacon implementation should be upgraded", async () => {
      expect(await comptrollerBeacon.implementation()).to.equal(NEW_COMPTROLLER_IMPLEMENTATION);
    });
  });
});
