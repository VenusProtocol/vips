import { forking, pretendExecutingVip } from "src/vip-framework";

import vip074 from "../../../proposals/ethereum/vip-074";

forking(20482219, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip074());
    });
  });
});
