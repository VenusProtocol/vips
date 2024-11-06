import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents, setMaxStaleCoreAssets } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip370 from "../../vips/vip-370/bscmainnet";
import {
  COMPTROLLER,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  vETH,
  vip372,
  vweETH,
  vwstETH,
} from "../../vips/vip-372/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

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

const XVS_BRIDGE = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";

forking(42508132, async () => {
  let xvsBridge: Contract;
  let comptrollerContract: Contract;

  before(async () => {
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    await pretendExecutingVip(await vip370({}), NORMAL_TIMELOCK);
    comptrollerContract = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, await ethers.getSigner(NORMAL_TIMELOCK));

    await setMaxStaleCoreAssets(CHAINLINK, NORMAL_TIMELOCK);
  });

  describe("Pre-Executing VIP", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_SEND_LIMIT.div(2),
      );
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT.div(2),
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_SEND_LIMIT.div(2));
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncmainnet)).to.equal(
        MAX_DAILY_RECEIVE_LIMIT.div(2),
      );
    });

    for (const [market, { vToken, supplyCap, borrowCap }] of Object.entries(previousCaps)) {
      it(`check supply and borrow cap on ${market}`, async () => {
        const currentSupplyCap = await comptrollerContract.supplyCaps(vToken);
        expect(currentSupplyCap).to.be.equal(supplyCap);

        const currentBorrowCap = await comptrollerContract.borrowCaps(vToken);
        expect(currentBorrowCap).to.be.equal(borrowCap);
      });
    }
  });

  testVip("vip-372", await vip372(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ABI],
        [
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
        ],
        [1, 1, 1, 1],
      );
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [3, 3]);
    },
  });
  describe("Post-Execution state", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncmainnet)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

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
