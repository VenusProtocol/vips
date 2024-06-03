import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip002, {
  BNB_MAINNET_ENDPOINT_ID,
  BNB_MAINNET_TRUSTED_REMOTE,
  ETHEREUM_ENDPOINT_ID,
  ETHEREUM_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  OPBNB_MAINNET_ENDPOINT_ID,
  OPBNB_MAINNET_TRUSTED_REMOTE,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
} from "../../../proposals/arbitrumone/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

const MIN_DEST_GAS = "300000";

forking(214523193, () => {
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
      expect(owner).not.equal(arbitrumone.NORMAL_TIMELOCK);
    });

    it("Trusted remote should not exist for any network(bscmainnet, opbnbmainnet, ethereum)", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(BNB_MAINNET_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(OPBNB_MAINNET_ENDPOINT_ID)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(ETHEREUM_ENDPOINT_ID)).to.be.revertedWith(
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
      await pretendExecutingVip(vip002());
    });

    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(arbitrumone.NORMAL_TIMELOCK);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(arbitrumone.NORMAL_TIMELOCK);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(arbitrumone.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all three networks", async () => {
      let trustedRemote = await xvsBridge.getTrustedRemoteAddress(BNB_MAINNET_ENDPOINT_ID);
      expect(trustedRemote).equals(BNB_MAINNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(OPBNB_MAINNET_ENDPOINT_ID);
      expect(trustedRemote).equals(OPBNB_MAINNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(ETHEREUM_ENDPOINT_ID);
      expect(trustedRemote).equals(ETHEREUM_TRUSTED_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE_DEST);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit for all three networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyLimit(BNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(OPBNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(ETHEREUM_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);
    });

    it("Should set correct max single limit for all three networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(BNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(OPBNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(ETHEREUM_ENDPOINT_ID);
      expect(limit).equals(SINGLE_SEND_LIMIT);
    });

    it("Should set correct max daily receive limit for all three networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(BNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(OPBNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(ETHEREUM_ENDPOINT_ID);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should set correct max single receive limit for all three networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(BNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(OPBNB_MAINNET_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ETHEREUM_ENDPOINT_ID);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);
    });

    it("Should set correct min destination gas", async () => {
      let limit = await xvsBridge.minDstGasLookup(BNB_MAINNET_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(OPBNB_MAINNET_ENDPOINT_ID, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(ETHEREUM_ENDPOINT_ID, 0);
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
