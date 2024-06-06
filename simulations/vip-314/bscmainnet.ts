import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { calculateMappingStorageSlot, expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkXVSVault } from "../../src/vip-framework/checks/checkXVSVault";
import vip314, {
  ACM,
  BNB_BLOCKS_PER_YEAR,
  CRITICAL_TIMELOCK,
  FAST_TRACK_TIMELOCK,
  NEW_XVS_IMPLEMENTATION,
  NORMAL_TIMELOCK,
  XVS_VAULT_PROXY,
} from "../../vips/vip-314/bscmainnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_VAULT_PROXY_ABI from "./abi/XVSVaultProxy.json";

const XVS_ADDRESS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(38915486, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;
  let accessControlManager: Contract;

  before(async () => {
    const xvsVaultSigner = await initMainnetUser(XVS_VAULT_PROXY, parseEther("1"));
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, xvsVaultSigner);

    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(utils.stripZeros(value));
  });

  testVip("VIP-314 Upgrade XVSVault Implementation", await vip314(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_PROXY_ABI], ["NewPendingImplementation", "NewImplementation"], [2, 1]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleRevoked", "RoleGranted"], [3, 3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    checkXVSVault();

    it("Check implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.equal(NEW_XVS_IMPLEMENTATION);
    });

    it("Xvs vault should be block based with correct number of blocks", async () => {
      expect(await xvsVaultProxy.isTimeBased()).to.be.equal(false);
      expect(await xvsVaultProxy.blocksOrSecondsPerYear()).to.be.equal(BNB_BLOCKS_PER_YEAR);
    });

    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.isAllowedToCall(NORMAL_TIMELOCK, "setRewardAmountPerBlockOrSecond(address,uint256)"),
      ).to.equal(true);
      expect(
        await accessControlManager.isAllowedToCall(
          FAST_TRACK_TIMELOCK,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
        ),
      ).to.equal(true);
      expect(
        await accessControlManager.isAllowedToCall(
          CRITICAL_TIMELOCK,
          "setRewardAmountPerBlockOrSecond(address,uint256)",
        ),
      ).to.equal(true);
    });

    it("Check permission for setRewardAmountPerBlock", async () => {
      expect(
        await accessControlManager.isAllowedToCall(NORMAL_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).to.equal(false);
      expect(
        await accessControlManager.isAllowedToCall(FAST_TRACK_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).to.equal(false);
      expect(
        await accessControlManager.isAllowedToCall(CRITICAL_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).to.equal(false);
    });

    it("Compare pending withdrawals state before and after upgrade", async () => {
      const pendingWithdrawalsAfter: BigNumber = await xvsVaultProxy.totalPendingWithdrawals(XVS_ADDRESS, POOL_ID);
      expect(pendingWithdrawalsBefore).to.equal(pendingWithdrawalsAfter);
    });
  });
});
