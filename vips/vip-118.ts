import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vETH = "0xf508fcd89b8bd15579dc79a6827cb4686a3592c8";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BORROWER = "0x7589dd3355dae848fdbf75044a3495351655cb1a";
const repayAmount = parseUnits("1437.5", 18);

export const vip118 = () => {
  const meta = {
    version: "v2",
    title: "VIP-118 Repay ETH debt on behalf debt",
    description: `
        transfer 1,437.5 ETH from the treasury to the Normal timelock contract
        repay 1,437.5 ETH debt on behalf of the account 0x7589dd3355dae848fdbf75044a3495351655cb1a from the Normal timelock contract`,
    forDescription: "I agree that Venus Protocol should proceed with the Repay ETH debt on behalf debt debt",
    againstDescription: "I do not think that Venus Protocol should proceed with the Repay ETH debt on behalf debt debt",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Repay ETH debt on behalf debt debt or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, repayAmount, NORMAL_TIMELOCK],
      },

      {
        target: ETH,
        signature: "approve(address,uint256)",
        params: [vETH, repayAmount],
      },

      {
        target: vETH,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER, repayAmount],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
