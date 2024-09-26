import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip009, {
  CORE_POOL_COMPTROLLER,
  vZK,
  vUSDCe,
  vWETH,
  vUSDCe_SUPPLY_CAP,
  vZK_SUPPLY_CAP,
  vWETH_SUPPLY_CAP,
  vUSDCe_BORROW_CAP,
} from "../../../proposals/zksyncmainnet/vip-009";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(43787868, async () => {
  const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, CORE_POOL_COMPTROLLER);

  describe("Pre-VIP behavior", async () => {
    it("should have correct market supply caps", async () => {
      const vZK_SUPPLY_CAP = await comptroller.supplyCaps(vZK);
      expect(vZK_SUPPLY_CAP).to.be.equal(parseUnits("25000000", 18));
    
      const vUSDCe_SUPPLY_CAP = await comptroller.supplyCaps(vUSDCe);
      expect(vUSDCe_SUPPLY_CAP).to.be.equal(parseUnits("5000000", 6));

      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("2000", 18));
    })
  })

  before(async () => {
    await pretendExecutingVip(await vip009());
  });

  describe("Post-VIP behavior", async () => {
    it("should have correct market supply caps", async () => {
      const vZK_SUPPLY_CAP = await comptroller.supplyCaps(vZK);
      expect(vZK_SUPPLY_CAP).to.be.equal(parseUnits("25000000", 18));
    
      const vUSDCe_SUPPLY_CAP = await comptroller.supplyCaps(vUSDCe);
      expect(vUSDCe_SUPPLY_CAP).to.be.equal(parseUnits("5000000", 6));

      const vWETH_SUPPLY_CAP = await comptroller.supplyCaps(vWETH);
      expect(vWETH_SUPPLY_CAP).to.be.equal(parseUnits("2000", 18));
    })
  });
});
