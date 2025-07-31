import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM,
  SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM,
} from "../../vips/vip-536/bsctestnet";
import BEACON_ABI from "./abi/Beacon.json";

const OLD_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM = "0x4ea44b72e00e942b259a6a3720Cf1B8776b9fe93";

forking(172142261, async () => {
  const provider = ethers.provider;
  let beacon: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_ARBITRUM, BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM);
    });
  });

  testForkedNetworkVipCommands("VIP-536", await vip536(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_ARBITRUM);
    });
  });
});
