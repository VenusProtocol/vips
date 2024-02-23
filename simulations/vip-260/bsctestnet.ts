import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents, initMainnetUser } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip260Testnet } from "../../vips/vip-260/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import TOKEN_BRIDGE_CONTROLLER_ABI from "./abi/TokenBridgeController.json";
import VAI_ABI from "./abi/VAI.json";
import VAIBridgeAdmin_ABI from "./abi/VAIBridgeAdmin.json";
import VAI_BRIDGE_ABI from "./abi/VAITokenBridge.json";

const DEST_CHAIN_ID = "10161";
const TOKEN_BRIDGE_CONTROLLER_VAI = "0x91b653f7527D698320133Eb97BB55a617663e792";
const TRUSTED_REMOTE = "0xfa62bc6c0e20a507e3ad0df4f6b89e71953161fa";
const VAI_HOLDER = "0x7Db4f5cC3bBA3e12FF1F528D2e3417afb0a57118";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(37969204, () => {
  const provider = ethers.provider;
  let vaiBridge: ethers.Contract;
  let bridgeAdmin: ethers.Contract;
  let vai: ethers.Contract;
  let tokenController: ethers.Contract;
  let receiver: SignerWithAddress;
  let vaiHolderSigner: SignerWithAddress;
  let receiverAddressBytes32: string;
  let defaultAdapterParams: string;

  beforeEach(async () => {
    vaiBridge = new ethers.Contract(bsctestnet.TOKEN_BRIDGE_VAI, VAI_BRIDGE_ABI, provider);
    bridgeAdmin = new ethers.Contract(bsctestnet.TOKEN_BRIDGE_ADMIN_VAI, VAIBridgeAdmin_ABI, provider);
    vai = new ethers.Contract(bsctestnet.VAI, VAI_ABI, provider);
    tokenController = new ethers.Contract(TOKEN_BRIDGE_CONTROLLER_VAI, TOKEN_BRIDGE_CONTROLLER_ABI, provider);
    [receiver] = await ethers.getSigners();
    vaiHolderSigner = await initMainnetUser(VAI_HOLDER, ethers.utils.parseEther("2"));
    receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
    defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
  });

  testVip("vip260Testnet", vip260Testnet(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [ACM_ABI, VAIBridgeAdmin_ABI, VAI_BRIDGE_ABI],
        ["RoleGranted", "OwnershipTransferred", "SetTrustedRemoteAddress", "Failure"],
        [63, 2, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Should set trusted remote address in vaiBridge", async () => {
      const trustedRemote = await vaiBridge.getTrustedRemoteAddress(10161);
      expect(trustedRemote).equals(TRUSTED_REMOTE);
    });

    it("Should set minting limit in Token Controller", async () => {
      const cap = await tokenController.minterToCap(bsctestnet.TOKEN_BRIDGE_VAI);
      expect(cap).equals(parseUnits("100000", 18));
    });

    it("Should set correct token address in vaiBridge", async () => {
      const token = await vaiBridge.token();
      expect(token).equals(bsctestnet.VAI);
    });
    it("Owner of the BridgeAdmin should be Normal Timelock", async () => {
      expect(await bridgeAdmin.owner()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("Should match minDestGas value", async () => {
      expect(await vaiBridge.minDstGasLookup(DEST_CHAIN_ID, 0)).to.equal("300000");
    });

    it("Should match single send transaction limit", async () => {
      expect(await vaiBridge.chainIdToMaxSingleTransactionLimit(DEST_CHAIN_ID)).to.equal("10000000000000000000000");
    });

    it("Should match single receive transaction limit", async () => {
      expect(await vaiBridge.chainIdToMaxSingleReceiveTransactionLimit(DEST_CHAIN_ID)).to.equal(
        "10000000000000000000000",
      );
    });

    it("Should match max daily send limit", async () => {
      expect(await vaiBridge.chainIdToMaxDailyLimit(DEST_CHAIN_ID)).to.equal("50000000000000000000000");
    });

    it("Should match max daily receive limit", async () => {
      expect(await vaiBridge.chainIdToMaxDailyReceiveLimit(DEST_CHAIN_ID)).to.equal("50000000000000000000000");
    });

    it("Should emit an event on successfull bridging of bsctestnet.VAI", async () => {
      const amount = parseUnits("0.5", 18);
      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      await vai.connect(vaiHolderSigner).approve(vaiBridge.address, amount);

      expect(
        await vaiBridge
          .connect(vaiHolderSigner)
          .sendFrom(
            vaiHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [vaiHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      )
        .to.be.emit(vaiBridge, "SendToChain")
        .withArgs(DEST_CHAIN_ID, VAI_HOLDER, receiverAddressBytes32, amount);
    });

    it("Reverts if single transaction limit exceed", async function () {
      const amount = ethers.utils.parseUnits("10001", 18);
      await vai.connect(vaiHolderSigner).approve(vaiBridge.address, amount);

      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;
      await expect(
        vaiBridge
          .connect(vaiHolderSigner)
          .sendFrom(
            vaiHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [vaiHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Single Transaction Limit Exceed");
    });

    it("Reverts if max daily transaction limit exceed", async function () {
      const maxPlusAmount = ethers.utils.parseUnits("50001");
      const amount = ethers.utils.parseUnits("10000");

      await vai.connect(vaiHolderSigner).approve(vaiBridge.address, maxPlusAmount);
      const nativeFee = (
        await vaiBridge.estimateSendFee(DEST_CHAIN_ID, receiverAddressBytes32, amount, false, defaultAdapterParams)
      ).nativeFee;

      for (let i = 0; i < 4; i++) {
        await vaiBridge
          .connect(vaiHolderSigner)
          .sendFrom(
            vaiHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [vaiHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          );
      }
      await expect(
        vaiBridge
          .connect(vaiHolderSigner)
          .sendFrom(
            vaiHolderSigner.address,
            DEST_CHAIN_ID,
            receiverAddressBytes32,
            amount,
            [vaiHolderSigner.address, ethers.constants.AddressZero, defaultAdapterParams],
            { value: nativeFee },
          ),
      ).to.be.revertedWith("Daily Transaction Limit Exceed");
    });
  });
});
