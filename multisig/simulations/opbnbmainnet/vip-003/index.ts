import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip003 from "../../../proposals/opbnbmainnet/vip-003";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const NORMAL_TIMELOCK = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";
const XVS_BRIDGE_ADMIN = "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831";
const XVS_BRIDGE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";
const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const SRC_CHAIN_ID = "102";
const TRUSTED_REMOTE = "0xf8f46791e3db29a029ec6c9d946226f3c613e854";

forking(14442236, async () => {
  let xvs: Contract;
  let xvsBridgeAdmin: Contract;
  let xvsBridge: Contract;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridgeAdmin = await ethers.getContractAt(XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_ADMIN);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != opbnbmainnet multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).not.equal(NORMAL_TIMELOCK);
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
      await pretendExecutingVip(await vip003());
    });
    it("Should set bridge owner to multisig", async () => {
      const owner = await xvsBridgeAdmin.owner();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(SRC_CHAIN_ID);
      expect(trustedRemote).equals(TRUSTED_REMOTE);
    });

    it("Should set minting limit in XVS token", async () => {
      const cap = await xvs.minterToCap(XVS_BRIDGE);
      expect(cap).equals(parseUnits("500000", 18));
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
});
