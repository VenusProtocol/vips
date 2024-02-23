import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, networkChainIds } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip214Testnet } from "../../../vips/vip-214/vip-214-testnet";
import ACCESS_CONTROL_MANAGER_ABI from "../abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "../abi/OmnichainProposalSender.json";

const OMNICHAIN_PROPOSAL_SENDER = "0x02d188be98cf7676cd98b03c8470f059fd7799da";
const OMNICHAIN_GOVERNANCE_EXECUTOR = "0xe09e4784c2dd7b0f2db5bf9b00e101a4dc8cc9eb";

forking(37874227, async () => {
  let omnichainProposalSender: Contract;
  const provider = ethers.provider;
  before(async () => {
    omnichainProposalSender = new ethers.Contract(OMNICHAIN_PROPOSAL_SENDER, OMNICHAIN_PROPOSAL_SENDER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(networkChainIds["sepolia"])).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(networkChainIds["sepolia"])).to.be.equals("0x");
    });
  });

  testVip("vip214Testnet give permissions to timelock", await vip214Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["PermissionGranted", "SetMaxDailyLimit", "SetTrustedRemoteAddress", "Failure"],
        [24, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Daily limit should be 100", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(networkChainIds["sepolia"])).to.equals(100);
    });

    it("Trusted remote should be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(networkChainIds["sepolia"])).to.be.equals(
        `${OMNICHAIN_GOVERNANCE_EXECUTOR}${OMNICHAIN_PROPOSAL_SENDER.slice(2)}`,
      );
    });
  });
});
