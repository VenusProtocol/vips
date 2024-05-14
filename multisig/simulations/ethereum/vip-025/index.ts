import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { BORROW_CAP, CURVE_COMPTROLLER, SUPPLY_CAP, vcrvUSD_CURVE, vip025 } from "../../../proposals/ethereum/vip-025";
import COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(19732098, () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CURVE_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("old borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vcrvUSD_CURVE);
      expect(cap).to.equal(parseUnits("2000000", 18));
    });
    it("old supply cap", async () => {
      const cap = await comptroller.supplyCaps(vcrvUSD_CURVE);
      expect(cap).to.equal(parseUnits("2500000", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip025());
    });
    it("new borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vcrvUSD_CURVE);
      expect(cap).to.equal(BORROW_CAP);
    });
    it("new supply cap", async () => {
      const cap = await comptroller.supplyCaps(vcrvUSD_CURVE);
      expect(cap).to.equal(SUPPLY_CAP);
    });
  });
});
