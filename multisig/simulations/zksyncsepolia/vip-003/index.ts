import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import vip003 from "../../../proposals/zksyncsepolia/vip-003";
import XVS_STORE_ABI from "./abi/xvsstore.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const XVS_STORE = "0xf0DaEFE5f5df4170426F88757EcdF45430332d88";

forking(3546606, async () => {
  let xvsVault: Contract;
  let xvsStore: Contract;

  before(async () => {
    xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, zksyncsepolia.XVS_VAULT_PROXY);
    xvsStore = await ethers.getContractAt(XVS_STORE_ABI, XVS_STORE);
    await pretendExecutingVip(await vip003());
  });

  describe("Post tx checks", () => {
    // it("Check Vault", async () => {  // We can check this once we have XVS on zksync sepolia chain
    //   // checkXVSVault();
    // });

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
