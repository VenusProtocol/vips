import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, {PSR} from "../../../proposals/arbitrumsepolia/vip-013";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(69942668, async () => {
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
      await pretendExecutingVip(await vip013());
    });

    it("pending owner of psr", async () => {
      expect(await psr.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});