import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip260Testnet } from "../../vips/vip-260/bsctestnet";
import ACM_ABI from "./abi/AccessControlManager.json";
import TOKEN_BRIDGE_CONTROLLER_ABI from "./abi/TokenBridgeController.json";
import VAI_ABI from "./abi/VAI.json";
import VAIBridgeAdmin_ABI from "./abi/VAIBridgeAdmin.json";
import VAI_BRIDGE_ABI from "./abi/VAITokenBridge.json";

const TOKEN_BRIDGE_VAI = "0x2280aCD3BE2eE270161a11A6176814C26FD747f9";
const TOKEN_BRIDGE_ADMIN_VAI = "0xfF058122378BD9AC5B572A2F7c1815E09504D859";
const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
const DEST_CHAIN_ID = "10161";
const TOKEN_BRIDGE_CONTROLLER_VAI = "0x91b653f7527D698320133Eb97BB55a617663e792";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const TRUSTED_REMOTE = "0xfa62bc6c0e20a507e3ad0df4f6b89e71953161fa";

forking(37964786, () => {
    const provider = ethers.provider;
    let vaiBridge: ethers.Contract;
    let bridgeAdmin: ethers.Contract;
    let vai: ethers.Contract;
    let tokenController: ethers.Contract;
    let receiver: SignerWithAddress;
    let receiverAddressBytes32: string;
    let defaultAdapterParams: string;

    beforeEach(async () => {
        vaiBridge = new ethers.Contract(TOKEN_BRIDGE_VAI, VAI_BRIDGE_ABI, provider);
        bridgeAdmin = new ethers.Contract(TOKEN_BRIDGE_ADMIN_VAI, VAIBridgeAdmin_ABI, provider);
        vai = new ethers.Contract(VAI, VAI_ABI, provider);
        tokenController = new ethers.Contract(TOKEN_BRIDGE_CONTROLLER_VAI, TOKEN_BRIDGE_CONTROLLER_ABI, provider);
        [receiver] = await ethers.getSigners();
        receiverAddressBytes32 = ethers.utils.defaultAbiCoder.encode(["address"], [receiver.address]);
        defaultAdapterParams = ethers.utils.solidityPack(["uint16", "uint256"], [1, 300000]);
    });

    testVip("vip260Testnet", vip260Testnet(), {
        callbackAfterExecution: async (txResponse: TransactionResponse) => {
            await expectEvents(
                txResponse,
                [ACM_ABI, VAIBridgeAdmin_ABI, VAI_BRIDGE_ABI],
                ["RoleGranted", "OwnershipTransferred", "SetTrustedRemoteAddress", "Failure"],
                [62, 2, 1, 0],
            );
        },
    });

    describe("Post-VIP behavior", () => {
        it("Should set trusted remote address in vaiBridge", async () => {
            const trustedRemote = await vaiBridge.getTrustedRemoteAddress(10161);
            expect(trustedRemote).equals(TRUSTED_REMOTE);
        });

        it("Should set minting limit in Token Controller", async () => {
            const cap = await tokenController.minterToCap(TOKEN_BRIDGE_VAI);
            expect(cap).equals(parseUnits("100000", 18));
        });

        it("Should set correct token address in vaiBridge", async () => {
            const token = await vaiBridge.token();
            expect(token).equals(VAI);
        });
        it("Owner of the BridgeAdmin should be Normal Timelock", async () => {
            expect(await bridgeAdmin.owner()).to.equal(NORMAL_TIMELOCK);
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
    });
});
