import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BNB_REPAYMENTS,
  REPAYMENTS_FROM_TREASURY_PART2,
  USDT,
  USDT_TO_OTC,
  USDT_TREASURY_REIMBURSEMENT,
  totalBNB,
  vBNB,
} from "./amounts";
import { CORE_COMPTROLLER, NORMAL_TIMELOCK, RISK_FUND, bep20RepayCommands } from "./bscmainnet";

const { bscmainnet } = NETWORK_ADDRESSES;

export const DEV_WALLET = "0x5e7bb1f600e42bc227755527895a282f782555ec";

export const vip605Part2 = () => {
  const meta = {
    version: "v2",
    title: "VIP-605 Repayment of Bad Debt (2/2) - 15/03/2026",
    description: `If passed, this VIP will complete the bad debt repayment started in VIP-605 (1/2). This is part 2 of 2.

**Remaining Treasury BEP20 repayments**

Repays SXP, FIL, and TUSD debts from Treasury tokens.

**Native BNB repayments**

Withdraws native BNB from Treasury and repays BNB debts for 5 accounts via \`repayBorrowBehalf\`.

**Treasury reimbursement**

Sweeps ~182,602 USDT from the Risk Fund to the Treasury to reimburse the tokens withdrawn across both VIPs (THE excluded, handled in VIP-690).

**OTC for remaining shortfall**

Sweeps ~1,601,225 USDT from the Risk Fund to the [Development Team wallet](https://bscscan.com/address/0x5e7bb1f600e42bc227755527895a282f782555ec) for OTC conversion to cover the remaining CAKE (~$1,560,706) and DAI (~$40,518) shortfall. THE repayment is handled separately in VIP-690.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/XXX)
- [VIP-605 (1/2): Bad debt repayment part 1](https://app.venus.io/#/governance/proposal/605?chainId=56)
- [Bad debt accounts reference](https://app.hex.tech/10609151-106a-4740-8982-17a9a4e59699/app/Venus-Bad-Debt-List-032iucgPVlHlorte5tRP4R/latest)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      // ════════════════════════════════════════════════════════
      // Repay from Treasury — BEP20 tokens Part 2 (SXP, FIL, TUSD)
      // ════════════════════════════════════════════════════════
      ...REPAYMENTS_FROM_TREASURY_PART2.flatMap(token => bep20RepayCommands(token, "treasury")),

      // ════════════════════════════════════════════════════════
      // Repay from Treasury — Native BNB
      // ════════════════════════════════════════════════════════
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [totalBNB(), NORMAL_TIMELOCK],
      },
      ...BNB_REPAYMENTS.map(b => ({
        target: vBNB,
        signature: "repayBorrowBehalf(address)",
        params: [b.address],
        value: b.amount.toString(),
      })),

      // ════════════════════════════════════════════════════════
      // Reimburse Treasury — sweep equivalent USDT from Risk Fund
      // ════════════════════════════════════════════════════════
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, CORE_COMPTROLLER, bscmainnet.VTREASURY, USDT_TREASURY_REIMBURSEMENT],
      },

      // ════════════════════════════════════════════════════════
      // OTC — sweep USDT to Dev Wallet for remaining shortfall
      // ════════════════════════════════════════════════════════
      {
        target: RISK_FUND,
        signature: "sweepTokenFromPool(address,address,address,uint256)",
        params: [USDT, CORE_COMPTROLLER, DEV_WALLET, USDT_TO_OTC],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip605Part2;
