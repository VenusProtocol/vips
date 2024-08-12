import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip013 from "../../multisig/proposals/arbitrumsepolia/vip-013";
import {PSR } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import vip350 from "../../vips/vip-350/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import PSR_ABI from "./abi/ProtocolShareReserve.json";
import { expectEvents } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(70004884, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip013());
  });

  testForkedNetworkVipCommands("vip350", await vip350(),  {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it(`correct owner for psr`, async () => {
      const psr  = new ethers.Contract(PSR, PSR_ABI, provider);
      expect(await psr.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });
  });
});