import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { swapRouterCorePool, vip130MainnetCore } from "../../../vips/vip-130/mainnetCore";
import SWAP_ROUTER_ABI from "../abi/swapRouter.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(29284246, () => {
  testVip("VIP-130-mainnet Swap router accept ownership", vip130MainnetCore(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SWAP_ROUTER_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Check owner address after accepting owership", () => {
    it("Check address", async () => {
      const router = new ethers.Contract(swapRouterCorePool, SWAP_ROUTER_ABI, ethers.provider);
      const ownerAddress = await router.owner();
      expect(ownerAddress).equals(NORMAL_TIMELOCK);
    });
  });
});
