import { expect } from "chai";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { networkChainIds } from "../../../src/utils";
import { forking, pretendExecutingVip } from "../../../src/vip-framework";
import { vip260Testnet } from "../../../vips/vip-260/sepolia";
import XVSVaultDest_ABI from "./abi/XVSVaultDestAbi.json";
import VotesSyncSender_ABI from "./abi/votesSyncSenderAbi.json";

const { sepolia } = NETWORK_ADDRESSES;

const XVS_Vault_OLD_implementation = "0x4129dF6BB93E9ABb9CC40816E63Be77c3042Ef27";

forking(5331707, async () => {
  const provider = ethers.provider;
  let xvsVault: ethers.Contract;
  let votesSyncSender: ethers.Contract;

  before(async () => {
    xvsVault = new ethers.Contract(sepolia.XVS_VAULT_PROXY, XVSVaultDest_ABI, provider);
    votesSyncSender = new ethers.Contract(sepolia.VOTE_SYNC_SENDER, VotesSyncSender_ABI, provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("Return old implementation", async () => {
      expect(await xvsVault.implementation()).to.equals(XVS_Vault_OLD_implementation);
    });
    it("Sets trusted remote of Binance", async () => {
      expect(await votesSyncSender.trustedRemoteLookup(networkChainIds["bsctestnet"])).to.equal("0x");
    });
  });

  describe("Post-VIP behaviour", async () => {
    before(async () => {
      await pretendExecutingVip(vip260Testnet());
    });
    it("Return new implementation", async () => {
      expect(await xvsVault.implementation()).to.equals(sepolia.XVS_Vault_Dest);
    });
    it("Owner of XVSVault is NORMAL TIMELOCK", async () => {
      const owner = await xvsVault.admin();
      expect(owner).to.equal(sepolia.NORMAL_TIMELOCK);
    });
    it("Sets trusted remote of Binance", async () => {
      const destinationAdd = ethers.utils.solidityPack(
        ["address", "address"],
        [sepolia.VOTE_SYNC_RECEIVER, sepolia.VOTE_SYNC_SENDER],
      );
      expect(await votesSyncSender.trustedRemoteLookup(networkChainIds["bsctestnet"])).to.equal(destinationAdd);
    });
  });
});
