import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip124 } from "../../vips/vip-124";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import VAIVault_ABI from "./abi/VAIVault_ABI.json";
import VRTVault_ABI from "./abi/VRTVault_ABI.json";
import VRTVault_PROXY_ABI from "./abi/VRTVault_PROXY_ABI.json";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";

const ACM = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";
const VAI_VAULT_PROXY = "0x0667Eed0a0aAb930af74a3dfeDD263A73994f216";
const VRT_VAULT_PROXY = "0x98bF4786D72AAEF6c714425126Dd92f149e3F334";
const XVS_OLD = "0xA0c958ca0FfA25253DE0a23f98aD3062F3987073";
const VAI_OLD = "0x7680C89Eb3e58dEc4D38093B4803be2b7f257360";
const VRT_OLD = "0xA3EEA5e491AD45caE30F6E0a315A275cc99EE147";
const XVS_NEW = "0x0CF9a22E790D89b8e58469f217b50bB4c3aB068C";
const VAI_NEW = "0xA52f2a56aBb7cbDD378bC36c6088fAfEaf9AC423";
const VRT_NEW = "0xeA98E94d35120b23F9f9F20A7314804D4AB491f1";
const FAST_TRACK_TIMELOCK = "0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const MULTISIG = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const LAST_ACCRUING_BLOCK = "29079555";

forking(28984751, async () => {
  const provider = ethers.provider;
  let xvsVault: ethers.Contract;
  let vaiVault: ethers.Contract;
  let vrtVault: ethers.Contract;
  let accessControlManager: ethers.Contract;
  let vrtVaultProxy: ethers.Contract;
  let xvsVaultSigner: Signer;
  let vaiVaultSigner: Signer;
  let vrtVaultSigner: Signer;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    vaiVault = new ethers.Contract(VAI_VAULT_PROXY, VAIVault_ABI, provider);
    vrtVault = new ethers.Contract(VRT_VAULT_PROXY, VRTVault_ABI, provider);

    vrtVaultProxy = new ethers.Contract(VRT_VAULT_PROXY, VRTVault_PROXY_ABI, provider);
    const multiSigSigner = await initMainnetUser(MULTISIG, ethers.utils.parseEther("1.0"));

    await vrtVaultProxy.connect(multiSigSigner)._setPendingAdmin(NORMAL_TIMELOCK);

    xvsVaultSigner = await initMainnetUser(XVS_VAULT_PROXY, ethers.utils.parseEther("1"));
    vaiVaultSigner = await initMainnetUser(VAI_VAULT_PROXY, ethers.utils.parseEther("1"));
    vrtVaultSigner = await initMainnetUser(VRT_VAULT_PROXY, ethers.utils.parseEther("1"));
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Owner of VRTVault is Multisig", async () => {
      const owner = await vrtVault.admin();
      expect(owner).to.equal(MULTISIG);
    });

    it("Implementation of XVSVault", async () => {
      const impl = await xvsVault.implementation();
      expect(impl).to.equal(XVS_OLD);
    });

    it("Implementation of VAIVault", async () => {
      const impl = await vaiVault.vaiVaultImplementation();
      expect(impl).to.equal(VAI_OLD);
    });

    it("Implementation of VRTVault", async () => {
      const impl = await vrtVault.implementation();
      expect(impl).to.equal(VRT_OLD);
    });
  });

  testVip("VIP-124 Change Vault Implementation", vip124(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VRTVault_PROXY_ABI, VRTVault_ABI, ACM_ABI],
        [
          "NewAdmin",
          "NewPendingImplementation",
          "NewImplementation",
          "NewAccessControlManager",
          "RoleGranted",
          "LastAccruingBlockChanged",
          "Failure",
        ],
        [1, 6, 3, 3, 30, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Owner of XVSVault is NORMAL TIMELOCK", async () => {
      const owner = await xvsVault.admin();
      expect(owner).to.equal(NORMAL_TIMELOCK);
    });

    it("Owner of VAIVault is NORMAL TIMELOCK", async () => {
      const owner = await vaiVault.admin();
      expect(owner).to.equal(NORMAL_TIMELOCK);
    });

    it("Owner of VRTVault is NORMAL TIMELOCK", async () => {
      const owner = await vrtVault.admin();
      expect(owner).to.equal(NORMAL_TIMELOCK);
    });

    it("Implementation of XVSVault", async () => {
      const impl = await xvsVault.implementation();
      expect(impl).to.equal(XVS_NEW);
    });

    it("Implementation of VAIVault", async () => {
      const impl = await vaiVault.vaiVaultImplementation();
      expect(impl).to.equal(VAI_NEW);
    });

    it("Implementation of VRTVault", async () => {
      const impl = await vrtVault.implementation();
      expect(impl).to.equal(VRT_NEW);
    });

    it("XVS VAULT Permissions", async () => {
      expect(await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "resume()")).equals(
        true,
      );
      expect(await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(
        await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "resume()"),
      ).equals(true);

      expect(await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(MULTISIG, "pause()")).equals(true);
      expect(await accessControlManager.connect(xvsVaultSigner).isAllowedToCall(MULTISIG, "resume()")).equals(true);
      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "add(address,uint256,address,uint256,uint256)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "set(address,uint256,uint256)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "setRewardAmountPerBlock(address,uint256)"),
      ).equals(true);

      expect(
        await accessControlManager
          .connect(xvsVaultSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "setWithdrawalLockingPeriod(address,uint256,uint256)"),
      ).equals(true);
    });

    it("VAI VAULT Permissions", async () => {
      expect(await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "resume()")).equals(
        true,
      );
      expect(await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(
        await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "resume()"),
      ).equals(true);
      expect(await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(MULTISIG, "pause()")).equals(true);
      expect(await accessControlManager.connect(vaiVaultSigner).isAllowedToCall(MULTISIG, "resume()")).equals(true);
    });

    it("VRT VAULT Permissions", async () => {
      expect(await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(CRITICAL_TIMELOCK, "resume()")).equals(
        true,
      );
      expect(await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "pause()")).equals(
        true,
      );
      expect(
        await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(FAST_TRACK_TIMELOCK, "resume()"),
      ).equals(true);
      expect(await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(MULTISIG, "pause()")).equals(true);
      expect(await accessControlManager.connect(vrtVaultSigner).isAllowedToCall(MULTISIG, "resume()")).equals(true);
      expect(
        await accessControlManager
          .connect(vrtVaultSigner)
          .isAllowedToCall(NORMAL_TIMELOCK, "withdrawBep20(address,address,uint256)"),
      ).equals(true);
    });

    it("Check VRT VAULT lastAccruingBlock", async () => {
      expect(await vrtVault.lastAccruingBlock()).to.equals(LAST_ACCRUING_BLOCK);
    });
  });
});
