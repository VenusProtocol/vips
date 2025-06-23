import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip455, {
  BNB_GAMEFI_COMPTROLLER,
  BNB_vFLOKI_CORE,
  BNB_vFLOKI_CORE_BORROW_CAP,
} from "../../vips/vip-455/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(46792130, async () => {
  const provider = ethers.provider;

  const comptroller = new ethers.Contract(BNB_GAMEFI_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check borrow caps", async () => {
      const borrowCap = await comptroller.borrowCaps(BNB_vFLOKI_CORE);
      expect(borrowCap).to.equal(parseUnits("16000000000", 9));
    });
  });

  testVip("VIP-455", await vip455(), {
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
      const borrowCap = await comptroller.borrowCaps(BNB_vFLOKI_CORE);
      expect(borrowCap).to.equal(BNB_vFLOKI_CORE_BORROW_CAP);
    });
  });
});
