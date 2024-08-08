import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip019 from "../../multisig/proposals/opbnbtestnet/vip-019";
import vip349 from "../../vips/vip-349/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(31356515, async () => {
  const provider = ethers.provider;
  const xvsVaultProxy = new ethers.Contract(opbnbtestnet.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);

  before(async () => {
    await pretendExecutingVip(await vip019());
  });

  testForkedNetworkVipCommands("vip349", await vip349(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(opbnbtestnet.NORMAL_TIMELOCK);
    });
  });
});