import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { SOL_BORROW_CAP, asBNB_SUPPLY_CAP, vSOL, vasBNB, vip537 } from "../../vips/vip-537/bscmainnet";
import COMPTROLLER_ABI from "./abi/CoreComptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const OLD_asBNB_SUPPLY_CAP = parseUnits("48000", 18);
const OLD_SOL_BORROW_CAP = parseUnits("9000", 18);

forking(56507618, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check initial supply caps", async () => {
      const supplyCap = await comptroller.supplyCaps(vasBNB);
      expect(supplyCap).to.equals(OLD_asBNB_SUPPLY_CAP);
    });

    it("check initial borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vSOL);
      expect(borrowCap).to.equals(OLD_SOL_BORROW_CAP);
    });
  });

  testVip("vip-537", await vip537(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check initial supply caps", async () => {
      const supplyCap = await comptroller.supplyCaps(vasBNB);
      expect(supplyCap).to.equals(asBNB_SUPPLY_CAP);
    });

    it("check initial borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(vSOL);
      expect(borrowCap).to.equals(SOL_BORROW_CAP);
    });
  });
});
