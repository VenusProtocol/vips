import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip021 from "../../../proposals/ethereum/vip-021";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const XVS_ADDRESS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(19723611, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(utils.stripZeros(value));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip021());
    });
    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
