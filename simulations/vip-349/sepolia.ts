import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip052 from "../../multisig/proposals/sepolia/vip-052";
import vip349 from "../../vips/vip-349/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6460097, async () => {
  const provider = ethers.provider;
  const xvsVaultProxy = new ethers.Contract(sepolia.XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);

  before(async () => {
    await pretendExecutingVip(await vip052());
  });

  testForkedNetworkVipCommands("vip349", await vip349(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("should have the correct pending owner", async () => {
      expect(await xvsVaultProxy.admin()).to.equal(sepolia.NORMAL_TIMELOCK);
    });
  });
});
