import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { vip011 } from "../../../proposals/vip-011/vip-011-sepolia";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import VAI_ABI from "./abi/vai.json";
import VAI_BRIDGE_ABI from "./abi/vaiBridge.json";
import VAI_BRIDGE_ADMIN_ABI from "./abi/vaiBridgeAdmin.json";

const { sepolia } = NETWORK_ADDRESSES;
const TRUSTED_REMOTE = "0xeaa89cf3bab8245f8a2f438595e1ff5cc3eeae18";
const DEST_CHAIN_ID = 10102;

forking(5373511, () => {
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
    let acc1: SignerWithAddress;
    let impersonateMinterOfVAI: SignerWithAddress;
    let receiverAddressBytes32: string;
    let defaultAdapterParams: string;
    before(async () => {
      await pretendExecutingVip(vip011());
      // Mocking for simulations
      impersonateMinterOfVAI = await initMainnetUser(sepolia.TOKEN_BRIDGE_VAI, ethers.utils.parseEther("2"));
      [acc1] = await ethers.getSigners();
      await vai.connect(impersonateMinterOfVAI).mint(acc1.address, parseUnits("50001", 18));
      receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [acc1.address]);
      defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    });
    it("Should set bridge owner to multisig", async () => {
      const owner = await vaiBridgeAdmin.owner();
      expect(owner).equals(sepolia.NORMAL_TIMELOCK);
    });

    it("Should set trusted remote address in bridge", async () => {
      const trustedRemote = await vaiBridge.getTrustedRemoteAddress(10102);
      expect(trustedRemote).equals(TRUSTED_REMOTE);
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

    it("Should emit an event on successfull bridging of VAI", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await vai.connect(acc1).approve(vaiBridge.address, amount);

      await expect(
        vaiBridge
          .connect(acc1)
          .sendFrom(
            acc1.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [acc1.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(vaiBridge, "SendToChain")
        .withArgs(DEST_CHAIN_ID, acc1.address, receiverAddressBytes32, amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("10001", 18);
      await vai.connect(acc1).approve(vaiBridge.address, amount);

      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;
      await expect(
        vaiBridge
          .connect(acc1)
          .sendFrom(
            acc1.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [acc1.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const maxPlusAmount = ethers.utils.parseUnits("50001");
      const amount = ethers.utils.parseUnits("10000");

      await vai.connect(acc1).approve(vaiBridge.address, maxPlusAmount);
      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      for (let i = 0; i < 4; i++) {
        await vaiBridge
          .connect(acc1)
          .sendFrom(
            acc1.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [acc1.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          );
      }
      await expect(
        vaiBridge
          .connect(acc1)
          .sendFrom(
            acc1.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [acc1.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
