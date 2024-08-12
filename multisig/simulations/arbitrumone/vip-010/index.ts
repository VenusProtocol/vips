import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010, { PSR } from "../../../proposals/arbitrumone/vip-010";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241039405, async () => {
  const provider = ethers.provider;
  let psr: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      psr = new ethers.Contract(PSR, PSR_ABI, provider);
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip010());
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
