import { expect } from "chai";
import { BigNumber } from "ethers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip321, {
  CERTIK,
  CERTIK_AMOUNT,
  DEV_WALLET,
  THE_GRAPH_USDC_AMOUNT,
  USDC,
  USDT,
  VTREASURY,
} from "../../vips/vip-321/bscmainnet";
import ERC20_ABI from "./abi/ERC20.json";
import VTREASURY_ABI from "./abi/VTreasuryAbi.json";

forking(39292226, async () => {
  let usdc: Contract;
  let usdt: Contract;
  let prevUSDCBalanceTreasury: BigNumber;
  let prevUSDTBalanceTreasury: BigNumber;
  let prevUSDCBalanceDevWallet: BigNumber;
  let prevUSDTBalanceCertikWallet: BigNumber;

  before(async () => {
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);
    prevUSDCBalanceTreasury = await usdc.balanceOf(VTREASURY);
    prevUSDCBalanceDevWallet = await usdc.balanceOf(DEV_WALLET);
    prevUSDTBalanceTreasury = await usdt.balanceOf(VTREASURY);
    prevUSDTBalanceCertikWallet = await usdt.balanceOf(CERTIK);
  });

  testVip("VIP-321", await vip321(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBEP20"], [2]);
    },
  });

  describe("Post-Execution state", () => {
    it("check treasury usdc balance after execution", async () => {
      expect(await usdc.balanceOf(VTREASURY)).to.equal(prevUSDCBalanceTreasury.sub(THE_GRAPH_USDC_AMOUNT));
    });

    it("check Dev wallet usdc balance after execution", async () => {
      expect(await usdc.balanceOf(DEV_WALLET)).to.equal(prevUSDCBalanceDevWallet.add(THE_GRAPH_USDC_AMOUNT));
    });

    it("check treasury usdt balance after execution", async () => {
      expect(await usdt.balanceOf(VTREASURY)).to.equal(prevUSDTBalanceTreasury.sub(CERTIK_AMOUNT));
    });

    it("check Certik wallet usdt balance after execution", async () => {
      expect(await usdt.balanceOf(CERTIK)).to.equal(prevUSDTBalanceCertikWallet.add(CERTIK_AMOUNT));
    });
  });
});
