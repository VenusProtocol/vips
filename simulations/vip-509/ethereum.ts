import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip509, {
  ETH_vDAI_Core,
  ETH_vDAI_Core_IRM,
  ETH_vFRAX_Core,
  ETH_vFRAX_Core_IRM,
  ETH_vTUSD_Core,
  ETH_vTUSD_Core_IRM,
  ETH_vUSDC_Core,
  ETH_vUSDC_Core_IRM,
  ETH_vUSDC_Ethena,
  ETH_vUSDC_Ethena_IRM,
  ETH_vUSDS_Core,
  ETH_vUSDS_Core_IRM,
  ETH_vUSDT_Core,
  ETH_vUSDT_Core_IRM,
  ETH_vcrvUSD_Core,
  ETH_vcrvUSD_Core_IRM,
  ETH_vcrvUSD_Curve,
  ETH_vcrvUSD_Curve_IRM,
} from "../../vips/vip-509/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ETH_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds

const oldIRMs = [
  [ETH_vUSDS_Core, "0x322072b84434609ff64333A125516055B5B4405F"],
  [ETH_vUSDC_Core, "0x4A786e4653Ff7DBA74D6dA0861350F233f2dA73b"],
  [ETH_vcrvUSD_Core, "0x837996e7d74222965ACf1fdd478926e07336a291"],
  [ETH_vFRAX_Core, "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9"],
  [ETH_vDAI_Core, "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9"],
  [ETH_vUSDT_Core, "0x4A786e4653Ff7DBA74D6dA0861350F233f2dA73b"],
  [ETH_vTUSD_Core, "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9"],
  [ETH_vcrvUSD_Curve, "0x837996e7d74222965ACf1fdd478926e07336a291"],
  [ETH_vUSDC_Ethena, "0x786ed1931Fa76a70B1259c42B0aC106B1E08485c"],
];

const newIRMs = [
  [ETH_vUSDS_Core, ETH_vUSDS_Core_IRM],
  [ETH_vUSDC_Core, ETH_vUSDC_Core_IRM],
  [ETH_vcrvUSD_Core, ETH_vcrvUSD_Core_IRM],
  [ETH_vFRAX_Core, ETH_vFRAX_Core_IRM],
  [ETH_vDAI_Core, ETH_vDAI_Core_IRM],
  [ETH_vUSDT_Core, ETH_vUSDT_Core_IRM],
  [ETH_vTUSD_Core, ETH_vTUSD_Core_IRM],
  [ETH_vcrvUSD_Curve, ETH_vcrvUSD_Curve_IRM],
  [ETH_vUSDC_Ethena, ETH_vUSDC_Ethena_IRM],
];

forking(22595258, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      for (const [market, expectedIRM] of oldIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedIRM);
      }
    });

    checkInterestRate(
      "0x322072b84434609ff64333A125516055B5B4405F",
      "USDS_Core",
      {
        base: "0",
        multiplier: "0.15625",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkTwoKinksInterestRateIL(
      "0x4A786e4653Ff7DBA74D6dA0861350F233f2dA73b",
      "USDC_Core_USDT_Core",
      {
        base: "0",
        multiplier: "0.15",
        kink1: "0.8",
        multiplier2: "0.9",
        base2: "0",
        kink2: "0.9",
        jump: "3.0",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x837996e7d74222965ACf1fdd478926e07336a291",
      "crvUSD_CORE_crvUSD_Curve",
      {
        base: "0",
        multiplier: "0.2",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9",
      "FRAX_Core",
      {
        base: "0",
        multiplier: "0.175",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9",
      "DAI_CORE_TUSD_Core",
      {
        base: "0",
        multiplier: "0.175",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x786ed1931Fa76a70B1259c42B0aC106B1E08485c",
      "USDC_Ethena",
      {
        base: "0",
        multiplier: "0.16304",
        jump: "2.5",
        kink: "0.92",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 509", await vip509(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [9]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      for (const [market, expectedIRM] of newIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedIRM);
      }
    });

    checkInterestRate(
      ETH_vUSDS_Core_IRM,
      "USDS_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkTwoKinksInterestRateIL(
      ETH_vUSDC_Core_IRM,
      "USDC_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "3.0",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vcrvUSD_Core_IRM,
      "crvUSD_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vFRAX_Core_IRM,
      "FRAX_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vDAI_Core_IRM,
      "DAI_Core",
      {
        base: "0.",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkTwoKinksInterestRateIL(
      ETH_vUSDT_Core_IRM,
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "3.0",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vTUSD_Core_IRM,
      "TUSD_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vcrvUSD_Curve_IRM,
      "crvUSD_Curve",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETH_vUSDC_Ethena_IRM,
      "USDC_Ethena",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.92",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );
  });
});
