import { forking, pretendExecutingVip } from "src/vip-framework";

import vip008 from "../../../proposals/basesepolia/vip-008";

forking(23534547, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip008());
    });
  });
});
