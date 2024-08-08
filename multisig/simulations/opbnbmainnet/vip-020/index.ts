import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020 from "../../../proposals/opbnbmainnet/vip-020";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const NORMAL_TIMELOCK = opbnbmainnet.NORMAL_TIMELOCK;

forking(28761242, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(opbnbmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    });

    it("should have no pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip020());
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});