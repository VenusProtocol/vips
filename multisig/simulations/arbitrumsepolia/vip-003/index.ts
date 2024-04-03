import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip003 from "../../../proposals/arbitrumsepolia/vip-003";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

const XVS_BRIDGE_ADMIN = "0x0DC3d6717727FD5a023e41bA8134640ca18f3E48";
const XVS = "0x47fA6E9F717c9eB081c4734FfB5a1EcD70508891";
const SRC_CHAIN_ID = "10102";
const XVS_MINT_LIMIT = parseUnits("500000", 18);
const TRUSTED_REMOTE = "0x0e132cd94fd70298b747d2b4d977db8d086e5fd0";
const XVS_BRIDGE = "0xE9B66800E63888DE29c4c9131faadbDbDCfae917";
const REGULAR_USER = "0xd7b572EeE55B6C4725469ef6Df5ceaa77374E641";

forking(29808974, () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != arbitrum sepolia multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("Trusted remote should not exist", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(SRC_CHAIN_ID)).to.be.revertedWith("LzApp: no trusted path record");
    });

    it("Mint limit = 0", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip003());
    });

    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(arbitrumsepolia.NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(SRC_CHAIN_ID);
      expect(trustedRemote).equals(TRUSTED_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals(XVS_MINT_LIMIT);
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit", async () => {
      const token = await xvsBridge.chainIdToMaxDailyLimit(SRC_CHAIN_ID);
      expect(token).equals("50000000000000000000000");
    });

    it("Should set correct max single limit", async () => {
      const token = await xvsBridge.chainIdToMaxSingleTransactionLimit(SRC_CHAIN_ID);
      expect(token).equals("10000000000000000000000");
    });

    it("Should set correct max daily receive limit", async () => {
      const token = await xvsBridge.chainIdToMaxDailyReceiveLimit(SRC_CHAIN_ID);
      expect(token).equals("50000000000000000000000");
    });

    it("Should set correct max single receive limit", async () => {
      const token = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(SRC_CHAIN_ID);
      expect(token).equals("10000000000000000000000");
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
