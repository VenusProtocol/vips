import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";

import vip452 from "../../vips/vip-452/bsctestnet";
import vip458, {
  ARBITRUM_SEPOLIA_REMOTE,
  BNB_TESTNET_TRUSTED_REMOTE,
  OPBNB_TESTNET_TRUSTED_REMOTE,
  OP_SEPOLIA_TRUSTED_REMOTE,
  SEPOLIA_TRUSTED_REMOTE,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
  XVS_STORE,
  ZYSYNC_SEPOLIA_REMOTE,
} from "../../vips/vip-458/bsctestnet";
import XVS_STORE_ABI from "./abi/XVSStore.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { berachainbartio } = NETWORK_ADDRESSES;
const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);

const MIN_DEST_GAS = "300000";

const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

forking(10791347, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvsMinter: SignerWithAddress;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, berachainbartio.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Bridge Owner != multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(berachainbartio.GUARDIAN);
    });

    it("Trusted remote should not exist for any network(bsctestnet, opbnbtestnet, sepolia, arbitumsepolia, zksyncsepolia)", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.bsctestnet)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.opbnbtestnet)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.sepolia)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.arbitrumsepolia)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.zksyncsepolia)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
    });

    it("Mint limit = 0", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(0);
    });
  });

  testForkedNetworkVipCommands("vip452 configures bridge", await vip452());
  testForkedNetworkVipCommands("vip458 configures bridge", await vip458());

  describe("Post-VIP behaviour", async () => {
    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(berachainbartio.NORMAL_TIMELOCK);
    });

    it("Should whitelist NT and TREASURY", async () => {
      let res = await xvsBridge.whitelist(berachainbartio.NORMAL_TIMELOCK);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(berachainbartio.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all six networks", async () => {
      let trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.bsctestnet);
      expect(trustedRemote).equals(BNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.opbnbtestnet);
      expect(trustedRemote).equals(OPBNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.sepolia);
      expect(trustedRemote).equals(SEPOLIA_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.arbitrumsepolia);
      expect(trustedRemote).equals(ARBITRUM_SEPOLIA_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.opsepolia);
      expect(trustedRemote).equals(OP_SEPOLIA_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.zksyncsepolia);
      expect(trustedRemote).equals(ZYSYNC_SEPOLIA_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit for all six networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.bsctestnet);
      expect(limit).equals(parseUnits("100000", 18));

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.sepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncsepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.opsepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);
    });

    it("Should set correct max single limit for all six networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.bsctestnet);
      expect(limit).equals(parseUnits("20000", 18));

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.sepolia);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncsepolia);
      expect(limit).equals(SINGLE_SEND_LIMIT);
    });

    it("Should set correct max daily receive limit for all six networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.bsctestnet);
      expect(limit).equals(parseUnits("102000", 18));

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.sepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncsepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.opsepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should set correct max single receive limit for all six networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.bsctestnet);
      expect(limit).equals(parseUnits("20400", 18));

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.sepolia);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncsepolia);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.opsepolia);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);
    });

    it("Should set correct min destination gas", async () => {
      let limit = await xvsBridge.minDstGasLookup(LzChainId.bsctestnet, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.opbnbtestnet, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.sepolia, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.arbitrumsepolia, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.zksyncsepolia, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.opsepolia, 0);
      expect(limit).equals(MIN_DEST_GAS);
    });
  });

  describe("Post-Execution extra checks", () => {
    it(`should fail if someone else tries to mint XVS`, async () => {
      const regularUser = await initMainnetUser(REGULAR_USER, parseEther("1"));

      await expect(xvs.connect(regularUser).mint(REGULAR_USER, 1)).to.be.revertedWithCustomError(xvs, "Unauthorized");
    });

    it(`should fail if someone else tries to burn XVS`, async () => {
      const regularUser = await initMainnetUser(REGULAR_USER, parseEther("1"));

      await expect(xvs.connect(regularUser).burn(REGULAR_USER, 1)).to.be.revertedWithCustomError(xvs, "Unauthorized");
    });
  });

  describe("XVS Vault checks", async () => {
    before(async () => {
      const xvs: Contract = await ethers.getContractAt(XVS_ABI, berachainbartio.XVS);
      xvsMinter = await initMainnetUser(XVS_BRIDGE_DEST, ethers.utils.parseEther("1"));
      const admin = await initMainnetUser(berachainbartio.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      const xvsHolder = await initMainnetUser(berachainbartio.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
      await xvsVault.connect(admin).setRewardAmountPerBlockOrSecond(berachainbartio.XVS, "61805555555555555");
      await xvsVault.connect(admin).resume();
      await xvs.connect(xvsMinter).mint(xvsHolder.address, parseEther("10"));

      await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
      await mine(604800);
    });

    checkXVSVault();

    it("Should set xvs vault owner to NTL", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(berachainbartio.NORMAL_TIMELOCK);
    });

    it("Should set xvs store owner to NTL", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(berachainbartio.NORMAL_TIMELOCK);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(berachainbartio.XVS);
      expect(isActive).equals(true);
    });
  });
});
