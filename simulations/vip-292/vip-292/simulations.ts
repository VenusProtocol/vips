import { expect } from "chai";
import { BigNumber, Contract, utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { calculateMappingStorageSlot, expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { checkXVSVault } from "../../../src/vip-framework/checks/checkXVSVault";
import vip292 from "../../../vips/vip-292/bscmainnet";
import XVSVaultProxy_ABI from "./abi/XVSVaultProxy_ABI.json";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";
import ACM_ABI from "./abi/accessControlManager.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";

const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const XVS_ADDRESS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const POOL_ID = 0;
const MAPPING_STORAGE_SLOT = 18;
const NEW_XVS_IMPLEMENTATION = "0xaBADb59b8BB3fC9D59A7c6696D3DE77344Cba782";

forking(38539721, async () => {
  const provider = ethers.provider;
  let xvsVaultProxy: Contract;
  let pendingWithdrawalsBefore: BigNumber;
  let accessControlManager: Contract;

  before(async () => {
    const xvsVaultSigner = await initMainnetUser(XVS_VAULT_PROXY, parseEther("1"));
    xvsVaultProxy = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, xvsVaultSigner);
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
    checkXVSVault();
    it("Check implementation", async () => {
      expect(await xvsVaultProxy.implementation()).to.equal(NEW_XVS_IMPLEMENTATION);
    });
    it("Check permission for setRewardAmountPerBlockOrSecond", async () => {
      expect(
        await accessControlManager.isAllowedToCall(
          bscmainnet.NORMAL_TIMELOCK,
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
