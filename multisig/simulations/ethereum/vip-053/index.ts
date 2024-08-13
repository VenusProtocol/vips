import { forking, pretendExecutingVip } from "src/vip-framework";

import vip053 from "../../../proposals/ethereum/vip-053";

forking(20482219, async () => {
  describe("Post-VIP behavior", async () => {
    it(`Execute VIP`, async () => {
      await pretendExecutingVip(await vip053());
    });
  });
});
