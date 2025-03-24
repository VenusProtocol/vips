import { forking, pretendExecutingVip } from "src/vip-framework";

import vip021 from "../../../proposals/zksyncmainnet/vip-021";

forking(58148637, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip021());
    });
  });
});
