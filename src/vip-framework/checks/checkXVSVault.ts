import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers, forkedNetwork } from "hardhat";

import { NETWORK_ADDRESSES } from "../../networkAddresses";
import { NETWORK_CONFIG } from "../../networkConfig";
import XVSVault_ABI from "../abi/XVSVault.json";
import ERC20_ABI from "../abi/erc20.json";

const NORMAL_TIMELOCK = NETWORK_ADDRESSES[forkedNetwork].NORMAL_TIMELOCK;
const XVS = NETWORK_ADDRESSES[forkedNetwork].XVS;
const XVS_VAULT_PROXY = NETWORK_ADDRESSES[forkedNetwork].XVS_VAULT_PROXY;
const ACCOUNT = NETWORK_ADDRESSES[forkedNetwork].GENERIC_TEST_USER_ACCOUNT;
const POOL_ID = NETWORK_CONFIG[forkedNetwork].XVS_VAULT_POOL_ID;

export const checkXVSVault = () => {
  describe("generic XVS Vault checks", () => {
    let xvs: Contract;
    let xvsVault: Contract;

    before(async () => {
      impersonateAccount(ACCOUNT);
      impersonateAccount(NORMAL_TIMELOCK);
      const signer = await ethers.getSigner(ACCOUNT);

      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
      xvsVault = await ethers.getContractAt(XVSVault_ABI, XVS_VAULT_PROXY, signer);

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: ACCOUNT, value: parseUnits("10") });
    });

    it("deposit and withdraw", async () => {
      let originalBalance = await xvs.balanceOf(ACCOUNT);

      await xvs.approve(xvsVault.address, parseUnits("1", 18));
      await expect(xvsVault.deposit(xvs.address, POOL_ID, parseUnits("1", 18))).to.be.not.reverted;
      expect(await xvs.balanceOf(ACCOUNT)).to.be.lt(originalBalance);

      originalBalance = await xvs.balanceOf(ACCOUNT);
      await xvsVault.requestWithdrawal(xvs.address, POOL_ID, parseUnits("1", 18));
      await mine(10000);
      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID);

      expect(await xvs.balanceOf(ACCOUNT)).to.be.gte(originalBalance);
    });
  });
};
