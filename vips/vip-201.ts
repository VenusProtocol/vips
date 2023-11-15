import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const vBUSD = "0x95c78222b3d6e262426483d42cfa53685a67ab9d";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const BORROWER = "0x8d655AAAA0ec224b17972df385e25325b9103332";
const repayAmount = parseUnits("6400762.2181", 18);

export const vip201 = () => {
  const meta = {
    version: "v2",
    title: "VIP-201 Repay BUSD debt on behalf borrower",
    description: `
        transfer 6400762.2181 BUSD from the treasury to the Normal timelock contract
        repay 6400762.2181 BUSD on behalf of the account 0x8d655AAAA0ec224b17972df385e25325b9103332 from the Normal timelock contract`,
    forDescription:
      "I agree that Venus Protocol should proceed with the Repay BUSD debt on behalf of mentioned borrower",
    againstDescription:
      "I do not think that Venus Protocol should proceed with the Repay BUSD debt on behalf of mentioned borrower",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Repay BUSD debt on behalf of mentioned borrower or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BUSD, repayAmount, NORMAL_TIMELOCK],
      },

      {
        target: BUSD,
        signature: "approve(address,uint256)",
        params: [vBUSD, repayAmount],
      },

      {
        target: vBUSD,
        signature: "repayBorrowBehalf(address,uint256)",
        params: [BORROWER, repayAmount],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
