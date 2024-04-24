import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip020 from "../../../proposals/opbnbmainnet/vip-020";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";

const XVS_VAULT_PROXY = "0x7dc969122450749A8B0777c0e324522d67737988";
const XVS_ADDRESS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

// NOTE: cannot find any pending rewards for XVS on this chain neither with PoolID = 0 or with PoolID = 1
forking(22188379, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip020());
    });
    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
