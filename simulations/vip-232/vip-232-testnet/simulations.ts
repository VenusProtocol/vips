import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  DEST_CHAIN_ID,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  MIN_DST_GAS,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  vip232Testnet,
} from "../../../vips/vip-232/vip-232-testnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import XVS_ABI from "./abi/XVS.json";
import XVSBridgeAdmin_ABI from "./abi/XVSBridgeAdmin.json";
import XVSProxyOFTSrc_ABI from "./abi/XVSProxyOFTSrc.json";

const XVSProxyOFTSrc = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
const XVSBridgeAdmin_Proxy = "0xB164Cb262328Ca44a806bA9e3d4094931E658513";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
const XVS_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(36177672, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let bridgeAdmin: Contract;
  let xvs: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVSProxyOFTSrc_ABI, provider);
    bridgeAdmin = new ethers.Contract(XVSBridgeAdmin_Proxy, XVSBridgeAdmin_ABI, provider);
    xvs = new ethers.Contract(XVS, XVS_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("5"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
  });

  testVip("vip232Testnet", await vip232Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACM_ABI, XVSBridgeAdmin_ABI, XVSProxyOFTSrc_ABI],
        [
          "RoleGranted",
          "OwnershipTransferred",
          "SetMinDstGas",
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "SetTrustedRemoteAddress",
          "Failure",
        ],
        [55, 2, 1, 1, 1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Owner of the BridgeAdmin should be Normal Timelock", async () => {
      expect(await bridgeAdmin.owner()).to.equal(NORMAL_TIMELOCK);
    });

    it("Should match minDestGas value", async () => {
      expect(await bridge.minDstGasLookup(DEST_CHAIN_ID, 0)).to.equal(MIN_DST_GAS);
    });

    it("Should match single send transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_RECEIVE_LIMIT);
    });

    it("Should match max daily send limit", async () => {
      expect(await bridge.chainIdToMaxDailyLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await bridge.chainIdToMaxDailyReceiveLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(DEST_CHAIN_ID, XVS_HOLDER, receiverAddressBytes32, amount);

      expect(await xvs.balanceOf(bridge.address)).to.equal(amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("2", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      const nativeFee = (
        await bridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const maxPlusAmount = ethers.utils.parseUnits("500");
      const amount = ethers.utils.parseUnits("0.9");

      await xvs.connect(xvsHolderSigner).approve(bridge.address, maxPlusAmount);
      const nativeFee = (
        await bridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      for (let i = 0; i < 50; i++) {
        await bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          );
      }
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
