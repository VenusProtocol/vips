import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip565, {
  NEW_OPBNB_BLOCK_RATE,
  OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION,
  OPBNBMAINNET_VTOKEN_BEACON,
  OPBNBMAINNET_XVS_VAULT_PROXY,
} from "../../vips/vip-565/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import VTOKEN_BEACON_ABI from "./abi/vtokenBeacon.json";

forking(88774388, async () => {
  const xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, OPBNBMAINNET_XVS_VAULT_PROXY);
  const vTokenBeacon = await ethers.getContractAt(VTOKEN_BEACON_ABI, OPBNBMAINNET_VTOKEN_BEACON);

  describe("Pre-VIP behaviour", async () => {
    it("VToken beacon should not point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.not.equal(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("XVS Vault should not have new block rate", async () => {
      const currentBlockRate = await xvsVault.blocksOrSecondsPerYear();
      expect(currentBlockRate).to.not.equal(NEW_OPBNB_BLOCK_RATE);
    });
  });

  testForkedNetworkVipCommands("VIP-565 Fourier Hardfork OPBNB", await vip565(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_BEACON_ABI, XVS_VAULT_ABI, ACM_ABI],
        ["Upgraded", "SetBlocksPerYear"],
        [1, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("VToken beacon should point to new implementation", async () => {
      const currentImplementation = await vTokenBeacon.implementation();
      expect(currentImplementation).to.equal(OPBNBMAINNET_NEW_VTOKEN_IMPLEMENTATION);
    });

    it("XVS Vault should have new block rate", async () => {
      const currentBlockRate = await xvsVault.blocksOrSecondsPerYear();
      expect(currentBlockRate).to.equal(NEW_OPBNB_BLOCK_RATE);
    });
  });
});
