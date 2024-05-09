import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, ethers } from "hardhat";

import { NETWORK_CONFIG } from "../../networkConfig";
import { getForkedNetworkAddress } from "../../utils";
import XVSVault_ABI from "../abi/XVSVault.json";
import ERC20_ABI from "../abi/erc20.json";

const FORKED_NETWORK_CONFIG = FORKED_NETWORK && NETWORK_CONFIG[FORKED_NETWORK];

const NORMAL_TIMELOCK = getForkedNetworkAddress("NORMAL_TIMELOCK");
const XVS = getForkedNetworkAddress("XVS");
const XVS_VAULT_PROXY = getForkedNetworkAddress("XVS_VAULT_PROXY");
const ACCOUNT = getForkedNetworkAddress("GENERIC_TEST_USER_ACCOUNT");
const POOL_ID = FORKED_NETWORK_CONFIG?.XVS_VAULT_POOL_ID;

export const checkXVSVault = () => {
  describe("generic XVS Vault checks", () => {
    let xvs: Contract;
    let xvsVault: Contract;

    before(async () => {
      console.log(1);
      await impersonateAccount(ACCOUNT);
      console.log(ACCOUNT);
      console.log(2);
      await impersonateAccount(NORMAL_TIMELOCK);
      console.log(NORMAL_TIMELOCK);
      console.log(3);
      const signer = await ethers.getSigner(ACCOUNT);
      console.log(4);

      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
      xvsVault = await ethers.getContractAt(XVSVault_ABI, XVS_VAULT_PROXY, signer);
      console.log(5);

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({ to: ACCOUNT, value: parseUnits("10") });
    });

    it("deposit and withdraw", async () => {
      console.log(6);
      console.log(ACCOUNT)
      console.log(xvs.address)
      console.log(POOL_ID)

      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID);
      console.log(7);

      let originalBalance = await xvs.balanceOf(ACCOUNT);
      console.log(8);

      await xvs.approve(xvsVault.address, parseUnits("1", 18));
      await expect(xvsVault.deposit(xvs.address, POOL_ID, parseUnits("1", 18))).to.be.not.reverted;
      expect(await xvs.balanceOf(ACCOUNT)).to.be.lt(originalBalance);
      console.log(9);
      originalBalance = await xvs.balanceOf(ACCOUNT);
      await xvsVault.requestWithdrawal(xvs.address, POOL_ID, parseUnits("1", 18));
      await mine(10000);
      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID);

      expect(await xvs.balanceOf(ACCOUNT)).to.be.gte(originalBalance);
    });
  });
};
