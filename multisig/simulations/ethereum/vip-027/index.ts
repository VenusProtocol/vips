import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip027, { LST_POOL_COMPTROLLER, LST_POOL_VWEETH, VWEETH_BORROW_CAP } from "../../../proposals/ethereum/vip-027";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(19831582, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LST_POOL_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("check borrow cap", async () => {
      const borrowCap = await comptroller.borrowCaps(LST_POOL_VWEETH);
      expect(borrowCap).to.equal(parseUnits("750", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip027());
    });

    it("check borrow cap", async () => {
      const borrowCap = await comptroller.borrowCaps(LST_POOL_VWEETH);
      expect(borrowCap).to.equal(VWEETH_BORROW_CAP);
    });
  });
});
