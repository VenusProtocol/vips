import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkCorePoolComptroller } from "../../../src/vip-framework/checks/checkCorePoolComptroller";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import { vip223Testnet } from "../../../vips/vip-223/vip-223-testnet";
import XVS_VAULT_PROXY_ABI from "./abi/xvsVaultProxy.json";

const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const XVS_VAULT_NEW_IMPLEMENTATION = "0x9801565BE8fe2c9fD12C17992ecDeb510BaF677A";
const XVS_VAULT_OLD_IMPLEMENTATION = "0x0fDBe58BbF3190D21a0589D0A448682D68De66a2";

forking(36346450, () => {
  describe("Pre-VIP behavior", async () => {
    let xvsVaultProxy: ethers.Contract;
    const provider = ethers.provider;

    before(async () => {
      xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
    });

    it("should have the old implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.be.equal(XVS_VAULT_OLD_IMPLEMENTATION);
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
    let xvsVaultProxy: ethers.Contract;
    const provider = ethers.provider;

    before(async () => {
      xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_PROXY_ABI, provider);
    });

    it("should have the new implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.be.equal(XVS_VAULT_NEW_IMPLEMENTATION);
    });

    describe("generic tests", async () => {
      checkCorePoolComptroller();
      checkXVSVault();
    });
  });
});
