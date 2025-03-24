import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip071, { vUSDS, vsUSDS } from "../../../proposals/sepolia/vip-071";
import VTOKEN_ABI from "./abi/VToken.json";

const { sepolia } = NETWORK_ADDRESSES;

const NORMAL_TIMELOCK = sepolia.NORMAL_TIMELOCK;

forking(7594027, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    for (const vTokenAddress of [vUSDS, vsUSDS]) {
      it(`should have no pending owner for ${vTokenAddress}`, async () => {
        const vToken = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await vToken.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip071());
    });

    for (const vTokenAddress of [vUSDS, vsUSDS]) {
      it(`correct pending owner for ${vTokenAddress}`, async () => {
        const vToken = new ethers.Contract(vTokenAddress, VTOKEN_ABI, provider);
        expect(await vToken.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      });
    }
  });
});
