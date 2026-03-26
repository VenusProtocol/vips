import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  REPAYMENTS_FROM_RISK_FUND,
  REPAYMENTS_FROM_TREASURY,
  TokenRepayment,
  USDT,
  USDT_TO_OTC,
  USDT_TREASURY_REIMBURSEMENT,
  totalBNB,
  totalForToken,
} from "./amounts";

const { bscmainnet } = NETWORK_ADDRESSES;

export const NORMAL_TIMELOCK = bscmainnet.NORMAL_TIMELOCK;

export const THE = "0xF4C8E32EaDEC4BFe97E0F595AdD0f4450a863a11";
export const vTHE = "0x86e06EAfa6A1eA631Eab51DE500E3D474933739f";

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const DEV_WALLET = "0x5e7bb1f600e42bc227755527895a282f782555ec";

export const BAD_DEBT_HELPER = "0x570eD1bD5d38D4Fe90c3560D01F361fd0f26ECAa";

/**
 * Source tokens to Timelock from Risk Fund or Treasury, then transfer to helper.
 */
const sourceAndTransferCommands = (token: TokenRepayment, source: "riskFund" | "treasury") => {
  const total = totalForToken(token);
  return [
    // Source tokens to Timelock
    ...(source === "riskFund"
      ? [
          {
            target: RISK_FUND,
            signature: "sweepTokenFromPool(address,address,address,uint256)",
            params: [token.underlying, bscmainnet.UNITROLLER, NORMAL_TIMELOCK, total],
          },
        ]
      : [
          {
            target: bscmainnet.VTREASURY,
            signature: "withdrawTreasuryBEP20(address,uint256,address)",
            params: [token.underlying, total, NORMAL_TIMELOCK],
          },
        ]),
    // Transfer tokens from Timelock to helper
    {
      target: token.underlying,
      signature: "transfer(address,uint256)",
      params: [BAD_DEBT_HELPER, total],
    },
  ];
};

export const vip604 = () => {
  const meta = {
    version: "v2",
    title: "VIP-604 [BNB Chain] Bad Debt Repayment and THE Market Recovery",
    description: `This proposal resolves all outstanding bad debt in Venus Protocol's BNB Chain Core Pool (~**$2,203,024 across 19 assets**) in a single VIP.
The repayment covers:
- Positions directly attributable to the THE market incident
- All accumulated bad debt from prior protocol events

The intent of this arrangement is to prioritise repayment using available native tokens across both the Treasury and Risk Fund, while ensuring that the end state leaves the Risk Fund as the sole source of funds consumed, with the Treasury restored to its pre-execution balance.

Execution details:
1. THE bad debt will be repaid as part of the vTHE exchange rate recovery operation: the VIP will call sweepTokenAndSync to remove the attacker-donated tokens, repay the ~1,919,129 THE bad debt to allow a second sweep, and restore the exchange rate from 4.466e28 to ~1.04e28.
2. A portion of CAKE bad debt will be transferred directly from the Venus Treasury. Only the shortfall will be repaid after OTC swap is completed.
3. For the remaining CAKE and the full amount of DAI, USDT will be transferred from the Risk Fund to the finance team, who will acquire the required CAKE and DAI via OTC swaps before repayment.
4. The remaining 16 assets will be covered using native tokens from the Venus Risk Fund or Treasury.
5. Reinstate any Treasury funds drawn down during the repayment, an equivalent amount of USDT (~182,602 USDT) will be transferred from the Risk Fund back to the Treasury following execution.

Upon the above execution, the BNB Chain Core Pool balance sheet will be fully restored to a clean state.

> ⚠️ **Price Disclaimer**: All USD values shown in this proposal are indicative only. Amounts are derived from snapshot data taken at the time of analysis and do not reflect current market prices. Actual token quantities to be transferred are fixed; USD equivalents will vary at time of execution.

**Changes**

1. **Restore vTHE exchange rate and repay THE bad debt via sweepTokenAndSync**
   - Sweep all available THE (~2,102,142 THE) out of the vTHE contract to reduce the inflated cash balance
   - Repay 1,919,128.96 THE of bad debt (~$347,724), recycling tokens back into the contract
   - Sweep again to bring the exchange rate from 4.466e28 → ~1.04e28 (within ~2% of fair pre-attack value)
   - All Supply, Borrow, and Liquidation actions on the vTHE market will be paused during execution and resumed after the rate stabilises

2. **Transfer CAKE from the Venus Treasury and source remaining CAKE via OTC to repay CAKE bad debt**
   - 146,760.42 CAKE transferred directly from the Venus Treasury
   - Remaining 1,037,431.74 CAKE (~$1,560,706) sourced by transferring USDT from the Risk Fund and swapping via OTC
   - Total CAKE needed: 1,184,192.16 CAKE (~$1,781,492)

3. **Transfer USDT from the Risk Fund to repay DAI bad debt via OTC**
   - USDT transferred from the Venus Risk Fund and swapped to DAI via OTC arrangement coordinated by the finance team
   - DAI needed: 57,834.42 DAI (~$57,833)
   - Source: Venus Risk Fund

4. **Transfer native tokens from the Risk Fund or Treasury to repay remaining asset bad debt**
   - BNB: 15.15 (~$10,231)
   - ETH: 1.60 (~$3,720)
   - USDT: 1,611.07 (~$1,611)
   - WBNB: 0.21 (~$139)
   - XRP: 89.67 (~$138)
   - BTCB: 0.0011 (~$83)
   - BCH: 0.0365 (~$17)
   - LTC: 0.137 (~$8)
   - LINK: 0.729 (~$7)
   - ADA: 24.70 (~$7)
   - USDC: 4.72 (~$5)
   - AAVE: 0.0376 (~$5)
   - DOGE: 38.93 (~$4)
   - SXP: 16.77 (~$0.21)
   - FIL: 0.168 (~$0.16)
   - TUSD: 0.014 (~$0.01)
   - Source: Venus Risk Fund / Venus Treasury

**Summary**

If approved, this VIP will Fully repay **~$2,203,024 in total outstanding bad debt across 19 assets:**
- Restore the **vTHE exchange rate** from 4.466e28 to ~1.04e28 via sweepTokenAndSync, clearing 1,919,128.96 THE (~$347,724) bad debt
- Transfer **146,760.42 CAKE** from the Venus Treasury and source the remaining **1,037,431.74 CAKE** (~$1,560,706) via OTC swap funded by USDT from the Risk Fund, fully repaying the CAKE bad debt position
- Cover the **DAI bad debt** (57,834.42 DAI) via USDT transferred from the Risk Fund and swapped via OTC by the finance team
- Transfer **native tokens** from the Venus Risk Fund or Treasury to repay bad debt across the remaining **16 asset positions** (~$15,975) in the BNB Chain Core Pool
- Transfer **~182,602 USDT from the Venus Risk Fund back to the Venus Treasury** to reinstate all Treasury funds used during repayment, ensuring the Risk Fund bears the full cost and the Treasury is restored to its pre-execution balance

**References**

- THE event Community Post: [[BNB Chain] THE Market Bad Debt Repayment](https://community.venus.io/t/bnb-chain-the-market-bad-debt-repayment/5719)
- THE exchange Rate Recovery: [THE Exchange Rate Recovery — Mechanism & Impact Analysis](https://community.venus.io/t/the-exchange-rate-recovery-mechanism-impact-analysis/5728)
- THE Market Incident Post-Mortem: https://community.venus.io/t/the-market-incident-post-mortem/5712
- GitHub PR: [https://github.com/VenusProtocol/vips/pull/689](https://github.com/VenusProtocol/vips/pull/689)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ════════════════════════════════════════════════════════
      // Source tokens from Risk Fund → Timelock → Helper
      // ════════════════════════════════════════════════════════
      ...REPAYMENTS_FROM_RISK_FUND.flatMap(token => sourceAndTransferCommands(token, "riskFund")),

      // ════════════════════════════════════════════════════════
      // Source tokens from Treasury → Timelock → Helper
      // ════════════════════════════════════════════════════════
      ...REPAYMENTS_FROM_TREASURY.flatMap(token => sourceAndTransferCommands(token, "treasury")),

      // ════════════════════════════════════════════════════════
      // Source native BNB from Treasury → Timelock
      // (sent to helper via execute() call value)
      // ════════════════════════════════════════════════════════
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [totalBNB(), NORMAL_TIMELOCK],
      },

      // ════════════════════════════════════════════════════════
      // THE market: set helper as pending admin of vTHE
      // ════════════════════════════════════════════════════════
      {
        target: vTHE,
        signature: "_setPendingAdmin(address)",
        params: [BAD_DEBT_HELPER],
      },

      // ════════════════════════════════════════════════════════
      // Execute helper — repays all bad debt atomically
      // ════════════════════════════════════════════════════════
      {
        target: BAD_DEBT_HELPER,
        signature: "execute()",
        params: [],
        value: totalBNB().toString(),
      },

      // ════════════════════════════════════════════════════════
      // Timelock reclaims admin of vTHE
      // ════════════════════════════════════════════════════════
      {
        target: vTHE,
        signature: "_acceptAdmin()",
        params: [],
      },

      // ════════════════════════════════════════════════════════
      // Reimburse Treasury — sweep USDT from Risk Fund
      // ════════════════════════════════════════════════════════
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, bscmainnet.UNITROLLER, bscmainnet.VTREASURY, USDT_TREASURY_REIMBURSEMENT],
      },

      // ════════════════════════════════════════════════════════
      // OTC — sweep USDT to Dev Wallet for CAKE+DAI shortfall
      // ════════════════════════════════════════════════════════
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, bscmainnet.UNITROLLER, DEV_WALLET, USDT_TO_OTC],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip604;
