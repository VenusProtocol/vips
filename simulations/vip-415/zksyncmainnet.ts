import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip415, {
  ZKSYNC_TWO_KINKS_IRM,
  vUSDC_ZKSYNC_CORE,
  vUSDCe_ZKSYNC_CORE,
  vUSDT_ZKSYNC_CORE,
} from "../../vips/vip-415/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ZKSYNC_BLOCKS_PER_YEAR = 31_536_000;

forking(52277026, async () => {
  testForkedNetworkVipCommands("VIP 415", await vip415(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [3]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vUSDC_ZKSYNC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ZKSYNC_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDT_ZKSYNC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ZKSYNC_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDCe_ZKSYNC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ZKSYNC_TWO_KINKS_IRM);
    });
    checkTwoKinksInterestRateIL(
      ZKSYNC_TWO_KINKS_IRM,
      "USDC_USDT_USDCe_CORE",
      {
        base: "0",
        multiplier: "0.15",
        kink1: "0.8",
        multiplier2: "0.9",
        base2: "0",
        kink2: "0.9",
        jump: "3",
      },
      BigNumber.from(ZKSYNC_BLOCKS_PER_YEAR),
    );
  });
});
