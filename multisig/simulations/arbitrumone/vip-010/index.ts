import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010 from "../../../proposals/arbitrumone/vip-010";

forking(241039405, async () => {
  describe("Post-VIP behavior", async () => {
    it(`Execute VIP`, async () => {
      await pretendExecutingVip(await vip010());
    });
  });
});
