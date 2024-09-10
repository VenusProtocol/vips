import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip002, {
  ARBITRUM_ONE_REMOTE,
  BNB_MAINNET_TRUSTED_REMOTE,
  ETHEREUM_TRUSTED_REMOTE,
  OPBNB_MAINNET_TRUSTED_REMOTE,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
} from "../../../proposals/zksyncmainnet/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
const MAX_DAILY_RECEIVE_LIMIT = parseUnits("51000", 18);
const SINGLE_SEND_LIMIT = parseUnits("10000", 18);
const SINGLE_RECEIVE_LIMIT = parseUnits("10200", 18);

const { zksyncmainnet } = NETWORK_ADDRESSES;
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

const MIN_DEST_GAS = "300000";

forking(42390726, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != zksync mainnet multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(zksyncmainnet.GUARDIAN);
    });

    it("Trusted remote should not exist for any network(bscmainnet, opbnbmainnet, ethereum, arbitrumone)", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.bscmainnet)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.opbnbmainnet)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.ethereum)).to.be.revertedWith(
        "LzApp: no trusted path record",
      );
      await expect(xvsBridge.getTrustedRemoteAddress(LzChainId.arbitrumone)).to.be.revertedWith(
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
      expect(owner).equals(zksyncmainnet.GUARDIAN);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(zksyncmainnet.GUARDIAN);
      expect(res).equals(true);

      res = await xvsBridge.whitelist(zksyncmainnet.VTREASURY);
      expect(res).equals(true);
    });

    it("Should set trusted remote address in bridge for all four networks", async () => {
      let trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.bscmainnet);
      expect(trustedRemote).equals(BNB_MAINNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.opbnbmainnet);
      expect(trustedRemote).equals(OPBNB_MAINNET_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.ethereum);
      expect(trustedRemote).equals(ETHEREUM_TRUSTED_REMOTE);

      trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.arbitrumone);
      expect(trustedRemote).equals(ARBITRUM_ONE_REMOTE);
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
      let limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.bscmainnet);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.opbnbmainnet);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.ethereum);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyLimit(LzChainId.arbitrumone);
      expect(limit).equals(MAX_DAILY_SEND_LIMIT);
    });

    it("Should set correct max single limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.bscmainnet);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.opbnbmainnet);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.ethereum);
      expect(limit).equals(SINGLE_SEND_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.arbitrumone);
      expect(limit).equals(SINGLE_SEND_LIMIT);
    });

    it("Should set correct max daily receive limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.bscmainnet);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.opbnbmainnet);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.ethereum);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.arbitrumone);
      expect(limit).equals(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should set correct max single receive limit for all four networks", async () => {
      let limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.bscmainnet);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.opbnbmainnet);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.ethereum);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);

      limit = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.arbitrumone);
      expect(limit).equals(SINGLE_RECEIVE_LIMIT);
    });

    it("Should set correct min destination gas", async () => {
      let limit = await xvsBridge.minDstGasLookup(LzChainId.bscmainnet, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.opbnbmainnet, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.ethereum, 0);
      expect(limit).equals(MIN_DEST_GAS);

      limit = await xvsBridge.minDstGasLookup(LzChainId.arbitrumone, 0);
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