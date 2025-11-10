import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip565, {
  MESSARI,
  MESSARI_USDC_AMOUNT_1,
  MESSARI_USDC_AMOUNT_2,
  USDC_ETH,
  USDT_ETH,
  USDT_TO_SWAP,
} from "../../vips/vip-565/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(23767030, async () => {
  const usdc = new Contract(USDC_ETH, ERC20_ABI, ethers.provider);
  const usdt = new Contract(USDT_ETH, ERC20_ABI, ethers.provider);

  const messariBalanceBefore = await usdc.balanceOf(MESSARI);
  const vtreasuryUSDCBalanceBefore = await usdc.balanceOf(ethereum.VTREASURY);
  const vtreasuryUSDTBalanceBefore = await usdt.balanceOf(ethereum.VTREASURY);

  testForkedNetworkVipCommands("vip-565", await vip565());

  describe("Post-VIP behavior", async () => {
    it("should transfer USDC from the Venus Treasury to Messari", async () => {
      const messariBalanceAfter = await usdc.balanceOf(MESSARI);
      expect(messariBalanceAfter).to.equal(messariBalanceBefore.add(MESSARI_USDC_AMOUNT_1).add(MESSARI_USDC_AMOUNT_2));
    });

    it("should update the VTreasury USDC balance", async () => {
      const vtreasuryUSDCBalanceAfter = await usdc.balanceOf(ethereum.VTREASURY);
      expect(vtreasuryUSDCBalanceAfter).to.equal(vtreasuryUSDCBalanceBefore.sub(MESSARI_USDC_AMOUNT_1));
    });

    it("should update the VTreasury USDT balance", async () => {
      const vtreasuryUSDTBalanceAfter = await usdt.balanceOf(ethereum.VTREASURY);
      expect(vtreasuryUSDTBalanceAfter).to.equal(vtreasuryUSDTBalanceBefore.sub(USDT_TO_SWAP));
    });
  });
});
