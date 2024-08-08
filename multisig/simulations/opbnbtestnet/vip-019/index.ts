import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip019 from "../../../proposals/opbnbtestnet/vip-019";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const NORMAL_TIMELOCK = opbnbtestnet.NORMAL_TIMELOCK;

forking(28761242, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(opbnbtestnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
    });

    it("should have no pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip019());
    });

    it("correct pending owner", async () => {
      expect(await xvsVault.pendingAdmin()).to.equal(NORMAL_TIMELOCK);
    });
  });
});