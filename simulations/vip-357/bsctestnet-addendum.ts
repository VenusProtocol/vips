import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  UNITROLLER,
  vAAVE,
  vAAVE_BORROW_CAP,
  vADA,
  vADA_BORROW_CAP,
  vBNB,
  vBNB_BORROW_CAP,
  vBTC,
  vBTC_BORROW_CAP,
  vBUSD,
  vDOGE,
  vDOGE_BORROW_CAP,
  vETH,
  vETH_BORROW_CAP,
  vLTC,
  vLTC_BORROW_CAP,
  vMATIC,
  vMATIC_BORROW_CAP,
  vTRX,
  vTRX_BORROW_CAP,
  vUSDC,
  vUSDC_BORROW_CAP,
  vUSDT,
  vUSDT_BORROW_CAP,
  vXRP,
  vXRP_BORROW_CAP,
  vip357,
} from "../../vips/vip-357/bsctestnet-addendum";
import COMPTROLLER_FACET_ABI from "./abi/comptroller.json";

forking(43437726, async () => {
  let comptroller: Contract;

  before(async () => {
    await impersonateAccount(UNITROLLER);
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_FACET_ABI, ethers.provider);
  });

  describe("Pre-VIP", () => {
    it("check borrow cap is not 0", async () => {
      const borrowCap = await comptroller.borrowCaps(vBUSD);
      expect(borrowCap).to.be.not.equal(0);
    });

    it("check borrow cap is 0", async () => {
      let borrowCap = await comptroller.borrowCaps(vAAVE);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vADA);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vBNB);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vBTC);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vDOGE);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vETH);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vLTC);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vMATIC);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vTRX);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vUSDC);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vUSDT);
      expect(borrowCap).to.be.equal(0);

      borrowCap = await comptroller.borrowCaps(vXRP);
      expect(borrowCap).to.be.equal(0);
    });
  });

  testVip("VIP-357 Unlist Market", await vip357(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_FACET_ABI], ["NewBorrowCap"], [13]);
    },
  });

  describe("Post-VIP", () => {
    it("check borrow cap 0", async () => {
      const borrowCap = await comptroller.borrowCaps(vBUSD);
      expect(borrowCap).to.be.equal(0);
    });

    it("check borrow cap is not 0", async () => {
      let borrowCap = await comptroller.borrowCaps(vAAVE);
      expect(borrowCap).to.be.equal(vAAVE_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vADA);
      expect(borrowCap).to.be.equal(vADA_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vBNB);
      expect(borrowCap).to.be.equal(vBNB_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vBTC);
      expect(borrowCap).to.be.equal(vBTC_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vDOGE);
      expect(borrowCap).to.be.equal(vDOGE_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vETH);
      expect(borrowCap).to.be.equal(vETH_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vLTC);
      expect(borrowCap).to.be.equal(vLTC_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vMATIC);
      expect(borrowCap).to.be.equal(vMATIC_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vTRX);
      expect(borrowCap).to.be.equal(vTRX_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vUSDC);
      expect(borrowCap).to.be.equal(vUSDC_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vUSDT);
      expect(borrowCap).to.be.equal(vUSDT_BORROW_CAP);

      borrowCap = await comptroller.borrowCaps(vXRP);
      expect(borrowCap).to.be.equal(vXRP_BORROW_CAP);
    });
  });
});
