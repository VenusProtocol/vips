import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip229 } from "../../vips/vip-229";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import VAI_CONTROLLER_ABI from "./abi/vaiController.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";

forking(34901100, async () => {
  let vaiController: Contract;
  let comptroller: Contract;

  before(async () => {
    vaiController = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_CONTROLLER);
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  testVip("vip229", await vip229());

  describe("Post-VIP behavior", () => {
    it("sets mintCap to 10M VAI", async () => {
      const mintCap = await vaiController.mintCap();
      expect(mintCap).to.equal(parseUnits("10000000", 18));
    });

    it("sets VAI mint rate to 100 bps", async () => {
      const mintRate = await comptroller.vaiMintRate();
      expect(mintRate).to.equal(parseUnits("100", 2));
    });
  });
});
