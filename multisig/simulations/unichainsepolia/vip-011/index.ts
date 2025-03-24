import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011 from "../../../proposals/unichainsepolia/vip-011";

forking(15985553, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip011());
    });
  });
});
