import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip505, { ERC4626_FACTORY_OPTIMISIM } from "../../vips/vip-505/bsctestnet";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";

const { opsepolia } = NETWORK_ADDRESSES;
const ACM = "0x1652E12C8ABE2f0D84466F0fc1fA4286491B3BC1";
const DEPLOYER = "0x476c66CA1fE0E8AbB45c8566D635DcA9dC930F73";
const BLOCK_NUMBER = 27753816;

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_OPTIMISIM, ERC4626FACTORY_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(opsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM);
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip505(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ERC4626FACTORY_ABI], ["OwnershipTransferred"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(opsepolia.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });
  });
});
