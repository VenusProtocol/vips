import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip322 from "../../vips/vip-322/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

forking(39159653, () => {
  let usdc: Contract;

  before(async () => {
  });

  testVip("VIP-322", vip322(), {
    callbackAfterExecution: async txResponse => {
      // await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-Execution state", () => {
  });
});
