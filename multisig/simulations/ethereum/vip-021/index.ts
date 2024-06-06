import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip021, {
  BNB_ENDPOINT_ID,
  ETHEREUM_MULTISIG,
  MAX_DAILY_RECEIVE_LIMIT_BNB,
  MAX_DAILY_RECEIVE_LIMIT_OP_BNB,
  MAX_DAILY_SEND_LIMIT_OP_BNB,
  OP_BNB_ENDPOINT_ID,
  OP_BNB_TRUSTED_REMOTE,
  SINGLE_RECEIVE_LIMIT_BNB,
  SINGLE_RECEIVE_LIMIT_OP_BNB,
  SINGLE_SEND_LIMIT_OP_BNB,
} from "../../../proposals/ethereum/vip-021";
import XVS_ABI from "./abi/xvs.json";
import XVS_BRIDGE_ABI from "./abi/xvsProxyOFTDest.json";

const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const XVS_BRIDGE = "0x888E317606b4c590BBAD88653863e8B345702633";
const XVS_HOLDER = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const ETHEREUM_TREASURY = "0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA";

forking(19574618, async () => {
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
      await pretendExecutingVip(await vip021());
    });

    it("Should match trusted remote address", async () => {
      const trustedRemote = await xvsBridge.getTrustedRemoteAddress(OP_BNB_ENDPOINT_ID);
      expect(trustedRemote).equals(OP_BNB_TRUSTED_REMOTE);
    });

    it("Should match single send transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleTransactionLimit(OP_BNB_ENDPOINT_ID)).to.equal(SINGLE_SEND_LIMIT_OP_BNB);
    });

    it("Should match single receive transaction limit", async () => {
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(OP_BNB_ENDPOINT_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT_OP_BNB,
      );
      expect(await xvsBridge.chainIdToMaxSingleReceiveTransactionLimit(BNB_ENDPOINT_ID)).to.equal(
        SINGLE_RECEIVE_LIMIT_BNB,
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyLimit(OP_BNB_ENDPOINT_ID)).to.equal(MAX_DAILY_SEND_LIMIT_OP_BNB);
    });

    it("Should match max daily receive limit", async () => {
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(OP_BNB_ENDPOINT_ID)).to.equal(
        MAX_DAILY_RECEIVE_LIMIT_OP_BNB,
      );
      expect(await xvsBridge.chainIdToMaxDailyReceiveLimit(BNB_ENDPOINT_ID)).to.equal(MAX_DAILY_RECEIVE_LIMIT_BNB);
    });

    it("Should whitelist MULTISIG and TREASURY", async () => {
      let res = await xvsBridge.whitelist(ETHEREUM_MULTISIG);
      expect(res).equals(true);
      res = await xvsBridge.whitelist(ETHEREUM_TREASURY);
      expect(res).equals(true);
    });

    it("Should emit an event on successful bridging of XVS (Ethereum -> opBNB)", async () => {
      const amount = parseUnits("1", 18);
      const nativeFee = (
        await xvsBridge.estimateSendFee(OP_BNB_ENDPOINT_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      const circulatingSupplyBefore = await xvsBridge.circulatingSupply();
      const totalSupplyBefore = await xvs.totalSupply();
      const minterToMintedAmountBefore = await xvs.minterToMintedAmount(XVS_BRIDGE);

      await expect(
        xvsBridge
          .connect(xvsHolderSigner)
          .sendFrom(
            xvsHolderSigner.address,
            OP_BNB_ENDPOINT_ID,
            receiverAddressBytes32,
            amount,
            [xvsHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(xvsBridge, "SendToChain")
        .withArgs(OP_BNB_ENDPOINT_ID, XVS_HOLDER, receiverAddressBytes32, amount);

      const circulatingSupplyAfter = await xvsBridge.circulatingSupply();
      const totalSupplyAfter = await xvs.totalSupply();
      const minterToMintedAmountAfter = await xvs.minterToMintedAmount(XVS_BRIDGE);

      expect(circulatingSupplyBefore).equals(circulatingSupplyAfter.add(amount));
      expect(totalSupplyBefore).equals(totalSupplyAfter.add(amount));
      expect(minterToMintedAmountBefore).equals(minterToMintedAmountAfter.add(amount));
    });
  });
});
