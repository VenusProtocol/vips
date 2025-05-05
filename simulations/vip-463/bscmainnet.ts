import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip463, {
  BNB_CORE_COMPTROLLER,
  BNB_TWT_CORE,
  BNB_TWT_CORE_SUPPLY_CAP,
  BNB_UNI_CORE,
  BNB_UNI_CORE_SUPPLY_CAP,
} from "../../vips/vip-463/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(47257273, async () => {
  const comptroller = new ethers.Contract(BNB_CORE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP risk parameters", () => {
    it("UNI should have supply cap of 1.3M", async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(parseUnits("1300000", 18));
    });
    it("TWT should have supply cap of 2M", async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_TWT_CORE);
      expect(supplyCap).equals(parseUnits("2000000", 18));
    });
  });

  testVip("VIP-463", await vip463(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [2, 0]);
    },
  });

  describe("Risk parameters", () => {
    it(`UNI should have supply cap of ${BNB_UNI_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(BNB_UNI_CORE_SUPPLY_CAP);
    });

    it(`TWT should have supply cap of ${BNB_TWT_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_TWT_CORE);
      expect(supplyCap).equals(BNB_TWT_CORE_SUPPLY_CAP);
    });
  });
});
