import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  ZK_vUSDC_Core,
  ZK_vUSDC_Core_IRM,
  ZK_vUSDCe_Core,
  ZK_vUSDCe_Core_IRM,
  ZK_vUSDT_Core,
  ZK_vUSDT_Core_IRM,
} from "../../vips/vip-506/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000; // seconds per year

let vUSDCe_Core: Contract;
let vUSDT_Core: Contract;
let vUSDC_Core: Contract;

forking(61099146, async () => {
  before(async () => {
    vUSDCe_Core = new ethers.Contract(ZK_vUSDCe_Core, VTOKEN_ABI, ethers.provider);
    vUSDT_Core = new ethers.Contract(ZK_vUSDT_Core, VTOKEN_ABI, ethers.provider);
    vUSDC_Core = new ethers.Contract(ZK_vUSDC_Core, VTOKEN_ABI, ethers.provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      expect(await vUSDCe_Core.interestRateModel()).to.equals("0x61E98E6a1F37649543156DC995E0dfe466B31a2e");
      expect(await vUSDT_Core.interestRateModel()).to.equals("0x61E98E6a1F37649543156DC995E0dfe466B31a2e");
      expect(await vUSDC_Core.interestRateModel()).to.equals("0x61E98E6a1F37649543156DC995E0dfe466B31a2e");
    });

    checkTwoKinksInterestRateIL(
      "0x61E98E6a1F37649543156DC995E0dfe466B31a2e",
      "USDCe_CORE_USDT_CORE_USDC_CORE",
      {
        base: "0",
        multiplier: "0.15",
        kink1: "0.8",
        multiplier2: "0.9",
        base2: "0",
        kink2: "0.9",
        jump: "3",
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
      expect(await vUSDCe_Core.interestRateModel()).to.equals(ZK_vUSDCe_Core_IRM);
      expect(await vUSDT_Core.interestRateModel()).to.equals(ZK_vUSDT_Core_IRM);
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
        jump: "3",
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
        jump: "3",
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
        jump: "3",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });
});
