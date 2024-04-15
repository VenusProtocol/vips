import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip012, {
  BNB_ENDPOINT_ID,
  ETHEREUM_ENDPOINT_ID,
  ETHEREUM_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  OPBNB_TREASURY,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
} from "../../../proposals/opbnbmainnet/vip-012";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const XVS_BRIDGE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";
const XVS_HOLDER = "0xc27Bac74AAbbE19A346660E1F5fd4602F2D54E93";
const OPBNB_MULTISIG = "0xC46796a21a3A9FAB6546aF3434F2eBfFd0604207";

forking(20387710, () => {
  let xvs: Contract;
  let xvsBridge: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    xvsHolderSigner = await initMainnetUser(XVS_HOLDER, ethers.utils.parseEther("5"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(vip012());
    });

    it("Should match trusted remote address", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(ETHEREUM_ENDPOINT_ID);
      expect(trustedRemote).equals(ETHEREUM_TRUSTED_REMOTE);
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(ETHEREUM_ENDPOINT_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ETHEREUM_ENDPOINT_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(BNB_ENDPOINT_ID)).to.equal(SINGLE_RECEIVE_LIMIT);
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(ETHEREUM_ENDPOINT_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(ETHEREUM_ENDPOINT_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(BNB_ENDPOINT_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(OPBNB_MULTISIG);
      expect(res).equals(true);
      res = await xvsBridge.whitelist(OPBNB_TREASURY);
      expect(res).equals(true);
    });

    it("Should emit an event on successful bridging of XVS (opBNB -> ETHEREUM)", async () => {
      const amount = parseUnits("1", 18);
      const nativeFee = (
        await xvsBridge.estimateSendFee(
          ETHEREUM_ENDPOINT_ID,
          receiverAddressBytes32,
          amount,
          false,
          defaultAdapterParams,
        )
      ).nativeFee;

      const circulatingSupplyBefore = await xvsBridge.circulatingSupply();
      const totalSupplyBefore = await xvs.totalSupply();
      const minterToMintedAmountBefore = await xvs.minterToMintedAmount(XVS_BRIDGE);

      await expect(
        xvsBridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            ETHEREUM_ENDPOINT_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(xvsBridge, "SendToChain")
        .withArgs(ETHEREUM_ENDPOINT_ID, XVS_HOLDER, receiverAddressBytes32, amount);

      const circulatingSupplyAfter = await xvsBridge.circulatingSupply();
      const totalSupplyAfter = await xvs.totalSupply();
      const minterToMintedAmountAfter = await xvs.minterToMintedAmount(XVS_BRIDGE);

      expect(circulatingSupplyBefore).equals(circulatingSupplyAfter.add(amount));
      expect(totalSupplyBefore).equals(totalSupplyAfter.add(amount));
      expect(minterToMintedAmountBefore).equals(minterToMintedAmountAfter.add(amount));
    });
  });
});
