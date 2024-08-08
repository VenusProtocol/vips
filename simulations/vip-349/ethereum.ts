import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip053 from "../../multisig/proposals/ethereum/vip-053";
import vip349 from "../../vips/vip-349/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(20482219, async () => {
  const provider = ethers.provider;
  const xvsVaultProxy = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);

  before(async () => {
    await pretendExecutingVip(await vip053());
  });

  testForkedNetworkVipCommands("vip349", await vip349(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(ethereum.NORMAL_TIMELOCK);
    });
  });
});