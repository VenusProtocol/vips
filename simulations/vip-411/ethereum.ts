import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip411, {
  ETHEREUM_DAI_TUSD_FRAX_IRM,
  ETHEREUM_TWO_KINKS_IRM,
  ETHEREUM_crvUSD_IRM,
  vDAI_ETHEREUM_CORE,
  vFRAX_ETHEREUM_CORE,
  vTUSD_ETHEREUM_CORE,
  vUSDC_ETHEREUM_CORE,
  vUSDT_ETHEREUM_CORE,
  vcrvUSD_ETHEREUM_CORE,
  vcrvUSD_ETHEREUM_CURVE,
} from "../../vips/vip-411/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const ETH_BLOCKS_PER_YEAR = 2_628_000; // assuming a block is mined every 12 seconds

forking(21492940, async () => {
  describe("Pre-VIP behaviour", () => {
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vDAI_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4");

      vToken = new ethers.Contract(vTUSD_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4");

      vToken = new ethers.Contract(vFRAX_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x244dBE6d11Ae9AadBaD552E6BD8901B680028E31");

      vToken = new ethers.Contract(vcrvUSD_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x244dBE6d11Ae9AadBaD552E6BD8901B680028E31");

      vToken = new ethers.Contract(vcrvUSD_ETHEREUM_CURVE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x508a84311d19fb77E603C1d234d560b2374d0791");
    });

    checkInterestRate(
      "0xD9D3E7adA04993Cf06dE1A5c9C7f101BD1DefBF4",
      "ETHEREUM_DAI_TUSD_IRM",
      {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x244dBE6d11Ae9AadBaD552E6BD8901B680028E31",
      "ETHEREUM_FRAX_crvUSD_IRM",
      {
        base: "0",
        multiplier: "0.15",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      "0x508a84311d19fb77E603C1d234d560b2374d0791",
      "ETHEREUM_crvUSD_IRM",
      {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 411", await vip411(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [7]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vUSDC_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDT_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vDAI_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_DAI_TUSD_FRAX_IRM);

      vToken = new ethers.Contract(vTUSD_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_DAI_TUSD_FRAX_IRM);

      vToken = new ethers.Contract(vFRAX_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_DAI_TUSD_FRAX_IRM);

      vToken = new ethers.Contract(vcrvUSD_ETHEREUM_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_crvUSD_IRM);

      vToken = new ethers.Contract(vcrvUSD_ETHEREUM_CURVE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(ETHEREUM_crvUSD_IRM);
    });
    checkTwoKinksInterestRateIL(
      ETHEREUM_TWO_KINKS_IRM,
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
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETHEREUM_DAI_TUSD_FRAX_IRM,
      "ETHEREUM_DAI_TUSD_FRAX_IRM",
      {
        base: "0",
        multiplier: "0.175",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );

    checkInterestRate(
      ETHEREUM_crvUSD_IRM,
      "ETHEREUM_crvUSD_IRM",
      {
        base: "0",
        multiplier: "0.2",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(ETH_BLOCKS_PER_YEAR),
    );
  });
});
