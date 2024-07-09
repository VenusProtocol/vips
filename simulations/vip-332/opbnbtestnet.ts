import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/opbnbtestnet/vip-020";
import vip332 from "../../vips/vip-332/bsctestnet";
import TREASURY_ABI from "./abi/treasury.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(33636631, async () => {
  let treasury: Contract;
  before(async () => {
    treasury = await ethers.getContractAt(TREASURY_ABI, opbnbtestnet.VTREASURY);
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("vip332 accept ownership", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [TREASURY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("Normal Timelock should be the owner of the Vtreasury", async () => {
      expect(await treasury.owner()).equals(opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});
