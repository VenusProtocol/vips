import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020 from "../../../proposals/opbnbmainnet/vip-020";

forking(31449867, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip020());
    });
  });
});
