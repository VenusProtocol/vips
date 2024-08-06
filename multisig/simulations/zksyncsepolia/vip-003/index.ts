import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { checkXVSVault } from "src/vip-framework/checks/checkXVSVault";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip003, { ACM, XVS_STORE } from "../../../proposals/zksyncsepolia/vip-003";
import ACM_ABI from "./abi/acm.json";
import XVS_ABI from "./abi/xvs.json";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const XVS_BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(3572259, async () => {
  let xvsVault: Contract;
  let xvsStore: Contract;
  let xvsMinter: SignerWithAddress;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, zksyncsepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);
    await pretendExecutingVip(await vip003());
  });

  describe("Post tx checks", () => {
    describe("Generic checks", async () => {
      before(async () => {
        const feeData = await ethers.provider.getFeeData();
        const txnParams: { maxFeePerGas?: BigNumber } = {};
        if (feeData.maxFeePerGas) {
          // Sometimes the gas estimation is wrong with zksync
          txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(15).div(10);
        }

        const acm: Contract = await ethers.getContractAt(ACM_ABI, ACM);
        const xvs: Contract = await ethers.getContractAt(XVS_ABI, zksyncsepolia.XVS);
        xvsMinter = await initMainnetUser(XVS_BRIDGE, ethers.utils.parseEther("1"));
        const admin = await initMainnetUser(zksyncsepolia.GUARDIAN, ethers.utils.parseEther("1"));
        const xvsHolder = await initMainnetUser(zksyncsepolia.GENERIC_TEST_USER_ACCOUNT, ethers.utils.parseEther("1"));
        await xvsVault
          .connect(admin)
          .setRewardAmountPerBlockOrSecond(zksyncsepolia.XVS, "61805555555555555", txnParams);

        await xvsVault.connect(admin).resume(txnParams);
        // Giving call permissions to call the functions as xvs bridge vip is not executed now.
        await acm.connect(admin).giveCallPermission(zksyncsepolia.XVS, "mint(address,uint256)", XVS_BRIDGE, txnParams);

        await acm
          .connect(admin)
          .giveCallPermission(zksyncsepolia.XVS, "setMintCap(address,uint256)", admin.address, txnParams);
        await xvs.connect(admin).setMintCap(XVS_BRIDGE, parseUnits("100", 18), txnParams);
        await xvs.connect(xvsMinter).mint(xvsHolder.address, parseEther("10"), txnParams);

        await xvs.connect(xvsHolder).transfer(XVS_STORE, ethers.utils.parseEther("1"), txnParams);
      });
      checkXVSVault();
    });

    it("Should set xvs vault owner to multisig", async () => {
      const owner = await xvsVault.admin();
      expect(owner).equals(zksyncsepolia.GUARDIAN);
    });

    it("Should set xvs store owner to multisig", async () => {
      const owner = await xvsStore.admin();
      expect(owner).equals(zksyncsepolia.GUARDIAN);
    });

    it("Should set correct xvs store address", async () => {
      const xvsStore = await xvsVault.xvsStore();
      expect(xvsStore).equals(XVS_STORE);
    });

    it("Should set correct reward token address", async () => {
      const isActive = await xvsStore.rewardTokens(zksyncsepolia.XVS);
      expect(isActive).equals(true);
    });

    it("Vault should be paused", async () => {
      const paused = await xvsVault.vaultPaused();
      expect(paused).to.be.true;
    });
  });
});
