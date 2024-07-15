import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { XVSStore, swapRouterCorePool, vip130 } from "../../../vips/vip-130/vip-130";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import SWAP_ROUTER_ABI from "./abi/swapRouter.json";

const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(29321964, async () => {
  testVip("VIP-130 Swap router accept ownership", await vip130(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(
        txResponse,
        [SWAP_ROUTER_ABI, XVS_STORE_ABI],
        ["OwnershipTransferred", "NewPendingAdmin", "AdminTransferred"],
        [1, 1, 1],
      );
    },
  });

  describe("Check owner address after accepting owership", () => {
    it("Check swap router owner address", async () => {
      const router = new ethers.Contract(swapRouterCorePool, SWAP_ROUTER_ABI, ethers.provider);
      const ownerAddress = await router.owner();
      expect(ownerAddress).equals(NORMAL_TIMELOCK);
    });

    it("Check XVS store owner address", async () => {
      const store = new ethers.Contract(XVSStore, XVS_STORE_ABI, ethers.provider);
      const ownerAddress = await store.admin();
      expect(ownerAddress).equals(NORMAL_TIMELOCK);
    });
  });
});
