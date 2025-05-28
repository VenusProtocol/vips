import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  SEPOLIA_vDAI_Core,
  SEPOLIA_vDAI_Core_IRM,
  SEPOLIA_vFRAX_Core,
  SEPOLIA_vFRAX_Core_IRM,
  SEPOLIA_vTUSD_Core,
  SEPOLIA_vTUSD_Core_IRM,
  SEPOLIA_vUSDC_Core,
  SEPOLIA_vUSDC_Core_IRM,
  SEPOLIA_vUSDC_Ethena,
  SEPOLIA_vUSDC_Ethena_IRM,
  SEPOLIA_vUSDS_Core,
  SEPOLIA_vUSDS_Core_IRM,
  SEPOLIA_vUSDT_Core,
  SEPOLIA_vUSDT_Core_IRM,
  SEPOLIA_vcrvUSD_Core,
  SEPOLIA_vcrvUSD_Core_IRM,
  SEPOLIA_vcrvUSD_Curve,
  SEPOLIA_vcrvUSD_Curve_IRM,
} from "../../vips/vip-506/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ETH_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds
export const OLD_ETH_BLOCK_PER_YER = 2_252_571;

const oldIRMs = [
  [SEPOLIA_vUSDS_Core, "0xBd20E6922A5b1e20B5e611700f1Cab7c177C35De"],
  [SEPOLIA_vUSDC_Core, "0xA03205bC635A772E533E7BE36b5701E331a70ea3"],
  [SEPOLIA_vcrvUSD_Core, "0xA03205bC635A772E533E7BE36b5701E331a70ea3"],
  [SEPOLIA_vFRAX_Core, "0xfBa27be0766acb9a60d2cede3d4293193f3b749d"],
  [SEPOLIA_vDAI_Core, "0xB778B803a72Af7ac9Ac8277bA87B405cE91741B9"],
  [SEPOLIA_vUSDT_Core, "0xA03205bC635A772E533E7BE36b5701E331a70ea3"],
  [SEPOLIA_vTUSD_Core, "0xfBa27be0766acb9a60d2cede3d4293193f3b749d"],
  [SEPOLIA_vcrvUSD_Curve, "0xA03205bC635A772E533E7BE36b5701E331a70ea3"],
  [SEPOLIA_vUSDC_Ethena, "0x7a381Fa8B502ac3870D05ECfb321CFEf1818A218"],
];

const newIRMs = [
  [SEPOLIA_vUSDS_Core, SEPOLIA_vUSDS_Core_IRM],
  [SEPOLIA_vUSDC_Core, SEPOLIA_vUSDC_Core_IRM],
  [SEPOLIA_vcrvUSD_Core, SEPOLIA_vcrvUSD_Core_IRM],
  [SEPOLIA_vFRAX_Core, SEPOLIA_vFRAX_Core_IRM],
  [SEPOLIA_vDAI_Core, SEPOLIA_vDAI_Core_IRM],
  [SEPOLIA_vUSDT_Core, SEPOLIA_vUSDT_Core_IRM],
  [SEPOLIA_vTUSD_Core, SEPOLIA_vTUSD_Core_IRM],
  [SEPOLIA_vcrvUSD_Curve, SEPOLIA_vcrvUSD_Curve_IRM],
  [SEPOLIA_vUSDC_Ethena, SEPOLIA_vUSDC_Ethena_IRM],
];

forking(8412432, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      for (const [market, expectedIRM] of oldIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedIRM);
      }
    });

    checkInterestRate(
      "0xBd20E6922A5b1e20B5e611700f1Cab7c177C35De",
      "USDS_CORE",
      {
        base: "0",
        multiplier: "0.15625",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0xA03205bC635A772E533E7BE36b5701E331a70ea3",
      "USDC_CORE_USDT_CORE_vcrvUSD_CORE_vcrv_USD_Curve",
      {
        base: "0",
        multiplier: "0.07",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(OLD_ETH_BLOCK_PER_YER),
    );

    checkInterestRate(
      "0xfBa27be0766acb9a60d2cede3d4293193f3b749d",
      "FRAX_Core_TUSD_Core",
      {
        base: "0",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0xB778B803a72Af7ac9Ac8277bA87B405cE91741B9",
      "DAI_CORE",
      {
        base: "0",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x7a381Fa8B502ac3870D05ECfb321CFEf1818A218",
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

  testForkedNetworkVipCommands("VIP 506", await vip506(), {
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
      SEPOLIA_vUSDS_Core_IRM,
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
      SEPOLIA_vUSDC_Core_IRM,
      "USDC_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      SEPOLIA_vcrvUSD_Core_IRM,
      "crvUSD_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      SEPOLIA_vFRAX_Core_IRM,
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
      SEPOLIA_vDAI_Core_IRM,
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
      SEPOLIA_vUSDT_Core_IRM,
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      SEPOLIA_vTUSD_Core_IRM,
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
      SEPOLIA_vcrvUSD_Curve_IRM,
      "crvUSD_Curve",
      {
        base: "0",
        multiplier: "0.1",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      SEPOLIA_vUSDC_Ethena_IRM,
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
