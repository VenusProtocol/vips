import { expect } from "chai";
import { forking, testVip } from "src/vip-framework";

import vip615 from "../../vips/vip-615/bscmainnet";

forking(94183469, async () => {
  describe("VIP-615 hub", () => {
    it("proposal builds with cross-chain commands only", async () => {
      const proposal = await vip615();
      expect(proposal.targets.length).to.be.greaterThan(0);
    });
  });

  testVip("VIP-615 hub", await vip615());
});
