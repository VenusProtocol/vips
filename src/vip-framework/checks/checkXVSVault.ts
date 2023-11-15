import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import ERC20_ABI from "../abi/erc20.json";
import XVSVault_ABI from "../abi/XVSVault.json";
import { parseUnits } from "ethers/lib/utils";

const ACCOUNT = "0x7f34ca8735F31a1b6e342F3480cF9b20EAA9F2d1";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const XVS_VAULT_PROXY = "0x051100480289e704d20e9DB4804837068f3f9204";

export const checkXVSVault = () => {
  describe("generic XVS Vault checks", () => {
    let xvs : Contract;
    let xvsVault : Contract;

    before(async () => {
      impersonateAccount(ACCOUNT);
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(ACCOUNT);

      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
      xvsVault = await ethers.getContractAt(XVSVault_ABI, XVS_VAULT_PROXY, signer);
    });

    it("deposit and withdraw", async () => {
      let originalBalance = await xvs.balanceOf(ACCOUNT);

      await xvs.approve(xvsVault.address, parseUnits("1", 18));
      await expect(xvsVault.deposit(xvs.address, 0, parseUnits("1", 18))).to.be.not.reverted;
      expect (await xvs.balanceOf(ACCOUNT)).to.be.equal(originalBalance.sub(parseUnits("1", 18)));

      originalBalance = await xvs.balanceOf(ACCOUNT);
      await xvsVault.requestWithdrawal(xvs.address, 0, parseUnits("1", 18));
      await mine(10000)
      await xvsVault.claim(ACCOUNT, xvs.address, 0)
      expect (await xvs.balanceOf(ACCOUNT)).to.be.gt(originalBalance);
    })
  });
};