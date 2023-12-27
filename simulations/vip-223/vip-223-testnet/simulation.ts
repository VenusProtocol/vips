import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip223Testnet } from "../../../vips/vip-223/vip-223-testnet";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import XVS_VAULT_ABI from "./abi/xvsVault.json";
import XVS_VAULT_PROXY_ABI from "./abi/xvsVaultProxy.json";

const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const XVS_VAULT_NEW_IMPLEMENTATION = "0x5C9Ae5218F4E19160f6FF1e8bA6E5aa0104113BA";
const XVS_VAULT_OLD_IMPLEMENTATION = "0x2B62C479A5554991264FBd1D83c756abF558F88b";

forking(36297695, () => {
  describe("Pre-VIP behavior", async () => {
    let xvsVaultProxy: ethers.Contract;
    const provider = ethers.provider;

    before(async () => {
      xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });

  testVip("VIP-223Testnet Upgrdae XVS Vault", vip223Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_PROXY_ABI], ["NewImplementation"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });
});
