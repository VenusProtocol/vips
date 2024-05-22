import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { calculateMappingStorageSlot, initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import vip020, {
  ACM,
  BLOCKS_PER_YEAR,
  NEW_XVS_IMPLEMENTATION,
  XVS_VAULT_PROXY,
} from "../../../proposals/opbnbmainnet/vip-020";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import ACM_ABI from "./abi/accessControlManager.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const XVS_ADDRESS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

// NOTE: cannot find any pending rewards for XVS on this chain neither with PoolID = 0 or with PoolID = 1
forking(24537990, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let accessControlManager: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip020());
      // Resume Vault
      const xvsVaultAdmin = await initMainnetUser(opbnbmainnet.NORMAL_TIMELOCK, parseEther("1"));
      await xvsVaultProxy.connect(xvsVaultAdmin).resume();
    });

    checkXVSVault();

    it("Check implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.equal(NEW_XVS_IMPLEMENTATION);
    });

    it("Xvs vault should be block based with correct number of blocks", async () => {
      expect(await xvsVaultProxy.isTimeBased()).to.be.equal(false);
      expect(await xvsVaultProxy.blocksOrSecondsPerYear()).to.be.equal(BLOCKS_PER_YEAR);
    });

    it("Check permission for setRewardAmountPerBlock", async () => {
      expect(
        await accessControlManager.hasPermission(
          opbnbmainnet.GUARDIAN,
          XVS_VAULT_PROXY,
          "setRewardAmountPerBlock(address,uint256)",
        ),
      ).to.equal(false);
    });

    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.hasPermission(
          opbnbmainnet.GUARDIAN,
          XVS_VAULT_PROXY,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
        ),
      ).to.equal(true);
    });

    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
