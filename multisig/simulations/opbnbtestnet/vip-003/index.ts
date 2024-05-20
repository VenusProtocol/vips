import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip003 from "../../../proposals/opbnbtestnet/vip-003";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";
const XVS_BRIDGE_ADMIN = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const XVS_BRIDGE = "0xA03205bC635A772E533E7BE36b5701E331a70ea3";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

forking(16382000, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != opbnbtestnet multisig", async () => {
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
      await pretendExecutingVip(await vip003());
    });
    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(10102);
      expect(trustedRemote).equals("0x0e132cd94fd70298b747d2b4d977db8d086e5fd0");
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals(parseUnits("10000", 18));
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
