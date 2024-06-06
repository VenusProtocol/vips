import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip147 } from "../../vips/vip-147";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER_GAMEFI = "0x1b43ea8622e76627B81665B1eCeBB4867566B963";
const vFLOKI_GAMEFI = "0xc353B7a1E13dDba393B5E120D4169Da7185aA2cb";

forking(30250111, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER_GAMEFI, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("supply cap of FLOKI_GAMEFI equals 22,000,000,000", async () => {
      const oldCap = await comptroller.supplyCaps(vFLOKI_GAMEFI);
      expect(oldCap).to.equal(parseUnits("22000000000", 9));
    });
  });

  testVip("VIP-147 Risk Parameters Update", await vip147(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of FLOKI_GAMEFI equals 44,000,000,000", async () => {
      const newCap = await comptroller.supplyCaps(vFLOKI_GAMEFI);
      expect(newCap).to.equal(parseUnits("44000000000", 9));
    });
  });
});
