import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  ZK_vUSDC_Core,
  ZK_vUSDC_Core_IRM,
  ZK_vUSDCe_Core,
  ZK_vUSDCe_Core_IRM,
  ZK_vUSDT_Core,
  ZK_vUSDT_Core_IRM,
} from "../../vips/vip-507/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000;

forking(5216041, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      const vUSDCe_Core = new ethers.Contract(ZK_vUSDCe_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDCe_Core.interestRateModel()).to.equals("0x5454be0683eDeceD065D9A4Bd9F376a0396cDCd9");

      const vUSDT_Core = new ethers.Contract(ZK_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDT_Core.interestRateModel()).to.equals("0x5454be0683eDeceD065D9A4Bd9F376a0396cDCd9");

      const vUSDC_Core = new ethers.Contract(ZK_vUSDC_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals("0x782D1BA04d28dbbf1Ff664B62993f69cd6225466");
    });

    checkInterestRate(
      "0x5454be0683eDeceD065D9A4Bd9F376a0396cDCd9",
      "USDCe_CORE_USDT_CORE",
      {
        base: "0",
        multiplier: "0.0875",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );

    checkInterestRate(
      "0x782D1BA04d28dbbf1Ff664B62993f69cd6225466",
      "USDC_CORE",
      {
        base: "0",
        multiplier: "0.0875",
        jump: "0.8",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 506", await vip506(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [3]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      const vUSDCe_Core = new ethers.Contract(ZK_vUSDCe_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDCe_Core.interestRateModel()).to.equals(ZK_vUSDCe_Core_IRM);

      const vUSDT_Core = new ethers.Contract(ZK_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDT_Core.interestRateModel()).to.equals(ZK_vUSDT_Core_IRM);

      const vUSDC_Core = new ethers.Contract(ZK_vUSDC_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals(ZK_vUSDC_Core_IRM);
    });

    checkTwoKinksInterestRateIL(
      ZK_vUSDCe_Core_IRM,
      "USDCe_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "2.5",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );

    checkTwoKinksInterestRateIL(
      ZK_vUSDT_Core_IRM,
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "2.5",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );

    checkTwoKinksInterestRateIL(
      ZK_vUSDC_Core_IRM,
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
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });
});
