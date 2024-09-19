import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip364, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  MIN_DST_GAS,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
} from "../../vips/vip-364/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const XVSProxyOFTSrc = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const XVS_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(42378700, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let xvs: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVS_BRIDGE_SRC_ABI, provider);
    xvs = new ethers.Contract(bsctestnet.XVS, XVS_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
  });

  testVip("vip-364 testnet", await vip364(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI],
        [
          "SetMinDstGas",
          "SetMaxSingleTransactionLimit",
          "SetMaxDailyLimit",
          "SetMaxSingleReceiveTransactionLimit",
          "SetMaxDailyReceiveLimit",
          "SetTrustedRemoteAddress",
          "Failure",
        ],
        [1, 1, 1, 1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should match minDestGas value", async () => {
      expect(await bridge.minDstGasLookup(LzChainId.opmainnet, 0)).to.equal(MIN_DST_GAS);
    });

    it("Should match single send transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleTransactionLimit(LzChainId.opmainnet)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.opmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await bridge.chainIdToMaxDailyLimit(LzChainId.opmainnet)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await bridge.chainIdToMaxDailyReceiveLimit(LzChainId.opmainnet)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(LzChainId.opmainnet, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);
      const bridgeBalPrev = await xvs.balanceOf(XVSProxyOFTSrc);
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.opmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(LzChainId.opmainnet, XVS_HOLDER, receiverAddressBytes32, amount);
      const bridgeBalAfter = await xvs.balanceOf(XVSProxyOFTSrc);

      expect(bridgeBalAfter.sub(bridgeBalPrev)).to.equal(amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("10000", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      const nativeFee = (
        await bridge.estimateSendFee(LzChainId.opmainnet, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.opmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const maxPlusAmount = ethers.utils.parseUnits("50000", 18);
      const amount = parseUnits("1420", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, maxPlusAmount);
      const nativeFee = (
        await bridge.estimateSendFee(LzChainId.opmainnet, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      for (let i = 0; i < 5; i++) {
        await bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.opmainnet,
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
            LzChainId.opmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
