import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip065, {
  SPEED,
  TRANSFER_AMOUNT,
  XVS,
  XVS_STORE,
  XVS_VAULT,
  XVS_VAULT_TREASURY,
} from "../../../proposals/ethereum/vip-065";
import ERC20_ABI from "./abi/ERC20.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

forking(20884830, async () => {
  let prevXvsVaultTreasuryBalance: BigNumber;
  let prevXvsStoreBalance: BigNumber;
  const xvsVault = new ethers.Contract(XVS_VAULT, XVS_VAULT_ABI, ethers.provider);
  const xvsContract = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);

  describe("Post-VIP behavior", async () => {
    before(async () => {
      prevXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      prevXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);
      await pretendExecutingVip(await vip065());
    });

    it("check balance", async () => {
      const currentXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      const currentXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);

      expect(prevXvsVaultTreasuryBalance.sub(TRANSFER_AMOUNT)).to.be.equal(currentXvsVaultTreasuryBalance);
      expect(prevXvsStoreBalance.add(TRANSFER_AMOUNT)).to.be.equal(currentXvsStoreBalance);
    });

    it("check speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlock(XVS)).to.be.equal(SPEED);
    });
  });
});
