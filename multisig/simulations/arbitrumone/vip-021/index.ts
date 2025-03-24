import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021 from "../../../proposals/arbitrumone/vip-021";

forking(245111060, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip021());
    });
  });
});
