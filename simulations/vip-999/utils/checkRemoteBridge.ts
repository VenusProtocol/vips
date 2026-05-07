import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { initMainnetUser, setMaxStalePeriod } from "src/utils";

import XVS_ABI from "../abi/XVS.json";
import XVS_BRIDGE_DEST_ABI from "../abi/XVSProxyOFTDest.json";
import RESILIENT_ORACLE_ABI from "../abi/resilientOracle.json";

// Funded XVS holder
const XVS_HOLDER = "0x000000000000000000000000000000000000dEaD";

export type RemoteBridgeCheckConfig = {
  description: string;
  proxyOFTDest: string; // remote `XVSProxyOFTDest`
  xvs: string; // remote XVS token (Dest mints/burns)
  resilientOracle: string;
};

export const checkRemoteBridge = async (config: RemoteBridgeCheckConfig) => {
  const provider = ethers.provider;
  const sendAmount = "0.5";

  let bridge: Contract;
  let xvs: Contract;
  let resilientOracle: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  describe(`Remote bridge — ${config.description}`, () => {
    before(async () => {
      bridge = new ethers.Contract(config.proxyOFTDest, XVS_BRIDGE_DEST_ABI, provider);
      resilientOracle = new ethers.Contract(config.resilientOracle, RESILIENT_ORACLE_ABI, provider);

      xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("2"));
      [receiver] = await ethers.getSigners();
      receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
      defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);

      // Fund XVS_HOLDER on this remote chain by impersonating the bridge
      const impersonatedBridge = await initMainnetUser(config.proxyOFTDest, parseUnits("1", 18));
      xvs = new ethers.Contract(config.xvs, XVS_ABI, impersonatedBridge);
      await xvs.mint(XVS_HOLDER, parseUnits("10000", 18));

      await setMaxStalePeriod(resilientOracle, xvs);
    });

    it("can read the BSC-direction limits without reverting", async () => {
      await bridge.chainIdToMaxDailyLimit(LzChainId.bscmainnet);
      await bridge.chainIdToMaxSingleTransactionLimit(LzChainId.bscmainnet);
      await bridge.chainIdToMaxDailyReceiveLimit(LzChainId.bscmainnet);
      await bridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.bscmainnet);
    });

    it(`can bridge XVS ${config.description} → BSC (sendAmount = ${sendAmount} XVS)`, async () => {
      const amount = parseUnits(sendAmount, 18);

      const nativeFee = (
        await bridge.estimateSendFee(LzChainId.bscmainnet, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await xvs.connect(xvsHolderSigner).approve(bridge.address, amount);

      await expect(
        bridge
          .connect(xvsHolderSigner)
          .sendFrom(
            XVS_HOLDER,
            LzChainId.bscmainnet,
            receiverAddressBytes32,
            amount,
            [XVS_HOLDER, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.emit(bridge, "SendToChain")
        .withArgs(LzChainId.bscmainnet, XVS_HOLDER, receiverAddressBytes32, amount);
    });
  });
};
