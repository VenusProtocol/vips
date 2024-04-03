import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInBinanceOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip279 } from "../../vips/vip-279/bscmainnet";


forking(37531985, () => {
  const provider = ethers.provider;

  before(async () => {
  });

  describe("Pre-VIP behavior", () => {
    
  });

  testVip("VIP-279", vip279(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
    },
  });

  describe("Post-VIP behavior", async () => {
   
  });
});
