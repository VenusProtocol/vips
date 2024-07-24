import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip049, {
  LIQUID_STAKED_ETH_COMPTROLLER,
  NEW_SUPPLY_CAP,
  vPTweETH26DEC2024LiquidStakedETH,
} from "../../../proposals/ethereum/vip-049";
import COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(20376300, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LIQUID_STAKED_ETH_COMPTROLLER);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Should have old supply cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vPTweETH26DEC2024LiquidStakedETH);
      expect(supplyCap).to.be.equal(parseUnits("1200", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip049());
    });

    it("Should have new supply cap", async () => {
      const supplyCap = await comptroller.supplyCaps(vPTweETH26DEC2024LiquidStakedETH);

      expect(supplyCap).to.be.equal(NEW_SUPPLY_CAP);
    });
  });
});
