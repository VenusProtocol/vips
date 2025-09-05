import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip540, {
  CERTIK,
  CERTIK_USDT_AMOUNT,
  PESSIMISTIC,
  PESSIMISTIC_USDT_AMOUNT,
  QUANTSTAMP,
  QUANTSTAMP_USDC_AMOUNT,
  USDC_BSC,
  USDT_BSC,
} from "../../vips/vip-540/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(60122406, async () => {
  const usdc = new Contract(USDC_BSC, ERC20_ABI, ethers.provider);
  const usdt = new Contract(USDT_BSC, ERC20_ABI, ethers.provider);
  const certikBalanceBefore = await usdt.balanceOf(CERTIK);
  const quantstampBalanceBefore = await usdc.balanceOf(QUANTSTAMP);
  const pessimisticBalanceBefore = await usdt.balanceOf(PESSIMISTIC);
  const vtreasuryUSDTBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
  const vtreasuryUSDCBalanceBefore = await usdc.balanceOf(bscmainnet.VTREASURY);

  testVip("VIP-540", await vip540(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check Certik USDT balance", async () => {
      const certikBalanceAfter = await usdt.balanceOf(CERTIK);
      expect(certikBalanceAfter).to.equal(certikBalanceBefore.add(CERTIK_USDT_AMOUNT));
    });

    it("check Quantstamp USDC balance", async () => {
      const quantstampBalanceAfter = await usdc.balanceOf(QUANTSTAMP);
      expect(quantstampBalanceAfter).to.equal(quantstampBalanceBefore.add(QUANTSTAMP_USDC_AMOUNT));
    });

    it("check Pessimistic USDT balance", async () => {
      const pessimisticBalanceAfter = await usdt.balanceOf(PESSIMISTIC);
      expect(pessimisticBalanceAfter).to.equal(pessimisticBalanceBefore.add(PESSIMISTIC_USDT_AMOUNT));
    });

    it("check VTreasury USDC balance", async () => {
      const vtreasuryUSDCBalanceAfter = await usdc.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDCBalanceAfter).to.equal(vtreasuryUSDCBalanceBefore.sub(QUANTSTAMP_USDC_AMOUNT));
    });

    it("check VTreasury USDT balance", async () => {
      const vtreasuryUSDTBalanceAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(vtreasuryUSDTBalanceAfter).to.equal(
        vtreasuryUSDTBalanceBefore.sub(CERTIK_USDT_AMOUNT).sub(PESSIMISTIC_USDT_AMOUNT),
      );
    });
  });
});
