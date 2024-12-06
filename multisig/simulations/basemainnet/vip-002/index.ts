import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip002, { XVS_STORE } from "../../../proposals/basemainnet/vip-002";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { basemainnet } = NETWORK_ADDRESSES;

const XVS_BRIDGE = "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd";

forking(23341826, async () => {
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvsMinter: SignerWithAddress;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, basemainnet.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);

    await pretendExecutingVip(await vip002());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, basemainnet.XVS);
        xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const admin = await initMainnetUser(basemainnet.GUARDIAN, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(basemainnet.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault.connect(admin).setRewardAmountPerBlockOrSecond(basemainnet.XVS, "61805555555555555");
        await xvsVault.connect(admin).resume();
        await xvs.connect(xvsMinter).mint(xvsHolder.address, parseEther("10"));

        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"));
        await mine(604800);
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(basemainnet.GUARDIAN);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(basemainnet.GUARDIAN);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(basemainnet.XVS);
      expect(isActive).equals(true);
    });
  });
});
