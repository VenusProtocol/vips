import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip052 from "../../../proposals/sepolia/vip-052";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip052());
    });

    it (`test`, async () => {})
  });
});