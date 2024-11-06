import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip007 from "../../../proposals/zksyncsepolia/vip-007/addendum";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(3606270, async () => {
  before(async () => {
    await pretendExecutingVip(await vip007());
  });
  describe("Post-VIP behavior", async () => {
    let xvsVault: Contract;
    it("XVS vault should be resumed", async () => {
      xvsVault = await ethers.getContractAt(XVS_VAULT_ABI, zksyncsepolia.XVS_VAULT_PROXY);
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });
  });
});
