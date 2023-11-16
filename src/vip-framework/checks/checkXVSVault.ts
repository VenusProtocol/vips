import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import mainnet from "@venusprotocol/venus-protocol/networks/mainnet.json"
import testnet from "@venusprotocol/venus-protocol/networks/testnet.json"

import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import ERC20_ABI from "../abi/erc20.json";
import XVSVault_ABI from "../abi/XVSVault.json";
import { parseUnits } from "ethers/lib/utils";

let NORMAL_TIMELOCK = mainnet.Contracts.Timelock;
let XVS = mainnet.Contracts.XVS;
let XVS_VAULT_PROXY = mainnet.Contracts.XVSVaultProxy;
let ACCOUNT = "0x7f34ca8735F31a1b6e342F3480cF9b20EAA9F2d1";
let POOL_ID = 0

if (process.env.FORKED_NETWORK === "bsctestnet") {
  NORMAL_TIMELOCK = testnet.Contracts.Timelock;
  XVS = testnet.Contracts.XVS;
  XVS_VAULT_PROXY = testnet.Contracts.XVSVaultProxy;
  ACCOUNT = "0x00aa8185BED9891d5197a4c072075F5ACE726B51"
  POOL_ID = 1
}

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
      await expect(xvsVault.deposit(xvs.address, POOL_ID, parseUnits("1", 18))).to.be.not.reverted;
      expect (await xvs.balanceOf(ACCOUNT)).to.be.equal(originalBalance.sub(parseUnits("1", 18)));

      originalBalance = await xvs.balanceOf(ACCOUNT);
      await xvsVault.requestWithdrawal(xvs.address, POOL_ID, parseUnits("1", 18));
      await mine(10000)
      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID)
      expect (await xvs.balanceOf(ACCOUNT)).to.be.gt(originalBalance);
    })
  });
};