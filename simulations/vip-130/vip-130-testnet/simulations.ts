import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { swapRouters, vip130Testnet } from "../../../vips/vip-130/vip-130-testnet";
import SWAP_ROUTER_ABI from "./abi/swapRouter.json";

const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(30887665, async () => {
  testVip("VIP-130-testnet Swap routers accept ownership", await vip130Testnet(), {
    callbackAfterExecution: async (txResponse: any) => {
      await expectEvents(txResponse, [SWAP_ROUTER_ABI], ["OwnershipTransferred"], [2]);
    },
  });

  describe("Check owner address after accepting owership", () => {
    it("Check addresses", async () => {
      const promises = await swapRouters.map(async routerAddress => {
        const router = new ethers.Contract(routerAddress, SWAP_ROUTER_ABI, ethers.provider);
        const ownerAddress = await router.owner();
        return ownerAddress;
      });

      const owners = await Promise.all(promises);

      owners.map(owner => {
        expect(owner).equals(NORMAL_TIMELOCK);
      });
    });
  });
});
