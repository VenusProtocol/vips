import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip013 from "../../multisig/proposals/arbitrumsepolia/vip-013";
import vip351 from "../../vips/vip-351/bsctestnet";
import {
  COMPTROLLERS, VTOKENS
} from "../../multisig/proposals/arbitrumsepolia/vip-013";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import VTOKEN_ABI from "./abi/VToken.json";
import { expect } from "chai";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(70004884, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip013());
  });

  testForkedNetworkVipCommands("vip351", await vip351(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [16]);
    },
  });
});