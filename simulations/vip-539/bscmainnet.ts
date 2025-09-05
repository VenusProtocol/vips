import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { IRM, RESERVE_FACTOR, SUPPLY_CAP, vBTCB, vip539, vxSolvBTC } from "../../vips/vip-539/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const OLD_IRM = "0xa84189107aF59BF132F3e7dd45DD201C0bb25bF4";

forking(60091886, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(bscmainnet.UNITROLLER, CORE_COMPTROLLER_ABI, provider);
  const vToken = new ethers.Contract(vBTCB, VTOKEN_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vxSolvBTC supply cap", async () => {
      const OLD_vxSolvBTC_SUPPLY_CAP = ethers.utils.parseUnits("1250", 18);

      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC);
      expect(supplyCap).equals(OLD_vxSolvBTC_SUPPLY_CAP);
    });

    it("check vBTCB reserve factor", async () => {
      const OLD_vBTCB_RESERVE_FACTOR = ethers.utils.parseUnits("0.2", 18);

      const reserveFactor = await vToken.reserveFactorMantissa();
      expect(reserveFactor).equals(OLD_vBTCB_RESERVE_FACTOR);
    });

    checkInterestRate(OLD_IRM, "vBTCB", {
      base: "0",
      multiplier: "0.09",
      jump: "2",
      kink: "0.75",
    });
  });

  testVip("VIP-539", await vip539(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel", "NewReserveFactor"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vxSolvBTC supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vxSolvBTC);
      expect(supplyCap).equals(SUPPLY_CAP);
    });

    it("check vBTCB reserve factor", async () => {
      const reserveFactor = await vToken.reserveFactorMantissa();
      expect(reserveFactor).equals(RESERVE_FACTOR);
    });

    checkInterestRate(IRM, "vBTCB", {
      base: "0.0025",
      multiplier: "0.0367",
      jump: "2",
      kink: "0.75",
    });
  });
});
