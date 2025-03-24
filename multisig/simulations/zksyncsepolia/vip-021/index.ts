import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021 from "../../../proposals/zksyncsepolia/vip-021";

forking(4977067, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip021());
    });
  });
});
