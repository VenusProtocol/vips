import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip508, { ERC4626_FACTORY_BASE } from "../../vips/vip-508/bsctestnet";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";

const { basesepolia } = NETWORK_ADDRESSES;
const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
const DEPLOYER = "0x4E8F79B53EB31E48F5096D6ac7503fDa734D5883";
const BLOCK_NUMBER = 26244723;

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_BASE, ERC4626FACTORY_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(basesepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM);
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip508(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ERC4626FACTORY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(basesepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });
  });
});
