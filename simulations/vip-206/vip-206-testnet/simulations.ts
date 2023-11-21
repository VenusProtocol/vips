import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip206Testnet } from "../../../vips/vip-206/vip-206-testnet";
import COMPTROLLER_ABI from "./abi/Comptroller_ABI.json";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const VUNI = "0x171B468b52d7027F12cEF90cd065d6776a25E24e";

forking(35291468, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });
  describe("Pre-VIP behaviour", () => {
    it("should have supply cap of 50,000", async () => {
      expect(await comptroller.supplyCaps(VUNI)).to.equals(parseUnits("50000", 18));
    });
    it("should have borrow cap of 30,000", async () => {
      expect(await comptroller.borrowCaps(VUNI)).to.equals(parseUnits("30000", 18));
    });
  });
  testVip("VIP-206-testnet Update Risk Parameters", vip206Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [1, 1, 0]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("sets new supply cap of 100,000", async () => {
      expect(await comptroller.supplyCaps(VUNI)).to.equals(parseUnits("100000", 18));
    });
    it("sets new borrow cap of 50,000", async () => {
      expect(await comptroller.borrowCaps(VUNI)).to.equals(parseUnits("50000", 18));
    });
  });
});
