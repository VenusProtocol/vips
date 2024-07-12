import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip046, { XVS_STORE_TRANSFER_AMOUNT, XVS_VAULT_TREASURY } from "../../../proposals/ethereum/vip-046";
import ERC20_ABI from "./abis/ERC20.json";

const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

forking(20292199, () => {
  let prevXvsVaultTreasuryBalance: BigNumber;
  let prevXvsStoreBalance: BigNumber;

  describe("Post-VIP behavior", async () => {
    let xvsContract: Contract;

    before(async () => {
      xvsContract = await ethers.getContractAt(ERC20_ABI, XVS);

      prevXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      console.log(prevXvsVaultTreasuryBalance.toString());
      prevXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);
      await pretendExecutingVip(vip046());
    });

    it("check balance", async () => {
      const currentXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      const currentXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);

      expect(prevXvsVaultTreasuryBalance.sub(XVS_STORE_TRANSFER_AMOUNT)).to.be.equal(currentXvsVaultTreasuryBalance);
      expect(prevXvsStoreBalance.add(XVS_STORE_TRANSFER_AMOUNT)).to.be.equal(currentXvsStoreBalance);
    });
  });
});
