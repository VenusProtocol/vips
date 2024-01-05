import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const DESTINATION_ADDRESS = "0x6657911F7411765979Da0794840D671Be55bA273";
const USDT_AMOUNT = "2100253000000000000000000";

export const vip233 = () => {
  const meta = {
    version: "v2",
    title: "VIP-233: 2023 Development Team Expense Reimbursement",
    description: `https://community.venus.io/t/2023-development-team-expense-reimbursement/4000/1`,

    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, DESTINATION_ADDRESS],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
