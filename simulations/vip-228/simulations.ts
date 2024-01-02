import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkVAIController } from "../../src/vip-framework/checks/checkVAIController";
import { vip228 } from "../../vips/vip-228";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";

const VAI_CONTROLLER_PROXY = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VAI_MINTER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

forking(34901046, () => {
  let vaiController: ethers.Contract;

  before(async () => {
    vaiController = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", () => {
    describe("generic tests", async () => {
      checkVAIController();
    });
  });

  testVip("vip228", vip228(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["NewVAIMintCap"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("rates", async () => {
      const mintCap = await vaiController.mintCap();
      expect(mintCap).to.equal(parseUnits("0", 18));
    });
  });
});
