import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip364, { newSpeeds } from "../../vips/vip-364/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

forking(42182861, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  testVip("Update XVS distribution speeds", await vip364(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["VenusSupplySpeedUpdated", "VenusBorrowSpeedUpdated"],
        [22, 21],
      );
    },
  });

  describe("Post-VIP state", () => {
    for (const speed of newSpeeds) {
      it(`Update supply-side distribution speed for ${speed.symbol}`, async () => {
        const supplySpeed = await comptroller.venusSupplySpeeds(speed.market);
        expect(supplySpeed).to.equal(BigNumber.from(speed.supplySideSpeed));
      });

      it(`Update borrow-side distribution speed for ${speed.symbol}`, async () => {
        const borrowSpeed = await comptroller.venusBorrowSpeeds(speed.market);
        expect(borrowSpeed).to.equal(BigNumber.from(speed.borrowSideSpeed));
      });
    }
  });
});
