import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot, expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip315 from "../../vips/vip-315/bscmainnet";

forking(39146407, async () => {
  const provider = ethers.provider;

  before(async () => {
    
  });

  testVip("VIP-315", vip315(), {
    callbackAfterExecution: async txResponse => {
    },
  });

  describe("Post-VIP behavior", async () => {
  });
});
