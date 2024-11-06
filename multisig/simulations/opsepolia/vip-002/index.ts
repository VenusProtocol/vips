import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip002, {
  ARBITRUM_SEPOLIA_ENDPOINT_ID,
  ARBITRUM_SEPOLIA_TRUSTED_REMOTE,
  BNB_TESTNET_ENDPOINT_ID,
  BNB_TESTNET_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  MIN_DST_GAS,
  OPBNB_TESTNET_ENDPOINT_ID,
  OPBNB_TESTNET_TRUSTED_REMOTE,
  SEPOLIA_ENDPOINT_ID,
  SEPOLIA_TRUSTED_REMOTE,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
  ZKSYNC_SEPOLIA_ENDPOINT_ID,
  ZKSYNC_SEPOLIA_TRUSTED_REMOTE,
} from "../../../proposals/opsepolia/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { opsepolia } = NETWORK_ADDRESSES;
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

forking(16643257, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != opsepolia multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(opsepolia.GUARDIAN);
    });

    it("Trusted remote should not exist for any network(bsctestnet, opbnbtestnet, sepolia)", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(BNB_TESTNET_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(OPBNB_TESTNET_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(SEPOLIA_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );

      await expect(xvsBridge.getTrustedRemoteAddress(ARBITRUM_SEPOLIA_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );

      await expect(xvsBridge.getTrustedRemoteAddress(ZKSYNC_SEPOLIA_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
    });

    it("Mint limit = 0", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip002());
    });

    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(opsepolia.GUARDIAN);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(opsepolia.GUARDIAN);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(opsepolia.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all five networks", async () => {
      let trustedRemote = await xvsBridge.getTrustedRemoteAddress(BNB_TESTNET_ENDPOINT_ID);
      expect(trustedRemote).equals(BNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(OPBNB_TESTNET_ENDPOINT_ID);
      expect(trustedRemote).equals(OPBNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(SEPOLIA_ENDPOINT_ID);
      expect(trustedRemote).equals(SEPOLIA_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(ARBITRUM_SEPOLIA_ENDPOINT_ID);
      expect(trustedRemote).equals(ARBITRUM_SEPOLIA_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(ZKSYNC_SEPOLIA_ENDPOINT_ID);
      expect(trustedRemote).equals(ZKSYNC_SEPOLIA_TRUSTED_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit for all five networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyLimit(BNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(OPBNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(ARBITRUM_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(ZKSYNC_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);
    });

    it("Should set correct max single limit for all five networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(BNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(OPBNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(ARBITRUM_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(ZKSYNC_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);
    });

    it("Should set correct max daily receive limit for all five networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(BNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(OPBNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(ARBITRUM_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(ZKSYNC_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should set correct max single receive limit for all five networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(BNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(OPBNB_TESTNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ARBITRUM_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ZKSYNC_SEPOLIA_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);
    });

    it("Should set correct min destination gas", async () => {
      let limit = await xvsBridge.minDstGasLookup(BNB_TESTNET_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DST_GAS);

      limit = await xvsBridge.minDstGasLookup(OPBNB_TESTNET_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DST_GAS);

      limit = await xvsBridge.minDstGasLookup(SEPOLIA_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DST_GAS);

      limit = await xvsBridge.minDstGasLookup(ARBITRUM_SEPOLIA_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DST_GAS);

      limit = await xvsBridge.minDstGasLookup(ZKSYNC_SEPOLIA_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DST_GAS);
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
});
