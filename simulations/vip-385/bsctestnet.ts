import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip384 from "../../vips/vip-384/bsctestnet";
import vip385 from "../../vips/vip-385/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { basesepolia } = NETWORK_ADDRESSES;
forking(46023795, async () => {
  testVip("VIP 384 Multichain Governance - Grant Permissions", await vip384(), {})

  testVip("VIP 385 Multichain Governance - Revoke Permissions", await vip385(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
});