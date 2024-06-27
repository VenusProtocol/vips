import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip218 } from "../../vips/vip-218";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VCAKE = "0x86aC3974e2BD0d60825230fa6F355fF11409df5c";

forking(34348500, async () => {
  let comptroller: Contract;

  const provider = ethers.provider;
  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("CAKE supply cap equals 14,000,000", async () => {
      const oldCap = await comptroller.supplyCaps(VCAKE);
      expect(oldCap).to.equal(parseUnits("14000000", 18));
    });
  });
  testVip("VIP-218 Chaos labs recommendations for the week December 13th, 2023", await vip218());

  describe("Post-VIP behavior", async () => {
    it("Increase CAKE supply cap to 21,000,000", async () => {
      const newCap = await comptroller.supplyCaps(VCAKE);
      expect(newCap).to.equal(parseUnits("21000000", 18));
    });
  });
});
