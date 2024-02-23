import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip011 } from "../../../proposals/vip-011/vip-011-sepolia";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VAI_ABI from "./abi/vai.json";
import VAI_BRIDGE_ABI from "./abi/vaiBridge.json";
import VAI_BRIDGE_ADMIN_ABI from "./abi/vaiBridgeAdmin.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(5340851, () => {
  let vai: Contract;
  let vaiBridgeAdmin: Contract;
  let vaiBridge: Contract;
  let oracle: Contract;

  before(async () => {
    vai = await ethers.getContractAt(VAI_ABI, sepolia.VAI);
    vaiBridgeAdmin = await ethers.getContractAt(VAI_BRIDGE_ADMIN_ABI, sepolia.TOKEN_BRIDGE_ADMIN_VAI);
    vaiBridge = await ethers.getContractAt(VAI_BRIDGE_ABI, sepolia.TOKEN_BRIDGE_VAI);
    oracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
  });

  describe("Pre-Execution state", () => {
    it("Bridge Owner != sepolia multisig", async () => {
      const owner = await vaiBridgeAdmin.owner();
      expect(owner).not.equal(sepolia.NORMAL_TIMELOCK);
    });

    it("Trusted remote should not exist", async () => {
      await expect(vaiBridge.getTrustedRemoteAddress(10102)).to.be.revertedWith("LzApp: no trusted path record");
    });

    it("Mint limit = 0", async () => {
      const cap = await vai.minterToCap(sepolia.TOKEN_BRIDGE_VAI);
      expect(cap).equals(0);
    });
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip011());
    });
    it("Should set bridge owner to multisig", async () => {
      const owner = await vaiBridgeAdmin.owner();
      expect(owner).equals(sepolia.NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await vaiBridge.getTrustedRemoteAddress(10102);
      expect(trustedRemote).equals("0x2280acd3be2ee270161a11a6176814c26fd747f9");
    });

    it("Should set minting limit in sepolia.VAI token", async () => {
      const cap = await vai.minterToCap(sepolia.TOKEN_BRIDGE_VAI);
      expect(cap).equals(parseUnits("100000", 18));
    });

    it("Should set correct token address in bridge", async () => {
      const token = await vaiBridge.token();
      expect(token).equals(sepolia.VAI);
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

    it("Should set correct mint cap in sepolia.VAI token", async () => {
      const token = await vai.minterToCap(sepolia.TOKEN_BRIDGE_VAI);
      expect(token).equals("100000000000000000000000");
    });

    it("Should get correct price of sepolia.VAI token", async () => {
      const price = await oracle.getPrice(sepolia.VAI);
      expect(price).equals(parseUnits("1", 18));
    });
  });
});
