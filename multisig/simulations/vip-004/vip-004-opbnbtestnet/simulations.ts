import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip004 } from "../../../proposals/vip-004/vip-004-opbnbtestnet";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
const XVS_STORE = "0x06473fB3f7bF11e2E8EfEcC95aC55ABEFCb2e0A0";
const XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const NORMAL_TIMELOCK = "0xb15f6EfEbC276A3b9805df81b5FB3D50C2A62BDf";

forking(16716512, () => {
  let xvsVault: Contract;
  let xvsStore: Contract;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);
    await pretendExecutingVip(vip004());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, XVS);
        const admin = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(opbnbtestnet.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault.connect(admin).setRewardAmountPerBlock(XVS, "61805555555555555");
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
        await mine(604800);
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(NORMAL_TIMELOCK);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(XVS);
      expect(isActive).equals(true);
    });
  });
});
