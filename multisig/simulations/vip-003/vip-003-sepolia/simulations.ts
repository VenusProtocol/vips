import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip003 } from "../../../proposals/vip-003/vip-003-sepolia";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(4750277, () => {
  let xvsVault: Contract;
  let xvsStore: Contract;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, sepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, sepolia.XVS_STORE);
    await pretendExecutingVip(vip003());
  });

  describe("Post tx checks", () => {
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
