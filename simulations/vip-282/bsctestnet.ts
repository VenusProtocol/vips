import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import {
  DEFAULT_PROXY_ADMIN,
  XVS_VAULT_TREASURY,
  XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
} from "../../vips/vip-282/bsctestnet";
import vip282 from "../../vips/vip-282/bsctestnet";
import PROXY_ABI from "./abi/XVSVaultTreasuryProxy.json";

const XVS_VAULT_TREASURY_OLD_IMPLEMENTATION = "0x5369D9b7ABB78FE9De0Db0310D83159029f0d291";

forking(39145203, async () => {
  let xvsVaultTreasuryProxy: Contract;

  before(async () => {
    await impersonateAccount(DEFAULT_PROXY_ADMIN);
    xvsVaultTreasuryProxy = new ethers.Contract(
      XVS_VAULT_TREASURY,
      PROXY_ABI,
      ethers.provider.getSigner(DEFAULT_PROXY_ADMIN),
    );
  });

  describe("Pre-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(
        XVS_VAULT_TREASURY_OLD_IMPLEMENTATION,
      );
    });
  });

  testVip("VIP-282", await vip282());

  describe("Post-VIP behavior", async () => {
    it("check implementation", async () => {
      expect(await xvsVaultTreasuryProxy.callStatic.implementation()).to.be.equal(
        XVS_VAULT_TREASURY_NEW_IMPLEMENTATION,
      );
    });
  });
});
