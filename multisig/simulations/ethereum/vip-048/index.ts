import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip048, { XVS_STORE_TRANSFER_AMOUNT, XVS_VAULT_TREASURY } from "../../../proposals/ethereum/vip-048";
import ERC20_ABI from "./abi/ERC20.json";

const XVS_STORE = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const XVS = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";

forking(20292199, async () => {
  let prevXvsVaultTreasuryBalance: BigNumber;
  let prevXvsStoreBalance: BigNumber;
  const xvsContract = new ethers.Contract(XVS, ERC20_ABI, ethers.provider);

  // VIP-339 bridges 45,000 XVS to Ethereum but we have no means to simulate it here just yet,
  // so for the simulation purposes we just pretend 45,000 XVS comes out of thin air
  const pretendXVSHasBeenBridged = async () => {
    const xvsHolder = await initMainnetUser("0xA0882C2D5DF29233A092d2887A258C2b90e9b994", parseEther("1"));
    const xvsFundingAmount = parseUnits("45000", 18);
    await xvsContract.connect(xvsHolder).transfer(XVS_VAULT_TREASURY, xvsFundingAmount);
  };

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendXVSHasBeenBridged();
      prevXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      prevXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);
      await pretendExecutingVip(vip048());
    });

    it("check balance", async () => {
      const currentXvsVaultTreasuryBalance = await xvsContract.balanceOf(XVS_VAULT_TREASURY);
      const currentXvsStoreBalance = await xvsContract.balanceOf(XVS_STORE);

      expect(prevXvsVaultTreasuryBalance.sub(XVS_STORE_TRANSFER_AMOUNT)).to.be.equal(currentXvsVaultTreasuryBalance);
      expect(prevXvsStoreBalance.add(XVS_STORE_TRANSFER_AMOUNT)).to.be.equal(currentXvsStoreBalance);
    });
  });
});
