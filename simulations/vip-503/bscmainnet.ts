import { TransactionResponse } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip500 from "../../vips/vip-500/bscmainnet";
import vip503, { BASE_MAINNET_TRUSTED_REMOTE } from "../../vips/vip-503/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import XVS_ABI from "./abi/XVS.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/XVSBridgeAdmin.json";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const XVSProxyOFTSrc = "0xf8F46791E3dB29a029Ec6c9d946226f3c613e854";
const XVS_HOLDER = "0x4F2F8448F857994CE83ef14cf4EBb7DF0bb14667";

forking(44974654, async () => {
  const provider = ethers.provider;
  let bridge: Contract;
  let xvs: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;
  let resilientOracle: Contract;

  beforeEach(async () => {
    bridge = new ethers.Contract(XVSProxyOFTSrc, XVS_BRIDGE_SRC_ABI, provider);
    xvs = new ethers.Contract(bscmainnet.XVS, XVS_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  await vip500();
  testVip("vip-503 testnet", await vip503(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI], ["SetTrustedRemoteAddress"], [1]);
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [5, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await setMaxStalePeriod(resilientOracle, xvs);
    });

    it("Should match trusted remote address", async () => {
      expect(await bridge.getTrustedRemoteAddress(LzChainId.basemainnet)).to.equal(
        BASE_MAINNET_TRUSTED_REMOTE.toLowerCase(),
      );
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(LzChainId.basemainnet, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);
      const bridgeBalPrev = await xvs.balanceOf(XVSProxyOFTSrc);
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            LzChainId.basemainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(LzChainId.basemainnet, XVS_HOLDER, receiverAddressBytes32, amount);
      const bridgeBalAfter = await xvs.balanceOf(XVSProxyOFTSrc);

      expect(bridgeBalAfter.sub(bridgeBalPrev)).to.equal(amount);
    });
  });
});
