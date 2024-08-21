import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/opbnbmainnet/vip-020";
import { PSR } from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip350 from "../../vips/vip-350/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(31449867, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
      await expectEvents(txResponse, [PSR_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it(`correct owner for psr`, async () => {
      const psr = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});
