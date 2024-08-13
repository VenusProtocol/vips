import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020, {
} from "../../../proposals/opbnbmainnet/vip-020";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(31449867, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip020());
    });

    it (`test`, async () => {})
  });
});