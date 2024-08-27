import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019 from "../../../proposals/opbnbtestnet/vip-019";

forking(36325286, async () => {
  describe("Post-VIP behavior", async () => {
    it("execute vip", async () => {
      await pretendExecutingVip(await vip019());
    });
  });
});
