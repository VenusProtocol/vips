import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip019, {
  ARBITRUM_ONE_CHAIN_ID,
  ARBITRUM_ONE_TRUSTED_REMOTE,
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
} from "../../../proposals/opbnbmainnet/vip-019";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0x3E2e61F1c075881F3fB8dd568043d8c221fd5c61";
const XVS_BRIDGE = "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2";
const XVS_HOLDER = "0x329557Aa54AAb595e6b651B41b796e541D58911f";

forking(25045089, () => {
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
      await pretendExecutingVip(vip019());
    });

    it("Should match trusted remote address", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(ARBITRUM_ONE_CHAIN_ID);
      expect(trustedRemote).equals(ARBITRUM_ONE_TRUSTED_REMOTE);
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(ARBITRUM_ONE_CHAIN_ID)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(ARBITRUM_ONE_CHAIN_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(ARBITRUM_ONE_CHAIN_ID)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(ARBITRUM_ONE_CHAIN_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should emit an event on successful bridging of XVS (Opbnb Mainnet -> Arbitrum One)", async () => {
      const amount = parseUnits("1", 18);
      const nativeFee = (
        await xvsBridge.estimateSendFee(
          ARBITRUM_ONE_CHAIN_ID,
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
            ARBITRUM_ONE_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(xvsBridge, "SendToChain")
        .withArgs(ARBITRUM_ONE_CHAIN_ID, XVS_HOLDER, receiverAddressBytes32, amount);

      const circulatingSupplyAfter = await xvsBridge.circulatingSupply();
      const totalSupplyAfter = await xvs.totalSupply();
      const minterToMintedAmountAfter = await xvs.minterToMintedAmount(XVS_BRIDGE);

      expect(circulatingSupplyBefore).equals(circulatingSupplyAfter.add(amount));
      expect(totalSupplyBefore).equals(totalSupplyAfter.add(amount));
      expect(minterToMintedAmountBefore).equals(minterToMintedAmountAfter.add(amount));
    });
  });
});
