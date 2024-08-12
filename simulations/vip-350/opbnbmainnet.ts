import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/opbnbmainnet/vip-020";
import { PSR } from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip350 from "../../vips/vip-350/bscmainnet";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import { expectEvents } from "src/utils";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

forking(31449867, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip350", await vip350(),  {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it(`correct owner for psr`, async () => {
      const psr  = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(opbnbmainnet.NORMAL_TIMELOCK);
    });
  });
});