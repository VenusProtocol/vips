import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip452, { MAX_DAILY_LIMIT, OMNICHAIN_PROPOSAL_SENDER } from "../../vips/vip-452/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { berachainbartio } = NETWORK_ADDRESSES;
forking(48276592, async () => {
  const provider = ethers.provider;
  const omnichainProposalSender = new ethers.Contract(
    OMNICHAIN_PROPOSAL_SENDER,
    OMNICHAIN_PROPOSAL_SENDER_ABI,
    provider,
  );

  describe("Pre-VIP behaviour", () => {
    it("Daily limit should be 0", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.berachainbartio)).to.equals(0);
    });
    it("Trusted remote should not be set", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.berachainbartio)).to.be.equals("0x");
    });
  });

  testVip("vip452 give permissions to timelock", await vip452(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["SetMaxDailyLimit", "SetTrustedRemoteAddress", "ExecuteRemoteProposal", "StorePayload"],
        [1, 1, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Daily limit should be 100 of berachainbartio", async () => {
      expect(await omnichainProposalSender.chainIdToMaxDailyLimit(LzChainId.berachainbartio)).to.equals(MAX_DAILY_LIMIT);
    });

    it("Trusted remote should be set of berachainbartio", async () => {
      expect(await omnichainProposalSender.trustedRemoteLookup(LzChainId.berachainbartio)).to.be.equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [berachainbartio.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_PROPOSAL_SENDER],
        ),
      );
    });
  });
});
