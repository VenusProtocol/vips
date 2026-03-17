import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  ACCOUNT_1,
  ACCOUNT_2,
  ACCOUNT_3,
  ACCOUNT_4,
  ACCOUNT_5,
  ACCOUNT_6,
  ACCOUNT_7,
  ACCOUNT_8,
  ACCOUNT_9,
  ACCOUNT_10,
  ACCOUNT_11,
  ACCOUNT_12,
  ACCOUNT_13,
  ACCOUNT_14,
  ACCOUNT_15,
  ACCOUNT_16,
  ACCOUNT_17,
  ACCOUNT_18,
  ACCOUNT_19,
  ACCOUNT_20,
  ACCOUNT_21,
  ACCOUNT_22,
  ACCOUNT_23,
  ACCOUNT_24,
  ACCOUNT_25,
  ACCOUNT_26,
  ACCOUNT_27,
  REPAYMENTS_FROM_RISK_FUND,
  REPAYMENTS_FROM_TREASURY_PART1,
  REPAYMENTS_FROM_TREASURY_PART2,
  USDT,
  USDT_TO_OTC,
  USDT_TREASURY_REIMBURSEMENT,
  vAAVE,
  vADA,
  vBCH,
  vBNB,
  vBTC,
  vCAKE,
  vDAI,
  vDOGE,
  vETH,
  vFIL,
  vLINK,
  vLTC,
  vSXP,
  vTHE,
  vTUSD,
  vUSDC,
  vUSDT,
  vWBNB,
  vXRP,
} from "../../vips/vip-605/amounts";
import { RISK_FUND, vip605 } from "../../vips/vip-605/bscmainnet";
import { DEV_WALLET, vip605Part2 } from "../../vips/vip-605/bscmainnet-2";
import VTREASURY_ABI from "./abi/VTreasury.json";
import ERC20_ABI from "./abi/erc20.json";
import RISK_FUND_ABI from "./abi/riskFund.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// All account debts: [account, vToken, tokenName, isPartialRepayment]
const ALL_DEBTS: [string, string, string, boolean][] = [
  // Account 1: CAKE partial, rest full
  [ACCOUNT_1, vCAKE, "CAKE", true],
  [ACCOUNT_1, vWBNB, "WBNB", false],
  [ACCOUNT_1, vBTC, "BTCB", false],
  [ACCOUNT_1, vBNB, "BNB", false],
  [ACCOUNT_1, vUSDC, "USDC", false],
  // Account 2: THE partial
  [ACCOUNT_2, vTHE, "THE", true],
  // Account 3: DAI partial, rest full
  [ACCOUNT_3, vDAI, "DAI", true],
  [ACCOUNT_3, vETH, "ETH", false],
  [ACCOUNT_3, vBTC, "BTCB", false],
  [ACCOUNT_3, vUSDT, "USDT", false],
  [ACCOUNT_3, vUSDC, "USDC", false],
  // Account 4
  [ACCOUNT_4, vBNB, "BNB", false],
  // Account 5
  [ACCOUNT_5, vTHE, "THE", false],
  [ACCOUNT_5, vUSDT, "USDT", false],
  // Account 6
  [ACCOUNT_6, vETH, "ETH", false],
  // Account 7
  [ACCOUNT_7, vTHE, "THE", false],
  // Account 8
  [ACCOUNT_8, vUSDT, "USDT", false],
  // Accounts 9-13
  [ACCOUNT_9, vTHE, "THE", false],
  [ACCOUNT_10, vTHE, "THE", false],
  [ACCOUNT_11, vTHE, "THE", false],
  [ACCOUNT_12, vTHE, "THE", false],
  [ACCOUNT_13, vTHE, "THE", false],
  // Account 14
  [ACCOUNT_14, vBNB, "BNB", false],
  [ACCOUNT_14, vBCH, "BCH", false],
  [ACCOUNT_14, vLINK, "LINK", false],
  [ACCOUNT_14, vAAVE, "AAVE", false],
  [ACCOUNT_14, vBTC, "BTCB", false],
  [ACCOUNT_14, vUSDT, "USDT", false],
  // Account 15
  [ACCOUNT_15, vBCH, "BCH", false],
  [ACCOUNT_15, vBTC, "BTCB", false],
  [ACCOUNT_15, vXRP, "XRP", false],
  [ACCOUNT_15, vETH, "ETH", false],
  [ACCOUNT_15, vFIL, "FIL", false],
  // Account 16
  [ACCOUNT_16, vXRP, "XRP", false],
  // Account 17
  [ACCOUNT_17, vXRP, "XRP", false],
  [ACCOUNT_17, vSXP, "SXP", false],
  // Account 18
  [ACCOUNT_18, vUSDT, "USDT", false],
  // Account 19
  [ACCOUNT_19, vXRP, "XRP", false],
  [ACCOUNT_19, vADA, "ADA", false],
  [ACCOUNT_19, vDOGE, "DOGE", false],
  // Account 20
  [ACCOUNT_20, vXRP, "XRP", false],
  [ACCOUNT_20, vBNB, "BNB", false],
  [ACCOUNT_20, vUSDC, "USDC", false],
  [ACCOUNT_20, vSXP, "SXP", false],
  [ACCOUNT_20, vTUSD, "TUSD", false],
  // Account 21
  [ACCOUNT_21, vLTC, "LTC", false],
  [ACCOUNT_21, vXRP, "XRP", false],
  [ACCOUNT_21, vADA, "ADA", false],
  [ACCOUNT_21, vSXP, "SXP", false],
  // Account 22
  [ACCOUNT_22, vXRP, "XRP", false],
  [ACCOUNT_22, vSXP, "SXP", false],
  // Account 23
  [ACCOUNT_23, vXRP, "XRP", false],
  [ACCOUNT_23, vBNB, "BNB", false],
  [ACCOUNT_23, vETH, "ETH", false],
  [ACCOUNT_23, vLTC, "LTC", false],
  // Account 24
  [ACCOUNT_24, vXRP, "XRP", false],
  // Account 25
  [ACCOUNT_25, vDAI, "DAI", false],
  [ACCOUNT_25, vXRP, "XRP", false],
  // Account 26
  [ACCOUNT_26, vXRP, "XRP", false],
  [ACCOUNT_26, vUSDT, "USDT", false],
  // Account 27
  [ACCOUNT_27, vXRP, "XRP", false],
];

forking(87107356, async () => {
  const provider = ethers.provider;

  let usdt: Contract;
  let treasuryUsdtBalanceBefore: BigNumber;
  let riskFundUsdtBalanceBefore: BigNumber;
  let devWalletUsdtBalanceBefore: BigNumber;

  const vTokenContracts: Record<string, Contract> = {};
  const borrowsBefore: Record<string, BigNumber> = {};
  const debtKey = (account: string, vToken: string) => `${account}-${vToken}`;

  before(async () => {
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    treasuryUsdtBalanceBefore = await usdt.balanceOf(bscmainnet.VTREASURY);
    riskFundUsdtBalanceBefore = await usdt.balanceOf(RISK_FUND);
    devWalletUsdtBalanceBefore = await usdt.balanceOf(DEV_WALLET);

    const uniqueVTokens = [...new Set(ALL_DEBTS.map(([, vToken]) => vToken))];
    for (const vToken of uniqueVTokens) {
      vTokenContracts[vToken] = new ethers.Contract(vToken, VTOKEN_ABI, provider);
    }

    for (const [account, vToken] of ALL_DEBTS) {
      const key = debtKey(account, vToken);
      if (!borrowsBefore[key]) {
        borrowsBefore[key] = await vTokenContracts[vToken].callStatic.borrowBalanceCurrent(account);
      }
    }
  });

  testVip("VIP-605 Part 1", await vip605(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [REPAYMENTS_FROM_RISK_FUND.length]);
      await expectEvents(
        txResponse,
        [VTREASURY_ABI],
        ["WithdrawTreasuryBEP20"],
        [REPAYMENTS_FROM_TREASURY_PART1.length],
      );
    },
  });

  testVip("VIP-605 Part 2", await vip605Part2(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [RISK_FUND_ABI], ["SweepTokenFromPool"], [2]);
      await expectEvents(
        txResponse,
        [VTREASURY_ABI],
        ["WithdrawTreasuryBEP20"],
        [REPAYMENTS_FROM_TREASURY_PART2.length],
      );
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBNB"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    for (const [account, vToken, tokenName, isPartial] of ALL_DEBTS) {
      const shortAccount = `${account.slice(0, 6)}...${account.slice(-4)}`;
      const label = isPartial ? "partially repay" : "fully repay";

      it(`should ${label} ${tokenName} debt for ${shortAccount}`, async () => {
        const key = debtKey(account, vToken);
        const before = borrowsBefore[key];
        const after = await vTokenContracts[vToken].callStatic.borrowBalanceCurrent(account);
        expect(after).to.be.lt(before);
        if (isPartial) {
          expect(after).to.be.gt(0);
        }
      });
    }

    it("should reimburse treasury with USDT from risk fund", async () => {
      const treasuryUsdtAfter = await usdt.balanceOf(bscmainnet.VTREASURY);
      expect(treasuryUsdtAfter).to.equal(treasuryUsdtBalanceBefore.add(USDT_TREASURY_REIMBURSEMENT));
    });

    it("should send USDT to dev wallet for OTC conversion", async () => {
      const devWalletUsdtAfter = await usdt.balanceOf(DEV_WALLET);
      expect(devWalletUsdtAfter).to.equal(devWalletUsdtBalanceBefore.add(USDT_TO_OTC));
    });

    it("should decrease risk fund USDT balance", async () => {
      const riskFundUsdtAfter = await usdt.balanceOf(RISK_FUND);
      expect(riskFundUsdtAfter).to.be.lt(riskFundUsdtBalanceBefore);
    });
  });
});
