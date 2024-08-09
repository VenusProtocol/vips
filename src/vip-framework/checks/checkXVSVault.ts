import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { FORKED_NETWORK, ethers, network } from "hardhat";

import { NETWORK_CONFIG } from "../../networkConfig";
import { getForkedNetworkAddress, initMainnetUser, mineBlocks } from "../../utils";
import XVSVault_ABI from "../abi/XVSVault.json";
import ERC20_ABI from "../abi/erc20.json";

const FORKED_NETWORK_CONFIG = FORKED_NETWORK && NETWORK_CONFIG[FORKED_NETWORK];

const XVS = getForkedNetworkAddress("XVS");
const XVS_VAULT_PROXY = getForkedNetworkAddress("XVS_VAULT_PROXY");
const ACCOUNT = getForkedNetworkAddress("GENERIC_TEST_USER_ACCOUNT");
const POOL_ID = FORKED_NETWORK_CONFIG?.XVS_VAULT_POOL_ID;
const DEPOSIT_AMOUNT = parseUnits("1");

export const checkXVSVault = () => {
  describe("generic XVS Vault checks", () => {
    let xvs: Contract;
    let xvsVault: Contract;

    before(async () => {
      const signer = await initMainnetUser(ACCOUNT, parseUnits("10"));

      xvs = await ethers.getContractAt(ERC20_ABI, XVS, signer);
      xvsVault = await ethers.getContractAt(XVSVault_ABI, XVS_VAULT_PROXY, signer);
    });

    it("deposit and withdraw", async () => {
      const feeData = await ethers.provider.getFeeData();
      const txnParams: { maxFeePerGas?: BigNumber } = {};

      if (network.zksync && feeData.maxFeePerGas) {
        // Sometimes the gas estimation is wrong with zksync
        txnParams.maxFeePerGas = feeData.maxFeePerGas.mul(15).div(10);
      }
      // Claim already existing rewards and make it 0 for easier testing
      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID, txnParams);

      let originalBalance = await xvs.balanceOf(ACCOUNT);

      // deposit XVS
      await xvs.approve(xvsVault.address, parseUnits("1", 18), txnParams);
      await expect(xvsVault.deposit(xvs.address, POOL_ID, DEPOSIT_AMOUNT, txnParams)).to.be.not.reverted;
      expect(await xvs.balanceOf(ACCOUNT)).to.be.lt(originalBalance);

      // Test claim
      originalBalance = await xvs.balanceOf(ACCOUNT);
      await mineBlocks(5);
      await xvsVault.claim(ACCOUNT, xvs.address, POOL_ID, txnParams);
      expect(await xvs.balanceOf(ACCOUNT)).to.be.gte(originalBalance);

      // Test withdrawal
      await xvsVault.requestWithdrawal(xvs.address, POOL_ID, parseUnits("1", 18), txnParams);
      await expect(xvsVault.executeWithdrawal(xvs.address, POOL_ID, txnParams)).to.be.reverted;

      // Can only withdraw after the lock period passes
      const blockTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
      const targetTimestamp = blockTimestamp + 604800;
      await ethers.provider.send("evm_setNextBlockTimestamp", [targetTimestamp]);
      await mineBlocks();

      originalBalance = await xvs.balanceOf(ACCOUNT);
      await expect(xvsVault.executeWithdrawal(xvs.address, POOL_ID, txnParams)).to.not.be.reverted;

      const updatedBalancePostWithdraw = await xvs.balanceOf(ACCOUNT);
      expect(updatedBalancePostWithdraw.sub(originalBalance)).equals(DEPOSIT_AMOUNT);
    });
  });
};
