import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip328, {
  ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR,
  MAX_DAILY_LIMIT,
  OMNICHAIN_PROPOSAL_SENDER,
} from "../../vips/vip-328/bsctestnet-addendum";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41185533, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );

  describe("Pre-VIP behaviour", () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.arbitrumsepolia)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.arbitrumsepolia)).to.be.equals("0x");
    });
    it("Daily limit should be 100 of arbitrumsepolia", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.arbitrumsepolia)).to.equals(0);
    });

    it("Trusted remote should be set of arbitrumsepolia", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.arbitrumsepolia)).to.be.equals("0x");
    });
  });

  testVip("vip328 give permissions to timelock", await vip328(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["SetMaxDailyLimit", "SetTrustedRemoteAddress", "Failure"],
        [1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of arbitrumsepolia", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.arbitrumsepolia)).to.equals(
        MAX_DAILY_LIMIT,
      );
    });

    it("Trusted remote should be set of arbitrumsepolia", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.arbitrumsepolia)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [ARBITRUMSEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
  });
});
