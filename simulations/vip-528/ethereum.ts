import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip528, {
  MESSARI,
  MESSARI_USDC_AMOUNT,
  USDC_ETH,
  sUSDe_ETH,
  sUSDe_REFUND_ADDRESS,
  sUSDe_REFUND_AMOUNT,
} from "../../vips/vip-528/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(22774245, async () => {
  const usdc = new Contract(USDC_ETH, ERC20_ABI, ethers.provider);
  const susde = new Contract(sUSDe_ETH, ERC20_ABI, ethers.provider);
  const messariBalanceBefore = await usdc.balanceOf(MESSARI);
  const susdeRefundBalanceBefore = await susde.balanceOf(sUSDe_REFUND_ADDRESS);
  const vtreasuryUSDCBalanceBefore = await usdc.balanceOf(ethereum.VTREASURY);
  const vtreasurySUSDEBalanceBefore = await susde.balanceOf(ethereum.VTREASURY);

  testForkedNetworkVipCommands("vip528", await vip528());

  describe("Post-VIP behavior", async () => {
    it("check Messari USDC balance", async () => {
      const messariBalanceAfter = await usdc.balanceOf(MESSARI);
      expect(messariBalanceAfter).to.equal(messariBalanceBefore.add(MESSARI_USDC_AMOUNT));
    });

    it("check sUSDe refund address balance", async () => {
      const susdeRefundBalanceAfter = await susde.balanceOf(sUSDe_REFUND_ADDRESS);
      expect(susdeRefundBalanceAfter).to.equal(susdeRefundBalanceBefore.add(sUSDe_REFUND_AMOUNT));
    });

    it("check VTreasury USDC balance", async () => {
      const vtreasuryUSDCBalanceAfter = await usdc.balanceOf(ethereum.VTREASURY);
      expect(vtreasuryUSDCBalanceAfter).to.equal(vtreasuryUSDCBalanceBefore.sub(MESSARI_USDC_AMOUNT));
    });

    it("check VTreasury sUSDe balance", async () => {
      const vtreasurySUSDEBalanceAfter = await susde.balanceOf(ethereum.VTREASURY);
      expect(vtreasurySUSDEBalanceAfter).to.equal(vtreasurySUSDEBalanceBefore.sub(sUSDe_REFUND_AMOUNT));
    });
  });
});
