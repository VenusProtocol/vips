import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip360, {
  UNITROLLER,
  vUNI,
  vUNI_SUPPLY_CAP,
  vDOGE,
  vDOGE_SUPPLY_CAP
} from "../../vips/vip-360/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(41983388, async () => {
  const provider = ethers.provider;
  let comptrollerContract: Contract;

  before(async () => {
    comptrollerContract = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check supply cap", async () => {
      const UNI_supplyCap = await comptrollerContract.supplyCaps(vUNI);
      expect(UNI_supplyCap).to.be.equal(parseUnits("600000", 18));

      const DOGE_supplyCap = await comptrollerContract.supplyCaps(vDOGE);
      expect(DOGE_supplyCap).to.be.equal(parseUnits("80000000", 8));
    });
  });

  testVip("VIP-360", await vip360(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap"],
        [2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply cap", async () => {
      const UNI_supplyCap = await comptrollerContract.supplyCaps(vUNI);
      expect(UNI_supplyCap).to.be.equal(vUNI_SUPPLY_CAP);

      const DOGE_supplyCap = await comptrollerContract.supplyCaps(vDOGE);
      expect(DOGE_supplyCap).to.be.equal(vDOGE_SUPPLY_CAP);
    });
  });
});
