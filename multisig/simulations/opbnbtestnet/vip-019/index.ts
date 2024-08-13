import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019, {
} from "../../../proposals/opbnbtestnet/vip-019";

forking(36325286, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip019());
    });

    it (`test`, async () => {})
  });
});