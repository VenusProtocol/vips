import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip106 } from "../../vips/vip-106";
import PAIR_ABI from "./abi/pairAbi.json";

const PAIR = "0xD94FeFc80a7d10d4708b140c7210569061a7eddb";

forking(26881099, () => {
  let pair: ethers.Contract;
  const provider = ethers.provider;
  const currentLiquidityUsdt = parseUnits("90.294422022310547114", 18);
  const currentLiquidityVai = parseUnits("87.950866165080484144", 18);

  before(async () => {
    pair = new ethers.Contract(PAIR, PAIR_ABI, provider);
  });

  testVip("VIP-106 Provide Liquidity in Pancake Swap", vip106());
  describe("Post-VIP behavior", async () => {
    it("Should increse Liquidity", async () => {
      const newLiquidityUsdt = (await pair.getReserves())[0];
      const newLiquidityVai = (await pair.getReserves())[1];

      let expected = parseUnits("178200", 18).add(currentLiquidityUsdt);
      expect(newLiquidityUsdt).greaterThanOrEqual(expected);

      expected = parseUnits("178200", 18).add(currentLiquidityVai);
      expect(newLiquidityVai).greaterThanOrEqual(expected);
    });
  });
});
