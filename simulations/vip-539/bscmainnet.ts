import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip539, { RELEASE_AMOUNT_BSC } from "../../vips/vip-539/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(56635892, async () => {
  let provider: any;
  let xvs: any;
  let comptrollerPreviousXVSBalance: any;

  before(async () => {
    provider = ethers.provider;
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
    comptrollerPreviousXVSBalance = await xvs.balanceOf(bscmainnet.UNITROLLER);
  });

  testVip("vip-539", await vip539(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [4, 0],
      );

      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should transfer XVS from the Comptroller", async () => {
      const comptrollerXVSBalanceAfter = await xvs.balanceOf(bscmainnet.UNITROLLER);
      expect(comptrollerXVSBalanceAfter).to.equal(comptrollerPreviousXVSBalance.sub(RELEASE_AMOUNT_BSC));
    });
  });
});
