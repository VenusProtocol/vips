import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import { SWAP_HELPER, SWAP_ROUTER, UNITROLLER, vip600 } from "../../vips/vip-600/bscmainnet";
import SWAP_ROUTER_ABI from "./abi/SwapRouter.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(76556273, async () => {
  let swapRouter: Contract;

  before(async () => {
    swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER);
  });

  describe("Pre-VIP behavior", () => {
    it("SwapRouter should have NORMAL_TIMELOCK as pending owner", async () => {
      expect(await swapRouter.pendingOwner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    describe("SwapRouter configuration", () => {
      it("should have correct COMPTROLLER", async () => {
        expect(await swapRouter.COMPTROLLER()).to.equal(UNITROLLER);
      });

      it("should have correct swapHelper", async () => {
        expect(await swapRouter.SWAP_HELPER()).to.equal(SWAP_HELPER);
      });
    });
  });

  testVip("VIP-600", await vip600(), {});

  describe("Post-VIP behavior", () => {
    it("SwapRouter should have NORMAL_TIMELOCK as owner", async () => {
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("SwapRouter should have zero address as pending owner", async () => {
      expect(await swapRouter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });
});
