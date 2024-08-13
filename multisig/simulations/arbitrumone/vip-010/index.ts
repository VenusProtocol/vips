import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010, {} from "../../../proposals/arbitrumone/vip-010";

forking(241039405, async () => {
  const provider = ethers.provider;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it (`test`, async () => {})
  });
});