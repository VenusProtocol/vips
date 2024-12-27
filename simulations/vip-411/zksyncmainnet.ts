import { BigNumber } from "ethers";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip411, { ZKSYNC_TWO_KINKS_IRM } from "../../vips/vip-411/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ZKSYNC_BLOCKS_PER_YEAR = 31_536_000;

forking(52277026, async () => {
  testForkedNetworkVipCommands("VIP 411", await vip411(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [3]);
    },
  });

  describe("Post-VIP behaviour", async () => {
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
