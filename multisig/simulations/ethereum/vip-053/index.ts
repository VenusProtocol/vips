import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip053, { PSR } from "../../../proposals/ethereum/vip-053";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(20482219, async () => {
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
      await pretendExecutingVip(await vip053());
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(ethereum.NORMAL_TIMELOCK);
    });
  });
});
