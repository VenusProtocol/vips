import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Proposal } from "src/types";
import { expectEvents, initMainnetUser, setMaxStalePeriod } from "src/utils";
import { testForkedNetworkVipCommands } from "src/vip-framework";

import { RemoteBridgeEntry } from "../../vips/vip-409/bscmainnet";
import XVS_BRIDGE_SRC_ABI from "./abi/XVSProxyOFTSrc.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ADMIN_ABI from "./abi/xvsBridgeAdmin.json";

const XVS_HOLDER = "0x000000000000000000000000000000000000dEaD";

export async function checkXVSBridge(
  remoteLzChainId: number | undefined,
  networkAddresses: { [key: string]: any },
  vip: () => Promise<Proposal>,
  trustedRemote: string,
  bridgeConfiguration: RemoteBridgeEntry,
) {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let bridge: Contract;
  let xvs: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  beforeEach(async () => {
    bridge = new ethers.Contract(bridgeConfiguration.proxyOFT, XVS_BRIDGE_SRC_ABI, provider);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    resilientOracle = new ethers.Contract(networkAddresses.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

    // Let's fund the XVS_HOLDER wallet with some XVS tokens
    const impersonatedBridge = await initMainnetUser(bridge.address, parseUnits("1", 18));

    xvs = new ethers.Contract(networkAddresses.XVS, XVS_ABI, impersonatedBridge);
    await xvs.mint(XVS_HOLDER, parseUnits("10000", 18));
  });

  testForkedNetworkVipCommands("VIP", await vip(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_BRIDGE_ADMIN_ABI, XVS_BRIDGE_SRC_ABI], ["SetTrustedRemoteAddress"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    before(async () => {
      await setMaxStalePeriod(resilientOracle, xvs);
    });

    it("Should match trusted remote address", async () => {
      expect(await bridge.getTrustedRemoteAddress(remoteLzChainId)).to.equal(trustedRemote.toLowerCase());
    });

    it("Should emit an event on successfull bridging of XVS", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await bridge.estimateSendFee(remoteLzChainId, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);
      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            XVS_HOLDER,
            remoteLzChainId,
            receiverAddressBytes32,
            amount,
            [XVS_HOLDER, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(bridge, "SendToChain")
        .withArgs(remoteLzChainId, XVS_HOLDER, receiverAddressBytes32, amount);
    });
  });
}
