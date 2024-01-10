import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip228 } from "../../vips/vip-228";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";

const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

forking(34901100, () => {
  let vaiController: Contract;

  before(async () => {
    vaiController = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_CONTROLLER);
  });

  testVip("vip228", vip228());

  describe("Post-VIP behavior", () => {
    it("sets mintCap to 0", async () => {
      const mintCap = await vaiController.mintCap();
      expect(mintCap).to.equal(0);
    });
  });
});
