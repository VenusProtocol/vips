import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip392, { VETH_LST_IRM, vETH_CORE_IRM, vETH_CORE, vETH_LST } from "../../vips/vip-392/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

forking(43743361, async () => {
  const provider = ethers.provider;

  const vETHCore = new ethers.Contract(vETH_CORE, VTOKEN_CORE_POOL_ABI, provider);
  const vETHLST = new ethers.Contract(vETH_LST, VTOKEN_CORE_POOL_ABI, provider);

  testVip("VIP-392", await vip392());

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      expect(await vETHCore.interestRateModel()).to.equal(vETH_CORE_IRM);
      expect(await vETHLST.interestRateModel()).to.equal(VETH_LST_IRM);
    });

    describe("new interest rate model parameters", async () => {
      checkInterestRate(vETH_CORE_IRM, "vETH (Core)", {
        base: "0",
        multiplier: "0.03",
        jump: "4.5",
        kink: "0.9",
      });

      checkInterestRate(VETH_LST_IRM, "vETH (LST)", {
        base: "0",
        multiplier: "0.03",
        jump: "4.5",
        kink: "0.9",
      });
    });
  });
});
