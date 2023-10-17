import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import { vip186 } from "../../vips/vip-186";
import VTOKEN_CORE_ABI from "./abi/VToken_core.json";
import VTOKEN_IL_ABI from "./abi/VToken_il.json";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const vUSDT_Stablecoins = "0x5e3072305F9caE1c7A82F6Fe9E38811c74922c3B";

forking(32681348, () => {
  testVip("VIP-186 Risk Parameters Update", vip186(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_CORE_ABI, VTOKEN_IL_ABI],
        ["NewMarketInterestRateModel", "Failure"],
        [2, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check new interest rate model", async () => {
      await checkInterestRate(vETH, "vETH", {
        base: "0",
        multiplier: "0.0425",
        jump: "2",
        kink: "0.85",
      });

      await checkInterestRate(vUSDT_Stablecoins, "vUSDT_Stablecoins", {
        base: "0",
        multiplier: "0.05",
        jump: "2.5",
        kink: "0.8",
      });
    });
  });
});
