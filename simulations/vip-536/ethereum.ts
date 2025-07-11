import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip536, {
  NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM,
  SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM,
} from "../../vips/vip-536/bscmainnet";
import BEACON_ABI from "./abi/Beacon.json";

const OLD_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM = "0x95de59aD391589603DF33F81B53C4d894D8e5545";

forking(22895432, async () => {
  const provider = ethers.provider;
  let beacon: Contract;

  before(async () => {
    beacon = new ethers.Contract(SINGLE_TOKEN_CONVERTER_BEACON_ETHEREUM, BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("SingleTokenConverter should have old implementation", async () => {
      expect(await beacon.implementation()).to.equal(OLD_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM);
    });
  });

  testForkedNetworkVipCommands("VIP-536", await vip536(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("RiskFundConverter and SingleTokenConverter should have new implementation", async () => {
      expect(await beacon.implementation()).to.equal(NEW_SINGLE_TOKEN_CONVERTER_IMP_ETHEREUM);
    });
  });
});
