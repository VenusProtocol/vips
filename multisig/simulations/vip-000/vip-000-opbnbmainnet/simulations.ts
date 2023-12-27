import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip000 } from "../../../proposals/vip-000/vip-000-opbnbmainnet";
import TREASURY_ABI from "./abi/treasury.json";

const VTREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";

forking(10892659, () => {
  let treasury: Contract;

  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, VTREASURY);
    await pretendExecutingVip(vip000());
  });

  describe("Post tx checks", () => {
    it("Should set owner to multisig", async () => {
      const owner = await treasury.owner();
      expect(owner).equals(NETWORK_ADDRESSES.opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
