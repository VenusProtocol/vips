import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  vip509,
} from "../../vips/vip-509/bscmainnet";


forking(50915884, async () => {
  const provider = ethers.provider;

  before(async () => {
  });


  testVip("VIP-508-testnet", await vip509(), {
    callbackAfterExecution: async txResponse => {
      
    },
  });

});
