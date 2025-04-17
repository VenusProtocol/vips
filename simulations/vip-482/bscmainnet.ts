import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework/index";

import { expectEvents } from "../../src/utils";
import vip482, { NEW_BORROW_CAP, NEW_SPPLY_CAP, SolvBTC, vTHE } from "../../vips/vip-482/bscmainnet";
import COMPTROLLER_ABI from "./abi/LegacyPoolComptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const ONE_YEAR = 365 * 24 * 3600;

const { RESILIENT_ORACLE, UNITROLLER } = NETWORK_ADDRESSES.bscmainnet;

forking(48405022, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behavior", () => {
    it("get price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal("83859075220550000000000");
    });

    it("check caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vTHE);
      const supplyCap = await comptroller.supplyCaps(vTHE);
      expect(borrowCap).to.be.equal(parseUnits("6000000", 18));
      expect(supplyCap).to.be.equal(parseUnits("12000000", 18));
    });
  });

  testVip("VIP-482", await vip482(ONE_YEAR), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("get price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal("83670628594800000000000");
    });

    it("check caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vTHE);
      const supplyCap = await comptroller.supplyCaps(vTHE);
      expect(borrowCap).to.be.equal(NEW_BORROW_CAP);
      expect(supplyCap).to.be.equal(NEW_SPPLY_CAP);
    });
  });
});
