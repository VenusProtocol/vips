import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip455, {
  CORE_COMPTROLLER,
  MIN_DST_GAS,
  UNICHAIN_MAINNET_TRUSTED_REMOTE,
  USDT,
  USDT_AMOUNT_TO_DEX,
  VANGUARD_TREASURY,
  XVS_AMOUNT_TO_BRIDGE,
  XVS_AMOUNT_TO_DEX,
  remoteBridgeEntries,
} from "../../vips/vip-455/bscmainnet";
import { RemoteBridgeEntry } from "../../vips/vip-455/types";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/VTreasury.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";
import ERC20_ABI from "./abi/erc20.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const XVSProxyOFTSrc = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const XVS_HOLDER = "0x4F2F8448F857994CE83ef14cf4EBb7DF0bb14667";

forking(46566370, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let xvs: Contract;
  let usdt: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;
  let resilientOracle: Contract;
  let usdtBalanceOfVanguardTreasury: BigNumber;
  let xvsBalanceOfVanguardTreasury: BigNumber;
  let xvsBalanceOfComptroller: BigNumber;

  before(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVS_BRIDGE_SRC_ABI, provider);
    xvs = new ethers.Contract(bscmainnet.XVS, ERC20_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    usdtBalanceOfVanguardTreasury = await usdt.balanceOf(VANGUARD_TREASURY);
    xvsBalanceOfVanguardTreasury = await xvs.balanceOf(VANGUARD_TREASURY);
    xvsBalanceOfComptroller = await xvs.balanceOf(CORE_COMPTROLLER);
  });

  testVip("vip-455", await vip455(), {
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
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [1]);
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["VenusGranted"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await setMaxStalePeriod(resilientOracle, xvs);
    });

    describe("transferred funds", () => {
      it("check usdt balance of Vanguard Treasury", async () => {
        const newBalance = await usdt.balanceOf(VANGUARD_TREASURY);
        expect(newBalance).to.equals(usdtBalanceOfVanguardTreasury.add(USDT_AMOUNT_TO_DEX));
      });

      it("check xvs balance of Vanguard Treasury", async () => {
        const newBalance = await xvs.balanceOf(VANGUARD_TREASURY);
        expect(newBalance).to.equals(xvsBalanceOfVanguardTreasury.add(XVS_AMOUNT_TO_DEX));
      });

      it("should transfer XVS from the Comptroller", async () => {
        const newBalance = await xvs.balanceOf(CORE_COMPTROLLER);
        expect(newBalance).to.equal(xvsBalanceOfComptroller.sub(XVS_AMOUNT_TO_BRIDGE.add(XVS_AMOUNT_TO_DEX)));
      });
    });

    it("Should match trusted remote address", async () => {
      expect(await bridge.getTrustedRemoteAddress(LzChainId.unichainmainnet)).to.equal(
        UNICHAIN_MAINNET_TRUSTED_REMOTE.toLowerCase(),
      );
    });

    it("Should match minDestGas value", async () => {
      expect(await bridge.minDstGasLookup(LzChainId.unichainmainnet, 0)).to.equal(MIN_DST_GAS);
    });

    describe("Limits", () => {
      let remoteBridgeEntry: RemoteBridgeEntry;

      before(() => {
        remoteBridgeEntry = remoteBridgeEntries.find(entry => !entry.dstChainId) as RemoteBridgeEntry;
      });

      it("Should match single send transaction limit", async () => {
        expect(await bridge.chainIdToMaxSingleTransactionLimit(LzChainId.unichainmainnet)).to.equal(
          remoteBridgeEntry.maxSingleTransactionLimit,
        );
      });

      it("Should match single receive transaction limit", async () => {
        expect(await bridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.unichainmainnet)).to.equal(
          remoteBridgeEntry.maxSingleReceiveTransactionLimit,
        );
      });

      it("Should match max daily send limit", async () => {
        expect(await bridge.chainIdToMaxDailyLimit(LzChainId.unichainmainnet)).to.equal(
          remoteBridgeEntry.maxDailyLimit,
        );
      });

      it("Should match max daily receive limit", async () => {
        expect(await bridge.chainIdToMaxDailyReceiveLimit(LzChainId.unichainmainnet)).to.equal(
          remoteBridgeEntry.maxDailyReceiveLimit,
        );
      });
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainmainnet,
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
            LzChainId.unichainmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(LzChainId.unichainmainnet, XVS_HOLDER, receiverAddressBytes32, amount);
      const bridgeBalAfter = await xvs.balanceOf(XVSProxyOFTSrc);

      expect(bridgeBalAfter.sub(bridgeBalPrev)).to.equal(amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("10000", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainmainnet,
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
            LzChainId.unichainmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const amount = parseUnits("1500", 18);
      await xvs.connect(xvsHolderSigner).approve(bridge.address, ethers.constants.MaxUint256); // Let's approve enough XVS
      const nativeFee = (
        await bridge.estimateSendFee(
          LzChainId.unichainmainnet,
          receiverAddressBytes32,
          amount,
          false,
          defaultAdapterParams,
        )
      ).nativeFee;

      for (let i = 0; i < 5; i++) {
        await bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.unichainmainnet,
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
            LzChainId.unichainmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
