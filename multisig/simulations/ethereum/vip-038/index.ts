import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip038, { BORROW_CAP, COMPTROLLER, vsFRAX } from "../../../proposals/ethereum/vip-038";
import COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(19962658, () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("old vsFRAX borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vsFRAX);
      expect(cap).to.equal(parseUnits("1000000", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip038());
    });

    it("new vsFRAX borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vsFRAX);
      expect(cap).to.equal(BORROW_CAP);
    });
  });
});
