import { forking, pretendExecutingVip } from "src/vip-framework";

import vip008 from "../../../proposals/basemainnet/vip-008";

forking(28023929, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip008());
    });
  });
});
