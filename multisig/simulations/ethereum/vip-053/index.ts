import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip053, {XVS_STORE} from "../../../proposals/ethereum/vip-053";
import XVS_VAULT_ABI from "./abi/XVSVault.json";
import XVS_STORE_ABI from "./abi/XVSStore.json";

const { ethereum } = NETWORK_ADDRESSES;

const NORMAL_TIMELOCK = ethereum.NORMAL_TIMELOCK;

forking(20482219, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvsStore: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(ethereum.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvsStore = new ethers.Contract(XVS_STORE, XVS_STORE_ABI, provider);
    });

    it("should have no pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });

    it("should have no pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip053());
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });

    it("correct pending owner", async () => {
      expect(await xvsStore.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
