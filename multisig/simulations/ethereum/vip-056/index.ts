import { forking, pretendExecutingVip } from "src/vip-framework";

import vip056 from "../../../proposals/ethereum/vip-056";

forking(20482219, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip056());
    });
  });
});
