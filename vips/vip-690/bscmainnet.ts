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

export const BAD_DEBT_HELPER = "0x94D914515a303A9CD8Fa7e23e578b8d653630A12";

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

export const vip690 = () => {
  const meta = {
    version: "v2",
    title: "VIP-690 [BNB Chain] Bad Debt Repayment and $THE Market Recovery",
    description: `This VIP repays all bad debt exceeding $10 in the BSC Core Pool (27 accounts, 19 tokens + native BNB) and handles recovery of the $THE market following the March 16 donation attack.

It uses a helper contract (BadDebtHelper) to execute all repayments atomically with live on-chain borrow balances, ensuring accurate repayment amounts regardless of interest accrual during the timelock delay.

### Flow

1. **Source tokens to Timelock**: Sweep from Risk Fund (ETH, USDT, WBNB, BTCB) and withdraw from Treasury (CAKE, DAI, XRP, BCH, LTC, LINK, ADA, USDC, AAVE, DOGE, SXP, FIL, TUSD, BNB).

2. **Transfer BEP20 tokens to helper**: All sourced tokens are transferred to the BadDebtHelper contract.

3. **THE market recovery**: Set helper as pending admin of vTHE so it can sweep THE liquidity.

4. **Execute helper**: The helper atomically:
   - Accepts admin of vTHE and sweeps all THE liquidity
   - Repays bad debt for all 27 accounts across all 19 BEP20 tokens + THE using live borrow balances
   - Repays native BNB debts
   - Performs a second vTHE sweep to recover THE from repayments
   - Transfers remaining THE to the designated receiver
   - Returns any unused BEP20 tokens to the Timelock
   - Hands vTHE admin back to Timelock

5. **Reclaim admin**: Timelock accepts admin of vTHE.

6. **Treasury reimbursement**: ~237,000 USDT swept from Risk Fund to Treasury.

7. **OTC for shortfall**: ~1,520,000 USDT swept from Risk Fund to Dev Wallet for OTC conversion (CAKE + DAI shortfall).

#### References

- [THE Market Incident Post-Mortem](https://community.venus.io/t/the-market-incident-post-mortem/5712)
- [VIP-600 Inflation Attack Patch](https://app.venus.io/#/governance/proposal/600?chainId=56)
- [Bad debt accounts reference](https://app.hex.tech/10609151-106a-4740-8982-17a9a4e59699/app/Venus-Bad-Debt-List-032iucgPVlHlorte5tRP4R/latest)
- [VIP-564: Previous bad debt repayment](https://app.venus.io/#/governance/proposal/564?chainId=56)`,
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

export default vip690;
