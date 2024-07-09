import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/arbitrumone/vip-010";
import vip332 from "../../vips/vip-332/bscmainnet";
import TREASURY_ABI from "./abi/treasury.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(221760109, async () => {
  let treasury: Contract;
  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, arbitrumone.VTREASURY);
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip332 accept ownership", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [TREASURY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(arbitrumone.NORMAL_TIMELOCK);
    });
  });
});
