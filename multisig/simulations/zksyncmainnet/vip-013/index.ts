import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, { CORE_POOL_COMPTROLLER, vWETH, vZK } from "../../../proposals/zksyncmainnet/vip-013";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(45670959, async () => {
  const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_POOL_COMPTROLLER);

  describe("Pre-VIP behavior", async () => {
    it("should have correct market supply caps", async () => {
      const vZK_SUPPLY_CAP = await comptroller.supplyCaps(vZK);
      expect(vZK_SUPPLY_CAP).to.be.equal(parseUnits("35000000", 18));

      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("3000", 18));
    });

    it("should have correct market borrow caps", async () => {
      const vWETH_BORROW_CAP = await comptroller.borrowCaps(vWETH);
      expect(vWETH_BORROW_CAP).to.be.equal(parseUnits("1700", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip013());
    });

    it("should have correct market supply caps", async () => {
      const vZK_SUPPLY_CAP = await comptroller.supplyCaps(vZK);
      expect(vZK_SUPPLY_CAP).to.be.equal(parseUnits("50000000", 18));

      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("6000", 18));
    });

    it("should have correct market borrow caps", async () => {
      const vWETH_BORROW_CAP = await comptroller.borrowCaps(vWETH);
      expect(vWETH_BORROW_CAP).to.be.equal(parseUnits("3400", 18));
    });
  });
});
