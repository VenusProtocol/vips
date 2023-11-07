import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const RECEIVER = "0x6657911f7411765979da0794840d671be55ba273";
export const BNB_AMOUNT = parseUnits("26438.87", 18);

export const vip200 = () => {
  const meta = {
    version: "v2",
    title: "VIP-200 Transfer BNB reserves to swap them",
    description: ``,
    forDescription: "I agree that Venus Protocol should proceed with the Transfer BNB reserves to swap them",
    againstDescription: "I do not think that Venus Protocol should proceed with the Transfer BNB reserves to swap them",
    abstainDescription:
      "I am indifferent to whether Venus Protocol proceeds with the Transfer BNB reserves to swap them or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, RECEIVER],
        value: "0",
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
