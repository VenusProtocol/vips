import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { calculateMappingStorageSlot } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import vip033, {
  ACM,
  ETHEREUM_BLOCKS_PER_YEAR,
  NEW_XVS_IMPLEMENTATION,
  XVS_VAULT_PROXY,
} from "../../../proposals/ethereum/vip-033";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import ACM_ABI from "./abi/accessControlManager.json";

const { ethereum } = NETWORK_ADDRESSES;

const XVS_ADDRESS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;

forking(19923613, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;
  let accessControlManager: Contract;

  before(async () => {
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    const storageSlot = calculateMappingStorageSlot(XVS_ADDRESS, POOL_ID, MAPPING_STORAGE_SLOT);
    const value = await provider.getStorageAt(XVS_VAULT_PROXY, storageSlot);
    pendingWithdrawalsBefore = BigNumber.from(ethers.constants.HashZero === value ? 0 : utils.stripZeros(value));
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip033());
    });

    checkXVSVault();

    it("Check implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.equal(NEW_XVS_IMPLEMENTATION);
    });

    it("Xvs vault should be block based with correct number of blocks", async () => {
      expect(await xvsVaultProxy.isTimeBased()).to.be.equal(false);
      expect(await xvsVaultProxy.blocksOrSecondsPerYear()).to.be.equal(ETHEREUM_BLOCKS_PER_YEAR);
    });

    it("Check permission for setRewardAmountPerBlock", async () => {
      expect(
        await accessControlManager.hasPermission(
          ethereum.GUARDIAN,
          XVS_VAULT_PROXY,
          "setRewardAmountPerBlock(address,uint256)",
        ),
      ).to.equal(false);
    });

    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.hasPermission(
          ethereum.GUARDIAN,
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
