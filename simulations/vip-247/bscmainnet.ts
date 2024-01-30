import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  COMPTROLLER,
  IL_DEFI_COMPTROLLER,
  OLD_TUSD_CF,
  OLD_TWT_SUPPLY,
  OLD_UNI_SUPPLY,
  OLD_WBETH_SUPPLY,
  TUSD_CF,
  TWT_SUPPLY,
  UNI_SUPPLY,
  WBETH_SUPPLY,
  vTUSD,
  vTWT,
  vUNI,
  vWBETH,
  vip247,
} from "../../vips/vip-247/bscmainnet";
import COMTROLLER_ABI from "./abi/comptroller.json";

forking(35700072, () => {
  const provider = ethers.provider;
  let corePoolComptroller: ethers.Contract;
  let ilDefiComptroller: ethers.Contract;

  before(async () => {
    corePoolComptroller = new ethers.Contract(COMPTROLLER, COMTROLLER_ABI, provider);
    ilDefiComptroller = new ethers.Contract(IL_DEFI_COMPTROLLER, COMTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify UNI and WBETH supply caps ", async () => {
      const uniSupplyCap = await corePoolComptroller.supplyCaps(vUNI);
      expect(uniSupplyCap).equals(OLD_UNI_SUPPLY);

      const wbethSupplyCap = await corePoolComptroller.supplyCaps(vWBETH);
      expect(wbethSupplyCap).equals(OLD_WBETH_SUPPLY);
    });

    it("Verify TWT supply caps ", async () => {
      const twtSupplyCap = await ilDefiComptroller.supplyCaps(vTWT);
      expect(twtSupplyCap).equals(OLD_TWT_SUPPLY);
    });

    it("Verify TUSD collateral factor ", async () => {
      const market = await corePoolComptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).equals(OLD_TUSD_CF);
    });
  });

  testVip("VIP-247 Chaos Labs Recommendations", vip247(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewSupplyCap"], [3]);
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewCollateralFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify UNI and WBETH supply caps ", async () => {
      const uniSupplyCap = await corePoolComptroller.supplyCaps(vUNI);
      expect(uniSupplyCap).equals(UNI_SUPPLY);

      const wbethSupplyCap = await corePoolComptroller.supplyCaps(vWBETH);
      expect(wbethSupplyCap).equals(WBETH_SUPPLY);
    });

    it("Verify TWT supply caps ", async () => {
      const twtSupplyCap = await ilDefiComptroller.supplyCaps(vTWT);
      expect(twtSupplyCap).equals(TWT_SUPPLY);
    });

    it("Verify TUSD collateral factor ", async () => {
      const market = await corePoolComptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).equals(TUSD_CF);
    });
  });
});
