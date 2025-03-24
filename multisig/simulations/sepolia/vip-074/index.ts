import { forking, pretendExecutingVip } from "src/vip-framework";

import vip074 from "../../../proposals/sepolia/vip-074";

forking(6466682, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip074());
    });
  });
});
