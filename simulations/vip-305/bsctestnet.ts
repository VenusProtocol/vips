import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { LzChainId } from "../../src/types";
import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import {
  vip304,
} from "../../vips/vip-304/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import { vip305 } from "../../vips/vip-305/bsctestnet";

forking(40149880, async () => {
  before(async () => {
    await pretendExecutingVip(await vip304())
  })

  testVip("vip305 give permissions to  critical & fasttrack timelock", await vip305(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [ 2, 0],
      );
    },
  });
});
