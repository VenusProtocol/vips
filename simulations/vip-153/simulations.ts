import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  GameFi_Comptroller,
  GameFi_VFLOKI,
  LiquidStakedBNB_Comptroller,
  LiquidStakedBNB_VstkBNB,
  NEW_BORROW_CAP_FLOKI,
  NEW_BORROW_CAP_stkBNB,
  NEW_SUPPLY_CAP_FLOKI,
  vip153,
} from "../../vips/vip-153";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(30505308, async () => {
  let gamefiComptroller: Contract;
  let lstComptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    gamefiComptroller = new ethers.Contract(GameFi_Comptroller, COMPTROLLER_ABI, provider);
    lstComptroller = new ethers.Contract(LiquidStakedBNB_Comptroller, COMPTROLLER_ABI, provider);
  });

  testVip("VIP-153 Risk Parameters Update", await vip153(), {
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("correct FLOKI supply cap of 68,000,000,000", async () => {
      expect(await gamefiComptroller.supplyCaps(GameFi_VFLOKI)).to.equal(NEW_SUPPLY_CAP_FLOKI);
    });
    it("correct FLOKI borrow cap of 22,000,000,000", async () => {
      expect(await gamefiComptroller.borrowCaps(GameFi_VFLOKI)).to.equal(NEW_BORROW_CAP_FLOKI);
    });
    it("correct vAnkrBNB borrow cap of 580", async () => {
      expect(await lstComptroller.borrowCaps(LiquidStakedBNB_VstkBNB)).to.equal(NEW_BORROW_CAP_stkBNB);
    });
  });
});
