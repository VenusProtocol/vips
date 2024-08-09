import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/arbitrumone/vip-010";
import vip351 from "../../vips/vip-351/bscmainnet";
import {
  COMPTROLLERS, VTOKENS
} from "../../multisig/proposals/arbitrumone/vip-010";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import VTOKEN_ABI from "./abi/VToken.json";
import { expect } from "chai";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241112064, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip351", await vip351(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [16]);
    },
  });
});