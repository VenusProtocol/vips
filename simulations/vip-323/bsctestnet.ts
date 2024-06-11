import { expect } from "chai";
import { ethers } from "hardhat";

import { LzChainId } from "../../src/types";
import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip323, {
  MAX_DAILY_LIMIT,
  OMNICHAIN_PROPOSAL_SENDER,
  OPBNBTESTNET_OMNICHAIN_GOVERNANCE_EXECUTOR,
  SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR,
} from "../../vips/vip-323/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40980904, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );

  describe("Pre-VIP behaviour", () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.sepolia)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.sepolia)).to.be.equals("0x");
    });
    it("Daily limit should be 100 of opbnbtestnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.opbnbtestnet)).to.equals(0);
    });

    it("Trusted remote should be set of opbnbtestnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.opbnbtestnet)).to.be.equals("0x");
    });
  });

  testVip("vip323 give permissions to timelock", await vip323(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["PermissionGranted", "SetMaxDailyLimit", "SetTrustedRemoteAddress", "Failure"],
        [26, 2, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of sepolia", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.sepolia)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of sepolia", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.sepolia)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [SEPOLIA_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
    it("Daily limit should be 100 of opbnbtestnet", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.opbnbtestnet)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of opbnbtestnet", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.opbnbtestnet)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [OPBNBTESTNET_OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
  });
});
