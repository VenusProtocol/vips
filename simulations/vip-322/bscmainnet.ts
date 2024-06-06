import { expect } from "chai";
import { ethers } from "hardhat";

import { LzChainId } from "../../src/types";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip322, {
  ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR,
  MAX_DAILY_LIMIT,
  OMNICHAIN_PROPOSAL_SENDER,
  OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR,
} from "../../vips/vip-322/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39004811, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );

  describe("Pre-VIP behaviour", () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.ethereum)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.ethereum)).to.be.equals("0x");
    });
    it("Daily limit should be 100 of opbnbmainnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.opbnbmainnet)).to.equals(0);
    });

    it("Trusted remote should be set of opbnbmainnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.opbnbmainnet)).to.be.equals("0x");
    });
  });

  testVip("vip322 give permissions to timelock", await vip322(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["RoleGranted", "SetMaxDailyLimit", "SetTrustedRemoteAddress", "Failure"],
        [26, 2, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of ethereum", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.ethereum)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of ethereum", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.ethereum)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [ETHEREUM_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
    it("Daily limit should be 100 of opbnbmainnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.opbnbmainnet)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of opbnbmainnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.opbnbmainnet)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [OPBNBMAINNET_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
  });
});
