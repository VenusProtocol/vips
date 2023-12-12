import { impersonateAccount, mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../networkAddresses";
import COMPTROLLER_ABI from "../abi/comptroller.json";
import VAI_ABI from "../abi/vai.json";
import VAI_CONTROLLER_ABI from "../abi/vaiController.json";

const VAI_UNITROLLER = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].VAI_UNITROLLER;
const ACCOUNT = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].VAI_MINT_USER_ACCOUNT;
const UNITROLLER = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].UNITROLLER;
const VAI = NETWORK_ADDRESSES[process.env.FORKED_NETWORK].VAI;

export const checkVAIController = () => {
  describe("generic VAI controller checks", () => {
    let vaiController: Contract;
    let comptroller: Contract;
    let vai: Contract;

    before(async () => {
      impersonateAccount(ACCOUNT);
      const signer = await ethers.getSigner(ACCOUNT);

      vaiController = await ethers.getContractAt(VAI_CONTROLLER_ABI, VAI_UNITROLLER, signer);
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER, signer);
      vai = await ethers.getContractAt(VAI_ABI, VAI, signer);
    });

    it("mint and repay", async () => {
      const isVAIMintingEnabled = await comptroller.vaiMintRate();
      if (isVAIMintingEnabled.eq(0)) {
        return;
      }

      const mintableAmount = await vaiController.getMintableVAI(ACCOUNT);
      expect(mintableAmount[1]).to.be.gt(0);

      const balanceBefore = await vai.balanceOf(ACCOUNT);
      await expect(vaiController.mintVAI(parseUnits("1000", "18"))).to.not.reverted;
      const balanceAfter = await vai.balanceOf(ACCOUNT);

      expect(balanceAfter.sub(balanceBefore)).to.be.gt(0);

      const repayAmount = await vaiController.getVAIRepayAmount(ACCOUNT);
      expect(repayAmount).to.be.gt(0);

      const repayAmountWithInterestBefore = await vaiController.getVAICalculateRepayAmount(ACCOUNT, repayAmount);
      await mine(5000);

      await vaiController.accrueVAIInterest();
      const repayAmountWithInterestAfter = await vaiController.getVAICalculateRepayAmount(ACCOUNT, repayAmount);
      expect(repayAmountWithInterestAfter[1].add(repayAmountWithInterestAfter[2])).to.be.gt(
        repayAmountWithInterestBefore[1].add(repayAmountWithInterestAfter[2]),
      );

      await expect(vaiController.repayVAI(parseUnits("500", "18"))).to.not.reverted;
      const balanceAfterRepay = await vai.balanceOf(ACCOUNT);

      expect(balanceAfterRepay).to.be.lt(balanceAfter);
    });
  });
};
