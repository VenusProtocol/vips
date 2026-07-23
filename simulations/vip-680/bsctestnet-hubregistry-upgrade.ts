import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { HUB_REGISTRY, HUB_REGISTRY_IMPL, HUB_REGISTRY_PROXY_ADMIN } from "../../vips/vip-680/addresses/bsctestnet";
import vip680HubRegistryUpgrade from "../../vips/vip-680/bsctestnet-hubregistry-upgrade";
import HUB_REGISTRY_ABI from "./abi/HubRegistry.json";
import PROXY_ADMIN_ABI from "./abi/ProxyAdmin.json";

// bsctestnet block after the new HubRegistry implementation (0x4D2C18…) was deployed at block 119,670,331.
const BLOCK_NUMBER = 119680000;

// A hub address never registered in the registry: assetForHub must resolve it to address(0) once the
// upgraded implementation exposes the getter (and revert on the old implementation, pre-VIP).
const UNREGISTERED_HUB = "0x0000000000000000000000000000000000000123";

forking(BLOCK_NUMBER, async () => {
  let registry: Contract;
  let proxyAdmin: Contract;

  before(async () => {
    registry = await ethers.getContractAt(HUB_REGISTRY_ABI, HUB_REGISTRY);
    proxyAdmin = await ethers.getContractAt(PROXY_ADMIN_ABI, HUB_REGISTRY_PROXY_ADMIN);
  });

  describe("Pre-VIP state", () => {
    it("HubRegistry proxy runs the old implementation (assetForHub unavailable)", async () => {
      expect(await proxyAdmin.getProxyImplementation(HUB_REGISTRY)).to.not.equal(HUB_REGISTRY_IMPL);
      await expect(registry.assetForHub(UNREGISTERED_HUB)).to.be.reverted;
    });
  });

  testVip("VIP-680 [BNB Testnet] HubRegistry upgrade (assetForHub)", await vip680HubRegistryUpgrade(), {
    callbackAfterExecution: async txResponse => {
      // Exactly one proxy upgrade.
      await expectEvents(txResponse, [PROXY_ADMIN_ABI], ["Upgraded"], [1]);
    },
  });

  describe("Post-VIP state", () => {
    it("HubRegistry proxy runs the new implementation", async () => {
      expect(await proxyAdmin.getProxyImplementation(HUB_REGISTRY)).to.equal(HUB_REGISTRY_IMPL);
    });

    it("assetForHub is now callable and consistent with hubForAsset", async () => {
      // Reverted pre-VIP; now resolves an unregistered hub to the zero address.
      expect(await registry.assetForHub(UNREGISTERED_HUB)).to.equal(ethers.constants.AddressZero);
      // Existing views keep working across the append-only upgrade.
      expect(await registry.hubForAsset(ethers.constants.AddressZero)).to.equal(ethers.constants.AddressZero);
    });
  });
});
