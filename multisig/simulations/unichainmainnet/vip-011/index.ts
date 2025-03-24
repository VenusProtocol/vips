import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011 from "../../../proposals/unichainmainnet/vip-011";

forking(12089574, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip011());
    });
  });
});
