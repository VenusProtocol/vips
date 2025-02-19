import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip002, { ACM, XVS_STORE } from "../../../proposals/unichainsepolia/vip-002";
import ACM_ABI from "./abi/acm.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { unichainsepolia } = NETWORK_ADDRESSES;
const XVS_BRIDGE = "0xCAF833318a6663bb23aa7f218e597c2F7970b4D2";

forking(4541503, async () => {
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvsMinter: SignerWithAddress;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, unichainsepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);
    await pretendExecutingVip(await vip002());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        const acm: Contract = await ethers.getContractAt(ACM_ABI, ACM);
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, unichainsepolia.XVS);
        xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const admin = await initMainnetUser(unichainsepolia.GUARDIAN, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(
          unichainsepolia.GENERIC_TEST_USER_ACCOUNT,
          ethers.utils.parseEther("1"),
        );
        await xvsVault.connect(admin).setRewardAmountPerBlockOrSecond(unichainsepolia.XVS, "61805555555555555");

        await xvsVault.connect(admin).resume();
        // Giving call permissions to call the functions as xvs bridge vip is not executed now.
        await acm.connect(admin).giveCallPermission(unichainsepolia.XVS, "mint(address,uint256)", XVS_BRIDGE);

        await acm.connect(admin).giveCallPermission(unichainsepolia.XVS, "setMintCap(address,uint256)", admin.address);
        await xvs.connect(admin).setMintCap(XVS_BRIDGE, parseUnits("100", 18));
        await xvs.connect(xvsMinter).mint(xvsHolder.address, parseEther("10"));

        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(unichainsepolia.GUARDIAN);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(unichainsepolia.GUARDIAN);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(unichainsepolia.XVS);
      expect(isActive).equals(true);
    });

    it("Vault should be paused", async () => {
      const paused = await xvsVault.vaultPaused();
      expect(paused).to.be.true;
    });
  });
});
