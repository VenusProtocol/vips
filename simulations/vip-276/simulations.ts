import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  IL_DEFI_COMPTROLLER,
  IL_GAMEFI_COMPTROLLER,
  UNITROLLER,
  vETH_CORE,
  vFDUSD_CORE,
  vTWT_DEFI,
  vUNI_CORE,
  vUSDC_CORE,
  vUSDT_GAMEFI,
  vWBETH_CORE,
  vip276,
} from "../../vips/vip-276/bscmainnet";
import SETTER_FACET_ABI from "./abi/SetterFacet.json";

forking(37186111, () => {
  let comptroller_core: Contract;
  let ilcomptroller_defi: Contract;
  let ilcomptroller_gamefi: Contract;

  before(async () => {
    comptroller_core = new ethers.Contract(UNITROLLER, SETTER_FACET_ABI, ethers.provider);
    ilcomptroller_defi = new ethers.Contract(IL_DEFI_COMPTROLLER, SETTER_FACET_ABI, ethers.provider);
    ilcomptroller_gamefi = new ethers.Contract(IL_GAMEFI_COMPTROLLER, SETTER_FACET_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check supply caps core pool", async () => {
      let cap = await comptroller_core.supplyCaps(vUNI_CORE);
      expect(cap).to.equal(parseUnits("300000", 18));

      cap = await comptroller_core.supplyCaps(vFDUSD_CORE);
      expect(cap).to.equal(parseUnits("20000000", 18));
    });

    it("check borrow caps core pool", async () => {
      let cap = await comptroller_core.borrowCaps(vWBETH_CORE);
      expect(cap).to.equal(parseUnits("4000", 18));

      cap = await comptroller_core.borrowCaps(vETH_CORE);
      expect(cap).to.equal(parseUnits("40000", 18));

      cap = await comptroller_core.borrowCaps(vUSDC_CORE);
      expect(cap).to.equal(parseUnits("124700000", 18));
    });

    it("check IL DeFi supply caps", async () => {
      const cap = await ilcomptroller_defi.supplyCaps(vTWT_DEFI);
      expect(cap).to.equal(parseUnits("1500000", 18));
    });

    it("check IL GameFi borrow caps", async () => {
      const cap = await ilcomptroller_gamefi.borrowCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(parseUnits("800000", 18));
    });
  });

  testVip("VIP-276", vip276(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewBorrowCap", "NewSupplyCap"], [4, 3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply caps core pool", async () => {
      let cap = await comptroller_core.supplyCaps(vUNI_CORE);
      expect(cap).to.equal(parseUnits("400000", 18));

      cap = await comptroller_core.supplyCaps(vFDUSD_CORE);
      expect(cap).to.equal(parseUnits("30000000", 18));
    });

    it("check borrow caps core pool", async () => {
      let cap = await comptroller_core.borrowCaps(vWBETH_CORE);
      expect(cap).to.equal(parseUnits("8000", 18));

      cap = await comptroller_core.borrowCaps(vETH_CORE);
      expect(cap).to.equal(parseUnits("60000", 18));

      cap = await comptroller_core.borrowCaps(vUSDC_CORE);
      expect(cap).to.equal(parseUnits("200000000", 18));
    });

    it("check IL DeFi supply caps", async () => {
      const cap = await ilcomptroller_defi.supplyCaps(vTWT_DEFI);
      expect(cap).to.equal(parseUnits("3000000", 18));
    });

    it("check IL GameFi borrow caps", async () => {
      const cap = await ilcomptroller_gamefi.borrowCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(parseUnits("1100000", 18));
    });
  });
});
