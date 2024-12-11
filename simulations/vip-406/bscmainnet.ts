import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip406, { BORROW_CAP, GAMEFI_COMPTROLLER, IRM, vFLOKI } from "../../vips/vip-406/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const OLD_IRM = "0xC682145a767ca98B743B895f1Bd2D4696bC9C2eC";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(44745851, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);
  const comptroller = new ethers.Contract(GAMEFI_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });

    describe("old interest rate model parameters", async () => {
      checkTwoKinksInterestRate(OLD_IRM, "vBNB", {
        base: "0",
        multiplier: "0.225",
        kink1: "0.4",
        multiplier2: "0.35",
        base2: "0.21",
        kink2: "0.7",
        jump: "5",
      });
    });

    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.25", 18));
    });

    it("check borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vFLOKI);
      expect(borrowCap).to.equal(parseUnits("4000000000", 9));
    });
  });

  testVip("VIP-406", await vip406(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [VTOKEN_CORE_POOL_ABI],
        ["NewMarketInterestRateModel", "NewReserveFactor"],
        [1, 1],
      );

      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IRM);
    });

    describe("new interest rate model parameters", async () => {
      checkTwoKinksInterestRate(IRM, "vBNB", {
        base: "0",
        multiplier: "0.125",
        kink1: "0.4",
        multiplier2: "0.9",
        base2: "0.21",
        kink2: "0.8",
        jump: "5",
      });
    });

    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.30", 18));
    });

    it("check borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vFLOKI);
      expect(borrowCap).to.equal(BORROW_CAP);
    });
  });
});
