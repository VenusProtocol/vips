import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip465, {
  BNB_CORE_COMPTROLLER,
  BNB_vSolv_BTC_CORE,
  BNB_vSolv_BTC_CORE_SUPPLY_CAP,
} from "../../vips/vip-465/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(47197189, async () => {
  const provider = ethers.provider;

  testVip("VIP-458", await vip465(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
  describe("Risk parameters", () => {
    it("should have supply cap of 1720", async () => {
      const comptroller = new ethers.Contract(BNB_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);
      const supplyCap = await comptroller.supplyCaps(BNB_vSolv_BTC_CORE);
      expect(supplyCap).equals(BNB_vSolv_BTC_CORE_SUPPLY_CAP);
    });
  });
});
