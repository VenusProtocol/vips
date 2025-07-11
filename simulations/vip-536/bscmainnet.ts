import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC,
  SINGLE_TOKEN_CONVERTER_BEACON_BSC,
} from "../../vips/vip-536/bscmainnet";
import BEACON_ABI from "./abi/Beacon.json";

const OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC = "0x40ed28180Df01FdeB957224E4A5415704B9D5990";

forking(53537328, async () => {
  const provider = ethers.provider;
  let beacon: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_BSC, BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_BSC);
    });
  });

  testVip("VIP-536", await vip536(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_BSC);
    });
  });
});
