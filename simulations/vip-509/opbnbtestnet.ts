import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip509, { OPBNB_vUSDT_Core, OPBNB_vUSDT_Core_IRM } from "../../vips/vip-509/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const OPBNB_BLOCKS_PER_YEAR = 63_072_000; // assuming a block is mined every 0.5 seconds

forking(66278482, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      const vUSDT_Core = new ethers.Contract(OPBNB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDT_Core.interestRateModel()).to.equals("0x41255DA851247d67c13a30e1159778Eb2C55dDDA");
    });

    checkInterestRate(
      "0x41255DA851247d67c13a30e1159778Eb2C55dDDA",
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.07",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(OPBNB_BLOCKS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 509", await vip509(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      const vUSDC_Core = new ethers.Contract(OPBNB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals(OPBNB_vUSDT_Core_IRM);
    });

    checkInterestRate(
      OPBNB_vUSDT_Core_IRM,
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(OPBNB_BLOCKS_PER_YEAR),
    );
  });
});
