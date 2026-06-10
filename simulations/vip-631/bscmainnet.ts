import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip631, {
  FINANCE_MULTISIG,
  USDC,
  USDC_AMOUNT,
  USDT,
  USDT_AMOUNT,
  VTREASURY,
} from "../../vips/vip-631/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasury.json";

const FORK_BLOCK = 103160000;

forking(FORK_BLOCK, async () => {
  const usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
  const usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);

  let treasuryUsdtBefore: BigNumber;
  let treasuryUsdcBefore: BigNumber;
  let multisigUsdtBefore: BigNumber;
  let multisigUsdcBefore: BigNumber;

  before(async () => {
    treasuryUsdtBefore = await usdt.balanceOf(VTREASURY);
    treasuryUsdcBefore = await usdc.balanceOf(VTREASURY);
    multisigUsdtBefore = await usdt.balanceOf(FINANCE_MULTISIG);
    multisigUsdcBefore = await usdc.balanceOf(FINANCE_MULTISIG);
  });

  describe("Pre-VIP state", () => {
    it("Treasury holds at least the USDT to be swept", async () => {
      expect(treasuryUsdtBefore).to.be.gte(USDT_AMOUNT);
    });

    it("Treasury holds at least the USDC to be swept", async () => {
      expect(treasuryUsdcBefore).to.be.gte(USDC_AMOUNT);
    });
  });

  testVip(
    "VIP-631 [BNB Chain] Liquidity Reserve — Institutional Fixed Rate Vault Backstop & Bstock Liquidation Buffer",
    await vip631(),
    {
      callbackAfterExecution: async (txResponse: TransactionResponse) => {
        await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
      },
    },
  );

  describe("Post-VIP state", () => {
    it("Treasury USDT balance decreased by exactly USDT_AMOUNT", async () => {
      const after = await usdt.balanceOf(VTREASURY);
      expect(treasuryUsdtBefore.sub(after)).to.equal(USDT_AMOUNT);
    });

    it("Treasury USDC balance decreased by exactly USDC_AMOUNT", async () => {
      const after = await usdc.balanceOf(VTREASURY);
      expect(treasuryUsdcBefore.sub(after)).to.equal(USDC_AMOUNT);
    });

    it("Finance multisig USDT balance increased by exactly USDT_AMOUNT", async () => {
      const after = await usdt.balanceOf(FINANCE_MULTISIG);
      expect(after.sub(multisigUsdtBefore)).to.equal(USDT_AMOUNT);
    });

    it("Finance multisig USDC balance increased by exactly USDC_AMOUNT", async () => {
      const after = await usdc.balanceOf(FINANCE_MULTISIG);
      expect(after.sub(multisigUsdcBefore)).to.equal(USDC_AMOUNT);
    });
  });
});
