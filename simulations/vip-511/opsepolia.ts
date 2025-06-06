import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip511, {
  ACM_OPTIMISM,
  ERC4626_FACTORY_OPTIMISM,
  PROXY_ADMIN_OPTIMISM,
  PSR_OPTIMISM,
  PSR_OPTIMISM_NEW_IMPLEMENTATION,
} from "../../vips/vip-511/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";

const { opsepolia } = NETWORK_ADDRESSES;
const DEPLOYER = "0x476c66CA1fE0E8AbB45c8566D635DcA9dC930F73";
const BLOCK_NUMBER = 28710871;
const PSR_OPTIMISM_OLD_IMPLEMENTATION = "0x28A2Acd72be0CFdfeEEEa8E6c2556774b0B4f13c";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_OPTIMISM, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_OPTIMISM, PROXY_ADMIN_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(opsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_OPTIMISM);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_OPTIMISM)).to.be.equals(
        PSR_OPTIMISM_OLD_IMPLEMENTATION,
      );
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip511(), {
    callbackAfterExecution: async txResponse => {
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
      expect(await erc4626Factory.owner()).to.be.equals(opsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_OPTIMISM);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_OPTIMISM)).to.be.equals(
        PSR_OPTIMISM_NEW_IMPLEMENTATION,
      );
    });
  });
});
