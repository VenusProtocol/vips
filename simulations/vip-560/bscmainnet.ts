import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip560, {
  CHAOS_LABS,
  CHAOS_LABS_USDC_AMOUNT,
  MESSARI,
  MESSARI_USDC_AMOUNT,
  USDC_BSC,
} from "../../vips/vip-560/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(66427918, async () => {
  const usdc = new Contract(USDC_BSC, ERC20_ABI, ethers.provider);
  const messariBalanceBefore = await usdc.balanceOf(MESSARI);
  const chaosLabsBalanceBefore = await usdc.balanceOf(CHAOS_LABS);
  const vtreasuryUSDCBalanceBefore = await usdc.balanceOf(bscmainnet.VTREASURY);

  testVip("VIP-560", await vip560(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check Messari USDC balance", async () => {
      const messariBalanceAfter = await usdc.balanceOf(MESSARI);
      expect(messariBalanceAfter).to.equal(messariBalanceBefore.add(MESSARI_USDC_AMOUNT));
    });

    it("check Chaos Labs USDC balance", async () => {
      const chaosLabsBalanceAfter = await usdc.balanceOf(CHAOS_LABS);
      expect(chaosLabsBalanceAfter).to.equal(chaosLabsBalanceBefore.add(CHAOS_LABS_USDC_AMOUNT));
    });

    it("check VTreasury USDC balance", async () => {
      const vtreasuryUSDCBalanceAfter = await usdc.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDCBalanceAfter).to.equal(
        vtreasuryUSDCBalanceBefore.sub(CHAOS_LABS_USDC_AMOUNT).sub(MESSARI_USDC_AMOUNT),
      );
    });
  });
});
