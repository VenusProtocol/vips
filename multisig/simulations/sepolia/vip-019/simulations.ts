import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import vip019 from "../../../proposals/sepolia/vip-019";
import { calculateMappingStorageSlot } from "./../../../../src/utils";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";
import ACM_ABI from "./abi/accessControlManager.json";

const { sepolia } = NETWORK_ADDRESSES;
const ACM = "0xbf705C00578d43B6147ab4eaE04DBBEd1ccCdc96";
const XVS_VAULT_PROXY = "0x1129f882eAa912aE6D4f6D445b2E2b1eCbA99fd5";
const XVS_ADDRESS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(5765590, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let accessControlManager: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip019());
    });
    checkXVSVault();
    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.hasPermission(
          sepolia.GUARDIAN,
          XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
        ),
      ).to.equal(true);
    });
    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      console.log(pendingWithdrawalsAfter);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
