import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010, { PRIME, PLP } from "../../../proposals/arbitrumone/vip-010";
import PLP_ABI from "./abi/PrimeLiquidityProvider.json";
import PRIME_ABI from "./abi/Prime.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241039405, async () => {
  const provider = ethers.provider;
  let prime: Contract;
  let plp: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      prime = new ethers.Contract(PRIME, PRIME_ABI, provider);
      plp = new ethers.Contract(PLP, PLP_ABI, provider);
    });

    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await plp.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it("pending owner", async () => {
      expect(await prime.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      expect(await plp.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});