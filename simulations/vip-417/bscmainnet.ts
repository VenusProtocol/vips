import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip417, { CORE_COMPTROLLER, TOTAL_XVS, XVS, XVS_STORE, XVS_STORE_AMOUNT } from "../../vips/vip-417/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";

forking(45437328, async () => {
  const provider = ethers.provider;
  const xvs = new ethers.Contract(XVS, XVS_ABI, provider);
  let xvsStorePReviousBalance = await xvs.balanceOf(XVS_STORE);
  const comptrollerPreviousXVSBalance = await xvs.balanceOf(CORE_COMPTROLLER);

  before(async () => {
    xvsStorePReviousBalance = await xvs.balanceOf(XVS_STORE);
  });

  testVip("VIP-417", await vip417(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS to the store", async () => {
      const xvsStoreBalance = await xvs.balanceOf(XVS_STORE);
      expect(xvsStoreBalance).to.equal(xvsStorePReviousBalance.add(XVS_STORE_AMOUNT));
    });

    it("should transfer XVS to the Comptroller", async () => {
      const comptrollerXVSBalance = await xvs.balanceOf(CORE_COMPTROLLER);
      expect(comptrollerXVSBalance).to.equal(comptrollerPreviousXVSBalance.sub(TOTAL_XVS));
    });
  });
});
