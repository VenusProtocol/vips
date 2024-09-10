import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip011, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  ZKSYNC_TRUSTED_REMOTE,
} from "../../../proposals/arbitrumone/vip-011";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0xc1Eb7689147C81aC840d4FF0D298489fc7986d52";
const XVS_BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";
const USER = "0xFd7dA20ea0bE63ACb0852f97E950376E7E4a817D";

forking(247232680, async () => {
  let xvs: Contract;
  let xvsBridge: Contract;
  let xvsHolderSigner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;
  let bridgeSigner: SignerWithAddress;

  before(async () => {
    xvs = await ethers.getContractAt(XVS_ABI, XVS);
    xvsBridge = await ethers.getContractAt(XVS_BRIDGE_ABI, XVS_BRIDGE);
    xvsHolderSigner = await initMainnetUser(USER, ethers.utils.parseEther("5"));
    bridgeSigner = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("2"));
    [receiver] = await ethers.getSigners();
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
  });

  describe("Post-Execution state", () => {
    before(async () => {
      await pretendExecutingVip(await vip011());
    });

    it("Should match trusted remote address", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.zksyncmainnet);
      expect(trustedRemote).equals(ZKSYNC_TRUSTED_REMOTE);
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncmainnet)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncmainnet)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncmainnet)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should emit an event on successful bridging of XVS (Arbitrum one -> Zksync mainnet)", async () => {
      const amount = parseUnits("1", 18);
      await xvs.connect(bridgeSigner).mint(USER, amount);
      const nativeFee = (
        await xvsBridge.estimateSendFee(
          LzChainId.zksyncmainnet,
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
            LzChainId.zksyncmainnet,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(xvsBridge, "SendToChain")
        .withArgs(LzChainId.zksyncmainnet, USER, receiverAddressBytes32, amount);

      const circulatingSupplyAfter = await xvsBridge.circulatingSupply();
      const totalSupplyAfter = await xvs.totalSupply();
      const minterToMintedAmountAfter = await xvs.minterToMintedAmount(XVS_BRIDGE);

      expect(circulatingSupplyBefore).equals(circulatingSupplyAfter.add(amount));
      expect(totalSupplyBefore).equals(totalSupplyAfter.add(amount));
      expect(minterToMintedAmountBefore).equals(minterToMintedAmountAfter.add(amount));
    });
  });
});
