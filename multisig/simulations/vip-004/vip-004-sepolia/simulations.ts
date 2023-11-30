import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip004 } from "../../../proposals/vip-004/vip-004-sepolia";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(4795108, () => {
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvs: Contract;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, sepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, sepolia.XVS_STORE);
    xvs = await ethers.getContractAt(XVS_ABI, sepolia.XVS);
    await pretendExecutingVip(vip004());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        xvs = await ethers.getContractAt(XVS_ABI, sepolia.XVS);
        const admin = await initMainnetUser(sepolia.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(sepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault.connect(admin).setRewardAmountPerBlock(sepolia.XVS, "61805555555555555");
        await xvs.connect(xvsHolder).transfer(sepolia.XVS_STORE, ethers.utils.parseEther("1"));
        await mine(604800);
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(sepolia.NORMAL_TIMELOCK);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(sepolia.NORMAL_TIMELOCK);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(sepolia.XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(sepolia.XVS);
      expect(isActive).equals(true);
    });
  });
});
