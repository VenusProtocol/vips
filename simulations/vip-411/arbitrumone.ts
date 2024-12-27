import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip411, {
  ARBITRUM_TWO_KINKS_IRM,
  vUSDC_ARBITRUM_CORE,
  vUSDT_ARBITRUM_CORE,
} from "../../vips/vip-411/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ARB_BLOCKS_PER_YEAR = 31_536_000;

forking(289107554, async () => {
  testForkedNetworkVipCommands("VIP 411", await vip411(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [2]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vUSDC_ARBITRUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ARBITRUM_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDT_ARBITRUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ARBITRUM_TWO_KINKS_IRM);
    });

    checkTwoKinksInterestRateIL(
      ARBITRUM_TWO_KINKS_IRM,
      "USDC_USDT_CORE",
      {
        base: "0",
        multiplier: "0.15",
        kink1: "0.8",
        multiplier2: "0.9",
        base2: "0",
        kink2: "0.9",
        jump: "3",
      },
      BigNumber.from(ARB_BLOCKS_PER_YEAR),
    );
  });
});
