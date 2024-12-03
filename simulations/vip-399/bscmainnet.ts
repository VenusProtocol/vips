import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip399, { MAX_DAILY_LIMIT, OMNICHAIN_PROPOSAL_SENDER } from "../../vips/vip-399/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { zksyncmainnet, opmainnet } = NETWORK_ADDRESSES;

forking(43770901, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );

  describe("Pre-VIP behaviour", () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.zksyncmainnet)).to.be.equals("0x");
    });
  });

  testVip("vip399 give permissions to timelock", await vip399(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["SetMaxDailyLimit", "SetTrustedRemoteAddress", "ExecuteRemoteProposal", "StorePayload"],
        [2, 2, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of zksyncmainnet and opmainnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equals(MAX_DAILY_LIMIT);
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.opmainnet)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of zksyncmainnet and opmainnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.zksyncmainnet)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [zksyncmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.opmainnet)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [opmainnet.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
  });
});
