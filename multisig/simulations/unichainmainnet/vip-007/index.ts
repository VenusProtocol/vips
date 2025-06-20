import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip007, { CORE_POOL_COMPTROLLER, vWETH } from "../../../proposals/unichainmainnet/vip-007";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(9065704, async () => {
  const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_POOL_COMPTROLLER);

  describe("Pre-VIP behavior", async () => {
    it("should have correct market supply caps", async () => {
      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("350", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip007());
    });

    it("should have correct market supply caps", async () => {
      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("700", 18));
    });
  });
});
