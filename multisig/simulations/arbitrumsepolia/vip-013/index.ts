import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, {
} from "../../../proposals/arbitrumsepolia/vip-013";

forking(69942668, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip013());
    });

    it (`test`, async () => {})
  });
});