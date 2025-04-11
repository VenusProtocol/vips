import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip477, { BASE_VWETH, BASE_WETH, ETH_AMOUNT_RECEIVED, VTREASURY_BASE } from "../../vips/vip-477/bscmainnet";
import ERC20_ABI from "./abi/erc20.json";
import VTOKEN_ABI from "./abi/vToken.json";

// "mintBehalf(address,uint256)" internally executes comptroller.preMintHook(address(this), minter, mintAmount)
// and distribute reward tokens through "rewardsDistributor.distributeSupplierRewardToken(vToken, minter)"
// it calculates REWARD TOKEN accrued by a supplier and possibly transfer it to them.
// it also executes "accrueInterest()", internally it calculates interest accrued
// from the last checkpointed slot(block or second) up to the current slot(block or second)
// and writes new checkpoint to storage and reduce spread reserves to protocol share reserve
// i.e _doTransferOut(protocolSeizeShare, amount)
const rewardVTokensAccrued = ethers.BigNumber.from("995969293046573365"); // till block 28615549
const VWETH_AMOUNT_RECEIVED = ethers.BigNumber.from("9968973998"); // till block 28615549
const wethHolder_address = "0xb2cc224c1c9feE385f8ad6a55b4d94E92359DC59";

forking(28615549, async () => {
  let weth: Contract;
  let vWeth: Contract;
  let wethHolderSigner: SignerWithAddress;
  let wethBalanceForVWeth: BigNumber;
  let vWethBalanceForTreasury: BigNumber;

  before(async () => {
    weth = new ethers.Contract(BASE_WETH, ERC20_ABI, ethers.provider);
    vWeth = new ethers.Contract(BASE_VWETH, VTOKEN_ABI, ethers.provider);
    wethBalanceForVWeth = await weth.balanceOf(BASE_VWETH);
    vWethBalanceForTreasury = await vWeth.balanceOf(VTREASURY_BASE);
    wethHolderSigner = await initMainnetUser(wethHolder_address, ethers.utils.parseEther("1"));

    await weth.connect(wethHolderSigner).transfer(VTREASURY_BASE, parseUnits("100", 18));
  });

  testForkedNetworkVipCommands(
    "VIP-477 Bridge 101 ETH from the Treasury on BNB Chain to the Treasury on Base",
    await vip477(),
  );

  describe("Post-VIP behaviour", async () => {
    it("Should increase weth balance in vWETH market", async () => {
      const balance = await weth.balanceOf(BASE_VWETH);
      expect(balance).equals(wethBalanceForVWeth.add(ETH_AMOUNT_RECEIVED).sub(rewardVTokensAccrued));
    });

    it("Should increase vWeth balance in vTreasury market", async () => {
      const balance = await vWeth.balanceOf(VTREASURY_BASE);
      expect(balance).equals(vWethBalanceForTreasury.add(VWETH_AMOUNT_RECEIVED));
    });
  });
});
