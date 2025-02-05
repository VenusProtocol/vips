import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BNB_COMPTROLLER, vUNI, vUNI_SUPPLY_CAP, vip431 } from "../../vips/vip-431/bscmainnet";
import BNB_CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const vUNI_SUPPLY_CAP_PREV = parseUnits("990000", 18);

forking(46014363, async () => {
  const provider = ethers.provider;
  const bnbCoreComptroller = new ethers.Contract(BNB_COMPTROLLER, BNB_CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    describe("BNB CORE pool checks", () => {
      it("check supply cap for UNI", async () => {
        const supplyCap = await bnbCoreComptroller.supplyCaps(vUNI);

        expect(supplyCap).to.eq(vUNI_SUPPLY_CAP_PREV);
      });
    });
  });

  testVip("VIP-431", await vip431(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BNB_CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);

      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("BNB CORE pool checks", () => {
      it("check supply cap for UNI", async () => {
        const supplyCap = await bnbCoreComptroller.supplyCaps(vUNI);

        expect(supplyCap).to.eq(vUNI_SUPPLY_CAP);
      });
    });
  });
});
