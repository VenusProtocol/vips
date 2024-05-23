import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip030 } from "../../../proposals/sepolia/vip-030";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_STABLECOIN = "0x18eF8D2bee415b731C25662568dc1035001cEB2c";
const vUSDT_POOL_STABLECOIN = "0x93dff2053D4B08823d8B39F1dCdf8497f15200f4";
const vUSDT_USER = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const GUARDIAN = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB";

forking(5152462, () => {
  let stableCoinPoolComptroller: Contract;

  before(async () => {
    await impersonateAccount(GUARDIAN);

    stableCoinPoolComptroller = new ethers.Contract(
      COMPTROLLER_STABLECOIN,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(GUARDIAN),
    );
  });

  describe("Pre-VIP behavior", () => {
    it("stablecoin pool market not unlisted", async () => {
      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.true;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip030());
    });

    it("stablecoin pool market unlisted", async () => {
      await stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN);

      const markets = await stableCoinPoolComptroller.getAssetsIn(vUSDT_USER);
      expect(markets.includes(vUSDT_POOL_STABLECOIN)).to.be.false;
    });
  });
});
