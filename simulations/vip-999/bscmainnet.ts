import { expect } from "chai";
import { forking, testVip } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";

forking(94183469, async () => {
  describe("VIP-999 hub", () => {
    it("proposal builds with cross-chain commands only", async () => {
      const proposal = await vip999();
      expect(proposal.targets.length).to.be.greaterThan(0);
    });
  });

  testVip("VIP-999 hub", await vip999());
});
