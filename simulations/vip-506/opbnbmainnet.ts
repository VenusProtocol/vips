import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  OPBNB_vFDUSD_Core,
  OPBNB_vFDUSD_Core_IRM,
  OPBNB_vUSDT_Core,
  OPBNB_vUSDT_Core_IRM,
} from "../../vips/vip-506/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const OPBNB_BLOCKS_PER_YEAR = 63_072_000; // assuming a block is mined every 0.5 seconds

let vUSDT_Core: Contract;
let vFDUSD_Core: Contract;

forking(60254298, async () => {
  before(async () => {
    vUSDT_Core = new ethers.Contract(OPBNB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
    vFDUSD_Core = new ethers.Contract(OPBNB_vFDUSD_Core, VTOKEN_ABI, ethers.provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      expect(await vUSDT_Core.interestRateModel()).to.equals("0xFe5C9e4188571Df688cB780beA69790B8756263e");
      expect(await vFDUSD_Core.interestRateModel()).to.equals("0xFe5C9e4188571Df688cB780beA69790B8756263e");
    });

    checkInterestRate(
      "0xFe5C9e4188571Df688cB780beA69790B8756263e",
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.125",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(OPBNB_BLOCKS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 506", await vip506(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      expect(await vUSDT_Core.interestRateModel()).to.equals(OPBNB_vUSDT_Core_IRM);
      expect(await vFDUSD_Core.interestRateModel()).to.equals(OPBNB_vFDUSD_Core_IRM);
    });

    checkInterestRate(
      OPBNB_vUSDT_Core_IRM,
      "USDT_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(OPBNB_BLOCKS_PER_YEAR),
    );
    checkInterestRate(
      OPBNB_vFDUSD_Core_IRM,
      "FDUSD_Core",
      {
        base: "0",
        multiplier: "0.1",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(OPBNB_BLOCKS_PER_YEAR),
    );
  });
});
