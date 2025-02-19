import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip453, { BNB_CHAIN_vFLOKI, FLOKI_BORROW_CAP, GAMEFI_COMPTROLLER } from "../../vips/vip-453/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(46738309, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(GAMEFI_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(BNB_CHAIN_vFLOKI);
      expect(borrowCap).to.equal(parseUnits("8000000000", 9));
    });
  });

  testVip("VIP-453", await vip453(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );

      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(BNB_CHAIN_vFLOKI);
      expect(borrowCap).to.equal(FLOKI_BORROW_CAP);
    });
  });
});
