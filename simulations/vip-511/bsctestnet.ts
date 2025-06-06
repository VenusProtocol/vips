import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip511, {
  ACM_BNB,
  ERC4626_FACTORY_BNB,
  PROXY_ADMIN_BNB,
  PSR_BNB,
  PSR_BNB_NEW_IMPLEMENTATION,
} from "../../vips/vip-511/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const DEPLOYER = "0x33C6476F88eeA28D7E7900F759B4597704Ef95B7";
const BLOCK_NUMBER = 53864628;
const PSR_BNB_OLD_IMPLEMENTATION = "0x91B67df8B13a1B53a3828EAAD3f4233B55FEc26d";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_BNB, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_BNB, PROXY_ADMIN_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(bsctestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_BNB);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_BNB)).to.be.equals(PSR_BNB_OLD_IMPLEMENTATION);
    });
  });

  testVip("VIP-511", await vip511(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [7, 0],
      );

      await expectEvents(
        txResponse,
        [ERC4626FACTORY_ABI, ACM_ABI],
        ["OwnershipTransferred", "PermissionGranted", "RewardRecipientUpdated"],
        [1, 8, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(bsctestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_BNB);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_BNB)).to.be.equals(PSR_BNB_NEW_IMPLEMENTATION);
    });
  });
});
