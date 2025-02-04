import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip443, { OMNICHAIN_PROPOSAL_SENDER, PID } from "../../vips/vip-443/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46357645, async () => {
  const provider = ethers.provider;
  const sender = new ethers.Contract(OMNICHAIN_PROPOSAL_SENDER, OMNICHAIN_PROPOSAL_SENDER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("Payload should be stored", async () => {
      const storedHash = await sender.storedExecutionHashes(PID);
      expect(storedHash).not.to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  testVip("VIP-443", await vip443(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ClearPayload"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Payload must be clear", async () => {
      const storedHash = await sender.storedExecutionHashes(PID);

      expect(storedHash).to.eq("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
    it("should left no funds in OmnichainProposalSender contract", async () => {
      expect(await ethers.provider.getBalance(OMNICHAIN_PROPOSAL_SENDER)).to.eq(0);
    });
  });
});
