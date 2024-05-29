import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { calculateMappingStorageSlot } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import vip010, { NEW_XVS_IMPLEMENTATION, XVS_VAULT_PROXY } from "../../../proposals/arbitrumsepolia/vip-010";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import ACM_ABI from "./abi/accessControlManager.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";
const XVS_ADDRESS = "0x47fA6E9F717c9eB081c4734FfB5a1EcD70508891";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;
const SECONDS_PER_YEAR = 31_536_000;

// NOTE: cannot find any pending rewards for XVS on this chain neither with PoolID = 0 or with PoolID = 1
forking(46354403, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let accessControlManager: Contract;
  let pendingWithdrawalsBefore: BigNumber;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);
    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip010());
    });

    checkXVSVault();

    it("Check implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.equal(NEW_XVS_IMPLEMENTATION);
    });

    it("Xvs vault should be time based with correct number of blocks", async () => {
      expect(await xvsVaultProxy.isTimeBased()).to.be.equal(true);
      expect(await xvsVaultProxy.blocksOrSecondsPerYear()).to.be.equal(SECONDS_PER_YEAR);
    });

    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.hasPermission(
          arbitrumsepolia.GUARDIAN,
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
