import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { REPAYMENTS_FROM_RISK_FUND, REPAYMENTS_FROM_TREASURY_PART1, TokenRepayment, totalForToken } from "./amounts";

const { bscmainnet } = NETWORK_ADDRESSES;

export const RISK_FUND = "0xdF31a28D68A2AB381D42b380649Ead7ae2A76E42";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

export const bep20RepayCommands = (token: TokenRepayment, source: "riskFund" | "treasury") => {
  const total = totalForToken(token);
  return [
    // Source tokens to Timelock
    ...(source === "riskFund"
      ? [
          {
            target: RISK_FUND,
            signature: "sweepTokenFromPool(address,address,address,uint256)",
            params: [token.underlying, CORE_COMPTROLLER, NORMAL_TIMELOCK, total],
          },
        ]
      : [
          {
            target: bscmainnet.VTREASURY,
            signature: "withdrawTreasuryBEP20(address,uint256,address)",
            params: [token.underlying, total, NORMAL_TIMELOCK],
          },
        ]),
    // Approve vToken to spend underlying
    {
      target: token.underlying,
      signature: "approve(address,uint256)",
      params: [token.vToken, total],
    },
    // Repay each borrower
    ...token.borrowers.map(b => ({
      target: token.vToken,
      signature: "repayBorrowBehalf(address,uint256)",
      params: [b.address, b.amount],
    })),
    // Reset approval
    {
      target: token.underlying,
      signature: "approve(address,uint256)",
      params: [token.vToken, 0],
    },
  ];
};

export const vip605 = () => {
  const meta = {
    version: "v2",
    title: "VIP-605 Repayment of Bad Debt (1/2) - 15/03/2026",
    description: `If passed, this VIP will repay bad debt for accounts with bad debt exceeding $10 in the BSC Core Pool. This is part 1 of 2 — covering repayments from the Risk Fund and most Treasury BEP20 tokens.

**Repayment from Risk Fund**

Tokens available in the Risk Fund (ETH, USDT, WBNB, BTCB) are swept to the Normal Timelock and used to repay borrower debts directly via \`repayBorrowBehalf\`.

**Repayment from Treasury**

For tokens not available in the Risk Fund (CAKE, DAI, XRP, BCH, LTC, LINK, ADA, USDC, AAVE, DOGE), the Treasury provides the tokens for repayment. THE repayment is handled separately in VIP-690.

- CAKE: partial repayment (~146,760 of 1,184,192 needed)
- DAI: partial repayment (~17,316 of 57,834 needed)
- All other tokens: fully covered

The remaining Treasury BEP20 repayments (SXP, FIL, TUSD), native BNB repayments, Treasury USDT reimbursement, and OTC sweep are handled in part 2.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [Bad debt accounts reference](https://app.hex.tech/10609151-106a-4740-8982-17a9a4e59699/app/Venus-Bad-Debt-List-032iucgPVlHlorte5tRP4R/latest)
- [VIP-564: Previous bad debt repayment](https://app.venus.io/#/governance/proposal/564?chainId=56)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ════════════════════════════════════════════════════════
      // Repay from Risk Fund (ETH, USDT, WBNB, BTCB)
      // ════════════════════════════════════════════════════════
      ...REPAYMENTS_FROM_RISK_FUND.flatMap(token => bep20RepayCommands(token, "riskFund")),

      // ════════════════════════════════════════════════════════
      // Repay from Treasury — BEP20 tokens Part 1
      // (CAKE, DAI, XRP, BCH, LTC, LINK, ADA, USDC, AAVE, DOGE)
      // NOTE: THE repayment handled separately in VIP-690
      // ════════════════════════════════════════════════════════
      ...REPAYMENTS_FROM_TREASURY_PART1.flatMap(token => bep20RepayCommands(token, "treasury")),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip605;
