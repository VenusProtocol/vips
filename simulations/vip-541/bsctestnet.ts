import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip541, {
} from "../../vips/vip-541/bsctestnet";
import { checkCorePoolComptroller } from "src/vip-framework/checks/checkCorePoolComptroller";
import DIAMOND_ABI from "./abi/Diamond.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(64768829, async () => {
  describe("Pre-VIP behavior", async () => {
    describe("generic tests", async () => {
      checkCorePoolComptroller();
    });
  });

  testVip("VIP-541", await vip541(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [DIAMOND_ABI], ["DiamondCut"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("generic tests", async () => {
      checkCorePoolComptroller();
    });
  });
});
