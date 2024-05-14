import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { vip108 } from "../../vips/vip-108";
import PAIR_ABI from "./abi/pairAbi.json";

const PAIR = "0xD94FeFc80a7d10d4708b140c7210569061a7eddb";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

forking(27255735, async () => {
  let pair: Contract;
  const provider = ethers.provider;
  const currentLiquidityUsdt = parseUnits("90.294422022310547114", 18);
  const currentLiquidityVai = parseUnits("87.950866165080484144", 18);
  let prevBalance: number;

  before(async () => {
    pair = new ethers.Contract(PAIR, PAIR_ABI, provider);
    prevBalance = await pair.balanceOf(TREASURY);
  });

  testVip("VIP-108 Provide Liquidity in Pancake Swap", await vip108());
  describe("Post-VIP behavior", async () => {
    it("Should increse Liquidity", async () => {
      const newLiquidityUsdt = (await pair.getReserves())[0];
      const newLiquidityVai = (await pair.getReserves())[1];

      let expected = parseUnits("178200", 18).add(currentLiquidityUsdt);
      expect(newLiquidityUsdt).greaterThanOrEqual(expected);

      expected = parseUnits("178200", 18).add(currentLiquidityVai);
      expect(newLiquidityVai).greaterThanOrEqual(expected);
    });

    it("Should increse LP token balance of treasury", async () => {
      const newBalance = await pair.balanceOf(TREASURY);
      expect(newBalance).greaterThan(prevBalance);
    });
  });
});
