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

import vip452, {
  MIN_DST_GAS,
  UNICHAIN_SEPOLIA_TRUSTED_REMOTE,
  remoteBridgeEntries,
} from "../../vips/vip-452/bsctestnet";
import { RemoteBridgeEntry } from "../../vips/vip-452/types";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";

const { bsctestnet } = NETWORK_ADDRESSES;

const XVSProxyOFTSrc = "0x0E132cd94fd70298b747d2b4D977db8d086e5fD0";
const XVS_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

forking(48077026, async () => {
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

  testVip("vip-452 testnet", await vip452(), {
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
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [6, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should match trusted remote address", async () => {
      expect(await bridge.getTrustedRemoteAddress(LzChainId.unichainsepolia)).to.equal(
        UNICHAIN_SEPOLIA_TRUSTED_REMOTE.toLowerCase(),
      );
    });

    it("Should match minDestGas value", async () => {
      expect(await bridge.minDstGasLookup(LzChainId.unichainsepolia, 0)).to.equal(MIN_DST_GAS);
    });

    describe("Limits", () => {
      let remoteBridgeEntry: RemoteBridgeEntry;

      before(() => {
        remoteBridgeEntry = remoteBridgeEntries.find(entry => !entry.dstChainId) as RemoteBridgeEntry;
      });

      it("Should match single send transaction limit", async () => {
        expect(await bridge.chainIdToMaxSingleTransactionLimit(LzChainId.unichainsepolia)).to.equal(
          remoteBridgeEntry.maxSingleTransactionLimit,
        );
      });

      it("Should match single receive transaction limit", async () => {
        expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.unichainsepolia)).to.equal(
          remoteBridgeEntry.maxSingleReceiveTransactionLimit,
        );
      });

      it("Should match max daily send limit", async () => {
        expect(await bridge.chainIdToMaxDailyLimit(LzChainId.unichainsepolia)).to.equal(
          remoteBridgeEntry.maxDailyLimit,
        );
      });

      it("Should match max daily receive limit", async () => {
        expect(await bridge.chainIdToMaxDailyReceiveLimit(LzChainId.unichainsepolia)).to.equal(
          remoteBridgeEntry.maxDailyReceiveLimit,
        );
      });
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainsepolia,
          receiverAddressBytes32,
          amount,
          false,
          defaultAdapterParams,
        )
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);
      const bridgeBalPrev = await xvs.balanceOf(XVSProxyOFTSrc);
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.unichainsepolia,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(LzChainId.unichainsepolia, XVS_HOLDER, receiverAddressBytes32, amount);
      const bridgeBalAfter = await xvs.balanceOf(XVSProxyOFTSrc);

      expect(bridgeBalAfter.sub(bridgeBalPrev)).to.equal(amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("10000", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainsepolia,
          receiverAddressBytes32,
          amount,
          false,
          defaultAdapterParams,
        )
      ).nativeFee;
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.unichainsepolia,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const amount = parseUnits("2500", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256); // Let's approve enough XVS
      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainsepolia,
          receiverAddressBytes32,
          amount,
          false,
          defaultAdapterParams,
        )
      ).nativeFee;

      for (let i = 0; i < 7; i++) {
        await bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.unichainsepolia,
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
            LzChainId.unichainsepolia,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
