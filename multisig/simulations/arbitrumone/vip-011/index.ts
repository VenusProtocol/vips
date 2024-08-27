import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011 from "../../../proposals/arbitrumone/vip-011";

forking(245111060, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip011());
    });
  });
});
