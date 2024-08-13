import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013 from "../../../proposals/arbitrumsepolia/vip-013";

forking(69942668, async () => {
  describe("Post-VIP behavior", async () => {
    it(`Execute VIP`, async () => {
      await pretendExecutingVip(await vip013());
    });
  });
});
