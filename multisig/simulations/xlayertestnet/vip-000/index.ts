import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip000 from "../../../proposals/xlayertestnet/vip-000";
import TREASURY_ABI from "./abi/treasury.json";

const TREASURY = "0x740aF73D4AB6300dc4c8D707a424EFC5f1bd04DA";

forking(14403492, async () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, TREASURY);
    await pretendExecutingVip(await vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.xlayertestnet.NORMAL_TIMELOCK);
    });
  });
});
