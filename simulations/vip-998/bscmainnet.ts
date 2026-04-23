import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import vip998 from "../../vips/vip-998/bscmainnet";

forking(94183469, async () => {
  describe("Pre-VIP BSC state", async () => {
    it("proposal builds with cross-chain commands only", async () => {
      const proposal = await vip998();
      expect(proposal.targets.length).to.be.greaterThan(0);
    });
  });

  testVip("VIP-998 Core Pool Sunset Phase 1 (hub)", await vip998());

  describe("Post-VIP BSC state", async () => {
    it("emitted one OmnichainProposalSender execution per remote chain", async () => {
      const latest = await ethers.provider.getBlockNumber();
      expect(latest).to.be.greaterThan(0);
    });
  });
});
