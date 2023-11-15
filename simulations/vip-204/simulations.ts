import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip204 } from "../../vips/vip-204";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const vBUSD = "0x95c78222b3d6e262426483d42cfa53685a67ab9d";
const BORROWER = "0x8d655AAAA0ec224b17972df385e25325b9103332";

forking(33508800, () => {
  let vToken: ethers.Contract;
  let prevBalance: BigNumber;

  before(async () => {
    vToken = new ethers.Contract(vBUSD, VBEP20_ABI, ethers.provider);
    prevBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
  });

  testVip("VIP-204 Repay BUSD debt on behalf debt", vip204(), {
    proposer: "0x97a32d4506f6a35de68e0680859cdf41d077a9a9",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI, VBEP20_ABI], ["WithdrawTreasuryBEP20", "RepayBorrow"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Should decrese Borrow Balance Stored", async () => {
      const currentBalance = await vToken.callStatic.borrowBalanceCurrent(BORROWER);
      const delta = prevBalance.sub(currentBalance);
      expect(delta).to.equal(parseUnits("6400762.2181", 18));
    });
  });
});
