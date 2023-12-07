import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip003 } from "../../../proposals/vip-003/vip-003-opbnbtestnet";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const XVS_BRIDGE_ADMIN = "0xd92aB7166a1cA1f8a401266E147B7c0e8705c143";
const XVS_BRIDGE = "0x636d84bEF01d88C9DC7fF3FFB1A0951cD8454f56";
const XVS = "0x3d0e20D4caD958bc848B045e1da19Fe378f86f03";

forking(15062900, () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != sepolia multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(NORMAL_TIMELOCK);
    });

    it("Trusted remote should not exist", async () => {
      await expect(xvsBridge.getTrustedRemoteAddress(10102)).to.be.revertedWith("LzApp: no trusted path record");
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
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(10102);
      expect(trustedRemote).equals("0x963cabdc5bb51c1479ec94df44de2ec1a49439e3");
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals("100000000000000000000");
    });

    it("Should set correct token address in bridge", async () => {
      const token = await xvsBridge.token();
      expect(token).equals(XVS);
    });

    it("Should set correct max daily limit", async () => {
      const token = await xvsBridge.chainIdToMaxDailyLimit(10102);
      expect(token).equals("500000000000000000000");
    });

    it("Should set correct max single limit", async () => {
      const token = await xvsBridge.chainIdToMaxSingleTransactionLimit(10102);
      expect(token).equals("10000000000000000000");
    });

    it("Should set correct max daily receive limit", async () => {
      const token = await xvsBridge.chainIdToMaxDailyReceiveLimit(10102);
      expect(token).equals("500000000000000000000");
    });

    it("Should set correct max single receive limit", async () => {
      const token = await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(10102);
      expect(token).equals("10000000000000000000");
    });
  });
});
