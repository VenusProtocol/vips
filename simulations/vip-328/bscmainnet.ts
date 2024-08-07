import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip328, { COMPTROLLER, vUSDT, vUSDT_SUPPLY_CAP } from "../../vips/vip-328/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(39743887, async () => {
  let comptrollerContract: Contract;

  before(async () => {
    comptrollerContract = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("check supply cap", async () => {
      const supplyCap = await comptrollerContract.supplyCaps(vUSDT);
      expect(supplyCap).to.be.equal(parseUnits("4000000", 18));
    });
  });

  testVip("VIP-328", await vip328(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply cap", async () => {
      const supplyCap = await comptrollerContract.supplyCaps(vUSDT);
      expect(supplyCap).to.be.equal(vUSDT_SUPPLY_CAP);
    });
  });
});
