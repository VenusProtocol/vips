import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip004 from "../../../proposals/ethereum/vip-004";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { ethereum } = NETWORK_ADDRESSES;

const XVS_VAULT_PROXY = "0xA0882C2D5DF29233A092d2887A258C2b90e9b994";
const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";

forking(18890306, () => {
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
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, ethereum.XVS);
        const admin = await initMainnetUser(ethereum.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(ethereum.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault.connect(admin).setRewardAmountPerBlock(ethereum.XVS, "61805555555555555");
        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
        await mine(604800);
      });
      // checkXVSVault(); // TODO: Can be executed once we have XVS on ethereum
    });

    it("Should pause xvs vault", async () => {
      const isPaused = await xvsVault.vaultPaused();
      expect(isPaused).equals(true);
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(ethereum.NORMAL_TIMELOCK);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(ethereum.NORMAL_TIMELOCK);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(ethereum.XVS);
      expect(isActive).equals(true);
    });
  });
});
