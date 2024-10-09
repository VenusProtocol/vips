import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip003, { ACM, XVS_STORE } from "../../../proposals/opsepolia/vip-003";
import ACM_ABI from "./abi/acm.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { opsepolia } = NETWORK_ADDRESSES;

const XVS_BRIDGE = "0x79a36dc9a43D05Db4747c59c02F48ed500e47dF1";

forking(17217995, async () => {
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvsMinter: SignerWithAddress;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, opsepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);

    await pretendExecutingVip(await vip003());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        const acm: Contract = await ethers.getContractAt(ACM_ABI, ACM);
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, opsepolia.XVS);
        xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const admin = await initMainnetUser(opsepolia.GUARDIAN, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(opsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault.connect(admin).setRewardAmountPerBlockOrSecond(opsepolia.XVS, "61805555555555555");
        await xvsVault.connect(admin).resume();
        // Giving call permissions to call the functions as xvs bridge vip is not executed now.
        await acm.connect(admin).giveCallPermission(opsepolia.XVS, "mint(address,uint256)", XVS_BRIDGE);
        await acm.connect(admin).giveCallPermission(opsepolia.XVS, "setMintCap(address,uint256)", admin.address);
        await xvs.connect(admin).setMintCap(XVS_BRIDGE, parseUnits("100", 18));
        await xvs.connect(xvsMinter).mint(xvsHolder.address, parseEther("10"));

        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
        await mine(604800);
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(opsepolia.GUARDIAN);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(opsepolia.GUARDIAN);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(opsepolia.XVS);
      expect(isActive).equals(true);
    });
  });
});