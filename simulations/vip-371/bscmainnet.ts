import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStaleCoreAssets } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip370 from "../../vips/vip-370/bscmainnet";
import vip371, { COMPTROLLER, vETH, vweETH, vwstETH } from "../../vips/vip-371/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const CHAINLINK = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";

const previousCaps = {
  ETH: {
    vToken: vETH,
    supplyCap: parseUnits("450", 18),
    borrowCap: parseUnits("400", 18),
  },
  weETH: {
    vToken: vweETH,
    supplyCap: parseUnits("400", 18),
    borrowCap: parseUnits("200", 18),
  },
  wstETH: {
    vToken: vwstETH,
    supplyCap: parseUnits("50", 18),
    borrowCap: parseUnits("5", 18),
  },
};

const newCaps = {
  ETH: {
    vToken: vETH,
    supplyCap: parseUnits("3600", 18),
    borrowCap: parseUnits("3250", 18),
  },
  weETH: {
    vToken: vweETH,
    supplyCap: parseUnits("120", 18),
    borrowCap: parseUnits("60", 18),
  },
  wstETH: {
    vToken: vwstETH,
    supplyCap: parseUnits("3200", 18),
    borrowCap: parseUnits("320", 18),
  },
};

forking(42511365, async () => {
  let comptrollerContract: Contract;

  before(async () => {
    await pretendExecutingVip(await vip370({}), NORMAL_TIMELOCK);
    comptrollerContract = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP behavior", async () => {
    for (const [market, { vToken, supplyCap, borrowCap }] of Object.entries(previousCaps)) {
      it(`check supply and borrow cap on ${market}`, async () => {
        const currentSupplyCap = await comptrollerContract.supplyCaps(vToken);
        expect(currentSupplyCap).to.be.equal(supplyCap);

        const currentBorrowCap = await comptrollerContract.borrowCaps(vToken);
        expect(currentBorrowCap).to.be.equal(borrowCap);
      });
    }
  });

  testVip("VIP-371", await vip371(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [3, 3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const [market, { vToken, supplyCap, borrowCap }] of Object.entries(newCaps)) {
      it(`check supply and borrow cap on ${market}`, async () => {
        const currentSupplyCap = await comptrollerContract.supplyCaps(vToken);
        expect(currentSupplyCap).to.be.equal(supplyCap);

        const currentBorrowCap = await comptrollerContract.borrowCaps(vToken);
        expect(currentBorrowCap).to.be.equal(borrowCap);
      });
    }
  });
});
