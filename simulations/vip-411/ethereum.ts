import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip411, {
  ETHEREUM_DAI_TUSD_FRAX_IRM,
  ETHEREUM_TWO_KINKS_IRM,
  ETHEREUM_crvUSD_IRM
} from "../../vips/vip-411/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";
import { checkInterestRate, checkTwoKinksInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";
import { BigNumber } from "ethers";
export const ETH_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds


forking(21492940, async () => {
  describe("Pre-VIP behaviour", () => {
    checkInterestRate(
      "0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4",
      "ETHEREUM_DAI_TUSD_FRAX_IRM",
      {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR)
    )

    checkInterestRate(
      "0x508a84311d19fb77E603C1d234d560b2374d0791",
      "ETHEREUM_crvUSD_IRM",
      {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR)
    )
  })

  testForkedNetworkVipCommands("VIP 411", await vip411(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI],
        ["NewMarketInterestRateModel"],
        [7],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
     checkTwoKinksInterestRateIL(
      ETHEREUM_TWO_KINKS_IRM, "USDC_USDT_CORE", {
            base: "0",
            multiplier: "0.15",
            kink1: "0.8",
            multiplier2: "0.9",
            base2: "0",
            kink2: "0.9",
            jump: "3",
          },
          BigNumber.from(ETH_BLOCKS_PER_YEAR)
        )

        checkInterestRate(
          ETHEREUM_DAI_TUSD_FRAX_IRM,
          "ETHEREUM_DAI_TUSD_FRAX_IRM",
          {
            base: "0",
            multiplier: "0.175",
            jump: "2.5",
            kink: "0.8",
          },
          BigNumber.from(ETH_BLOCKS_PER_YEAR)
        )
    
        checkInterestRate(
          ETHEREUM_crvUSD_IRM,
          "ETHEREUM_crvUSD_IRM",
          {
            base: "0",
            multiplier: "0.2",
            jump: "2.5",
            kink: "0.8",
          },
          BigNumber.from(ETH_BLOCKS_PER_YEAR)
        )
  });
});
