import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot, expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import vip292 from "../../../vips/vip-292/bscmainnet";
import XVSVaultProxy_ABI from "./abi/XVSVaultProxy_ABI.json";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS_ADDRESS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(38133407, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(utils.stripZeros(value));
  });

  testVip("VIP-292 Upgrade XVSVault Implementation", vip292(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVSVaultProxy_ABI], ["NewPendingImplementation", "NewImplementation"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
