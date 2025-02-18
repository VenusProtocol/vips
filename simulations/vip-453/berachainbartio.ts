import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip452 from "../../vips/vip-452/bsctestnet";
import vip453, {
  ARBITRUM_SEPOLIA_REMOTE,
  BNB_TESTNET_TRUSTED_REMOTE,
  OPBNB_TESTNET_TRUSTED_REMOTE,
  OP_SEPOLIA_TRUSTED_REMOTE,
  SEPOLIA_TRUSTED_REMOTE,
  XVS,
  XVS_BRIDGE_ADMIN_PROXY,
  XVS_BRIDGE_DEST,
  XVS_MINT_LIMIT,
  ZYSYNC_SEPOLIA_REMOTE,
} from "../../vips/vip-453/bsctestnet";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { berachainbartio } = NETWORK_ADDRESSES;
const SINGLE_SEND_LIMIT = parseUnits("20000", 18);
const MAX_DAILY_SEND_LIMIT = parseUnits("100000", 18);
const MAX_DAILY_RECEIVE_LIMIT = parseUnits("102000", 18);
const SINGLE_RECEIVE_LIMIT = parseUnits("20400", 18);

const MIN_DEST_GAS = "300000";

forking(10720442, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN_PROXY);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE_DEST);
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
  testForkedNetworkVipCommands("vip453 configures bridge", await vip453());

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
});
