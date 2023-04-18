import { expect } from "chai";
import { Signer } from "ethers";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip108Testnet } from "../../vips/vip-108-testnet";
import ACM_ABI from "./abi/IAccessControlManager_ABI.json";
import VAIVault_ABI from "./abi/VAIVault_ABI.json";
import VRTVault_ABI from "./abi/VRTVault_ABI.json";
import XVSVault_ABI from "./abi/XVSVault_ABI.json";

const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
const VAI_VAULT_PROXY = "0x7Db4f5cC3bBA3e12FF1F528D2e3417afb0a57118";
const VRT_VAULT_PROXY = "0x1ffD1b8B67A1AE0C189c734B0F58B0954522FF71";
const VRT_NEW = "0x12D290de159341d36BB1a5A58904aD95053BDB20";
const XVS_NEW = "0x87123996F4287A10a8627C86E5786E4Cf1962849";
const VAI_NEW = "0x399984959c003A75765a6344B3469818f9657C68";
const FAST_TRACK_TIMELOCK = "0x3CFf21b7AF8390fE68799D58727d3b4C25a83cb6";
const CRITICAL_TIMELOCK = "0x23B893a7C45a5Eb8c8C062b9F32d0D2e43eD286D";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

forking(29044074, async () => {
  const provider = ethers.provider;
  let xvsVault: ethers.Contract;
  let vaiVault: ethers.Contract;
  let vrtVault: ethers.Contract;
  let accessControlManager: ethers.Contract;
  let xvsVaultSigner: Signer;
  let vaiVaultSigner: Signer;
  let vrtVaultSigner: Signer;

  before(async () => {
    xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVSVault_ABI, provider);
    vaiVault = new ethers.Contract(VAI_VAULT_PROXY, VAIVault_ABI, provider);
    vrtVault = new ethers.Contract(VRT_VAULT_PROXY, VRTVault_ABI, provider);

    xvsVaultSigner = await initMainnetUser(XVS_VAULT_PROXY, ethers.utils.parseEther("1"));
    vaiVaultSigner = await initMainnetUser(VAI_VAULT_PROXY, ethers.utils.parseEther("1"));
    vrtVaultSigner = await initMainnetUser(VRT_VAULT_PROXY, ethers.utils.parseEther("1"));
    accessControlManager = new ethers.Contract(ACM, ACM_ABI, provider);
  });

  testVip("VIP-108-testnet Change Vault Implementation Testnet", vip108Testnet());

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
    });

    it("XVS VAULT Permissions", async () => {
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
    });

    it("Check VRT VAULT lastAccruingBlock", async () => {
      expect(await vrtVault.lastAccruingBlock()).to.equals(27348741);
    });
  });
});
