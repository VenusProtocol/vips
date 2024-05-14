import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser, setMaxStalePeriodInChainlinkOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  DEST_CHAIN_ID,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  vip273,
} from "../../vips/vip-273/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVSProxyOFTSrc_ABI from "./abi/XVSProxyOFTSrc.json";

const XVSProxyOFTSrc = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_HOLDER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const XVS_FEED = "0xBF63F430A79D4036A5900C19818aFf1fa710f206";

const OLD_SINGLE_SEND_LIMIT = parseUnits("10000", 18);
const OLD_MAX_DAILY_SEND_LIMIT = parseUnits("50000", 18);
const OLD_SINGLE_RECEIVE_LIMIT = parseUnits("10000", 18);
const OLD_MAX_DAILY_RECEIVE_LIMIT = parseUnits("50000", 18);

forking(36955530, async () => {
  const provider = ethers.provider;
  let xvsBridge: Contract;
  let xvs: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  before(async () => {
    xvsBridge = new ethers.Contract(XVSProxyOFTSrc, XVSProxyOFTSrc_ABI, provider);
    xvs = new ethers.Contract(XVS, XVS_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("5"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, XVS, XVS_FEED, NORMAL_TIMELOCK);
  });

  describe("Pre-VIP state", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(DEST_CHAIN_ID)).to.equal(OLD_SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(DEST_CHAIN_ID)).to.equal(
        OLD_SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(DEST_CHAIN_ID)).to.equal(OLD_MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(DEST_CHAIN_ID)).to.equal(OLD_MAX_DAILY_RECEIVE_LIMIT);
    });
  });

  testVip("vip273", await vip273(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVSProxyOFTSrc_ABI],
        [
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "Failure",
        ],
        [1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(DEST_CHAIN_ID)).to.equal(SINGLE_RECEIVE_LIMIT);
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(DEST_CHAIN_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("50000", 18);
      await xvs.connect(xvsHolderSigner).approve(xvsBridge.address, amount);

      const nativeFee = (
        await xvsBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;
      await expect(
        xvsBridge
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
      const maxPlusAmount = ethers.utils.parseUnits("160000");
      const amount = ethers.utils.parseUnits("6000", 18); // 1XVS = $16.3

      await xvs.connect(xvsHolderSigner).approve(xvsBridge.address, maxPlusAmount);
      const nativeFee = (
        await xvsBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      for (let i = 0; i < 10; i++) {
        await xvsBridge
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
        xvsBridge
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
