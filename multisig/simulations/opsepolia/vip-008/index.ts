import { forking, pretendExecutingVip } from "src/vip-framework";

import vip008 from "../../../proposals/opsepolia/vip-008";

forking(25517569, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip008());
    });
  });
});
