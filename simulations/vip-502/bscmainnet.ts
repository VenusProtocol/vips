import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip502, { COMPTROLLER_LST, VasBNB_LST } from "../../vips/vip-502/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(49241252, async () => {
  const comptroller = new ethers.Contract(COMPTROLLER_LST, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-Execution state", () => {
    it(`asBNB supply cap should be 2000`, async () => {
      expect(await comptroller.supplyCaps(VasBNB_LST)).to.equal(parseUnits("2000", 18));
    });
  });

  testVip("VIP-502", await vip502(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-Execution state", () => {
    it(`should set supply cap of asBNB to 10000`, async () => {
      expect(await comptroller.supplyCaps(VasBNB_LST)).to.equal(parseUnits("10000", 18));
    });
  });
});
