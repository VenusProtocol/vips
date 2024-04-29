import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip019 from "../../../proposals/sepolia/vip-019";
import { calculateMappingStorageSlot } from "./../../../../src/utils";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";

const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS_ADDRESS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(5765590, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
    checkXVSVault();
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip019());
    });
    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      console.log(pendingWithdrawalsAfter);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
