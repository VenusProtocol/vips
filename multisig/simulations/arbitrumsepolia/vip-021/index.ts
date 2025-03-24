import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021 from "../../../proposals/arbitrumsepolia/vip-021";

forking(69942668, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip021());
    });
  });
});
