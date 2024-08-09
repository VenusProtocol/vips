import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip052, {
  MAX_DAILY_RECEIVE_LIMIT,
  MAX_DAILY_SEND_LIMIT,
  SINGLE_RECEIVE_LIMIT,
  SINGLE_SEND_LIMIT,
  ZKSYNC_SEPOLIA_TRUSTED_REMOTE,
} from "../../../proposals/sepolia/vip-052";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0x66ebd019E86e0af5f228a0439EBB33f045CBe63E";
const XVS_BRIDGE = "0xc340b7d3406502F43dC11a988E4EC5bbE536E642";
const XVS_HOLDER = "0xFd7dA20ea0bE63ACb0852f97E950376E7E4a817D";

forking(6460328, async () => {
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
      await pretendExecutingVip(await vip052());
    });

    it("Should match trusted remote address", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(LzChainId.zksyncsepolia);
      expect(trustedRemote).equals(ZKSYNC_SEPOLIA_TRUSTED_REMOTE);
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(LzChainId.zksyncsepolia)).to.equal(SINGLE_SEND_LIMIT);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(LzChainId.zksyncsepolia)).to.equal(
        SINGLE_RECEIVE_LIMIT,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(LzChainId.zksyncsepolia)).to.equal(MAX_DAILY_SEND_LIMIT);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(LzChainId.zksyncsepolia)).to.equal(MAX_DAILY_RECEIVE_LIMIT);
    });

    it("Should emit an event on successful bridging of XVS (sepolia -> Zksync Sepolia)", async () => {
      const amount = parseUnits("1", 18);
      const nativeFee = (
        await xvsBridge.estimateSendFee(
          LzChainId.zksyncsepolia,
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
            LzChainId.zksyncsepolia,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(xvsBridge, "SendToChain")
        .withArgs(LzChainId.zksyncsepolia, XVS_HOLDER, receiverAddressBytes32, amount);

      const circulatingSupplyAfter = await xvsBridge.circulatingSupply();
      const totalSupplyAfter = await xvs.totalSupply();
      const minterToMintedAmountAfter = await xvs.minterToMintedAmount(XVS_BRIDGE);

      expect(circulatingSupplyBefore).equals(circulatingSupplyAfter.add(amount));
      expect(totalSupplyBefore).equals(totalSupplyAfter.add(amount));
      expect(minterToMintedAmountBefore).equals(minterToMintedAmountAfter.add(amount));
    });
  });
});
