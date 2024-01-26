import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip009 } from "../../../proposals/vip-009/vip-009-opbnbtestnet";
import COMPTROLLER_FACET_ABI from "./abis/comptroller.json";

const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";
const vUSDT_POOL_STABLECOIN = "0xe3923805f6E117E51f5387421240a86EF1570abC";
const MULTISIG = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

forking(19326830, () => {
  let stableCoinPoolComptroller: ethers.Contract;

  before(async () => {
    impersonateAccount(MULTISIG);

    stableCoinPoolComptroller = new ethers.Contract(
      COMPTROLLER_CORE,
      COMPTROLLER_FACET_ABI,
      await ethers.getSigner(MULTISIG),
    );
  });

  describe("Pre-VIP behavior", () => {
    it("unlist reverts", async () => {
      await expect(stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip009());
    });

    it("unlist successful", async () => {
      await expect(stableCoinPoolComptroller.unlistMarket(vUSDT_POOL_STABLECOIN)).to.be.not.reverted;
    });
  });
});
