import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip011 } from "../../../proposals/vip-011/vip-011-sepolia";
import VAI_ABI from "./abi/vai.json";
import VAI_BRIDGE_ABI from "./abi/vaiBridge.json";
import VAI_BRIDGE_ADMIN_ABI from "./abi/vaiBridgeAdmin.json";

const NORMAL_TIMELOCK = "0x94fa6078b6b8a26F0B6EDFFBE6501B22A10470fB"; // Sepolia Multisig
const VAI = "0x9414b9d8fbC128799B896A50c8927C369AA553CB";
const TOKEN_BRIDGE_VAI = "0xFA62BC6C0E20A507E3Ad0dF4F6b89E71953161fa";
const TOKEN_BRIDGE_ADMIN_VAI = "0x296349C4E86C7C3dd1fC9e5b30Ca47cf31162486";

forking(5340851, () => {
  let vai: Contract;
  let vaiBridgeAdmin: Contract;
  let vaiBridge: Contract;

  before(async () => {
    vai = await ethers.getContractAt(VAI_ABI, VAI);
    vaiBridgeAdmin = await ethers.getContractAt(VAI_BRIDGE_ADMIN_ABI, TOKEN_BRIDGE_ADMIN_VAI);
    vaiBridge = await ethers.getContractAt(VAI_BRIDGE_ABI, TOKEN_BRIDGE_VAI);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != sepolia multisig", async () => {
      const owner = await vaiBridgeAdmin.owner();
      expect(owner).not.equal(NORMAL_TIMELOCK);
    });

    it("Trusted remote should not exist", async () => {
      await expect(vaiBridge.getTrustedRemoteAddress(10102)).to.be.revertedWith("LzApp: no trusted path record");
    });

    it("Mint limit = 0", async () => {
      const cap = await vai.minterToCap(TOKEN_BRIDGE_VAI);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip011());
    });
    it("Should set bridge owner to multisig", async () => {
      const owner = await vaiBridgeAdmin.owner();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await vaiBridge.getTrustedRemoteAddress(10102);
      expect(trustedRemote).equals("0x2280acd3be2ee270161a11a6176814c26fd747f9");
    });

    it("Should set minting limit in VAI token", async () => {
      const cap = await vai.minterToCap(TOKEN_BRIDGE_VAI);
      expect(cap).equals(parseUnits("100000", 18));
    });

    it("Should set correct token address in bridge", async () => {
      const token = await vaiBridge.token();
      expect(token).equals(VAI);
    });

    it("Should set correct max daily limit", async () => {
      const token = await vaiBridge.chainIdToMaxDailyLimit(10102);
      expect(token).equals("50000000000000000000000");
    });

    it("Should set correct max single limit", async () => {
      const token = await vaiBridge.chainIdToMaxSingleTransactionLimit(10102);
      expect(token).equals("10000000000000000000000");
    });

    it("Should set correct max daily receive limit", async () => {
      const token = await vaiBridge.chainIdToMaxDailyReceiveLimit(10102);
      expect(token).equals("50000000000000000000000");
    });

    it("Should set correct max single receive limit", async () => {
      const token = await vaiBridge.chainIdToMaxSingleReceiveTransactionLimit(10102);
      expect(token).equals("10000000000000000000000");
    });

    it("Should set correct mint cap in VAI token", async () => {
      const token = await vai.minterToCap(TOKEN_BRIDGE_VAI);
      expect(token).equals("100000000000000000000000");
    });
  });
});
