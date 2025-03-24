import { forking, pretendExecutingVip } from "src/vip-framework";

import vip008 from "../../../proposals/opmainnet/vip-008";

forking(133619400, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip008());
    });
  });
});
