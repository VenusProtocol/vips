import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip500, { ERC4626_FACTORY_UNICHAIN } from "../../vips/vip-500/bsctestnet";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";

const { unichainsepolia } = NETWORK_ADDRESSES;
const ACM = "0x854C064EA6b503A97980F481FA3B7279012fdeDd";
const DEPLOYER = "0xA03893a7f835C6A216E63F8C212EEB4310416dDF";
const BLOCK_NUMBER = 20454772;

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_UNICHAIN, ERC4626FACTORY_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM);
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ERC4626FACTORY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(unichainsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });
  });
});
