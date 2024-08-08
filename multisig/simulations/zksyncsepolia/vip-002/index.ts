import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip002, {
  ARBITRUM_SEPOLIA_REMOTE,
  BNB_TESTNET_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  OPBNB_TESTNET_TRUSTED_REMOTE,
  SEPOLIA_TRUSTED_REMOTE,
  SINGLE_RECEIVE_LIMIT,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
} from "../../../proposals/zksyncsepolia/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);

const MIN_DEST_GAS = "300000";

forking(3571119, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != arbitrum sepolia multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(zksyncsepolia.GUARDIAN);
    });

    it("Trusted remote should not exist for any network(bsctestnet, opbnbtestnet, sepolia, arbitumsepolia)", async () => {
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
      expect(owner).equals(zksyncsepolia.GUARDIAN);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(zksyncsepolia.GUARDIAN);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(zksyncsepolia.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all four networks", async () => {
      let trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.bsctestnet);
      expect(trustedRemote).equals(BNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.opbnbtestnet);
      expect(trustedRemote).equals(OPBNB_TESTNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.sepolia);
      expect(trustedRemote).equals(SEPOLIA_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.arbitrumsepolia);
      expect(trustedRemote).equals(ARBITRUM_SEPOLIA_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.bsctestnet);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.sepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);
    });

    it("Should set correct max single limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.bsctestnet);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.sepolia);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(SINGLE_SEND_LIMIT);
    });

    it("Should set correct max daily receive limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.bsctestnet);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.sepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.arbitrumsepolia);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should set correct max single receive limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.bsctestnet);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.opbnbtestnet);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.sepolia);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.arbitrumsepolia);
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
